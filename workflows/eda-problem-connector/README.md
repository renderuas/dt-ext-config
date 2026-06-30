# EDA Problem Connector

Workflow de Dynatrace Automation que actúa como puente entre los **problemas Davis** (`event.kind == "DAVIS_PROBLEM"`) y **Red Hat Event-Driven Ansible (EDA)**, habilitando auto-remediación basada en problemas detectados por Davis AI.

Es el equivalente a [`eda-event-connector`](../eda-event-connector/) pero a nivel de **problema** (entidad agregada y correlacionada por Davis) en lugar de **evento crudo** individual.

> **Estado:** PoC en desarrollo — trigger desactivado (`isActive: false`)

---

## Diferencia con `eda-event-connector`

| | `eda-event-connector` | `eda-problem-connector` |
|---|---|---|
| Dispara con | `event.kind == "DAVIS_EVENT"` | `event.kind == "DAVIS_PROBLEM"` |
| Granularidad | Evento individual (puede no llegar a generar un problema) | Problema correlacionado por Davis (agrupa uno o más eventos) |
| Entidad principal | Entidad fuente del evento (`dt.source_entity`) | Entidad raíz (`root_cause_entity_id`) + entidades afectadas |
| Trazabilidad | `problem_ids`: problemas asociados al evento | `underlying_event_ids`: eventos Davis que componen el problema |

Ambos workflows pueden coexistir sin duplicar remediaciones si EDA deduplica por `correlation_id` / `display_id` en su lado, ya que un mismo problema puede generar tanto el evento individual (vía `eda-event-connector`, si su filtro lo captura) como el problema agregado (vía este conector).

---

## Arquitectura del flujo

```
Davis Event Trigger
       │
       │  DAVIS_PROBLEM + ACTIVE + CREATED + categoría en (AVAILABILITY, ERROR, RESOURCE_CONTENTION)
       │  (solo fuera de ventanas de mantenimiento)
       ▼
run_javascript_1  ──► ERROR ──► falla con mensaje descriptivo
  · Obtiene el problema via SDK (executionsClient)
  · Valida campos requeridos
  · Normaliza y mapea campos al payload EDA
       │
       │  OK
       ├──► send_email_1 (debug: envía el payload completo por email)
       └──► send_event_to_event-driven-ansible_1
              · Envía el payload normalizado al webhook de EDA
                     │
                     ▼
              EDA Controller (Red Hat Ansible)
```

---

## Trigger

- **Tipo:** `davis-event` (mismo tipo de trigger que el conector de eventos; en Dynatrace tanto eventos como problemas Davis se configuran a través del trigger "Davis event", filtrando por `event.kind`) — actualmente **inactivo** (`isActive: false`)
- **Filtro activo:**

```
event.kind == "DAVIS_PROBLEM"
and event.status == "ACTIVE"
and event.status_transition == "CREATED"
and (event.category == "AVAILABILITY"
or event.category == "ERROR"
or event.category == "RESOURCE_CONTENTION")
```

- Solo se dispara en creación del problema (`CREATED`), no en actualizaciones (`UPDATED`/`REFRESHED`) ni en cierre (`CLOSED`/`RESOLVED`)
- **Filtro de severidad/categoría:** se restringe a `AVAILABILITY`, `ERROR` y `RESOURCE_CONTENTION` (las categorías de mayor impacto operativo). Se excluyen deliberadamente `CUSTOM_ALERT` (ya cubierta por `eda-event-connector` a nivel de evento), `MONITORING_UNAVAILABLE` y `SLOWDOWN`/`PERFORMANCE`. **Ajustar esta lista según el volumen y criticidad real observados en staging.**
- **No actúa dentro de ventanas de mantenimiento** (`maintenanceWindowTriggerBehavior: outside`) — si la entidad está en mantenimiento, el problema no se procesa y **no se envía nada a EDA**
- Hay un filtro de Filenet comentado en el JSON (`event.name`), heredado como plantilla del conector de eventos; se puede descomentar para restringir el scope

> ⚠️ **Importante:** a diferencia del conector de eventos, **no hay un payload real de un problema (`DAVIS_PROBLEM`) capturado en este repositorio para validar nombres de campo.** El mapeo de abajo se basa en: (a) los campos confirmados en los payloads reales de `DAVIS_EVENT` en [`../eda-event-connector/results/`](../eda-event-connector/results/) que pertenecen al mismo modelo de datos Davis (mismo namespace `event.*`, `dt.entity.*`, `dt.davis.*`), y (b) el diccionario semántico de Dynatrace para problemas (`display_id`, `root_cause_entity_id`, `affected_entity_ids`, `dt.davis.event_ids`, etc.). **Debe validarse contra una ejecución real antes de activar el trigger** — ver sección "Pendientes".

---

## Tareas

### 1. `run_javascript_1` — Normalización del problema

Misma lógica que en `eda-event-connector` (obtención vía `executionsClient.getExecution`, validación de campos requeridos, helpers `getTag`/`toISO`), adaptada a los campos propios de un problema Davis.

**Por qué se usa el SDK:** igual que en el conector de eventos, el contexto de ejecución no inyecta el problema directamente en los parámetros del script; hay que consultarlo explícitamente:

```js
import { executionsClient } from "@dynatrace-sdk/client-automation";

const execution = await executionsClient.getExecution({ id: execution_id });
const event = execution.params?.event;
```

**Validación de campos requeridos:** igual que el conector de eventos —

```js
const requiredFields = ["event.id", "event.name", "event.category"];
```

### Mapeo: problema Davis → payload EDA

| Campo en payload EDA      | Origen en el problema Davis           | Notas                                                   |
|----------------------------|----------------------------------------|----------------------------------------------------------|
| `event_id`                 | `event["event.id"]`                   | ID único del problema (campo requerido)                  |
| `display_id`               | `event["display_id"]`                 | ID legible (ej. `P-2307288`) — **validar en staging**    |
| `correlation_id`           | `event["dt.event.correlation_id"]`    | Correlación entre eventos relacionados                   |
| `event_name`                | `event["event.name"]`                 | Título del problema (campo requerido)                    |
| `event_description`        | `event["event.description"]`          | Descripción libre                                        |
| `event_category`           | `event["event.category"]`             | Ej: `AVAILABILITY`, `ERROR` (campo requerido)             |
| `event_severity`           | `event["event.severity"]`             | Nivel de severidad — **validar en staging**               |
| `event_status`              | `event["event.status"]`               | Estado actual (`ACTIVE`, `CLOSED`…)                       |
| `status_transition`        | `event["event.status_transition"]`    | Transición que disparó el workflow                        |
| `event_start`               | `toISO(event["event.start"])`         | Normalizado a ISO 8601                                    |
| `event_end`                 | `toISO(event["event.end"])`           | Normalizado a ISO 8601, `null` si el problema sigue activo |
| `root_cause_entity_id`      | `event["root_cause_entity_id"]`       | Entidad identificada como causa raíz — **validar en staging** |
| `root_cause_entity_name`    | `event["root_cause_entity_name"]`     | **validar en staging**                                     |
| `affected_entity_ids`       | `event["affected_entity_ids"]`        | Array; presente también en eventos `DAVIS_EVENT`           |
| `affected_entity_names`     | `event["affected_entity_names"]`      | **validar en staging**                                     |
| `affected_entity_types`     | `event["affected_entity_types"]`      | Array; presente también en eventos `DAVIS_EVENT`           |
| `host_id`                   | `event["dt.entity.host"]`             | ID de entidad host                                         |
| `host_name`                 | `event["dt.entity.host.name"]` \| `event["host.name"]` | Nombre del host afectado                  |
| `host_group_id`             | `event["dt.host_group.id"]`           |                                                              |
| `host_group_name`           | `event["dt.entity.host_group.name"]`  |                                                              |
| `source_entity_type`        | `event["dt.source_entity.type"]`      |                                                              |
| `source_entity`             | `event["dt.source_entity"]`           |                                                              |
| `environment`                | `entity_tags` → tag `ENVIRONMENT:`    | Extraído del array de tags de la entidad                   |
| `opco`                       | `entity_tags` → tag `AGO_AXAOPCOTRIGRAM:` |                                                          |
| `assignment_group`          | `entity_tags` → tag `AGO_DEFAULT_ASSIGNMENT_GROUP:` |                                                |
| `platform`                   | `entity_tags` → tag `AGO_AXAPLATFORM:` |                                                             |
| `app`                         | `entity_tags` → tag `AGO_GLOBAL_APP:`  |                                                             |
| `app_service_id`            | `entity_tags` → tag `AGO_GLOBAL_APPSERVICEID:` |                                                     |
| `patch_environment`         | `entity_tags` → tag `AGO_AXAPATCHENVIRONMENT:` |                                                     |
| `timeout_minutes`           | `event["dt.davis.timeout"]`           | Timeout de remediación Davis                               |
| `impact_level`               | `event["dt.davis.impact_level"]`      |                                                              |
| `mute_status`                | `event["dt.davis.mute.status"]`       |                                                              |
| `underlying_event_ids`      | `event["dt.davis.event_ids"]`         | Eventos Davis que componen el problema — **validar en staging** |

Si un tag no existe en la entidad, el campo se resuelve como `null`. Mismas tags requeridas que en `eda-event-connector` (ver su README).

---

### 2. `send_email_1` — Debug por email

Igual patrón que en `eda-event-connector`: envía el payload normalizado completo a `victor.ruiz@axa.es` con asunto `PoC autoremediacion EDA - Problems`. Se replicó deliberadamente para mantener simetría entre ambos conectores durante la fase de PoC.

> Antes de pasar a producción, decidir su destino: eliminarla, convertirla en notificación de error, o redirigirla a una lista de distribución en lugar de un correo personal (ver hallazgos del análisis del conector de eventos, aplicables aquí también).

### 3. `send_event_to_event-driven-ansible_1` — Envío a EDA

- **Acción:** `dynatrace.redhat.ansible:send-event-to-eda`
- **Condición de ejecución:** solo si `run_javascript_1` terminó en estado `OK`
- **Payload enviado:** `{{ result("run_javascript_1") | tojson }}`
- **Conexión:** mismo `connectionId` que `eda-event-connector` (mismo tenant/conexión EDA)

> Si se migra a otro tenant de Dynatrace, el `connectionId` debe actualizarse en ambos conectores.

---

## Contenido del directorio

| Archivo | Descripción |
|---|---|
| `eda-problem-integration.workflow.json` | Export del workflow listo para importar en Dynatrace |
| `trigger-problems.dql` | Query DQL de referencia que replica el filtro del trigger, para explorar qué problemas entrarían al workflow |

---

## Configuración antes de activar

1. **Capturar un payload real de un problema (`DAVIS_PROBLEM`)** y validar contra él todos los campos marcados como "validar en staging" en la tabla de mapeo — este es el paso más importante, ya que el mapeo actual no está verificado contra una ejecución real de problema (a diferencia del conector de eventos)
2. **Verificar `connectionId`:** debe apuntar a la conexión EDA activa del tenant
3. **Decidir el destino de `send_email_1`** antes de producción (ver nota arriba)
4. **Ajustar el filtro de categoría/severidad** (`event.category in (...)`) según el volumen real observado con `trigger-problems.dql`
5. **Revisar `hourlyExecutionLimit`** (actual: 1000)
6. **Evaluar solapamiento con `eda-event-connector`:** si ambos workflows están activos, un mismo incidente puede generar tanto un evento como un problema; coordinar con EDA para deduplicar por `correlation_id`/`display_id` y evitar remediaciones duplicadas
7. **Activar el trigger:** cambiar `isActive` a `true` en el JSON o desde la UI de Dynatrace

---

## Pendientes / próximos pasos

- [ ] Capturar y validar un payload real de problema Davis (`event.kind == "DAVIS_PROBLEM"`) — confirmar nombres exactos de `display_id`, `event.severity`, `root_cause_entity_id/name`, `affected_entity_names`, `dt.davis.event_ids`
- [ ] Definir estrategia de deduplicación con `eda-event-connector` en el lado de EDA
- [ ] Decidir si activar `onProblemClose: true` para notificar a EDA cuando el problema se resuelve y cancelar remediaciones en curso
- [ ] Decidir el destino final de `send_email_1` (eliminar / convertir en alerta de error / redirigir a lista de distribución)
- [ ] Añadir manejo de fallo (notificación) para `run_javascript_1` y para el envío a EDA — actualmente ningún error se notifica
- [ ] Activar el trigger (`isActive: true`) tras validación en entorno de pruebas
