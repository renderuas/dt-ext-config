# Changelog Manual — Cambios aplicados en Dynatrace

> No existe pipeline automático. **Cada vez que apliques un cambio manualmente en la interfaz
> de Dynatrace** (importar/actualizar un dashboard, workflow, notebook, o registrar una query
> nueva), agregá una fila acá — **antes o inmediatamente después** de aplicarlo.

## Cómo agregar una entrada

1. Copiá la fila de plantilla de abajo.
2. Completá todos los campos. No dejes `TBD` salvo que vuelvas a completarlo el mismo día.
3. Agregá la fila **arriba de todo** (orden cronológico descendente, más reciente primero).
4. Si el cambio corresponde a un archivo de este repo, enlazalo en la columna "Archivo".

### Plantilla de fila

```
| YYYY-MM-DD | <Dev/QA/Prod> | <nombre.apellido> | <Dashboard/Workflow/Notebook/DQL> | <Crear/Actualizar/Eliminar> | [<archivo>](ruta/al/archivo) | <motivo breve> |
```

---

## Registro

| Fecha | Entorno | Responsable | Tipo de recurso | Acción | Archivo | Motivo / Descripción |
|---|---|---|---|---|---|---|
| 2026-06-30 | Prod | <nombre.apellido> | Dashboard | Crear | [example_dashboard_infra_overview.json](dashboards/example_dashboard_infra_overview.json) | Ejemplo inicial del repo — sin aplicar aún en un entorno real. |

<!--
  Agregá nuevas filas arriba de esta línea, debajo del encabezado de la tabla.
  No borres filas antiguas: este archivo es el historial completo del equipo.
-->
