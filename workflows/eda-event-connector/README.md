# EDA Event Connector

Workflow de Dynatrace Automation que actúa como puente entre los **eventos Davis** de tipo `CUSTOM_ALERT` y **Red Hat Event-Driven Ansible (EDA)**, habilitando auto-remediación basada en alertas de monitoreo.

> **Estado:** PoC en desarrollo — trigger desactivado (`isActive: false`)

---

## Arquitectura del flujo

```
Davis Event Trigger
       │
       │  DAVIS_EVENT + CUSTOM_ALERT + ACTIVE + CREATED
       │  (solo fuera de ventanas de mantenimiento)
       ▼
run_javascript_1  ──► ERROR ──► falla con mensaje descriptivo
  · Obtiene el evento via SDK (executionsClient)
  · Valida campos requeridos
  · Normaliza y mapea campos al payload EDA
       │
       │  OK
       ▼
send_event_to_event-driven-ansible_1
  · Envía el payload normalizado al webhook de EDA
       │
       ▼
EDA Controller (Red Hat Ansible)
```

---

## Trigger

- **Tipo:** `davis-event` — actualmente **inactivo** (`isActive: false`)
- **Filtro activo:**

```
event.kind == "DAVIS_EVENT"
and event.category == "CUSTOM_ALERT"
and event.status == "ACTIVE"
and event.status_transition == "CREATED"
```

- Solo se dispara en creación del evento (`CREATED`), no al cierre
- **No actúa dentro de ventanas de mantenimiento** (`maintenanceWindowTriggerBehavior: outside`) — si la entidad está en mantenimiento, el evento no se procesa y **no se envía nada a EDA**
- Hay un filtro de Filenet comentado en el JSON (`event.name`) que sirvió para pruebas iniciales; se puede descomentar para restringir el scope

---

## Tareas

### 1. `run_javascript_1` — Normalización del evento

**Propósito:** Obtener el evento Davis del contexto de ejecución y transformarlo en un payload estructurado para EDA.

#### Por qué se usa el SDK

En el runtime de Dynatrace Automation, el evento del trigger **no se inyecta directamente** en los parámetros del script. Para acceder al evento hay que consultarlo explícitamente via SDK:

```js
import { executionsClient } from "@dynatrace-sdk/client-automation";

const execution = await executionsClient.getExecution({ id: execution_id });
const event = execution.params?.event;
```

#### Validación de campos requeridos

Antes de construir el payload se validan los campos mínimos. Si alguno falta, la tarea falla con mensaje descriptivo:

```js
const requiredFields = ["event.id", "event.name", "event.category"];
```

#### Helpers internos

**`getTag(prefix)`** — extrae el valor de una tag del array `entity_tags`:
- Formato esperado en Dynatrace: `PREFIJO:valor`
- **Case-insensitive**: `environment:PRD` y `ENVIRONMENT:PRD` son equivalentes
- Si hay `:` en el valor (ej. `APP:ns:nombre`), lo preserva correctamente

```js
const getTag = (prefix) => {
  const p = prefix.toUpperCase();
  const match = tags.find(t => t.toUpperCase().startsWith(p + ":"));
  return match ? match.split(":").slice(1).join(":") : null;
};
```

**`toISO(ts)`** — convierte timestamp a ISO 8601:
- Soporta timestamps en **milisegundos** y en **segundos Unix**
- Devuelve `null` si el valor es nulo/undefined

```js
const toISO = (ts) => {
  if (!ts) return null;
  const ms = ts < 1e12 ? ts * 1000 : ts;
  return new Date(ms).toISOString();
};
```

---

### Mapeo completo: evento Davis → payload EDA

| Campo en payload EDA   | Origen en el evento Davis                                       | Notas                                      |
|------------------------|-----------------------------------------------------------------|--------------------------------------------|
| `event_id`             | `event["event.id"]`                                             | ID único del evento Davis                  |
| `correlation_id`       | `event["dt.event.correlation_id"]`                              | Correlación entre eventos relacionados     |
| `event_name`           | `event["event.name"]`                                           | Nombre de la alerta (campo requerido)      |
| `event_description`    | `event["event.description"]`                                    | Descripción libre del evento               |
| `event_category`       | `event["event.category"]`                                       | Ej: `CUSTOM_ALERT` (campo requerido)       |
| `event_status`         | `event["event.status"]`                                         | Estado actual del evento (ACTIVE, CLOSED…) |
| `status_transition`    | `event["event.status_transition"]`                              | Transición que disparó el workflow         |
| `event_start`          | `toISO(event["event.start"])`                                   | Normalizado a ISO 8601                     |
| `event_end`            | `toISO(event["event.end"])`                                     | Normalizado a ISO 8601, `null` si activo   |
| `host_id`              | `event["dt.entity.host"]`                                       | ID de entidad host en Dynatrace            |
| `host_name`            | `event["dt.entity.host.name"]` \| `event["host.name"]`          | Nombre del host afectado                   |
| `host_group_id`        | `event["dt.host_group.id"]`                                     | ID del grupo de hosts                      |
| `host_group_name`      | `event["dt.entity.host_group.name"]`                            |                                            |
| `source_entity_type`   | `event["dt.source_entity.type"]`                                | Tipo de entidad que generó el evento       |
| `source_entity`        | `event["dt.source_entity"]`                                     | ID de la entidad fuente                    |
| `environment`          | `entity_tags` → tag con prefijo `ENVIRONMENT:`                  | Extraído del array de tags de la entidad   |
| `opco`                 | `entity_tags` → tag con prefijo `AGO_AXAOPCOTRIGRAM:`           | Código de OpCo para enrutamiento           |
| `assignment_group`     | `entity_tags` → tag con prefijo `AGO_DEFAULT_ASSIGNMENT_GROUP:` | Grupo de asignación en ITSM                |
| `platform`             | `entity_tags` → tag con prefijo `AGO_AXAPLATFORM:`              |                                            |
| `app`                  | `entity_tags` → tag con prefijo `AGO_GLOBAL_APP:`               |                                            |
| `app_service_id`       | `entity_tags` → tag con prefijo `AGO_GLOBAL_APPSERVICEID:`      | ID de servicio en el CMDB                  |
| `patch_environment`    | `entity_tags` → tag con prefijo `AGO_AXAPATCHENVIRONMENT:`      |                                            |
| `timeout_minutes`      | `event["dt.davis.timeout"]`                                     | Timeout de remediación Davis               |
| `impact_level`         | `event["dt.davis.impact_level"]`                                | Nivel de impacto Davis                     |
| `problem_ids`          | `event["dt.davis.problems"]`                                    | IDs de problemas Davis asociados al evento |

> **Nota:** `is_under_maintenance` fue eliminado del payload. El trigger con `maintenanceWindowTriggerBehavior: "outside"` garantiza que el workflow nunca se ejecuta durante mantenimientos activos, por lo que el campo siempre sería `false`.

Si un tag no existe en la entidad, el campo se resuelve como `null`.

---

### 2. `send_event_to_event-driven-ansible_1` — Envío a EDA

- **Acción:** `dynatrace.redhat.ansible:send-event-to-eda`
- **Condición de ejecución:** solo si `run_javascript_1` terminó en estado `OK`
- **Payload enviado:** `{{ result("run_javascript_1") | tojson }}` — el objeto normalizado de la tarea anterior
- **Conexión:** definida por `connectionId` (ver nota de configuración)

> Si se migra a otro tenant de Dynatrace, el `connectionId` debe actualizarse.

---

## Tags requeridas en las entidades

Para que el enrutamiento hacia EDA funcione correctamente, las entidades monitoreadas deben tener estas tags en Dynatrace (la búsqueda es case-insensitive):

| Tag | Propósito |
|---|---|
| `ENVIRONMENT:<valor>` | Entorno (PRD, PRE, DEV…) |
| `AGO_AXAOPCOTRIGRAM:<valor>` | Código de OpCo |
| `AGO_DEFAULT_ASSIGNMENT_GROUP:<valor>` | Grupo de asignación |
| `AGO_AXAPLATFORM:<valor>` | Plataforma |
| `AGO_GLOBAL_APP:<valor>` | Aplicación global |
| `AGO_GLOBAL_APPSERVICEID:<valor>` | ID del servicio en el CMDB |
| `AGO_AXAPATCHENVIRONMENT:<valor>` | Entorno de parcheo |

---

## Contenido del directorio

| Archivo | Descripción |
|---|---|
| `eda-event-integration.workflow.json` | Export del workflow listo para importar en Dynatrace |
| `payloads/test-payload.json` | Evento de prueba para ejecución manual |
| `results/filter.dql` | Filtro DQL de referencia para el trigger |

---

## Configuración antes de activar

1. **Verificar `connectionId`:** debe apuntar a la conexión EDA activa del tenant
2. **Validar en staging:** ejecutar manualmente con `payloads/test-payload.json` antes de activar en producción
3. **Ajustar el filtro `event.name`:** descomentar o ampliar en el trigger para limitar el scope en producción
4. **Revisar `hourlyExecutionLimit`:** el valor actual (1000) puede ser alto según el volumen de alertas esperado
5. **Activar el trigger:** cambiar `isActive` a `true` en el JSON o desde la UI de Dynatrace

---

## Pendientes / próximos pasos

- [ ] Validar nombres de campos del evento en ejecuciones reales (especialmente `dt.host_group.id` vs `dt.entity.host_group.id`)
- [ ] Decidir si activar `onProblemClose: true` para notificar a EDA cuando el evento se resuelve y cancelar remediaciones en curso
- [ ] Activar el trigger (`isActive: true`) tras validación en entorno de pruebas

