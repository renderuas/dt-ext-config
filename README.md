# dt-ext-config — Biblioteca de Configuraciones Dynatrace

Repositorio centralizado de **Dashboards, Notebooks, Workflows y consultas DQL** de Dynatrace.

> ⚠️ **Sin automatización.** Este repo NO usa Monaco ni pipelines CI/CD. Es un control de versiones
> y manual de procedimientos. Toda aplicación de cambios en Dynatrace es **manual**, vía interfaz web
> (copiar/pegar JSON/DQL o importar archivo).

---

## 1. Estructura de directorios

```
dt-ext-config/
├── README.md                  ← Estás aquí. Visión general y convenciones.
├── CHANGELOG.md                ← Registro manual de cambios aplicados en Dynatrace.
│
├── dashboards/                 ← Dashboards de nueva generación (JSON)
│   ├── README.md               ← Procedimiento export/import + variables a reemplazar.
│   └── *.json
│
├── notebooks/                  ← Notebooks (JSON)
│   ├── README.md
│   └── *.json
│
├── workflows/                  ← Workflows / Automation (JSON)
│   ├── README.md
│   └── *.json
│
└── dql_queries/                ← Consultas DQL reutilizables (texto plano .dql)
    ├── README.md
    ├── infraestructura/        ← Hosts, procesos, K8s, cloud
    ├── aplicaciones/           ← Servicios, RUM, trazas
    ├── logs/                   ← Análisis de logs
    └── security/               ← Seguridad, auditoría, accesos
```

**Regla de oro:** cada tipo de recurso vive en su carpeta. No se mezclan JSON de dashboards con
DQL sueltas. Si un recurso no encaja, se documenta el motivo en su propio README.

---

## 2. Convención de nombres de archivo

```
<tipo>_<area>_<descripcion-corta>.<ext>
```

| Tipo de recurso | Extensión | Ejemplo |
|---|---|---|
| Dashboard | `.json` | `dash_infra_hosts-overview.json` |
| Notebook | `.json` | `nb_app_troubleshooting-latencia.json` |
| Workflow | `.json` | `wf_security_respuesta-incidente.json` |
| Consulta DQL | `.dql` | `q_infra_cpu-saturation.dql` |

- Minúsculas, separadas por guiones (`-`), sin espacios ni tildes.
- El `area` debe coincidir con la subcarpeta cuando aplique (`infraestructura`, `aplicaciones`, `logs`, `security`).

---

## 3. Convención de placeholders (variables de entorno)

Como **no existe sustitución automática de variables**, todo valor que cambie entre entornos
(Dev/QA/Prod, tenant, cluster, IDs de host/servicio, tokens) debe marcarse de forma visual y
fácil de buscar (`Ctrl+F`) antes de hacer commit.

| Notación | Uso recomendado | Ejemplo |
|---|---|---|
| `${NOMBRE_VARIABLE}` | IDs únicos, tokens, URLs, claves técnicas | `${TU_CLUSTER_ID}`, `${TU_MZ_ID}` |
| `{{ contexto }}` | Nombres/etiquetas legibles que se repiten en texto libre (títulos, descripciones) | `{{ambiente}}`, `{{equipo}}` |

**Nunca** se commitea un valor real de producción (tokens de API, IDs sensibles) ni siquiera
"de ejemplo" — se reemplaza siempre por el placeholder antes de subir el archivo al repo.

Antes de importar a Dynatrace: buscar todos los placeholders del archivo (`grep -o '\${[A-Z_]*}\|{{[a-z_ ]*}}'`)
y reemplazarlos por los valores reales del entorno destino.

---

## 4. Flujo de trabajo manual (resumen)

1. **Exportar** el recurso desde Dynatrace (ver README de la carpeta correspondiente).
2. **Sanitizar**: reemplazar IDs/tokens reales por placeholders (`${...}` / `{{...}}`).
3. **Commit** al repo con mensaje claro (`dash: agrega overview de hosts productivos`).
4. **Documentar** en [CHANGELOG.md](CHANGELOG.md).
5. Al aplicar en un entorno: **copiar el archivo**, **reemplazar placeholders por valores reales**
   del entorno destino, e **importar** vía interfaz web.
6. Registrar la aplicación en el CHANGELOG (qué entorno, quién, cuándo).

Cada carpeta (`dashboards/`, `workflows/`, `notebooks/`, `dql_queries/`) tiene su propio `README.md`
con el detalle exacto de exportación/importación para ese tipo de recurso.

---

## 5. Antes de importar — checklist rápido

- [ ] ¿Reemplacé **todos** los placeholders (`${...}`, `{{...}}`) por valores reales del entorno destino?
- [ ] ¿Verifiqué que el Management Zone / Host Group / Service ID existe en ese entorno?
- [ ] ¿Probé la consulta DQL o el dashboard en un entorno no productivo primero?
- [ ] ¿Registré el cambio en [CHANGELOG.md](CHANGELOG.md)?
