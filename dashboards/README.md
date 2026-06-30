# Dashboards — Procedimiento Manual

Esta carpeta contiene **Dashboards de nueva generación** de Dynatrace en formato JSON.
No hay automatización: todo export/import se hace a mano desde la interfaz web.

---

## 1. Cómo EXPORTAR un dashboard desde el entorno de origen

1. En Dynatrace, ir a **Dashboards** (menú lateral).
2. Abrir el dashboard que querés versionar.
3. Click en el menú `⋮` (esquina superior derecha del dashboard) → **Export to JSON**.
4. Se descarga un archivo `.json`. Renombralo según la convención del repo:
   `dash_<area>_<descripcion-corta>.json` (ver [README raíz](../README.md#2-convención-de-nombres-de-archivo)).
5. **Antes de guardar el archivo en el repo**, abrilo en un editor de texto y sanitizá los valores
   sensibles/específicos del entorno (ver sección 3).
6. Mové el archivo a `dashboards/` y hacé commit con un mensaje descriptivo.

---

## 2. Cómo IMPORTAR un dashboard en el entorno de destino

1. Copiá el archivo `.json` que necesitás desde este repo.
2. **Reemplazá todos los placeholders** (`${...}` / `{{...}}`) por los valores reales del
   entorno destino (ver sección 3) — usá buscar/reemplazar en tu editor de texto.
3. En Dynatrace, ir a **Dashboards** → botón **Upload** (o **Create new dashboard** → **Import JSON**,
   según versión de la UI).
4. Seleccioná el archivo `.json` ya editado con los valores reales.
5. Verificá que todos los tiles cargan datos correctamente (sin errores de "entity not found").
6. Ajustá permisos de compartición (*sharing*) y Management Zone si corresponde — estos
   **no siempre viajan** en el export y pueden requerir configuración manual post-importación.
7. Registrá la importación en el [CHANGELOG.md](../CHANGELOG.md) raíz.

---

## 3. Cómo identificar y reemplazar variables de entorno

Los dashboards exportados contienen referencias **hardcodeadas** al entorno de origen. Buscá
(`Ctrl+F`) estos patrones típicos dentro del JSON antes de reutilizarlo:

| Campo en el JSON | Qué representa | Cómo detectarlo |
|---|---|---|
| `"managementZoneId"` | ID de Management Zone | Buscar `managementZoneId` |
| `"entityId": "HOST-XXXXXXXX"` | ID de host específico | Buscar `"HOST-` |
| `"entityId": "SERVICE-XXXXXXXX"` | ID de servicio específico | Buscar `"SERVICE-` |
| `"entityId": "PROCESS_GROUP-..."` | ID de grupo de procesos | Buscar `"PROCESS_GROUP-` |
| `query` (tiles DQL) | Consultas embebidas con nombres de host/servicio | Revisar cada tile tipo `dql` |
| `tileFilter` / `filterConfig` | Filtros por tag o entidad | Buscar `tileFilter` |
| `owner` | Usuario propietario del dashboard | Buscar `"owner"` |
| URLs embebidas (markdown tiles) | Links a otros dashboards/entornos | Buscar `https://` |

**Procedimiento de sanitización (antes del commit):**
1. Reemplazá cada ID de entidad real por un placeholder descriptivo, ej: `${TU_HOST_ID}`, `${TU_SERVICE_ID}`.
2. Reemplazá el `managementZoneId` por `${TU_MZ_ID}`.
3. Reemplazá nombres de entorno en títulos/descripciones por `{{ambiente}}`.
4. Dejá un comentario o nota en la descripción del dashboard (campo `"description"`) listando
   qué placeholders contiene, si no es evidente.

**Procedimiento al importar (con valores reales):**
1. Abrí el JSON sanitizado en un editor de texto.
2. Buscar y reemplazar **todas las ocurrencias** de cada placeholder por el valor real del entorno destino.
3. Confirmá que no quedó ningún `${` o `{{` sin reemplazar antes de subir el archivo (búsqueda final).

---

## 4. Ejemplo

Ver ejemplo completo con placeholders en [`example_dashboard_infra_overview.json`](example_dashboard_infra_overview.json).
