# Handoff — datos que necesito del tenant corporativo

Dashboard: `change-validation-golden-signals.json` (Dashboards app / Platform, Grail).
Objetivo: validar servicios tras un cambio comparando las 4 señales de oro (Errores, Latencia, Tráfico, Saturación) en la ventana actual vs. el periodo anterior.

Como no puedo desplegar ni consultar el tenant desde este PC, necesito que **ejecutes estas queries en un Notebook del tenant corporativo y me pegues la salida** (con 5–20 filas basta). Con eso ajusto las variables y los tiles y te devuelvo el JSON final listo para importar.

> Cómo ejecutarlas: abre la app **Notebooks** en Dynatrace → nueva sección DQL → pega la query → *Run* → copia la tabla resultante (o exporta a CSV) y pégala bajo cada bloque.

---

## Bloque A — Formato y ubicación de las tags (CRÍTICO)

Todo el encadenado de variables depende de esto. Necesito ver la cadena EXACTA de las tags y en qué entidad viven.

### A1. Tags en servicios
```dql
fetch dt.entity.service
| fields entity.name, tags
| limit 20
```
Pega aquí la salida:
```
<pegar>
```

### A2. Tags en hosts
```dql
fetch dt.entity.host
| fields entity.name, tags
| limit 20
```
Pega aquí la salida:
```
<pegar>
```

### A3. Tags en process groups (por si el APP vive aquí)
```dql
fetch dt.entity.process_group_instance
| fields entity.name, tags
| limit 20
```
Pega aquí la salida:
```
<pegar>
```

**Lo que necesito confirmar con A1–A3:**
- [ ] ¿La tag `AESM_GLOBAL_ENVIRONMENT:<valor>` está en **servicios**, en **hosts** o en ambos?
- [ ] ¿La tag de APP está en servicios o solo en hosts? ¿Se llama `AESM_GLOBAL_APP:` (minúscula) o `APP:` (mayúscula)? (vi las dos en los ejemplos)
- [ ] ¿Los valores de entorno reales son? (ej. `Development`, `INT`, `PRO`, `PRE`...): `______________`

---

## Bloque B — Relación servicio ↔ app (solo si el APP NO está en el servicio)

Si en A1 los servicios **no** llevan la tag de APP (solo la llevan los hosts), necesito saber cómo mapear un servicio a su app. Ejecuta:

```dql
fetch dt.entity.service
| fields entity.name, sid = id, runs_on = instance_of[dt.entity.process_group], hosts = runs_on[dt.entity.host]
| limit 10
```
Pega aquí la salida:
```
<pegar>
```

> Si esta query da error en los nombres de relación, prueba también:
> ```dql
> fetch dt.entity.service | fieldsAdd relacionados = * | limit 2
> ```
> y pégame los nombres de campos de relación que aparezcan (`runs_on...`, `calls...`, `instance_of...`).

---

## Bloque C — Disponibilidad de métricas de servicio (CRÍTICO)

Los tiles usan la familia moderna `dt.service.request.*`. Confirma que existe y tiene datos.

### C1. Familia moderna (la que uso ahora)
```dql
timeseries { reqs = sum(dt.service.request.count), fails = sum(dt.service.request.failure_count), p90 = percentile(dt.service.request.response_time, 90) }, by: { dt.entity.service }, from: -2h
| limit 5
```
Resultado (marca uno):
- [ ] Devuelve filas con datos  → usamos esta familia (nada que cambiar)
- [ ] Devuelve vacío / error "metric not found" → pasar a C2

Pega aquí la salida o el error:
```
<pegar>
```

### C2. Familia clásica (fallback)
```dql
timeseries { reqs = sum(builtin:service.requestCount.total), fails = sum(builtin:service.errors.total.count), rt = avg(builtin:service.response.time) }, by: { dt.entity.service }, from: -2h
| limit 5
```
Pega aquí la salida:
```
<pegar>
```

> Si funciona C2 y no C1, te reescribo todos los tiles con `builtin:service.*` (response.time va en microsegundos, igual que la moderna).

---

## Bloque D — Spans (tile de detalle "Mixto")

```dql
fetch spans, from: -1h
| fields dt.entity.service, span.name, span.status_code
| limit 10
```
Resultado (marca uno):
- [ ] Devuelve spans  → el tile de detalle funciona
- [ ] Vacío / sin permiso / spans no ingestados → quito ese tile o lo cambio por logs

Pega aquí la salida:
```
<pegar>
```
- [ ] ¿Qué valores toma `span.status_code`? (`ERROR`/`OK`/`UNSET`...): `______________`

---

## Bloque E — Decisiones abiertas (por tus últimas ediciones de variables)

Marca lo que prefieras; ajusto variables **y** tiles en consecuencia:

1. **Identificador del servicio en la variable `service`:**
   - [ ] Devolver **ID** (`toString(id)`) y filtrar los tiles por `dt.entity.service`  ← más robusto (recomendado)
   - [ ] Devolver **nombre** y filtrar por `entityName(...)`
   > Ahora mismo la variable devuelve ID pero los tiles filtran por nombre → **tiles vacíos**. Hay que unificar. Dime cuál.

2. **Opción "ALL":** has añadido `record(value = "ALL")` en `app` y `service`.
   - [ ] Quiero soporte "ALL" (sin filtro) → adapto los tiles a `filter (in("ALL", $service) or in(dt.entity.service, $service))`
   - [ ] No hace falta "ALL", quito el sentinel

3. **Filtro de entorno en `service`:** tu versión tiene `filter $environment == "ALL"` con la rama del entorno comentada, así que al elegir un entorno concreto **la lista sale vacía**. ¿Confirmas que quieres filtrar servicios por entorno? (necesito el resultado de A1/B para saber por qué campo).

4. **Umbrales de las 4 señales** (por si AXA es más estricta). Actuales:
   | Señal | WARN | CRÍTICO |
   |---|---|---|
   | Errores (Fail rate) | Δ > 0.5 pp | Δ > 2 pp ó fail actual > 5% |
   | Latencia (p90) | Δ > 10% | Δ > 30% |
   | Tráfico (throughput) | \|Δ\| > 20% | \|Δ\| > 50% |
   | Saturación (p99) | Δ > 10% | Δ > 30% |
   - [ ] Me valen  · [ ] Cámbialos a: `______________`

5. **¿Anclar a la hora del despliegue?** (variable extra con timestamp del cambio para comparar antes/después de un instante exacto en vez de ventana rodante)
   - [ ] No, ventana rodante actual vs anterior está bien
   - [ ] Sí, añade la variable `deploy_time`

---

## Bloque F — Versión del documento e importación

- Versión del documento del dashboard: he dejado `version: 21` (la que pusiste). Si al importar Dynatrace se queja de versión, dime cuál te sugiere: `______________`

### Cómo importar el JSON en el tenant corporativo
1. Abre la app **Dashboards**.
2. Botón **+ / Upload** (o menú `···` → *Upload dashboard*) y selecciona `change-validation-golden-signals.json`.
3. Se abre en modo edición. Comprueba que las 4 variables (`environment`, `app`, `service`, `timeframe`) resuelven valores en los desplegables.
4. **Guarda**. Si alguna variable no resuelve, es por lo del Bloque A/B — mándame las salidas y lo arreglo.

---

## Resumen de lo mínimo imprescindible
Si vas con prisa, con esto ya puedo cerrar el 90%:
1. **A1** y **A2** (salida completa).
2. **C1** (¿funciona sí/no?).
3. **E1** (¿ID o nombre en la variable service?).
