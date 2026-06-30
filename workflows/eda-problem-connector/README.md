# EDA Problem Connector

Workflow de Dynatrace Automation que actúa como puente entre los **problemas Davis** (`event.kind == "DAVIS_PROBLEM"`) y **Red Hat Event-Driven Ansible (EDA)**, habilitando auto-remediación basada en problemas detectados por Davis AI.

Es el equivalente a [`eda-event-connector`](../eda-event-connector/) pero a nivel de **problema** (entidad agregada y correlacionada por Davis) en lugar de **evento crudo** individual.

> **Estado:** PoC en desarrollo — trigger desactivado (`isActive: false`)

---

## Diferencia con `eda-event-connector`

| | `eda-event-connector` | `eda-problem-connector` |
|---|---|---|
| Dispara con | trigger `davis-event` + `customFilter` en texto | trigger `davis-problem` + `categories` (booleans) |
| Granularidad | Evento individual (puede no llegar a generar un problema) | Problema correlacionado por Davis (agrupa uno o más eventos) |
| Entidad principal | Entidad fuente del evento (`dt.source_entity`) | Entidad raíz (`root_cause_entity_id`) + entidades afectadas |
| Trazabilidad | `problem_ids`: problemas asociados al evento | `underlying_event_ids`: eventos Davis que componen el problema |

Ambos workflows pueden coexistir sin duplicar remediaciones si EDA deduplica por `correlation_id` / `display_id` en su lado, ya que un mismo problema puede generar tanto el evento individual (vía `eda-event-connector`, si su filtro lo captura) como el problema agregado (vía este conector).

---

## Arquitectura del flujo

```
Problem Trigger (categorías: Availability, Error, Resource)
       │
       │  dispara al abrir/reabrir el problema
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

- **Tipo:** `davis-problem` ("Problem Trigger" en la UI) — **distinto** del `davis-event` que usa `eda-event-connector`. No es el mismo trigger con un filtro distinto: es un tipo de trigger separado en el schema de Dynatrace (`triggerConfiguration.type`), confirmado contra el código fuente del [Terraform provider de Dynatrace](https://pkg.go.dev/github.com/dynatrace-oss/terraform-provider-dynatrace/dynatrace/api/automation/workflows/settings) — actualmente **inactivo** (`isActive: false`)

> ⚠️ **Corrección importante (2026-06-30):** la primera versión de este workflow usaba `type: "davis-event"` con un `customFilter` escribiendo `event.kind == "DAVIS_PROBLEM"` a mano (copiado de `eda-event-connector`). Al importarlo y probar "Query past events" en la UI dio **0 resultados en 1h/1d/7d**, pese a que la misma lógica de filtro vía DQL ad-hoc sí devolvía 5 problemas reales. Causa: con `type: "davis-event"`, el trigger evalúa contra la fuente de eventos Davis (`DAVIS_EVENT`), no problemas — el `customFilter` pidiendo `DAVIS_PROBLEM` nunca podía matchear nada, sin importar el rango de tiempo. **Corregido a `type: "davis-problem"`**, que usa un objeto `categories` (booleans) en vez de filtrar `event.category` por texto, y dispara automáticamente al abrir/reabrir el problema sin necesitar `event.status_transition == "CREATED"` en el filtro.

- **Categorías activas:** `availability: true`, `error: true`, `resource: true` (resto en `false`) — equivalente a `AVAILABILITY`, `ERROR`, `RESOURCE_CONTENTION`. Se excluyen deliberadamente `custom` (`CUSTOM_ALERT`, ya cubierta por `eda-event-connector` a nivel de evento), `monitoringUnavailable`, `slowdown` e `info`. **Ajustar según el volumen y criticidad real observados en staging.**
- **`onProblemClose: false`** — no dispara al cerrarse el problema (igual que el conector de eventos)
- **`analysisReady: false`** — el workflow dispara apenas se abre el problema, sin esperar a que termine el análisis de causa raíz de Davis. Si se quiere esperar a tener `root_cause_entity_id` resuelto (que en la muestra real siempre vino vacío — ver más abajo), probar `analysisReady: true` y validar si eso lo rellena.
- **`customFilter`** queda vacío por ahora; el campo sigue disponible en `davis-problem` por si se necesita refinar más allá de las categorías (ej. el filtro de Filenet comentado en `eda-event-connector`).
- ⚠️ **Pendiente de confirmar en la UI:** el struct de `davis-problem` documentado en el Terraform provider no lista un campo `maintenanceWindowTriggerBehavior` (sí existe en `davis-event`). Falta confirmar en la pantalla "Problem Trigger" del tenant si hay un control equivalente para "no disparar durante mantenimiento" y, si lo hay, qué nombre de campo usa en el JSON — **no asumir que el comportamiento `outside` de `eda-event-connector` se heredó automáticamente.**

> ✅ **Validado contra datos reales (2026-06-30):** el mapeo se contrastó contra 5 problemas reales del tenant ([`ProblemsExample.JSON`](ProblemsExample.JSON), capturados con `trigger-problems.dql` vía DQL). Hallazgos que corrigieron el mapeo inicial:
>
> - `dt.entity.host`, `dt.host_group.id` y `dt.davis.impact_level` llegan como **array** a nivel de problema (no como string suelto, a diferencia de los eventos individuales) — el script usa un helper `first()` para extraerlos.
> - `root_cause_entity_id`/`root_cause_entity_name` vinieron **`null` en los 5 casos**, incluido uno de servicio JBoss. Davis no siempre resuelve una causa raíz única para estas categorías de problema — **no depender de estos campos**, usar `affected_entity_*`.
> - En problemas a nivel **servicio** (ej. `Failure rate increase` en un servicio JBoss), `dt.entity.host` viene `null` — la entidad solo aparece en `affected_entity_ids/names/types`. Por eso se añadieron `affected_entity_id/name/type` (primer elemento) como campos principales de ubicación, independientes de si la entidad es host o service.
> - `dt.davis.timeout` vino **siempre `null`** a nivel de problema en los 5 casos (sí tenía valor a nivel de evento individual en `eda-event-connector`).
> - ⚠️ **Hallazgo crítico:** en el problema de JBoss (`P-260614046`, categoría `ERROR`, entorno `PRE`), las tags `AGO_AXAOPCOTRIGRAM:` y `AGO_DEFAULT_ASSIGNMENT_GROUP:` **no estaban presentes** en `entity_tags` → `opco` y `assignment_group` resuelven a `null`. Solo los problemas de tipo *host* en entorno `DEV` de la muestra traían el set completo de tags `AGO_*`. **Antes de depender de `assignment_group`/`opco` para enrutar en EDA, confirmar si esto es un gap de tagging en PRE o un patrón sistemático en problemas de tipo servicio.**
> - Ningún ejemplo de los 5 fue de **disco** — el filtro/mapeo no se ha validado todavía contra ese caso de uso concreto.
>
> Campos que siguen sin confirmar (no estaban en el `fields` de la DQL usada): `dt.event.correlation_id`, `event.description`, `dt.davis.mute.status`. Se mantienen en el mapeo por convención del mismo namespace Davis, pero no hay evidencia directa de su presencia a nivel de problema.

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
| `event_description`        | `event["event.description"]`          | Descripción libre — *no confirmado en datos reales*       |
| `event_category`           | `event["event.category"]`             | Ej: `AVAILABILITY`, `ERROR`, `RESOURCE_CONTENTION` (campo requerido) — confirmado |
| `event_severity`           | `event["event.severity"]`             | Confirmado (`long`, valor `3` en los 5 casos de muestra)  |
| `event_status`              | `event["event.status"]`               | Estado actual (`ACTIVE`, `CLOSED`…) — confirmado          |
| `status_transition`        | `event["event.status_transition"]`    | Transición que disparó el workflow — confirmado            |
| `event_start`               | `toISO(event["event.start"])`         | Normalizado a ISO 8601 — confirmado                        |
| `event_end`                 | `toISO(event["event.end"])`           | Normalizado a ISO 8601, `null` si el problema sigue activo |
| `root_cause_entity_id`      | `event["root_cause_entity_id"]`       | Confirmado: **siempre `null`** en los 5 casos reales — no depender de él |
| `root_cause_entity_name`    | `event["root_cause_entity_name"]`     | Confirmado: **siempre `null`** en los 5 casos reales        |
| `affected_entity_id`        | `first(event["affected_entity_ids"])` | **Campo principal de ubicación** — primer elemento, confirmado en host y service |
| `affected_entity_name`      | `first(event["affected_entity_names"])` | Confirmado — ej. nombre de host o `host:puerto` para servicios |
| `affected_entity_type`      | `first(event["affected_entity_types"])` | Confirmado — `dt.entity.host` o `dt.entity.service`        |
| `affected_entity_ids`       | `event["affected_entity_ids"]`        | Array completo, confirmado                                  |
| `affected_entity_names`     | `event["affected_entity_names"]`      | Array completo, confirmado                                  |
| `affected_entity_types`     | `event["affected_entity_types"]`      | Array completo, confirmado                                  |
| `host_id`                   | `first(event["dt.entity.host"])`      | Confirmado como **array** en problemas; `null` cuando la entidad afectada es un service (ej. JBoss) |
| `host_name`                 | `event["dt.entity.host.name"]` \| `event["host.name"]` | Confirmado: **siempre `null`** en los 5 casos reales — usar `affected_entity_name` |
| `host_group_id`             | `first(event["dt.host_group.id"])`    | Confirmado como **array**; presente tanto en problemas host como service |
| `host_group_name`           | `event["dt.entity.host_group.name"]`  | Confirmado: **siempre `null`** en los 5 casos reales — usar `host_group_id` |
| `source_entity_type`        | `event["dt.source_entity.type"]`      | Confirmado: **siempre `null`** a nivel de problema (campo de evento individual) |
| `source_entity`             | `event["dt.source_entity"]`           | Confirmado: **siempre `null`** a nivel de problema           |
| `environment`                | `entity_tags` → tag `ENVIRONMENT:`    | Extraído del array de tags de la entidad — confirmado       |
| `opco`                       | `entity_tags` → tag `AGO_AXAOPCOTRIGRAM:` | ⚠️ `null` en problemas de tipo *service* en la muestra (ver nota arriba) |
| `assignment_group`          | `entity_tags` → tag `AGO_DEFAULT_ASSIGNMENT_GROUP:` | ⚠️ `null` en problemas de tipo *service* en la muestra |
| `platform`                   | `entity_tags` → tag `AGO_AXAPLATFORM:` | ⚠️ `null` en problemas de tipo *service* en la muestra      |
| `app`                         | `entity_tags` → tag `AGO_GLOBAL_APP:`  | Confirmado presente en todos los casos (host y service)     |
| `app_service_id`            | `entity_tags` → tag `AGO_GLOBAL_APPSERVICEID:` | ⚠️ `null` en problemas de tipo *service* en la muestra |
| `patch_environment`         | `entity_tags` → tag `AGO_AXAPATCHENVIRONMENT:` | ⚠️ `null` en problemas de tipo *service* en la muestra |
| `timeout_minutes`           | `first(event["dt.davis.timeout"])`    | Confirmado: **siempre `null`** a nivel de problema           |
| `impact_level`               | `first(event["dt.davis.impact_level"])` | Confirmado como **array** (`["Infrastructure"]`, `["Services"]`) |
| `mute_status`                | `event["dt.davis.mute.status"]`       | *No confirmado en datos reales* (no estaba en el `fields` de la DQL) |
| `underlying_event_ids`      | `event["dt.davis.event_ids"]`         | Confirmado — array de 1 o más IDs (ej. el problema de Webmethods agrupó 2 eventos) |

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
| `ProblemsExample.JSON` | 5 problemas reales capturados el 2026-06-30 con `trigger-problems.dql`, usados para validar el mapeo de campos |

---

## Configuración antes de activar

1. **Confirmar en la UI si "Problem Trigger" tiene un control de comportamiento durante mantenimiento** equivalente al `maintenanceWindowTriggerBehavior: outside` de `eda-event-connector`, y si lo hay, sincronizar el nombre de campo en el JSON del repo (ver nota arriba) — **sin esto, el workflow podría disparar durante ventanas de mantenimiento**
2. **Resolver el gap de tags `AGO_*` en problemas de tipo servicio** (ver hallazgo crítico arriba) — confirmar con el equipo de tagging si es esperado o un bug de configuración en PRE, antes de depender de `opco`/`assignment_group`/`app_service_id`/`patch_environment` para enrutar remediaciones de servicios (JBoss, httpd, etc.)
3. **Capturar al menos un problema real de categoría disco/recurso** para validar el caso de uso de limpieza de disco (la muestra de 5 no incluyó ninguno)
4. **Verificar `connectionId`:** debe apuntar a la conexión EDA activa del tenant
5. **Decidir el destino de `send_email_1`** antes de producción (ver nota arriba)
6. **Ajustar las `categories` activas** según el volumen real observado con "Query past events" en la UI o con `trigger-problems.dql`
7. **Revisar `hourlyExecutionLimit`** (actual: 1000)
8. **Evaluar solapamiento con `eda-event-connector`:** si ambos workflows están activos, un mismo incidente puede generar tanto un evento como un problema; coordinar con EDA para deduplicar por `correlation_id`/`display_id` y evitar remediaciones duplicadas. La muestra real mostró dos problemas `Memory saturation` sobre el mismo host en menos de una hora — considerar cooldown/deduplicación también dentro de un mismo tipo de problema
9. **Activar el trigger:** cambiar `isActive` a `true` en el JSON o desde la UI de Dynatrace

---

## Pendientes / próximos pasos

- [x] Capturar y validar un payload real de problema Davis (`event.kind == "DAVIS_PROBLEM"`) — hecho el 2026-06-30 con 5 problemas reales (`ProblemsExample.JSON`); ver correcciones aplicadas al mapeo arriba
- [x] **Corregir el tipo de trigger de `davis-event` a `davis-problem`** — hecho el 2026-06-30 tras detectar que "Query past events" daba 0 resultados pese a que la DQL equivalente sí encontraba problemas reales; causa raíz confirmada contra el código fuente del Terraform provider de Dynatrace (ver nota en sección Trigger)
- [ ] **Confirmar si `davis-problem` tiene equivalente a `maintenanceWindowTriggerBehavior`** y añadirlo al JSON si existe
- [ ] **Investigar por qué los problemas de tipo servicio (JBoss) no traen tags `AGO_*` de enrutamiento** — bloqueante para el caso de uso de reinicio de JBoss/httpd si EDA depende de `assignment_group`
- [ ] Capturar un problema real de categoría disco para validar ese caso de uso
- [ ] Evaluar `analysisReady: true` para ver si espera a que Davis resuelva `root_cause_entity_id` (en la muestra siempre vino vacío con la config actual)
- [ ] Definir estrategia de deduplicación con `eda-event-connector` en el lado de EDA
- [ ] Decidir si activar `onProblemClose: true` para notificar a EDA cuando el problema se resuelve y cancelar remediaciones en curso
- [ ] Decidir el destino final de `send_email_1` (eliminar / convertir en alerta de error / redirigir a lista de distribución)
- [ ] Añadir manejo de fallo (notificación) para `run_javascript_1` y para el envío a EDA — actualmente ningún error se notifica
- [ ] Activar el trigger (`isActive: true`) tras validación en entorno de pruebas
