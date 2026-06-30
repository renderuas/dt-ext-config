# Workflows — Procedimiento Manual

Esta carpeta contiene definiciones JSON de **Workflows** (Dynatrace AutomationEngine / Workflow App).
Export/import 100% manual desde la interfaz web.

---

## 1. Cómo EXPORTAR un workflow desde el entorno de origen

1. En Dynatrace, ir a la app **Workflows**.
2. Abrir el workflow que querés versionar.
3. Click en el menú `⋮` (esquina superior derecha) → **Export** (descarga JSON).
4. Renombrá el archivo según la convención: `wf_<area>_<descripcion-corta>.json`.
5. **Antes de guardar en el repo**, sanitizá credenciales y referencias de entorno (ver sección 3).
6. Mové el archivo a `workflows/` y hacé commit.

---

## 2. Cómo IMPORTAR un workflow en el entorno de destino

1. Copiá el archivo `.json` desde este repo.
2. Reemplazá **todos** los placeholders por valores reales del entorno destino.
3. En Dynatrace, ir a **Workflows** → **Create workflow** → menú `⋮` → **Import** (o "Upload YAML/JSON",
   según versión de la UI).
4. Seleccioná el archivo `.json` editado.
5. **Revisá manualmente cada acción del workflow** (tasks): las integraciones externas
   (Slack, Jira, ServiceNow, webhooks genéricos) requieren reconfigurar la conexión/credencial
   en el entorno destino — **no se exportan tokens ni secretos**.
6. Verificá el trigger (schedule, event-based, on-demand) — puede requerir reactivarse manualmente
   tras la importación (los workflows importados suelen quedar deshabilitados por defecto).
7. Ejecutá una corrida de prueba (**Run now**) antes de confiar en el trigger automático.
8. Registrá la importación en el [CHANGELOG.md](../CHANGELOG.md) raíz.

---

## 3. Cómo identificar y reemplazar variables de entorno

| Campo en el JSON | Qué representa | Cómo detectarlo |
|---|---|---|
| `"managementZoneId"` | Management Zone usada en condiciones/filtros | Buscar `managementZoneId` |
| `actor` / `credential` en tasks de tipo `http` o `webhook` | Credenciales/tokens de servicios externos | Buscar `"credential"`, `"token"`, `"url"` |
| `entityId` en filtros de eventos | Host/Service específico que dispara el workflow | Buscar `"HOST-`, `"SERVICE-` |
| `recipients` / `channel` (tasks de notificación) | Canal de Slack, lista de correo, etc. | Buscar `"channel"`, `"recipients"`, `"email"` |
| `input` de tasks DQL | Consultas embebidas con referencias de entorno | Revisar cada `task` tipo `dql-query` |

**Regla crítica de seguridad:** ningún archivo en este repo debe contener tokens, API keys,
webhooks reales o credenciales. Reemplazalos siempre por `${TU_TOKEN_SLACK}`, `${TU_WEBHOOK_URL}`, etc.
Si Dynatrace exporta el secreto en texto plano (poco común, pero revisar), **eliminalo del JSON
antes de commitear** — no solo enmascararlo.

**Procedimiento de sanitización (antes del commit):**
1. Reemplazá IDs de entidad y Management Zone por placeholders `${...}`.
2. Reemplazá credenciales/tokens por `${TU_CREDENCIAL_X}` y dejá una nota en el README o en un
   comentario del propio commit indicando qué credencial de Dynatrace (Settings → Credential Vault)
   debe usarse en su lugar.
3. Reemplazá nombres de canal/entorno en mensajes de notificación por `{{ambiente}}`.

---

## 4. Ejemplo

Ver ejemplo completo con placeholders en [`example_workflow_auto_remediation.json`](example_workflow_auto_remediation.json).
