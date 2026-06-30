# DQL Queries — Biblioteca de Consultas

Consultas DQL reutilizables, organizadas por dominio. Formato de archivo: texto plano `.dql`
(la consulta sola, sin envoltorio JSON), para poder copiar/pegar directo en **Notebooks**,
**Dashboards** (tile DQL) o en el editor de Workflows.

---

## 1. Organización por subcarpeta

| Subcarpeta | Contenido |
|---|---|
| `infraestructura/` | Hosts, procesos, contenedores, Kubernetes, cloud (CPU, memoria, disco, red) |
| `aplicaciones/` | Servicios, RUM, trazas distribuidas, errores de aplicación |
| `logs/` | Análisis y búsqueda de logs (`fetch logs`) |
| `security/` | Auditoría, accesos, vulnerabilidades, eventos de seguridad |

Si una consulta cruza dominios (ej. logs + seguridad), va en la carpeta del dominio **principal**
y se referencia desde la otra con un comentario.

---

## 2. Cómo usar una consulta de este repo

1. Abrí el archivo `.dql` correspondiente.
2. Reemplazá los placeholders (`${...}` / `{{...}}`) por los valores reales de tu entorno
   (ver convención en el [README raíz](../README.md#3-convención-de-placeholders-variables-de-entorno)).
3. Pegá la consulta en:
   - **Notebooks** → nuevo bloque DQL, o
   - **Dashboards** → tile → "Add tile" → DQL, o
   - **Workflows** → task tipo "Query records" / "Send DQL query".
4. Ejecutá y validá el resultado **antes** de guardarlo dentro de un dashboard/notebook/workflow.

---

## 3. Cómo aportar una consulta nueva al repo

1. Probala en Dynatrace hasta que funcione correctamente.
2. Reemplazá los valores específicos de tu entorno por placeholders.
3. Guardala con nombre descriptivo: `q_<area>_<descripcion-corta>.dql` (ver convención en el README raíz).
4. Agregá un encabezado de comentario (ver plantilla abajo) con propósito, parámetros y autor.
5. Commit + entrada en el [CHANGELOG.md](../CHANGELOG.md) raíz (opcional para queries, recomendado si es crítica).

### Plantilla de encabezado para cada archivo `.dql`

```
// Propósito: <qué resuelve esta consulta, en una línea>
// Parámetros a reemplazar: ${PLACEHOLDER_1}, ${PLACEHOLDER_2}
// Autor: <nombre> | Fecha: <YYYY-MM-DD>
```

---

## 4. Ejemplos

- [`infraestructura/hosts_cpu_saturation.dql`](infraestructura/hosts_cpu_saturation.dql)
- [`aplicaciones/service_error_rate.dql`](aplicaciones/service_error_rate.dql)
- [`logs/log_errors_by_service.dql`](logs/log_errors_by_service.dql)
- [`security/failed_logins.dql`](security/failed_logins.dql)
