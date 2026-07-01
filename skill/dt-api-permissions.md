# Permisos y Scopes de Tokens en Dynatrace (Acceso Completo)

Dynatrace utiliza un modelo de seguridad basado en tokens de acceso directo. **No necesitas configurar Clientes OAuth** ni registros complejos de cliente para usar el Servidor MCP o las herramientas CLI. En su lugar, puedes generar **Tokens de Acceso (Access Tokens / Platform Tokens)** estándar directamente desde la interfaz web de tu tenant.

A continuación se detallan los permisos (scopes) necesarios que debes activar al crear tus tokens para poder ejecutar prácticamente cualquier acción mediante API.

---

## 1. Scopes para la Nueva Plataforma (Grail, Workflows y Servidor MCP)
Estos permisos se configuran al crear un **Platform Token** (o Personal Access Token) en tu tenant de Dynatrace. Son los requeridos por el **Servidor MCP** y la herramienta **`dtctl`**:

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

### Model Context Protocol (MCP Gateway) & Inteligencia Artificial (Davis)
*   `mcp-gateway:servers:invoke` - Requerido para poder invocar servidores MCP.
*   `mcp-gateway:servers:read` - Requerido para leer la configuración de servidores MCP.
*   `davis-copilot:conversations:execute` - Permite al MCP utilizar el "Help Agent" para resolver preguntas generales de Dynatrace.
*   `davis-copilot:nl2dql:execute` - Permite al MCP traducir lenguaje natural a consultas DQL de Grail.
*   `davis-copilot:dql2nl:execute` - Permite al MCP explicar consultas DQL complejas en lenguaje natural.
*   `davis:analyzers:read` y `davis:analyzers:execute` - Permiten interactuar y ejecutar diagnósticos de Davis Analyzer.

---

## 2. Scopes para APIs Clásicas (V1 y V2 APIs)
Estos permisos se configuran en los **Access Tokens** clásicos. Son los requeridos por la herramienta de extensiones **`dt-cli`** y scripts de monitorización tradicionales:

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
