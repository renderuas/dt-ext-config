# Guía de Conexión: Dynatrace MCP Server y Dynatrace CLIs

Esta guía detalla los pasos para conectar tu entorno al **Servidor MCP de Dynatrace** (local y remoto) y a las herramientas de línea de comandos de Dynatrace (**`dtctl`** y **`dt-cli`**) utilizando **Tokens de Plataforma / Acceso estándar** (sin necesidad de configurar clientes OAuth para la mayoría de los casos).

> **Nota sobre prefijos de token (importante):**
> - Un **Platform Token** empieza por `dt0s16.` → se usa para la nueva plataforma (Grail, Workflows, MCP Server, `dtctl`).
> - Un **Access Token clásico** empieza por `dt0c01.` → se usa para APIs v1/v2 clásicas y para la CLI de extensiones (`dt-cli`).
> No los confundas: usar el prefijo equivocado provocará errores de autenticación (401).

---

## 1. Conexión al Servidor MCP de Dynatrace (Model Context Protocol)

El Servidor MCP permite a tus asistentes de IA (como Claude Desktop, Claude Code o extensiones de VS Code) interactuar con tu tenant. **Dynatrace no admite la conexión al servidor MCP mediante credenciales de cliente OAuth de forma directa**, porque el token que devuelve OAuth solo es válido 5 minutos. En su lugar, se recomienda usar un **Platform Token** persistente.

Existen **dos variantes** del servidor MCP:

### Opción A — MCP Server Remoto (recomendado en entornos con Node.js bloqueado)

No requiere Node.js ni instalación local. Es el servidor alojado por Dynatrace, ideal para entornos corporativos restringidos o para conectar otros agentes.

**Requisitos**
* La URL de tu entorno de Dynatrace Platform (`https://<tenant-id>.apps.dynatrace.com`).
* Un **Platform Token** (`dt0s16.…`) con, como mínimo, los scopes `mcp-gateway:servers:invoke` y `mcp-gateway:servers:read`, más los scopes de datos que vayas a consultar.

**Configuración (`mcp.json` de VS Code / cliente MCP):**

```json
{
  "mcpServers": {
    "dynatrace": {
      "url": "https://abc12345.apps.dynatrace.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "transport": "streamable-http",
      "headers": {
        "Authorization": "Bearer dt0s16.XXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  }
}
```

> VS Code no refresca automáticamente los tokens caducados: cuando el token expire, genera uno nuevo y actualiza la configuración.

### Opción B — MCP Server Local (vía `npx`, requiere Node.js)

Ejecuta el servidor OSS localmente. Requiere **Node.js v18+**, por lo que no es viable si Node.js está bloqueado en tu equipo.

**Requisitos**
* Node.js v18+ instalado.
* La URL de tu entorno de Dynatrace Platform (`https://<tenant-id>.apps.dynatrace.com`).
* Un **Platform Token** (`dt0s16.…`) con los permisos detallados en `dt-api-permissions.md`.

**Configuración en Claude Desktop** — edita `claude_desktop_config.json`:
*   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
*   **macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dynatrace": {
      "command": "npx",
      "args": [
        "-y",
        "@dynatrace-oss/dynatrace-mcp-server@latest"
      ],
      "env": {
        "DT_ENVIRONMENT": "https://abc12345.apps.dynatrace.com",
        "DT_PLATFORM_TOKEN": "dt0s16.XXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  }
}
```

> Si solo indicas `DT_ENVIRONMENT` (sin token), el servidor local intentará abrir el navegador para autenticarte por SSO y almacenará el token en el llavero del SO.

> **Excepción de scope:** algunas funciones que requieren `environment-api:entities:read` (p. ej. detalles de *ownership* de entidades) **solo funcionan con OAuth Client**, no con Platform Token. Para el resto de casos de uso, el Platform Token es suficiente.

---

## 2. Conexión a la CLI de Plataforma (`dtctl`)

`dtctl` es la herramienta de consola (estilo `kubectl`) para gestionar dashboards, notebooks, workflows, SLOs, settings y consultas DQL. Es un **binario único en Go, sin dependencias** (no usa Node.js).

### Instalación
Método recomendado (macOS/Linux):
```bash
brew install dynatrace-oss/tap/dtctl
```
En Windows o sin Homebrew, descarga el binario correspondiente desde las *releases* del repositorio `dynatrace-oss/dtctl` en GitHub y colócalo en tu `PATH`.

### Configuración por SSO / OAuth (recomendado para uso local interactivo)
Abre el navegador para autenticarte; los tokens se guardan y refrescan automáticamente:
```bash
dtctl auth login --context mi-entorno --environment "https://abc12345.apps.dynatrace.com"
```

### Configuración por Platform Token (recomendado para CI/CD o entornos headless)
```bash
# 1. Crea el contexto referenciando una credencial por nombre
dtctl config set-context mi-entorno \
  --environment "https://abc12345.apps.dynatrace.com" \
  --token-ref mi-token

# 2. Almacena tu Platform Token de forma segura bajo ese nombre
dtctl config set-credentials mi-token \
  --token "dt0s16.XXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### Verificación
```bash
# Comprueba la conexión y la configuración
dtctl doctor

# Muestra el usuario autenticado
dtctl auth whoami

# Listar recursos (verbo-sustantivo, estilo kubectl)
dtctl get dashboards
dtctl get workflows
```

### Skill para agentes de IA
`dtctl` incluye una *Agent Skill* que enseña a los asistentes (Claude Code, Copilot, etc.) a operarlo:
```bash
dtctl skills install --for claude
```

---

## 3. Conexión a la CLI de Extensiones (`dt-cli`)

`dt-cli` es la herramienta clásica en **Python** para empaquetar, firmar y subir extensiones de monitorización 2.0 (SNMP, Prometheus, JMX, etc.). Funciona mediante un **Access Token clásico** (`dt0c01.…`) configurado en variables de entorno.

### Instalación
Es un paquete **Python** (no npm):
```bash
pip install dtcli
```

### Autenticación por Variables de Entorno
Establece las siguientes variables antes de ejecutar comandos:

**En Windows (PowerShell):**
```powershell
$env:DT_API_URL = "https://abc12345.live.dynatrace.com"  # URL clásica para extensions v2
$env:DT_API_TOKEN = "dt0c01.XXXXXXXX.XXXXXXXXXXXXXXXX"
```

**En macOS/Linux (Bash/Zsh):**
```bash
export DT_API_URL="https://abc12345.live.dynatrace.com"
export DT_API_TOKEN="dt0c01.XXXXXXXX.XXXXXXXXXXXXXXXX"
```

### Generar Firma y Subida
1. Genera la CA y el certificado de desarrollador:
   ```bash
   dt ext genca
   dt ext generate-developer-pem --ca-crt ca.pem --ca-key ca.key -o dev.pem
   ```
2. Sube el certificado público a tu tenant en `Settings > Credential vault > Extension certificates`.
3. Empaqueta, firma y sube tu extensión:
   ```bash
   dt ext assemble
   dt ext sign --key dev.pem
   dt ext upload
   ```

> Verifica los nombres exactos de subcomandos con `dt ext --help`, ya que pueden variar ligeramente según la versión instalada.
