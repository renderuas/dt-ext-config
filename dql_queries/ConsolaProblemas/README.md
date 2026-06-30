# ConsolaProbelms.ts - Guia de mantenimiento

Este documento explica como funciona la asignacion de owner en el script `ConsolaProbelms.ts`, y como mantenerlo sin romper prioridades.

## Objetivo del script

- Consultar problemas Dynatrace por DQL.
- Enriquecer entidades, tags, host group y comentarios.
- Calcular owner final segun un motor de reglas con prioridad.
- Devolver un data frame listo para panel/reporting.

## Flujo general

1. Ejecuta consulta DQL y obtiene records.
2. Normaliza entidades afectadas y root cause.
3. Obtiene host group, OS y tags (con fallback a API REST cuando hace falta).
4. Ejecuta `determineOwner(...)`.
5. Construye salida final con campos funcionales.

## Motor de reglas de owner

El owner se decide por `OWNER_RULES`.

- Todas las reglas tienen `condition`, `owner` y `priority`.
- Se ordenan de mayor a menor prioridad.
- La primera regla que cumpla gana.

Regla base del motor:

- Funcion: `determineOwner(...)`
- Clase de contexto: `OwnerContext`

## Priorizacion importante (resumen)

Orden logico actual (alto -> bajo):

1. PaaS / patrones siempre APP / patrones siempre OS
2. Filesystem critico de SO (Linux/Windows)
3. Asignacion directa de OS Service (configurable)
4. Filesystem Linux data BD (configurable)
5. Filesystem Linux data APP (configurable)
6. Host Technology Map por HostGroup
7. Grupo BD por HostGroup (TIER=DB)
8. Tag AGO_OS
9. Fallback final APP

## Configuracion rapida: Filesystem Linux

### 1) Rutas criticas de SO (owner Linux)

Constante:

- `LINUX_OS_FS_PATHS`

Uso:

- Si un problema de FS cae en estas rutas, owner = Linux.

### 2) Rutas Linux de datos para BD

Constante:

- `DB_DATA_FS_PATHS`

Uso:

- Si un problema de FS Linux contiene alguna de estas rutas (y no es FS critico), owner = BD.

Ejemplo:

- `/dbmaint`

### 3) Rutas Linux de datos para APP

Constante:

- `APP_DATA_FS_PATHS`

Uso:

- Si la lista tiene valores: funciona como allow-list para APP.
- Si esta vacia: cualquier FS Linux no critico y no BD cae en APP.

Ejemplo:

- `/export/home`

## Configuracion rapida: OS Services

Se incorporo asignacion directa para OS Services.

Constante:

- `OS_SERVICE_DIRECT_OWNER_RULES`

Formato:

- Lista de objetos con:
  - `contains`: texto a buscar
  - `owner`: owner destino (`Windows`, `Linux`, `APP`, `BD`, etc.)

Como hace match:

- `contains` es case-insensitive.
- Busca en:
  - `problemDetails`
  - nombres de entidades afectadas
  - tags consolidados del problema
- La primera coincidencia de la lista gana.

Ejemplo:

- `{ contains: 'group policy client', owner: 'Windows' }`
- `{ contains: 'gpsvc', owner: 'Windows' }`

## Buenas practicas de mantenimiento

1. Cambiar primero listas de configuracion, no la logica.
2. Mantener reglas especificas por encima de reglas genericas.
3. Evitar solapamientos ambiguos entre listas BD y APP.
4. Si hay solape, la prioridad y el orden definen el resultado.
5. Antes de subir cambios, validar al menos 3 casos:
   - un FS critico SO
   - un FS data APP
   - un OS Service con asignacion directa

## Casos conocidos

- FS Linux en `/export/home/...` -> APP (si esta en `APP_DATA_FS_PATHS`).
- FS Linux en `/dbmaint/...` -> BD (si esta en `DB_DATA_FS_PATHS`).
- OS Service `Group Policy Client` / `gpsvc` -> Windows por regla directa, aunque el HostGroup sea DB.

## Troubleshooting rapido

Si un owner no sale como esperas:

1. Confirmar `problemDetails`, `hostsGroup`, `osType`, `entityType` y tags.
2. Revisar si alguna regla de mayor prioridad ya hizo match.
3. Revisar listas:
   - `LINUX_OS_FS_PATHS`
   - `DB_DATA_FS_PATHS`
   - `APP_DATA_FS_PATHS`
   - `OS_SERVICE_DIRECT_OWNER_RULES`
4. Verificar que el texto en `contains` realmente aparece en los datos de entrada.

## Sugerencia de evolucion

Si el numero de reglas sigue creciendo, siguiente paso recomendado:

- Extraer configuracion a archivo JSON/YAML externo.
- Mantener solo el motor de evaluacion dentro de `ConsolaProbelms.ts`.
