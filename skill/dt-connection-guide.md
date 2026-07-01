# Guía de Conexión: Dynatrace MCP Server y Dynatrace CLIs

Esta guía detalla los pasos para conectar tu entorno al **Servidor MCP de Dynatrace** y a las herramientas de línea de comandos de Dynatrace (**`dtctl`** y **`dt-cli`**) utilizando **Tokens de Plataforma/Acceso estándar** (sin necesidad de configurar clientes OAuth).

---

## 1. Conexión al Servidor MCP de Dynatrace (Model Context Protocol)

El Servidor MCP permite a tus asistentes de IA (como Claude Desktop o extensiones de VS Code) interactuar con tu tenant. **Dynatrace no admite la conexión directa con credenciales de clientes OAuth al servidor MCP**, debido a que sus tokens expiran en 5 minutos. En su lugar, debes usar un **Platform Token** persistente.

### Requisitos
*   Tener Node.js instalado (v18+).
*   La URL de tu entorno de Dynatrace Platform (formato: `https://<tenant-id>.apps.dynatrace.com`).
*   Un **Platform Token** generado desde tu consola de Dynatrace (`Manage > Access tokens`) con los permisos detallados en `dt-api-permissions.md`.

### Configuración en Claude Desktop
Edita tu archivo de configuración `claude_desktop_config.json`:
*   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
*   **macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Añade el servidor indicando tu URL y tu Platform Token como variables de entorno:

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
        "DT_PLATFORM_TOKEN": "dt0c01.XXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      }
    }
  }
}
```

---

## 2. Conexión a la CLI de Plataforma (`dtctl`)

`dtctl` es la herramienta de consola para gestionar dashboards, notebooks, workflows y SLOs. Aunque soporta un flujo interactivo por navegador para desarrollo local, puedes configurarla directamente con tu **Platform Token** de forma estática (método estándar para servidores, automatizaciones y terminales locales).

### Instalación
Instala `dtctl` globalmente con npm:
```bash
npm install -g @dynatrace-oss/dtctl
```

### Configuración rápida por Token (Recomendado)
Para configurar tu terminal usando directamente tu token sin pasar por logins del navegador, ejecuta los siguientes comandos:

1. Crea tu contexto indicando tu URL de plataforma:
   ```bash
   dtctl config set-context mi-entorno --environment "https://abc12345.apps.dynatrace.com"
   ```
2. Asocia tu Platform Token al contexto creado:
   ```bash
   dtctl config set-token --context mi-entorno --token "dt0c01.XXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   ```
3. Activa el contexto para empezar a operar:
   ```bash
   dtctl config use-context mi-entorno
   ```
4. Comprueba la conexión listando tus dashboards:
   ```bash
   dtctl dashboards list
   ```

---

## 3. Conexión a la CLI de Extensiones (`dt-cli`)

`dt-cli` es el SDK clásico para empaquetar, firmar y subir extensiones de monitorización 2.0 (SNMP, Prometheus, JMX, etc.). Funciona exclusivamente mediante un **Access Token** clásico de Dynatrace configurado en variables de entorno.

### Instalación
Instala el SDK globalmente:
```bash
npm install -g @dynatrace/dt-cli
```

### Autenticación por Variables de Entorno
Establece las siguientes variables en tu consola antes de ejecutar comandos de la CLI:

**En Windows (PowerShell):**
```powershell
$env:DT_API_URL = "https://abc12345.live.dynatrace.com"  # Nota: Usa la URL clásica para extensions v2
$env:DT_API_TOKEN = "dt0c01.XXXXXXXX.XXXXXXXXXXXXXXXX"
```

**En macOS/Linux (Bash/Zsh):**
```bash
export DT_API_URL="https://abc12345.live.dynatrace.com"
export DT_API_TOKEN="dt0c01.XXXXXXXX.XXXXXXXXXXXXXXXX"
```

### Generar Firma y Subida
1. Genera las claves de firma locales:
   ```bash
   dt extension generate-certs
   ```
2. Sube el certificado público (`developer.crt`) a tu tenant en `Settings > Credential vault > Extension certificates`.
3. Empaqueta, firma y sube tu extensión:
   ```bash
   dt extension assemble
   dt extension sign --key developer.pem
   dt extension upload
   ```
