# Notebooks — Procedimiento Manual

Esta carpeta contiene **Notebooks** de Dynatrace (combinación de bloques DQL, markdown y visualizaciones)
en formato JSON. Export/import manual desde la interfaz web.

---

## 1. Cómo EXPORTAR un notebook desde el entorno de origen

1. En Dynatrace, ir a la app **Notebooks**.
2. Abrir el notebook que querés versionar.
3. Click en el menú `⋮` (esquina superior derecha) → **Export to JSON**.
4. Renombrá el archivo: `nb_<area>_<descripcion-corta>.json`.
5. Sanitizá referencias de entorno antes de guardarlo en el repo (ver sección 3).
6. Mové el archivo a `notebooks/` y hacé commit.

---

## 2. Cómo IMPORTAR un notebook en el entorno de destino

1. Copiá el archivo `.json` desde este repo.
2. Reemplazá todos los placeholders por valores reales del entorno destino.
3. En Dynatrace, ir a **Notebooks** → **Create new** → menú `⋮` → **Import JSON**.
4. Ejecutá cada bloque manualmente para confirmar que las consultas DQL devuelven datos
   (los nombres de bucket, host o servicio pueden no existir en el entorno destino).
5. Registrá la importación en el [CHANGELOG.md](../CHANGELOG.md) raíz.

---

## 3. Cómo identificar y reemplazar variables de entorno

| Campo en el JSON | Qué representa | Cómo detectarlo |
|---|---|---|
| `query` (bloques tipo `dql`) | Consultas DQL embebidas | Revisar cada bloque `"type": "dql"` |
| `"bucket"` (filtro `from logs`) | Bucket de logs específico del entorno | Buscar `bucket:` dentro de las queries |
| `entityId` en filtros | Host/Service específico | Buscar `"HOST-`, `"SERVICE-` |
| Texto en bloques markdown | Nombres de entorno, equipo, contactos | Revisar bloques `"type": "markdown"` |

**Procedimiento:** igual que en `dashboards/` — reemplazar por `${...}` antes del commit,
y por valores reales antes de importar. Ver detalle en [dashboards/README.md](../dashboards/README.md#3-cómo-identificar-y-reemplazar-variables-de-entorno).

---

## 4. Nota sobre las consultas DQL reutilizables

Si una consulta DQL de un bloque del notebook es útil de forma independiente (fuera del notebook),
copiala también a la carpeta [`dql_queries/`](../dql_queries/) en la subcarpeta que corresponda,
para que sea fácil de encontrar sin tener que abrir el notebook completo.
