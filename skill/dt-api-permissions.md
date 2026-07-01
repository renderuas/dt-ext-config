# Permisos y Scopes de Tokens en Dynatrace (Acceso Completo)

Dynatrace utiliza un modelo de seguridad basado en tokens de acceso directo. **Para el Servidor MCP y `dtctl` no necesitas configurar Clientes OAuth** en la mayoría de casos: basta con generar **Platform Tokens** estándar desde la interfaz web de tu tenant. Para las APIs clásicas y `dt-cli` se usan **Access Tokens clásicos**.

> **Prefijos de token:**
> - **Platform Token** → empieza por `dt0s16.` (nueva plataforma: Grail, Workflows, MCP, `dtctl`).
> - **Access Token clásico** → empieza por `dt0c01.` (APIs v1/v2, extensiones, `dt-cli`).
>
> **Excepción OAuth:** algunas funciones puntuales (p. ej. las que usan `environment-api:entities:read` para *ownership* de entidades) **solo funcionan con OAuth Client**, no con Platform Token. Para todo lo demás, el Platform Token es suficiente.

A continuación se detallan los scopes necesarios que debes activar al crear tus tokens.

---

## 1. Scopes para la Nueva Plataforma (Grail, Workflows y Servidor MCP)
Estos permisos se configuran al crear un **Platform Token** (`dt0s16.…`) en tu tenant. Son los requeridos por el **Servidor MCP** y la herramienta **`dtctl`**:

### Model Context Protocol (MCP Gateway) — requeridos para el MCP Server remoto
*   `mcp-gateway:servers:invoke` - Requerido para invocar los servidores MCP (transporte SSE/streamable-http).
*   `mcp-gateway:servers:read` - Requerido para leer la configuración de los servidores MCP.

### Telemetría y Grail (Lectura de Datos)
*   `storage:logs:read` - Permite consultar logs en Grail.
*   `storage:metrics:read` - Permite consultar métricas en Grail.
*   `storage:events:read` - Permite consultar eventos del sistema y alertas.
*   `storage:spans:read` - Permite consultar trazas distribuidas (spans).
*   `storage:bizevents:read` - Permite consultar eventos de negocio.

### Ingesta de Datos (Escritura en Grail)
*   `storage:logs:write` - Ingesta de logs personalizados.
*   `storage:events:write` - Ingesta de eventos personalizados.
*   `storage:metrics:write` - Ingesta de métricas.
*   `storage:bizevents:write` - Ingesta de eventos de negocio.

### Automatización y Documentos (Workflows / Dashboards)
*   `document:documents:read` - Lectura de Dashboards y Notebooks nuevos.
*   `document:documents:write` - Creación, edición y eliminación de Dashboards/Notebooks.
*   `automation:workflows:read` - Lectura de Workflows creados.
*   `automation:workflows:write` - Creación y modificación de flujos de automatización.
*   `automation:workflows:run` - Capacidad de disparar manualmente o testear Workflows.
*   `state:states:read` y `state:states:write` - Gestión del estado de ejecución de workflows.

### Configuración del Entorno
*   `settings:objects:read` - Lectura de objetos de configuración del tenant.
*   `settings:objects:write` - Modificación de configuraciones del tenant.
*   `settings:schemas:read` - Lectura de esquemas de configuración disponibles.

### Inteligencia Artificial (Davis / Copilot)
*   `davis-copilot:conversations:execute` - Permite al MCP utilizar el "Help Agent" para resolver preguntas generales de Dynatrace.
*   `davis-copilot:nl2dql:execute` - Permite traducir lenguaje natural a consultas DQL de Grail.
*   `davis-copilot:dql2nl:execute` - Permite explicar consultas DQL complejas en lenguaje natural.
*   `davis:analyzers:read` y `davis:analyzers:execute` - Permiten interactuar y ejecutar diagnósticos de Davis Analyzer.
    *   *Nota: verifica el nombre exacto de estos scopes de Davis en tu tenant, ya que su nomenclatura ha variado entre versiones.*

### Solo con OAuth Client (no disponible con Platform Token)
*   `environment-api:entities:read` - Detalles de *ownership* de entidades monitorizadas. **Requiere OAuth Client.**

---

## 2. Scopes para APIs Clásicas (V1 y V2 APIs)
Estos permisos se configuran en los **Access Tokens** clásicos (`dt0c01.…`). Son los requeridos por la herramienta de extensiones **`dt-cli`** y scripts de monitorización tradicionales:

### Lectura de Telemetría (Read Scopes)
*   `entities.read` - Lectura de topología (Hosts, Process Groups, Services, Applications).
*   `metrics.read` - Lectura de métricas clásicas de series temporales.
*   `logs.read` - Acceso a los logs indexados clásicos.
*   `events.read` - Lectura de eventos clásicos.
*   `slo.read` - Lectura de Service Level Objectives (SLOs).
*   `spans.read` - Consulta de trazas.
*   `securityProblems.read` - Lectura de vulnerabilidades de seguridad.

### Escritura e Ingesta (Write/Ingest Scopes)
*   `entities.write` - Crear/modificar tags y metadatos en entidades.
*   `metrics.ingest` - Ingesta directa de métricas OpenTelemetry/StatsD.
*   `logs.ingest` - Envío de logs mediante API HTTPS.
*   `events.ingest` - Envío de eventos personalizados.
*   `openTelemetryTrace.ingest` - Ingesta de trazas OpenTelemetry externas.

### Administración y Configuración (Admin Scopes)
*   `settings.read` y `settings.write` - Lectura y escritura del Settings 2.0 del entorno.
*   `credentialVault.read` y `credentialVault.write` - Gestión de credenciales seguras.
*   `extensions.read` y `extensions.write` - Gestión, subida e instalación de extensiones.
*   `ActiveGateCertificates.read` y `ActiveGateCertificates.write` - Configuración de certificados en ActiveGates.
