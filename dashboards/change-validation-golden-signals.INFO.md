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
{
  "records": [
    {
      "entity.name": "CM",
      "tags": [
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "azure.location:westeurope",
        "Vulnerability test:apps-set-java",
        "AESM_GLOBAL_APP:PXPA",
        "ENVIRONMENT:PRO",
        "azure.resource.group:z-aes-pxpa-pr01-ew1-01",
        "TIER:FRONT",
        "azure.subscription:7b0ee8af-1494-4621-b118-84a3043b096d",
        "host:cama900f, cama9010",
        "dt.host_group.id:PRO_FRONT_JBOSS_SHARED_.PXPA.JWEB.",
        "TECHNOLOGY:JBOSS"
      ]
    },
    {
      "entity.name": "PORTALOPS - PRO - portal-search-web",
      "tags": [
        "Vulnerability test:apps-set-java",
        "AESM_App_Purpose:PORTALOPS",
        "ENVIRONMENT:PRO",
        "[Environment]DT_RELEASE_PRODUCT",
        "host:portales-operaciones-pro-principal-liferay-7c8b9b749-4fq94, portales-operaciones-pro-principal-liferay-7c8b9b749-ws9gx, portales-operaciones-pro-principal-liferay-f87cdbcd6-qlbbb",
        "[Environment]ENVIRONMENT:prod",
        "k8s.namespace.name:z-app-portaldeoperaciones-ew1-prod-axa-es",
        "[Environment]DT_RELEASE_VERSION",
        "APP:PORTALOPS",
        "[Environment]APP:portal-operaciones"
      ]
    },
    {
      "entity.name": "spitarif",
      "tags": [
        "TECHNOLOGY:POSTGRE",
        "TIER:DB",
        "ENVIRONMENT:PRE",
        "aes_monitoring_enabled:non-prod",
        "TECHNOLOGY:PostgreSQL",
        "AESM_GLOBAL_APP:Atria",
        "APP:ATRIA",
        "ENVIRONMENT:DEV",
        "host:dama2019",
        "AESM_GLOBAL_ENVIRONMENT:Development"
      ]
    },
    {
      "entity.name": "SP_Policy_Liferisk_Healthsuscription_Operations.ws.pub",
      "tags": [
        "APP:ESB",
        "azure.location:westeurope",
        "AESM_GLOBAL_APP:ESB-Spain",
        "ENVIRONMENT:PRO",
        "aes_monitoring_enabled:prod",
        "aes_app_guardia:yes",
        "host:cama207c, cama207e",
        "TIER:IS",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "Vulnerability test:apps-set-java",
        "TECHNOLOGY:WEBMETHODS",
        "dt.host_group.id:PRO_IS_WEBMETHODS_ESB",
        "azure.resource.group:z-aes-esb-pr01-ew1-01",
        "azure.subscription:7b0ee8af-1494-4621-b118-84a3043b096d"
      ]
    },
    {
      "entity.name": "SiniestrosApiImpl",
      "tags": [
        "AESM_App_Purpose:NED_BackNed",
        "k8s.namespace.name:liferay-ned-prod-axa-es",
        "APP:NED",
        "Vulnerability test:apps-set-java",
        "ENVIRONMENT:PRO",
        "host:mediadores-pro-principal-liferay-6457f544f6-959nw, mediadores-pro-principal-liferay-6457f544f6-jc2m5, mediadores-pro-principal-liferay-6457f544f6-xppgj, mediadores-pro-principal-liferay-c6f9bf69c-5nvb4, mediadores-pro-principal-liferay-c6f9bf69c-9spsh, mediadores-pro-principal-liferay-c6f9bf69c-sk9x4"
      ]
    },
    {
      "entity.name": "Tomcat-1/localhost",
      "tags": [
        "APP:RPS",
        "azure.location:westeurope",
        "ENVIRONMENT:PRO",
        "aes_monitoring_enabled:prod",
        "aes_app_guardia:yes",
        "TIER:BACKOPES",
        "azure.resource.group:z-aes-rps-pr01-ew1-01",
        "AESM_GLOBAL_APP:RPS",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "Vulnerability test:apps-set-java",
        "dt.host_group.id:PRO_BACKOPES_JBOSS_RPS",
        "AESM_App_Purpose:RPS_BACKOPES_PRO",
        "azure.subscription:7b0ee8af-1494-4621-b118-84a3043b096d",
        "host:cama902b",
        "TECHNOLOGY:JBOSS"
      ]
    },
    {
      "entity.name": "wm.server.portAccess",
      "tags": [
        "AESM_vmstopweekend:true",
        "APP:ESB",
        "ENVIRONMENT:PRE",
        "azure.location:westeurope",
        "AESM_vmstoptime:01\\:00",
        "AESM_vmstoptime:23\\:00",
        "AESM_GLOBAL_APP:ESB-Spain",
        "TIER:APIGW",
        "AESM_vmstarttime:07\\:00",
        "azure.resource.group:z-aes-esb-pp01-ew1-01",
        "AESM_vmstartstop:true",
        "azure.resource.group:Z-AES-ESB-PP01-EW1-01",
        "aes_monitoring_enabled:non-prod",
        "Vulnerability test:apps-set-java",
        "TECHNOLOGY:WEBMETHODS",
        "azure.subscription:0794959b-a80f-4de4-a327-7567945d0d57",
        "AESM_GLOBAL_ENVIRONMENT:Pre-Production",
        "dt.host_group.id:PRE_APIGW_WEBMETHODS_ESB",
        "host:bama2023, bama2025"
      ]
    },
    {
      "entity.name": "classic-theme",
      "tags": [
        "k8s.namespace.name:liferay-portales-prod-axa-es",
        "host:portales-pro-principal-liferay-596b995444-mgjsz, portales-pro-principal-liferay-5d5bcfb674-8m5sj, portales-pro-principal-liferay-5d5bcfb674-qj8g2",
        "Vulnerability test:apps-set-java",
        "APP:PORTALES",
        "ENVIRONMENT:PRO"
      ]
    },
    {
      "entity.name": "MYRIAM-PRE-APP-APACHE-sirius-pp.axa-seguros-es.intraxa:9085",
      "tags": [
        "host:bamai008",
        "ENVIRONMENT:PRE",
        "azure.location:westeurope",
        "APP:MYRIAM",
        "TECHNOLOGY:APACHE",
        "aesm_global_app:myriam",
        "azure.resource.group:z-aes-iam-pp01-ew1-01",
        "aesm_global_environment:pre",
        "TIER:APP",
        "aes_monitoring_enabled:non-prod",
        "azure.subscription:0794959b-a80f-4de4-a327-7567945d0d57",
        "AESM_GLOBAL_APP:IAM-Spain",
        "dt.host_group.id:PRE_APP_APACHE_MYRIAM",
        "AESM_GLOBAL_ENVIRONMENT:Pre-Production"
      ]
    },
    {
      "entity.name": "RPSEditorTextoService",
      "tags": [
        "APP:RPS",
        "azure.location:westeurope",
        "ENVIRONMENT:PRO",
        "aes_monitoring_enabled:prod",
        "aes_app_guardia:yes",
        "AESM_App_Purpose:RPS_BACK_PRO",
        "TIER:BACK",
        "azure.resource.group:z-aes-rps-pr01-ew1-01",
        "AESM_GLOBAL_APP:RPS",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "Vulnerability test:apps-set-java",
        "host:cama902d, cama902f",
        "azure.subscription:7b0ee8af-1494-4621-b118-84a3043b096d",
        "dt.host_group.id:PRO_BACK_JBOSS_RPS",
        "TECHNOLOGY:JBOSS"
      ]
    },
    {
      "entity.name": "ais.axa.es:9082",
      "tags": [
        "dt.host_group.id:PRO_APP_APACHE_IAM",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "TIER:APP",
        "TECHNOLOGY:APACHE",
        "ENVIRONMENT:PRO",
        "APP:IAM",
        "AESM_GLOBAL_APP:IAM-Spain",
        "host:camai001, camai003"
      ]
    },
    {
      "entity.name": "Mediadores.NET:39001 (/AXA.WEBMED.WSTUNELING)",
      "tags": [
        "azure.location:westeurope",
        "EntidadCritica",
        "Mediadores Pool:- APPPOOL_SS_REPL2",
        "ENVIRONMENT:PRO",
        "dt.host_group.id:PRO_APP_IIS_WEBMED_IaaS",
        "AESM_App_Purpose:WEBMED_IAAS_APP",
        "AESM_GLOBAL_APP:WEBMED-Spain",
        "Vulnerability test:apps-tag-net",
        "TECHNOLOGY:IIS",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "TIER:APP",
        "host:camah02a, camah03d, camah040, camah041",
        "APP:WEBMED_IaaS"
      ]
    },
    {
      "entity.name": "wm.server.ports",
      "tags": [
        "AESM_vmstopweekend:true",
        "APP:ESB",
        "ENVIRONMENT:PRE",
        "azure.location:westeurope",
        "AESM_vmstoptime:01\\:00",
        "AESM_vmstoptime:23\\:00",
        "AESM_GLOBAL_APP:ESB-Spain",
        "TIER:APIGW",
        "AESM_vmstarttime:07\\:00",
        "azure.resource.group:z-aes-esb-pp01-ew1-01",
        "AESM_vmstartstop:true",
        "azure.resource.group:Z-AES-ESB-PP01-EW1-01",
        "aes_monitoring_enabled:non-prod",
        "Vulnerability test:apps-set-java",
        "TECHNOLOGY:WEBMETHODS",
        "azure.subscription:0794959b-a80f-4de4-a327-7567945d0d57",
        "AESM_GLOBAL_ENVIRONMENT:Pre-Production",
        "dt.host_group.id:PRE_APIGW_WEBMETHODS_ESB",
        "host:bama2023, bama2025"
      ]
    },
    {
      "entity.name": "default-host (/business-central)",
      "tags": [
        "azure.resource.group:Z-AES-MUTU-PP01-EW1-01",
        "AESM_vmstopweekend:true",
        "ENVIRONMENT:PRE",
        "azure.location:westeurope",
        "AESM_vmstoptime:23\\:00",
        "AESM_vmstarttime:07\\:00",
        "dt.host_group.id:PRE_FRONT_JBOSS_SHARED_.CAM.CAEM.OMEGA.SPC.FWSD.",
        "AESM_vmstartstop:true",
        "aes_monitoring_enabled:non-prod",
        "Vulnerability test:apps-set-java",
        "azure.subscription:0794959b-a80f-4de4-a327-7567945d0d57",
        "TIER:FRONT",
        "AESM_GLOBAL_APP:MED",
        "AESM_GLOBAL_ENVIRONMENT:Pre-Production",
        "host:bama9005",
        "TECHNOLOGY:JBOSS"
      ]
    },
    {
      "entity.name": "HealthController",
      "tags": [
        "k8s.namespace.name:vip-authentication-prod-axa-es",
        "Vulnerability test:apps-set-java",
        "host:ssp-ssp-identity-566c6d9546-fc988, ssp-ssp-identity-566c6d9546-vhqcr",
        "[Environment]DT_RELEASE_VERSION:3.1.1_1027",
        "[Environment]DT_RELEASE_PRODUCT:ssp"
      ]
    },
    {
      "entity.name": "Requests executed in background threads of SpringBoot com.axa.es.odh.consent.ConsentApplication odh-ms-consent-int-*",
      "tags": [
        "host:odh-ms-consent-int-7b8c564cbf-l84l8",
        "odh-int",
        "k8s.namespace.name:odh-preprod-axa-es",
        "AESM_App_Purpose:ODH_INT",
        "Vulnerability test:apps-set-java",
        "[Environment]APP:odh",
        "[Environment]ENVIRONMENT:int",
        "[Environment]DT_RELEASE_PRODUCT",
        "ENVIRONMENT:INT",
        "[Environment]DT_RELEASE_VERSION"
      ]
    },
    {
      "entity.name": "sirius pro - J018Presupuesto2HostProcess",
      "tags": [
        "AESM_App_Purpose:SIRIUS_BATCH_PRO",
        "azure.location:westeurope",
        "EntidadCritica",
        "ENVIRONMENT:PRO",
        "dt.host_group.id:PRO_BATCH_JBOSS_SIRIUS",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "AESM_GLOBAL_APP:SIRIUS",
        "APP:SIRIUS",
        "Vulnerability test:apps-set-java",
        "TIER:BATCH",
        "host:cama9014",
        "azure.subscription:7b0ee8af-1494-4621-b118-84a3043b096d",
        "azure.resource.group:z-aes-sirius-pr01-ew1-01",
        "TECHNOLOGY:JBOSS"
      ]
    },
    {
      "entity.name": "ProyectosApiImpl",
      "tags": [
        "AESM_App_Purpose:NED_BackNed",
        "AESM_App_Purpose:NED_Critical",
        "k8s.namespace.name:liferay-ned-prod-axa-es",
        "APP:NED",
        "host:mediadores-pro-correos-liferay-594668ccb9-72zk4, mediadores-pro-correos-liferay-594668ccb9-f7x4b, mediadores-pro-correos-liferay-c7f679d9b-ndx4x, mediadores-pro-correos-liferay-c7f679d9b-s6qqc",
        "Vulnerability test:apps-set-java",
        "ENVIRONMENT:PRO"
      ]
    },
    {
      "entity.name": "HealthController",
      "tags": [
        "k8s.namespace.name:vip-authentication-prod-axa-es",
        "Vulnerability test:apps-set-java",
        "host:ssp-ssp-admin-7d876fcc9d-6mqpm, ssp-ssp-admin-7d876fcc9d-nb9q7",
        "[Environment]DT_RELEASE_VERSION:3.1.1_1027",
        "[Environment]DT_RELEASE_PRODUCT:ssp"
      ]
    },
    {
      "entity.name": "axa.es",
      "tags": null
    }
  ],
  "types": [
    {
      "indexRange": [
        0,
        0
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                10
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        1,
        2
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                9
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        3,
        3
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                13
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        4,
        4
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                5
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        5,
        5
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                14
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        6,
        6
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                18
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        7,
        7
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                4
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        8,
        8
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                13
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        9,
        9
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                14
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        10,
        10
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                7
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        11,
        11
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                12
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        12,
        12
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                18
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        13,
        13
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                15
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        14,
        14
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                4
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        15,
        15
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                9
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        16,
        16
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                13
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        17,
        17
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                6
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        18,
        19
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                4
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    }
  ],
  "metadata": {
    "grail": {
      "analysisTimeframe": {
        "end": "2026-07-02T06:06:22.006000000Z",
        "start": "2026-07-02T04:06:22.005000000Z"
      },
      "canonicalQuery": "fetch dt.entity.service\n| fields entity.name, tags\n| limit 20",
      "contributions": {
        "buckets": []
      },
      "dqlVersion": "V1_0",
      "executionTimeMilliseconds": 45,
      "flags": [
        "CLASSIC_ENTITY_MIGRATION_ADVISED"
      ],
      "locale": "es",
      "notifications": [
        {
          "arguments": [],
          "message": "Give the new `smartscapeNodes` command a try to work with entities from the new Smartscape storage.",
          "messageFormat": "Give the new `smartscapeNodes` command a try to work with entities from the new Smartscape storage.",
          "messageFormatSpecifierTypes": [],
          "notificationType": "DEPRECATED_ENTITY_DATAOBJECT",
          "severity": "INFO",
          "syntaxPosition": {
            "start": {
              "column": 7,
              "index": 6,
              "line": 1
            },
            "end": {
              "column": 23,
              "index": 22,
              "line": 1
            }
          }
        }
      ],
      "query": "fetch dt.entity.service\n| fields entity.name, tags\n| limit 20",
      "queryId": "98d8d780-b3f8-425f-8bfb-8ad51f4ebf26",
      "sampled": false,
      "scannedBytes": 0,
      "scannedDataPoints": 0,
      "scannedRecords": 20,
      "timezone": "Europe/Madrid"
    }
  }
}
```

### A2. Tags en hosts
```dql
fetch dt.entity.host
| fields entity.name, tags
| limit 20
```
Pega aquí la salida:
```
{
  "records": [
    {
      "entity.name": "zdaesa3037.ppcloudmgmt.intraxa",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_ORACLE_DBARCH:STANDALONE",
        "Linux",
        "[Azure]local-vmstartstop:true",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_Ora_backup:basic",
        "[Azure]local-dbclass:Oracle PDB Instance",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "[Azure]local-sow:500123",
        "AGO_ORACLE_ASM:NO",
        "[Azure]local-vmprovisioning:activity-orchreport-succeeded-iteration1",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "[Azure]local-configuration:{\"license\"\\:\"RHEL_BYOS\",\"os\"\\:\"Linux\",\"role\"\\:\"oracle\",\"support_resource_group\"\\:\"z-aes-support-dv01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "[Azure]global-app:REDES",
        "[Azure]local-vmpuppetstatus:succeeded",
        "AESM_vmstarttime:07\\:00",
        "ENVIRONMENT:INT",
        "[Azure]local-purpose:MPI",
        "AGO_ORACLE_SAP:NO",
        "AESM_vmstoptime:19\\:00",
        "APP:REDES",
        "[Azure]local-creation-year:2025",
        "AESM_vmstartstop:true",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "[Azure]global-dataclass:Confidential",
        "AGO_AXAROLE:ORACLE",
        "AGO_GLOBAL_APP:REDES",
        "[Azure]local-vmprovisioningid:20250311-073605",
        "HostGroup:INT_DB_ORACLE_REDES",
        "AGO_ORACLE_SUPPORTED:YES",
        "[Azure]local-vmstoptime:19\\:00",
        "[Azure]json_axa_db_create:{\"blk_size\"\\:\"8192\",\"charset\"\\:\"WE8ISO8859P15\",\"db_name\"\\:\"SRIPDBZ01\",\"lang\"\\:\"AMERICAN\",\"release\"\\:\"19\",\"territory\"\\:\"AMERICA\"}",
        "[Azure]local-silva_internal_id:053955",
        "[Azure]global-cbp:A02139",
        "[Azure]local-vmstopweekend:true",
        "AGO_ORACLE_VERSION:19.0",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:3,\"data_disksize\"\\:700,\"os_disk_name\"\\:\"zaesredsdv01304_OSDisk\"}",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"external\",\"source_address\"\\:\"100.113.138.66\",\"subnet\"\\:\"devs-ext-pic-rt\",\"vnet\"\\:\"zaesextspkdv01ew1net01\"}",
        "[Azure]global-dcs:AXA Seguros Spain",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AutoUpdateOneAgent:nopro",
        "[Azure]local-vmstatus:Provisioned",
        "host:zdaesa3037",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "[Azure]global-appserviceid:de09c7f2db3087c43fd0f9231d961933",
        "AESM_GLOBAL_APP:redes",
        "[Azure]global-project:Public IAAS",
        "[Azure]local-vmfqdn:zdaesa3037.ppcloudmgmt.intraxa",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"Migrated\",\"usage\"\\:\"Apps\"}",
        "[Azure]local-vm-replaced:DAMA3039.ppcloudmgmt.intraxa",
        "Arquitectura x86",
        "[Azure]local-app-name:REDES",
        "[Azure]global-env:Development",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "AESM_vmstopweekend:true",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "[Azure]local-vmprovisioninginfo",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "[Azure]local-vmstarttime:07\\:00",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"basic\",\"replicationtype\"\\:\"zonal\"}",
        "AGO_ORACLE_RELEASE:19.0",
        "[Azure]local-vmstartstoppriority:5",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_GLOBAL_APPSERVICEID:de09c7f2db3087c43fd0f9231d961933",
        "[Azure]Last Backup:07/01/2026, 10\\:03\\:36 PM",
        "[Azure]global-opco:aes",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Bronze\",\"source_location\"\\:\"westeurope\"}",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "axaes-genesys-cloud-cargador-tareas-back-preprod-85d877bc6vh862",
      "tags": [
        "PaaS OpenShift",
        "host:axaes-genesys-cloud-cargador-tareas-back-preprod-85d877bc6vh862",
        "ENVIRONMENT:PRE",
        "APP:GENESYSCLOUD",
        "aes_monitoring_enabled:non-prod",
        "Vulnerability test:apps-set-java",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "AESM_App_Purpose:GENESYSCLOUD"
      ]
    },
    {
      "entity.name": "BAMAH039.prcloudmgmt.intraxa",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_GLOBAL_APP:WEBMED-Spain",
        "[Azure]local-vmprovisioning:rehosting-activity1-orchapi-succeeded-iteration1",
        "[Azure]local-configuration:{\"license\"\\:\"Windows_Server\",\"os\"\\:\"Windows\",\"role\"\\:\"base\",\"support_resource_group\"\\:\"z-aes-support-pp01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "AGO_OS:Windows",
        "[Azure]local-silva_internal_id:NotReady",
        "AESM_GLOBAL_ENVIRONMENT:pre-production",
        "[Azure]local-vmstoptime:23\\:00",
        "[Azure]local-vmstartstop:true",
        "AGO_Ora_backup:basic",
        "AGO_CSP_REGION:WESTEUROPE",
        "host:bamah039",
        "AGO_AXAENVIRONMENTNAME:Pre-Production",
        "[Azure]global-env:Pre-Production",
        "AESM_GLOBAL_APP:webmed-spain",
        "AGO_ALERTING_ACC",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"Rehosted\",\"usage\"\\:\"Apps\"}",
        "ENVIRONMENT:PRE",
        "HostGroup:PRE_APP_IIS_WEBMED_IaaS",
        "[Azure]global-appserviceid:b7094bf2db3087c43fd0f9231d961971",
        "AESM_vmstarttime:07\\:00",
        "[Azure]local-purpose:MPI",
        "[Azure]Last Backup:07/01/2026, 10\\:51\\:45 PM",
        "AESM_vmstartstop:true",
        "AGO_GLOBAL_APPSERVICEID:b7094bf2db3087c43fd0f9231d961971",
        "[Azure]local-vmpuppetstatus:NotReady",
        "[Azure]global-dataclass:Confidential",
        "AGO_Not_AD:True",
        "aes_monitoring_enabled:non-prod",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"external\",\"source_address\"\\:\"100.113.143.32\",\"subnet\"\\:\"ppd-ext-main-pa-c-rt\",\"vnet\"\\:\"zaesextspkpp02ew1net01\"}",
        "[Azure]local-vmstatus:Ready",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:2,\"data_disksize\"\\:50,\"os_disk_name\"\\:\"osdisk\"}",
        "AGO_AXAROLE:BASE",
        "[Azure]local-vmprovisioningid:20230316-144938",
        "[Azure]local-vmstopweekend:true",
        "[Azure]local-vmstartstoppriority:2",
        "[Azure]global-dcs:AXA Seguros Spain",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AutoUpdateOneAgent:nopro",
        "TECHNOLOGY:IIS",
        "[Azure]global-app:WEBMED Spain",
        "[Azure]global-project:Public IAAS",
        "[Azure]global-cbp:A02120",
        "Arquitectura x86",
        "APP:WEBMED_IaaS",
        "AESM_vmstopweekend:true",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "AESM_vmstoptime:23\\:00",
        "AGO_AXAGOSCOPE:True",
        "Windows",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "[Azure]local-vmfqdn:bamah039.prcloudmgmt.intraxa",
        "TIER:APP",
        "[Azure]local-vmstarttime:07\\:00",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"basic\",\"replicationtype\"\\:\"zonal\"}",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Bronze\",\"source_location\"\\:\"westeurope\"}",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "axaes-jarvis-orchestrator-prod-57566fd87d-2stsb",
      "tags": [
        "PaaS OpenShift",
        "host:axaes-jarvis-orchestrator-prod-57566fd87d-2stsb",
        "ENVIRONMENT:PRO",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86"
      ]
    },
    {
      "entity.name": "zpaesa3014.prprivmgmt.intraxa",
      "tags": [
        "[Azure]local-app-name:CIS",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"elevated\",\"replicationtype\"\\:\"geo\"}",
        "Linux",
        "[Azure]local-silva_internal_id:054480",
        "[Azure]local-dbclass:Oracle PDB Instance",
        "[Azure]global-cbp:A03057",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "[Azure]local-sow:500123",
        "[Azure]local-vm-replaced:DR - praesdbcrm03.axa-seguros-es.intraxa",
        "AGO_ORACLE_ASM:NO",
        "[Azure]json_axa_db_create:{\"blk_size\"\\:\"8192\",\"charset\"\\:\"AL32UTF8\",\"db_name\"\\:\"SRPMDM\",\"lang\"\\:\"AMERICAN\",\"release\"\\:\"19\",\"territory\"\\:\"AMERICA\"}",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "AGO_Ora_backup:elevated",
        "[Azure]local-vmprovisioningid:20250516-063107",
        "[Azure]local-vmprovisioning:activity-orchreport-succeeded-iteration1",
        "AGO_ALERTING_PRD",
        "APP:MACC",
        "AGO_GLOBAL_APPSERVICEID:e32a4d27dbaf3240dc68f9d10f96199f",
        "[Azure]local-vmpuppetstatus:succeeded",
        "[Azure]local-purpose:MPI",
        "AGO_ORACLE_SAP:NO",
        "[Azure]global-app:CIS",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Platinum\",\"source_location\"\\:\"westeurope\"}",
        "[Azure]local-creation-year:2025",
        "[Azure]local-vmfqdn:zpaesa3014.prprivmgmt.intraxa",
        "[Azure]local_tags:{\"dr_enable\"\\:\"yes\",\"dr_priority\"\\:\"2\",\"dr_role\"\\:\"db\"}",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "[Azure]global-dataclass:Confidential",
        "[Azure]global-env:Production",
        "AGO_AXAROLE:ORACLE",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"New\",\"usage\"\\:\"Apps\"}",
        "AESM_GLOBAL_APP:cis",
        "AGO_ORACLE_SUPPORTED:YES",
        "AGO_GLOBAL_APP:CIS",
        "AGO_ORACLE_VERSION:19.0",
        "[Azure]global-dcs:AXA Seguros Spain",
        "AGO_AXAOPCOTRIGRAM:AES",
        "[Azure]local-vmstatus:Provisioned",
        "[Azure]global-project:Exit Core IT",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "[Azure]local-configuration:{\"license\"\\:\"RHEL_BYOS\",\"os\"\\:\"Linux\",\"role\"\\:\"oracle\",\"support_resource_group\"\\:\"z-aes-support-pr01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "[Azure]global-appserviceid:e32a4d27dbaf3240dc68f9d10f96199f",
        "AGO_ORACLE_DBARCH:DATAGUARD",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:4,\"data_disksize\"\\:2048,\"os_disk_name\"\\:\"zaescispr01301_OSDisk\"}",
        "AGO_AXAENVIRONMENTNAME:Production",
        "[Azure]Last Backup:07/01/2026, 09\\:09\\:12 PM",
        "Arquitectura x86",
        "host:zpaesa3014",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "[Azure]local-vmprovisioninginfo",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "ENVIRONMENT:PRO",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "HostGroup:PRO_DB_ORACLE_MACC",
        "AGO_ORACLE_RELEASE:19.0",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"internal\",\"source_address\"\\:\"100.113.242.162\",\"subnet\"\\:\"prd-int-main-pic-rt\",\"vnet\"\\:\"zaesintspkpr01ew1net01\"}",
        "AESM_GLOBAL_APP:CIS"
      ]
    },
    {
      "entity.name": "consola-impresion-backend-app-preprod-7ffbfcfb44-zjv7r",
      "tags": [
        "PaaS OpenShift",
        "ENVIRONMENT:PRE",
        "aes_monitoring_enabled:non-prod",
        "Vulnerability test:apps-set-java",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "host:consola-impresion-backend-app-preprod-7ffbfcfb44-zjv7r",
        "APP:ConsolaImpresion",
        "consola-impresion-preprod"
      ]
    },
    {
      "entity.name": "odh-leo-portal-back-int-7b46bb6f64-wqb68",
      "tags": [
        "PaaS OpenShift",
        "odh-int",
        "AESM_App_Purpose:ODH_INT",
        "Vulnerability test:apps-set-java",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "APP:ODH",
        "host:odh-leo-portal-back-int-7b46bb6f64-wqb68"
      ]
    },
    {
      "entity.name": "ZAESCTXMGMTPR03.axa-seguros-es.intraxa",
      "tags": [
        "APP:CITRIX",
        "TECHNOLOGY:CITRIX",
        "AGO_AXAROLE:BASE",
        "[Azure]global-techserviceid:f91fe892c39ce610236293e9050131c2",
        "AGO_OS:Windows",
        "AESM_GLOBAL_APP:citrix-services",
        "[Azure]global-dataclass:Internal",
        "[Azure]global-dcs:AXA Seguros Spain",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APPSERVICEID:3e63637adb6da7c49ca45a48dc9619ce",
        "[Azure]local-vmfqdn:ZAESCTXMGMTPR03.axa-seguros-es.intraxa",
        "AGO_Ora_backup:basic",
        "[Azure]global-project:282742",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "[Azure]global-app:Citrix Services",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "HostGroup:PRO_APP_CITRIX_CITRIX",
        "AGO_AXAENVIRONMENTNAME:Production",
        "Arquitectura x86",
        "[Azure]global-description:Citrix Services - AXA SEGUROS SPAIN - Production",
        "[Azure]global-broker:CB Spain",
        "AGO_ALERTING_PRD",
        "ENVIRONMENT:PRO",
        "[Azure]global-cbp:A02159",
        "AGO_AXAGOSCOPE:True",
        "Windows",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AGO_CITRIX",
        "TIER:APP",
        "AGO_Not_AD:True",
        "[Azure]global-env:Production",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "host:zaesctxmgmtpr03",
        "AGO_GLOBAL_APP:Citrix-Services",
        "[Azure]global-appserviceid:3e63637adb6da7c49ca45a48dc9619ce"
      ]
    },
    {
      "entity.name": "dama3030.ppprivmgmt.intraxa",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "[Azure]local-vmprovisioning:rehosting-activity2-backup-succeeded-iteration1",
        "[Azure]local-silva_internal_id:NotReady",
        "AGO_ORACLE_DBARCH:STANDALONE",
        "Linux",
        "[Azure]local-vmstartstop:true",
        "[Azure]global-appserviceid:b609c7f2db3087c43fd0f9231d9619f6",
        "host:dama3030",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_Ora_backup:basic",
        "[Azure]local-dbclass:Oracle PDB Instance",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "AGO_ORACLE_ASM:NO",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"Rehosted\",\"usage\"\\:\"Apps\"}",
        "[Azure]local-configuration:{\"license\"\\:\"RHEL_BYOS\",\"os\"\\:\"Linux\",\"role\"\\:\"oracle\",\"support_resource_group\"\\:\"z-aes-support-dv01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "[Azure]global-cbp:A02138",
        "AESM_vmstarttime:07\\:00",
        "[Azure]local-purpose:MPI",
        "AGO_ORACLE_SAP:NO",
        "AESM_vmstoptime:19\\:00",
        "[Azure]global-app:SIRIUS",
        "AESM_vmstartstop:true",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "[Azure]local-vmpuppetstatus:NotReady",
        "[Azure]global-dataclass:Confidential",
        "aes_monitoring_enabled:non-prod",
        "[Azure]local-vmprovisioningid:20230314-132137",
        "[Azure]local-vmstatus:Ready",
        "AGO_AXAROLE:ORACLE",
        "ENVIRONMENT:DEV",
        "AGO_ORACLE_SUPPORTED:YES",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"internal\",\"source_address\"\\:\"100.113.139.31\",\"subnet\"\\:\"devs-int-pic-rt\",\"vnet\"\\:\"zaesintspkdv01ew1net01\"}",
        "[Azure]local-vmstoptime:19\\:00",
        "AGO_AXAATSLEGALENTITY:AXA-GROUP-OPERATIONS-SPAIN",
        "[Azure]local-vmstopweekend:true",
        "AGO_GLOBAL_APP:SIRIUS",
        "AGO_ORACLE_VERSION:19.0",
        "[Azure]global-dcs:AXA Seguros Spain",
        "to_decom:yes",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AutoUpdateOneAgent:nopro",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "[Azure]global-project:Public IAAS",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:8,\"data_disksize\"\\:100,\"os_disk_name\"\\:\"osdisk\"}",
        "Arquitectura x86",
        "[Azure]local-vmfqdn:dama3030.ppprivmgmt.intraxa",
        "[Azure]global-env:Development",
        "AGO_GLOBAL_APPSERVICEID:b609c7f2db3087c43fd0f9231d9619f6",
        "AGO_ORACLE_GRID_INFRA:NO",
        "HostGroup:DEV_DB_ORACLE_SIRIUS",
        "TIER:DB",
        "AESM_vmstopweekend:true",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "[Azure]Last Backup:07/01/2026, 10\\:30\\:43 PM",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "APP:SIRIUS",
        "AESM_GLOBAL_APP:sirius",
        "[Azure]local-vmstarttime:07\\:00",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"basic\",\"replicationtype\"\\:\"zonal\"}",
        "AGO_ORACLE_RELEASE:19.0",
        "[Azure]local-vmstartstoppriority:5",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Bronze\",\"source_location\"\\:\"westeurope\"}",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "ssp-hazelcast-0",
      "tags": [
        "PaaS OpenShift",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "host:ssp-hazelcast-0"
      ]
    },
    {
      "entity.name": "CAMA0052.PRPRIVMGMT.intraxa",
      "tags": [
        "AGO_OS:Windows",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"elevated\",\"replicationtype\"\\:\"geo\"}",
        "HostGroup:PRO_WEB_PAPYRUS_PAPYRUS",
        "AESM_GLOBAL_APP:papyrus-spain",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "Reinicio_papyrus_domingos",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "[Azure]Last Backup:07/02/2026, 01\\:27\\:15 AM",
        "[Azure]local-silva_internal_id:048623",
        "AGO_Ora_backup:elevated",
        "[Azure]global-appserviceid:af2a4d27dbaf3240dc68f9d10f9619c1",
        "[Azure]local-vmprovisioning:activity-orchreport-succeeded-iteration1",
        "AGO_ALERTING_PRD",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"Rehosted\",\"usage\"\\:\"Apps\"}",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"internal\",\"source_address\"\\:\"100.113.242.29\",\"subnet\"\\:\"prd-int-main-pic-rt\",\"vnet\"\\:\"zaesintspkpr01ew1net01\"}",
        "[Azure]local-purpose:MPI",
        "TECHNOLOGY:PAPYRUS",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Platinum\",\"source_location\"\\:\"westeurope\"}",
        "[Azure]global-dataclass:Confidential",
        "AGO_Not_AD:True",
        "[Azure]global-env:Production",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:3,\"data_disksize\"\\:400,\"os_disk_name\"\\:\"osdisk\"}",
        "Reinicio_Papyrus_6\\:30-6\\:55_cama0052",
        "APP:PAPYRUS",
        "[Azure]local-configuration:{\"license\"\\:\"Windows_Server\",\"os\"\\:\"Windows\",\"role\"\\:\"base\",\"support_resource_group\"\\:\"z-aes-support-pr01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "AGO_AXAROLE:BASE",
        "[Azure]global-app:Papyrus Spain",
        "[Azure]local-vmfqdn:cama0052.prprivmgmt.intraxa",
        "[Azure]global-dcs:AXA Seguros Spain",
        "AGO_AXAOPCOTRIGRAM:AES",
        "[Azure]local_tags:{\"dr_enable\"\\:\"yes\",\"dr_priority\"\\:\"1\",\"dr_role\"\\:\"app\"}",
        "[Azure]local-vmstatus:Provisioned",
        "[Azure]global-project:Public IAAS",
        "AGO_AXAENVIRONMENTNAME:Production",
        "AGO_GLOBAL_APP:Papyrus-Spain",
        "Arquitectura x86",
        "[Azure]global-cbp:A02119",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "ENVIRONMENT:PRO",
        "AGO_GLOBAL_APPSERVICEID:af2a4d27dbaf3240dc68f9d10f9619c1",
        "AGO_AXAGOSCOPE:True",
        "Windows",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "[Azure]local-vmprovisioningid:20231030-095713",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "TIER:WEB",
        "[Azure]local-vmpuppetstatus:NotApplicable",
        "host:cama0052"
      ]
    },
    {
      "entity.name": "zdaesa303c.ppcloudmgmt.intraxa",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "APP:COCO",
        "AGO_ORACLE_DBARCH:STANDALONE",
        "Linux",
        "[Azure]local-vmfqdn:zdaesa303c.ppcloudmgmt.intraxa",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:3,\"data_disksize\"\\:512,\"os_disk_name\"\\:\"zaescocodv01303_OSDisk\"}",
        "[Azure]Last Backup:07/01/2026, 08\\:47\\:56 PM",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_Ora_backup:basic",
        "[Azure]local-dbclass:Oracle PDB Instance",
        "[Azure]local-app-name:COCO",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "[Azure]local-sow:500123",
        "AGO_ORACLE_ASM:NO",
        "[Azure]global-cbp:A02141",
        "[Azure]local-vmstartstop:false",
        "[Azure]local-vmprovisioning:activity-orchreport-succeeded-iteration1",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "[Azure]local-configuration:{\"license\"\\:\"RHEL_BYOS\",\"os\"\\:\"Linux\",\"role\"\\:\"oracle\",\"support_resource_group\"\\:\"z-aes-support-dv01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "AESM_GLOBAL_APP:coco",
        "[Azure]local-vmpuppetstatus:succeeded",
        "ENVIRONMENT:INT",
        "[Azure]local-purpose:MPI",
        "AGO_ORACLE_SAP:NO",
        "[Azure]global-appserviceid:42e8cf72db3087c43fd0f9231d961983",
        "[Azure]local-vmprovisioningid:20250714-085710",
        "[Azure]local-creation-year:2025",
        "HostGroup:INT_DB_ORACLE_COCO",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "[Azure]global-dataclass:Confidential",
        "AGO_AXAROLE:ORACLE",
        "[Azure]local-vmprovisioninginfo:{\"REJECTED\"\\:\"Flow rejected\\: cannot create fileshare when backup provider is commvault\"}",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"external\",\"source_address\"\\:\"100.113.138.69\",\"subnet\"\\:\"devs-ext-pic-rt\",\"vnet\"\\:\"zaesextspkdv01ew1net01\"}",
        "AGO_GLOBAL_APPSERVICEID:42e8cf72db3087c43fd0f9231d961983",
        "AGO_ORACLE_SUPPORTED:YES",
        "[Azure]json_axa_db_create:{\"blk_size\"\\:\"8192\",\"charset\"\\:\"WE8ISO8859P15\",\"db_name\"\\:\"SRDPDBZ0\",\"lang\"\\:\"AMERICAN\",\"release\"\\:\"19\",\"territory\"\\:\"AMERICA\"}",
        "AGO_ORACLE_VERSION:19.0",
        "[Azure]global-dcs:AXA Seguros Spain",
        "AGO_AXAOPCOTRIGRAM:AES",
        "[Azure]local-silva_internal_id:036531",
        "AutoUpdateOneAgent:nopro",
        "[Azure]local-vmstatus:Provisioned",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "[Azure]global-project:Public IAAS",
        "host:zdaesa303c",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.1.0\",\"source\"\\:\"New\",\"usage\"\\:\"Apps\"}",
        "Arquitectura x86",
        "[Azure]global-env:Development",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "[Azure]local-vm-replaced:DAMA301F.ppcloudmgmt.intraxa",
        "[Azure]global-app:COCO",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_GLOBAL_APP:COCO",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"basic\",\"replicationtype\"\\:\"zonal\"}",
        "AGO_ORACLE_RELEASE:19.0",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Bronze\",\"source_location\"\\:\"westeurope\"}",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "odh-ms-catalog-pro-9464f4f47-b5f9r",
      "tags": [
        "host:odh-ms-catalog-pro-9464f4f47-b5f9r",
        "PaaS OpenShift",
        "AESM_App_Purpose:ODH_PRO",
        "odh-pro",
        "AESM_Blackout",
        "Vulnerability test:apps-set-java",
        "ENVIRONMENT:PRO",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "APP:ODH"
      ]
    },
    {
      "entity.name": "portales-operaciones-pro-principal-liferay-7c8b9b749-4fq94",
      "tags": [
        "PaaS OpenShift",
        "Vulnerability test:apps-set-java",
        "host:portales-operaciones-pro-principal-liferay-7c8b9b749-4fq94",
        "AESM_App_Purpose:PORTALOPS",
        "ENVIRONMENT:PRO",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "APP:PORTALOPS"
      ]
    },
    {
      "entity.name": "CAMA9074.prcloudmgmt.intraxa",
      "tags": [
        "[Azure]local-vmprovisioning:rehosting-activity1-orchapi-succeeded-iteration1",
        "AESM_GLOBAL_APP:atria",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"elevated\",\"replicationtype\"\\:\"geo\"}",
        "[Azure]Last Backup:07/02/2026, 01\\:53\\:32 AM",
        "Linux",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"external\",\"source_address\"\\:\"100.113.246.47\",\"subnet\"\\:\"prd-ext-main-pa-c-rt\",\"vnet\"\\:\"zaesextspkpr02ew1net01\"}",
        "AESM_GLOBAL_APP:Atria",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "AGO_Ora_backup:elevated",
        "AGO_ALERTING_PRD",
        "TECHNOLOGY:JBOSS",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"Rehosted\",\"usage\"\\:\"Apps\"}",
        "[Azure]global-appserviceid:99b5ceccdb266f0085c9f9231d96193f",
        "[Azure]local-purpose:MPI",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Platinum\",\"source_location\"\\:\"westeurope\"}",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "[Azure]global-dataclass:Confidential",
        "[Azure]local-vmstatus:Ready",
        "[Azure]local_tags:{\"dr_enable\"\\:\"yes\",\"dr_priority\"\\:\"3\",\"dr_role\"\\:\"app\"}",
        "[Azure]global-env:Production",
        "[Azure]local-vmfqdn:cama9074.prcloudmgmt.intraxa",
        "AGO_GLOBAL_APPSERVICEID:99b5ceccdb266f0085c9f9231d96193f",
        "[Azure]local-vmprovisioningid:20230511-120731",
        "aes_app_24x7:yes",
        "aes_monitoring_enabled:prod",
        "aes_app_guardia:yes",
        "[Azure]global-dcs:AXA Seguros Spain",
        "AGO_AXAOPCOTRIGRAM:AES",
        "TIER:WS",
        "[Azure]local-configuration:{\"license\"\\:\"RHEL_BYOS\",\"os\"\\:\"Linux\",\"role\"\\:\"base\",\"support_resource_group\"\\:\"z-aes-support-pr01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "AGO_GLOBAL_APP:Atria",
        "AGO_AXAROLE:JBOSS",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:3,\"data_disksize\"\\:64,\"os_disk_name\"\\:\"osdisk\"}",
        "[Azure]global-project:Public IAAS",
        "AutoUpdateOneAgent:atriapro2",
        "Vulnerability test:apps-set-java",
        "AGO_AXAENVIRONMENTNAME:Production",
        "[Azure]local-silva_internal_id:046206",
        "Arquitectura x86",
        "host:cama9074",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "ENVIRONMENT:PRO",
        "[Azure]global-cbp:A02132",
        "AGO_AXAGOSCOPE:True",
        "AESM_App_Purpose:ATRIA_WS_PRO",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "[Azure]global-app:Atria",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "APP:ATRIA",
        "HostGroup:PRO_WS_JBOSS_ATRIA",
        "[Azure]global-opco:aes",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "[Azure]local-vmpuppetstatus:NotApplicable"
      ]
    },
    {
      "entity.name": "zdaesa0066.ppcloudmgmt.intraxa",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "HostGroup:DEV_APP_IIS_AGROSEGURO",
        "AGO_OS:Windows",
        "[Azure]local-vmstartstop:true",
        "[Azure]local-creation-year:2024",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_Ora_backup:basic",
        "AGO_CSP_REGION:WESTEUROPE",
        "[Azure]global-app:Agroseguro",
        "[Azure]local-vmprovisioningid:20240403-151332",
        "[Azure]local-vmprovisioning:activity-orchreport-succeeded-iteration1",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "[Azure]global-appserviceid:a419247bdbece344a80c5487dc961982",
        "AESM_vmstarttime:07\\:00",
        "[Azure]local-purpose:MPI",
        "AESM_vmstoptime:19\\:00",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"external\",\"source_address\"\\:\"100.113.138.5\",\"subnet\"\\:\"devs-ext-pic-rt\",\"vnet\"\\:\"zaesextspkdv01ew1net01\"}",
        "AESM_vmstartstop:true",
        "[Azure]local-configuration:{\"license\"\\:\"Windows_Server\",\"os\"\\:\"Windows\",\"role\"\\:\"base\",\"support_resource_group\"\\:\"z-aes-support-dv01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "[Azure]global-dataclass:Confidential",
        "AGO_GLOBAL_APPSERVICEID:a419247bdbece344a80c5487dc961982",
        "AGO_Not_AD:True",
        "aes_monitoring_enabled:non-prod",
        "[Azure]local-vmpuppetstatus:failed",
        "ENVIRONMENT:DEV",
        "[Azure]local-vmstoptime:19\\:00",
        "[Azure]local-sow:300028",
        "[Azure]local-vmprovisioninginfo:{\"REJECTED\"\\:null,\"FailureCause\"\\:\"activity1-dnsapi flow reference not found\",\"Puppet\"\\:\"failed\"}",
        "AGO_AXAROLE:BASE",
        "[Azure]global-cbp:A02116",
        "[Azure]local-vmstopweekend:true",
        "host:zdaesa0066",
        "[Azure]local-silva_internal_id:047381",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AutoUpdateOneAgent:nopro",
        "[Azure]local-vmstatus:Provisioned",
        "TECHNOLOGY:IIS",
        "[Azure]local-vmfqdn:zdaesa0066.ppcloudmgmt.intraxa",
        "[Azure]global-project:Public IAAS",
        "[Azure]axa_iis.state:present",
        "[Azure]local-app-name:Agroseguro",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"Migrated\",\"usage\"\\:\"Apps\"}",
        "Arquitectura x86",
        "[Azure]global-env:Development",
        "AESM_vmstopweekend:true",
        "[Azure]axa_iis.version:10",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "[Azure]local-vm-replaced:DAMAH00B.ppcloudmgmt.intraxa",
        "AGO_GLOBAL_APP:Agroseguro",
        "[Azure]global-dcs:AXA Seguros SPAIN",
        "AESM_GLOBAL_APP:agroseguro",
        "AGO_AXAGOSCOPE:True",
        "Windows",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "[Azure]Last Backup:07/01/2026, 11\\:37\\:53 PM",
        "TIER:APP",
        "[Azure]local-vmstarttime:07\\:00",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"basic\",\"replicationtype\"\\:\"zonal\"}",
        "APP:AGROSEGURO",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Bronze\",\"source_location\"\\:\"westeurope\"}",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:1,\"data_disksize\"\\:30,\"os_disk_name\"\\:\"zaesagrodv01700_OSDisk\"}"
      ]
    },
    {
      "entity.name": "gps-policies-preprod-8579f656b9-2dzsv",
      "tags": [
        "APP:GPS",
        "PaaS OpenShift",
        "ENVIRONMENT:PRE",
        "gps-ms-pro",
        "host:gps-policies-preprod-8579f656b9-2dzsv",
        "aes_monitoring_enabled:non-prod",
        "Vulnerability test:apps-set-java",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "AESM_App_Purpose:GPS"
      ]
    },
    {
      "entity.name": "odh-ms-claim-pre-5c7bdb9c96-cfjv9",
      "tags": [
        "PaaS OpenShift",
        "ODH-micro:claim",
        "ENVIRONMENT:PRE",
        "aes_monitoring_enabled:non-prod",
        "Vulnerability test:apps-set-java",
        "Linux",
        "AGO_AXAGOSCOPE:False",
        "Arquitectura x86",
        "APP:ODH",
        "host:odh-ms-claim-pre-5c7bdb9c96-cfjv9"
      ]
    },
    {
      "entity.name": "zpaesa3019.prcloudmgmt.intraxa",
      "tags": [
        "APP:COCO",
        "AESM_GLOBAL_APP:COCO",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"elevated\",\"replicationtype\"\\:\"geo\"}",
        "Linux",
        "[Azure]local-dbclass:Oracle PDB Instance",
        "[Azure]local-app-name:COCO",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "[Azure]local-sow:500123",
        "AGO_ORACLE_ASM:NO",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "[Azure]global-cbp:A02141",
        "AGO_Ora_backup:elevated",
        "[Azure]local-vmprovisioning:activity-orchreport-succeeded-iteration1",
        "AGO_ALERTING_PRD",
        "[Azure]local-silva_internal_id:039670",
        "AGO_ORACLE_DBROLE:PHYSICAL_STANDBY",
        "AESM_GLOBAL_APP:coco",
        "[Azure]local-vmpuppetstatus:succeeded",
        "[Azure]local-purpose:MPI",
        "AGO_ORACLE_SAP:NO",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Platinum\",\"source_location\"\\:\"westeurope\"}",
        "[Azure]local_tags:{\"dr_enable\"\\:\"yes\",\"dr_priority\"\\:\"2\",\"dr_role\"\\:\"db\"}",
        "AESM_GLOBAL_ENVIRONMENT:Production",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "[Azure]global-dataclass:Confidential",
        "[Azure]global-env:Production",
        "[Azure]local-configuration:{\"license\"\\:\"RHEL_BYOS\",\"os\"\\:\"Linux\",\"role\"\\:\"oracle\",\"support_resource_group\"\\:\"z-aes-support-pr01-ew1-01\",\"zones\"\\:\"1\\:2\"}",
        "[Azure]global-appserviceid:5e1ac127dbaf3240dc68f9d10f96195a",
        "AGO_AXAROLE:ORACLE",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.0.3\",\"source\"\\:\"New\",\"usage\"\\:\"Apps\"}",
        "[Azure]local-vm-replaced:CAMA3046.prcloudmgmt.intraxa",
        "AGO_ORACLE_SUPPORTED:YES",
        "[Azure]json_axa_db_create:{\"blk_size\"\\:\"8192\",\"charset\"\\:\"WE8ISO8859P15\",\"db_name\"\\:\"SRPPDBZ0\",\"lang\"\\:\"AMERICAN\",\"release\"\\:\"19\",\"territory\"\\:\"AMERICA\"}",
        "AGO_ORACLE_VERSION:19.0",
        "AGO_AXAOPCOTRIGRAM:AES",
        "[Azure]local-vmstatus:Provisioned",
        "AGO_GLOBAL_APPSERVICEID:5e1ac127dbaf3240dc68f9d10f96195a",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "HostGroup:PRO_DB_ORACLE_COCO",
        "[Azure]local-creation-year:2026",
        "[Azure]global-project:Public IAAS",
        "AGO_ORACLE_DBARCH:DATAGUARD",
        "AGO_AXAENVIRONMENTNAME:Production",
        "Arquitectura x86",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"external\",\"source_address\"\\:\"100.113.247.11\",\"subnet\"\\:\"prd-ext-main-d-c-rt\",\"vnet\"\\:\"zaesextspkpr02ew1net01\"}",
        "[Azure]global-app:COCO",
        "[Azure]local-vmprovisioninginfo",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "[Azure]Last Backup:07/02/2026, 03\\:23\\:12 AM",
        "ENVIRONMENT:PRO",
        "[Azure]global-dcs:AXA Seguros SPAIN",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_GLOBAL_APP:COCO",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "[Azure]local-vmfqdn:zpaesa3019.prcloudmgmt.intraxa",
        "AGO_ORACLE_RELEASE:19.0",
        "[Azure]local-vmprovisioningid:20260205-163606",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:4,\"data_disksize\"\\:2500,\"os_disk_name\"\\:\"zaescocopr01303_OSDisk\"}",
        "[Azure]global-opco:aes",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "host:zpaesa3019"
      ]
    },
    {
      "entity.name": "zdaesa304a.ppprivmgmt.intraxa",
      "tags": [
        "AGO_ORACLE_DBARCH:STANDALONE",
        "Linux",
        "[Azure]local-sow:500154",
        "[Azure]local-vmstartstop:true",
        "[Azure]global-appserviceid:b609c7f2db3087c43fd0f9231d9619f6",
        "[Azure]local-workspace_info:{\"workspace_runid\"\\:\"notconfiguredbyuser\",\"workspace_slug\"\\:\"AXA-Spain/aes_az_mpi_vm_dv_pool_03-dev\"}",
        "AGO_Ora_backup:basic",
        "[Azure]local-dbclass:Oracle PDB Instance",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "AGO_ORACLE_ASM:NO",
        "[Azure]local-app-name:SIRIUS",
        "[Azure]local-vmprovisioning:activity-orchreport-succeeded-iteration1",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "[Azure]local-configuration:{\"license\"\\:\"RHEL_BYOS\",\"os\"\\:\"Linux\",\"role\"\\:\"oracle\",\"support_resource_group\"\\:\"z-aes-support-dv01-ew1-01\",\"zones\"\\:\"2\\:1\"}",
        "[Azure]global-cbp:A02138",
        "[Azure]Last Backup:07/01/2026, 08\\:53\\:06 PM",
        "[Azure]local-vmpuppetstatus:succeeded",
        "AESM_vmstarttime:07\\:00",
        "ENVIRONMENT:INT",
        "[Azure]local-purpose:MPI",
        "AGO_ORACLE_SAP:NO",
        "AESM_vmstoptime:19\\:00",
        "[Azure]global-app:SIRIUS",
        "AESM_vmstartstop:true",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "[Azure]global-dataclass:Confidential",
        "AGO_AXAROLE:ORACLE",
        "AGO_ORACLE_SUPPORTED:YES",
        "host:zdaesa304a",
        "[Azure]local-vmstoptime:19\\:00",
        "[Azure]local-configuration_disks:{\"data_disks\"\\:3,\"data_disksize\"\\:256,\"os_disk_name\"\\:\"zaessiriusdv02309_OSDisk\"}",
        "[Azure]local-vmstopweekend:true",
        "[Azure]local-vm-replaced:dama302e.ppprivmgmt.intraxa",
        "AGO_GLOBAL_APP:SIRIUS",
        "AGO_ORACLE_VERSION:19.0",
        "AGO_AXAOPCOTRIGRAM:AES",
        "[Azure]local-vmprovisioningid:20260528-102255",
        "AutoUpdateOneAgent:nopro",
        "[Azure]local-vmstatus:Provisioned",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "[Azure]local-creation-year:2026",
        "[Azure]global-project:Public IAAS",
        "HostGroup:INT_DB_ORACLE_SIRIUS",
        "[Azure]local-deployment:{\"flow_type\"\\:\"Standard\",\"moduleversion\"\\:\"5.1.0\",\"source\"\\:\"New\",\"usage\"\\:\"Apps\"}",
        "Arquitectura x86",
        "[Azure]global-env:Development",
        "AGO_GLOBAL_APPSERVICEID:b609c7f2db3087c43fd0f9231d9619f6",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "AESM_vmstopweekend:true",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "[Azure]local-vmprovisioninginfo",
        "[Azure]global-techserviceid:c19d9c3a1bec8994e3e66574604bcbee",
        "[Azure]global-dcs:AXA Seguros SPAIN",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "[Azure]local-silva_internal_id:049363",
        "[Azure]local-configuration_network:{\"exposure\"\\:\"internal\",\"source_address\"\\:\"100.113.139.59\",\"subnet\"\\:\"devs-int-pic-rt\",\"vnet\"\\:\"zaesintspkdv01ew1net01\"}",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "APP:SIRIUS",
        "AESM_GLOBAL_APP:sirius",
        "[Azure]local-vmstarttime:07\\:00",
        "[Azure]local-configuration_backup:{\"policy\"\\:\"basic\",\"replicationtype\"\\:\"zonal\"}",
        "[Azure]local-vmfqdn:zdaesa304a.ppprivmgmt.intraxa",
        "AGO_ORACLE_RELEASE:19.0",
        "[Azure]local-vmstartstoppriority:5",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "[Azure]global-opco:aes",
        "[Azure]local-configuration_recovery:{\"class\"\\:\"Bronze\",\"source_location\"\\:\"westeurope\"}",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "[Azure]json_axa_db_create:{\"blk_size\"\\:\"8192\",\"charset\"\\:\"WE8ISO8859P15\",\"db_name\"\\:\"SRZPDB00\",\"lang\"\\:\"AMERICAN\",\"release\"\\:\"19\",\"territory\"\\:\"AMERICA\"}"
      ]
    }
  ],
  "types": [
    {
      "indexRange": [
        0,
        0
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                75
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        1,
        1
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                9
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        2,
        2
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                59
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        3,
        3
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                5
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        4,
        4
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                68
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        5,
        5
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                9
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        6,
        6
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                8
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        7,
        7
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                37
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        8,
        8
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                71
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        9,
        9
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                4
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        10,
        10
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                51
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        11,
        11
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                67
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        12,
        12
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                10
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        13,
        13
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                8
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        14,
        14
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                56
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        15,
        15
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                65
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        16,
        16
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                10
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        17,
        17
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                9
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        18,
        18
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                68
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        19,
        19
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                74
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    }
  ],
  "metadata": {
    "grail": {
      "analysisTimeframe": {
        "end": "2026-07-02T06:06:45.001000000Z",
        "start": "2026-07-02T04:06:45.001000000Z"
      },
      "canonicalQuery": "fetch dt.entity.host\n| fields entity.name, tags\n| limit 20",
      "contributions": {
        "buckets": []
      },
      "dqlVersion": "V1_0",
      "executionTimeMilliseconds": 38,
      "flags": [
        "CLASSIC_ENTITY_MIGRATION_ADVISED"
      ],
      "locale": "es",
      "notifications": [
        {
          "arguments": [],
          "message": "Give the new `smartscapeNodes` command a try to work with entities from the new Smartscape storage.",
          "messageFormat": "Give the new `smartscapeNodes` command a try to work with entities from the new Smartscape storage.",
          "messageFormatSpecifierTypes": [],
          "notificationType": "DEPRECATED_ENTITY_DATAOBJECT",
          "severity": "INFO",
          "syntaxPosition": {
            "start": {
              "column": 7,
              "index": 6,
              "line": 1
            },
            "end": {
              "column": 20,
              "index": 19,
              "line": 1
            }
          }
        }
      ],
      "query": "fetch dt.entity.host\n| fields entity.name, tags\n| limit 20",
      "queryId": "95ce5f7b-6a70-468b-b913-38a7d76e881f",
      "sampled": false,
      "scannedBytes": 0,
      "scannedDataPoints": 0,
      "scannedRecords": 20,
      "timezone": "Europe/Madrid"
    }
  }
}
```

### A3. Tags en process groups (por si el APP vive aquí)
```dql
fetch dt.entity.process_group_instance
| fields entity.name, tags
| limit 20
```
Pega aquí la salida:
```
{
  "records": [
    {
      "entity.name": "Dynatrace OneAgent Source StatsD",
      "tags": [
        "APP:CITRIX",
        "AESM_vmstopweekend:true",
        "TECHNOLOGY:CITRIX",
        "AGO_AXAROLE:BASE",
        "AGO_OS:Windows",
        "ENVIRONMENT:PRO",
        "AESM_GLOBAL_APP:citrix-services",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APPSERVICEID:3e63637adb6da7c49ca45a48dc9619ce",
        "AGO_AXAGOSCOPE:True",
        "AESM_vmstoptime:22\\:00",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "TIER:APP",
        "AESM_1_startStopMaintenanceTag",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_vmstarttime:06\\:00",
        "AGO_GLOBAL_APP:Citrix-Services",
        "host:zaesctxwpccpr11",
        "AGO_ALERTING_PRD"
      ]
    },
    {
      "entity.name": "AMAExtHealthMonitor",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_AXAROLE:BASE",
        "AGO_OS:Windows",
        "host:zdaesa0064",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AESM_GLOBAL_APP:magic-info",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_GLOBAL_APPSERVICEID:05f88ced1bc7d514ddb68055464bcb6b",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "AESM_vmstopweekend:true",
        "AGO_GLOBAL_APP:Magic-Info",
        "APP:MAGICINFO",
        "AESM_vmstarttime:07\\:00",
        "TECHNOLOGY:MAGICINFO",
        "AESM_vmstoptime:19\\:00",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "TIER:APP",
        "aes_monitoring_enabled:non-prod",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "ENVIRONMENT:DEV",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "AXA.Redes.Launcher.CCA-DA.exe",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_AXAROLE:BASE",
        "AESM_vmstoptime:01\\:00",
        "AGO_OS:Windows",
        "AGO_AXAOPCOTRIGRAM:AES",
        "TECHNOLOGY:IIS",
        "AESM_GLOBAL_APP:redes",
        "AGO_CSP_REGION:WESTEUROPE",
        "AESM_GLOBAL_ENVIRONMENT:integration",
        "AGO_ALERTING_ACC",
        "AESM_vmstopweekend:true",
        "AGO_AXAATSLEGALENTITY:AXA-TECH-SPAIN",
        "AGO_AXAENVIRONMENTNAME:Integration",
        "AESM_vmstarttime:07\\:00",
        "APP:REDES",
        "AGO_AXAGOSCOPE:True",
        "AESM_vmstartstop:true",
        "TIER:APP",
        "aes_monitoring_enabled:non-prod",
        "host:damah00a",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_GLOBAL_APPSERVICEID:de09c7f2db3087c43fd0f9231d961933",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_GLOBAL_APP:REDES",
        "ENVIRONMENT:DEV",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "Linux System",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_GLOBAL_APP:PXPA",
        "AESM_GLOBAL_APP:pxpa",
        "AESM_GLOBAL_ENVIRONMENT:pre-production",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_AXAROLE:JBOSS",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "APP:PXPA",
        "AGO_AXAENVIRONMENTNAME:Pre-Production",
        "AGO_ALERTING_ACC",
        "TECHNOLOGY:JBOSS",
        "AESM_vmstopweekend:true",
        "AGO_AXAATSLEGALENTITY:AXA-TECH-SPAIN",
        "ENVIRONMENT:PRE",
        "AGO_GLOBAL_APPSERVICEID:5e09c7f2db3087c43fd0f9231d961931",
        "AESM_vmstarttime:07\\:00",
        "AESM_vmstoptime:19\\:00",
        "AGO_AXAGOSCOPE:True",
        "AESM_vmstartstop:true",
        "aes_monitoring_enabled:non-prod",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "TIER:FRONT",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "host:bama9007",
        "APP:JWEB"
      ]
    },
    {
      "entity.name": "OneAgent system monitoring",
      "tags": [
        "AGO_AXAATSLEGALENTITY:AXA-TECH-SPAIN",
        "APP:RPS",
        "ENVIRONMENT:PRO",
        "aes_monitoring_enabled:prod",
        "aes_app_guardia:yes",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APPSERVICEID:3f2a8d27dbaf3240dc68f9d10f96190e",
        "AGO_AXAGOSCOPE:True",
        "AESM_GLOBAL_APP:rps",
        "AGO_AXAROLE:JBOSS",
        "TIER:BACK",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_GLOBAL_APP:RPS",
        "AGO_OS:Linux",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAENVIRONMENTNAME:Production",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "AGO_ALERTING_PRD",
        "TECHNOLOGY:JBOSS",
        "host:cama902d"
      ]
    },
    {
      "entity.name": "ATRIA-PRE-ONLINE-Apache",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_AXAATSLEGALENTITY:AXA-GROUP-OPERATIONS-SPAIN",
        "AESM_GLOBAL_APP:atria",
        "AESM_GLOBAL_ENVIRONMENT:pre-production",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APP:Atria",
        "AGO_AXAROLE:JBOSS",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "AGO_AXAENVIRONMENTNAME:Pre-Production",
        "AESM_GLOBAL_APP:Atria",
        "TIER:ONLINE",
        "AGO_ALERTING_ACC",
        "TECHNOLOGY:JBOSS",
        "AESM_vmstopweekend:true",
        "ENVIRONMENT:PRE",
        "AESM_vmstoptime:23\\:00",
        "host:bama9043",
        "AESM_vmstarttime:07\\:00",
        "AGO_AXAGOSCOPE:True",
        "AESM_vmstartstop:true",
        "AGO_GLOBAL_APPSERVICEID:46c8f57fdb162b00cbdcf3d61d96198d",
        "aes_monitoring_enabled:non-prod",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "APP:ATRIA",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_GLOBAL_ENVIRONMENT:Pre-Production",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "[AGO.INFRA] - Qualys",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:gold",
        "AGO_AXAATSLEGALENTITY:AXA-TECH-SPAIN",
        "AGO_AXAROLE:BASE",
        "APP:DLP",
        "AGO_GLOBAL_APP:Data-Leakage-Protection",
        "ENVIRONMENT:PRO",
        "AGO_AXAOPCOTRIGRAM:AES",
        "host:cama2000",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "TECHNOLOGY:DLP",
        "TIER:APP",
        "AGO_OS:Linux",
        "AESM_GLOBAL_APP:data-leakage-protection",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAENVIRONMENTNAME:Production",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_GLOBAL_APPSERVICEID:d7aaff89db925f00e736ed6b4b961920",
        "AGO_ALERTING_PRD"
      ]
    },
    {
      "entity.name": "WindowsAzureGuestAgent.exe",
      "tags": [
        "APP:CONTROLM",
        "AGO_AXAATSLEGALENTITY:AXA-GROUP-OPERATIONS-SPAIN",
        "AGO_AXAROLE:BASE",
        "AGO_OS:Windows",
        "host:eama0007",
        "AESM_GLOBAL_APP:control-m-spain",
        "ENVIRONMENT:PRO",
        "AGO_GLOBAL_APPSERVICEID:5afe8ae31bba085016da1f07bd4bcbfc",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAENVIRONMENTNAME:Tools",
        "AGO_CSP_REGION:WESTEUROPE",
        "TIER:APP",
        "TECHNOLOGY:CONTROLM",
        "AESM_GLOBAL_ENVIRONMENT:tools",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_GLOBAL_APP:Control-M-Spain",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "AGO_ALERTING_ACC"
      ]
    },
    {
      "entity.name": "agentid-service",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_ORACLE_SUPPORTED:YES",
        "AGO_ORACLE_DBARCH:STANDALONE",
        "AESM_GLOBAL_ENVIRONMENT:pre-production",
        "AGO_ORACLE_VERSION:19.0",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "AESM_GLOBAL_APP:redes",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "AGO_AXAENVIRONMENTNAME:Pre-Production",
        "AGO_ORACLE_ASM:NO",
        "host:zqaesa300a",
        "AGO_ALERTING_ACC",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "AESM_vmstopweekend:true",
        "ENVIRONMENT:PRE",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "AESM_vmstarttime:07\\:00",
        "AGO_ORACLE_SAP:NO",
        "AESM_vmstoptime:19\\:00",
        "APP:REDES",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "aes_monitoring_enabled:non-prod",
        "AGO_ORACLE_RELEASE:19.0",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_GLOBAL_APPSERVICEID:de09c7f2db3087c43fd0f9231d961933",
        "AGO_AXAROLE:ORACLE",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_GLOBAL_APP:REDES",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "pxp_agent",
      "tags": [
        "APP:CITRIX",
        "AESM_vmstopweekend:true",
        "TECHNOLOGY:CITRIX",
        "AGO_AXAROLE:BASE",
        "AGO_OS:Windows",
        "ENVIRONMENT:PRO",
        "AESM_GLOBAL_APP:citrix-services",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APPSERVICEID:3e63637adb6da7c49ca45a48dc9619ce",
        "AESM_vmstarttime:07\\:00",
        "AGO_AXAGOSCOPE:True",
        "host:zaesctxfevpr16",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "AESM_vmstoptime:00\\:00",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "TIER:APP",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAENVIRONMENTNAME:Production",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_GLOBAL_APP:Citrix-Services",
        "AGO_ALERTING_PRD"
      ]
    },
    {
      "entity.name": "pidof",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AESM_vmstoptime:01\\:00",
        "AESM_GLOBAL_APP:dmp-frameworkserviciosdocu",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APP:DMP-FrameworkServiciosDocu",
        "AGO_AXAROLE:JBOSS",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "APP:CAM",
        "AGO_ALERTING_ACC",
        "TECHNOLOGY:JBOSS",
        "AGO_AXAENVIRONMENTNAME:Development",
        "AESM_vmstopweekend:true",
        "AGO_AXAATSLEGALENTITY:AXA-TECH-SPAIN",
        "AGO_GLOBAL_APPSERVICEID:11dc1215dbfc67c4e1b4fb931d96198f",
        "AESM_vmstarttime:07\\:00",
        "AGO_AXAGOSCOPE:True",
        "AESM_vmstartstop:true",
        "aes_monitoring_enabled:non-prod",
        "APP:CAEM",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "host:dama9002",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "ENVIRONMENT:DEV",
        "TIER:FRONT",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "amacoreagent",
      "tags": [
        "AGO_ORACLE_SUPPORTED:YES",
        "AGO_ORACLE_DBARCH:STANDALONE",
        "AGO_GLOBAL_APP:SIRIUS",
        "AGO_ORACLE_VERSION:19.0",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_DB:ORACLE",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "AGO_ORACLE_ASM:NO",
        "host:zdaesa3046",
        "AGO_GLOBAL_APPSERVICEID:b609c7f2db3087c43fd0f9231d9619f6",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "AESM_vmstopweekend:true",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "AESM_vmstarttime:07\\:00",
        "AGO_ORACLE_SAP:NO",
        "AESM_vmstoptime:19\\:00",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "APP:SIRIUS",
        "aes_monitoring_enabled:non-prod",
        "AESM_GLOBAL_APP:sirius",
        "AGO_ORACLE_RELEASE:19.0",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAROLE:ORACLE",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "ENVIRONMENT:DEV",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "Puppet_Agent",
      "tags": [
        "AGO_ORACLE_SUPPORTED:YES",
        "host:zdaesa302b",
        "AGO_ORACLE_VERSION:19.0",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_DB:ORACLE",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_ORACLE_ASM:YES",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_ORACLE_DBARCH:DATAGUARD",
        "AGO_OS:Linux",
        "AGO_GLOBAL_APP:Test-Data-Management",
        "AGO_GLOBAL_APPSERVICEID:6cfed93fdb9eb7c0a044fb261d961944",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "TIER:DB",
        "AESM_GLOBAL_APP:test-data-management",
        "AGO_ORACLE_DBROLE:PHYSICAL_STANDBY",
        "AGO_ORACLE_GRID_INFRA:YES",
        "AGO_ORACLE_SAP:NO",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "aes_monitoring_enabled:non-prod",
        "AGO_ORACLE_RELEASE:19.0",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAROLE:ORACLE",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "ENVIRONMENT:DEV",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "AGO_ORACLE_MULTIPLE_LISTENERS:YES",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "APP:TDM"
      ]
    },
    {
      "entity.name": "pip",
      "tags": [
        "AGO_AXAATSLEGALENTITY:AXA-TECH-SPAIN",
        "AGO_GLOBAL_APPSERVICEID:043a8d27dbaf3240dc68f9d10f9619b4",
        "ENVIRONMENT:PRO",
        "AGO_GLOBAL_APP:SIRIUS",
        "host:cama9026",
        "AGO_AXAOPCOTRIGRAM:AES",
        "TIER:ODMDS",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAROLE:JBOSS",
        "AGO_AXAPATCHENVIRONMENT:PRODUCTION",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "APP:SIRIUS",
        "AESM_GLOBAL_APP:sirius",
        "AESM_GLOBAL_ENVIRONMENT:production",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAENVIRONMENTNAME:Production",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "AGO_ALERTING_PRD",
        "TECHNOLOGY:JBOSS"
      ]
    },
    {
      "entity.name": "MetricsExtension.Native",
      "tags": [
        "APP:CONTROLM",
        "AGO_AXAATSLEGALENTITY:AXA-GROUP-OPERATIONS-SPAIN",
        "AGO_AXAROLE:BASE",
        "host:eama0004",
        "AGO_OS:Windows",
        "AESM_GLOBAL_APP:control-m-spain",
        "ENVIRONMENT:PRO",
        "AGO_GLOBAL_APPSERVICEID:5afe8ae31bba085016da1f07bd4bcbfc",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAENVIRONMENTNAME:Tools",
        "AGO_CSP_REGION:WESTEUROPE",
        "TIER:APP",
        "TECHNOLOGY:CONTROLM",
        "AESM_GLOBAL_ENVIRONMENT:tools",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_GLOBAL_APP:Control-M-Spain",
        "AESM_GLOBAL_RECOVERY_CLASS:platinum",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "AGO_ALERTING_ACC"
      ]
    },
    {
      "entity.name": "ccSvcHst.exe",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_GLOBAL_APP:WEBMED-Spain",
        "AGO_AXAROLE:BASE",
        "AGO_OS:Windows",
        "AESM_GLOBAL_ENVIRONMENT:pre-production",
        "AGO_AXAOPCOTRIGRAM:AES",
        "TECHNOLOGY:IIS",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_AXAENVIRONMENTNAME:Pre-Production",
        "AESM_GLOBAL_APP:webmed-spain",
        "APP:WEBMED_IaaS",
        "AGO_ALERTING_ACC",
        "AESM_vmstopweekend:true",
        "ENVIRONMENT:PRE",
        "AESM_vmstoptime:23\\:00",
        "host:bamah03a",
        "AESM_vmstarttime:07\\:00",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "AGO_GLOBAL_APPSERVICEID:b7094bf2db3087c43fd0f9231d961971",
        "aes_monitoring_enabled:non-prod",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "TIER:FRONT",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "amacoreagent",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:gold",
        "AGO_AXAENVIRONMENTNAME:Development",
        "TIER:DB",
        "AESM_GLOBAL_APP:tools-alm",
        "AGO_AXAATSLEGALENTITY:AXA-TECH-SPAIN",
        "AGO_AXAROLE:BASE",
        "ENVIRONMENT:PRO",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APP:Tools-ALM",
        "AGO_GLOBAL_APPSERVICEID:086f2d8cdb14b708073df1061d96195a",
        "host:eama2008",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "APP:ADMINISTRACION",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "AGO_ALERTING_ACC"
      ]
    },
    {
      "entity.name": "IIS app pool MYRIAM",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_GLOBAL_APP:WEBMED-Spain",
        "AGO_AXAROLE:BASE",
        "AGO_OS:Windows",
        "host:damah01d",
        "APP:WEBMED",
        "AGO_AXAOPCOTRIGRAM:AES",
        "TECHNOLOGY:IIS",
        "AGO_CSP_REGION:WESTEUROPE",
        "AESM_GLOBAL_ENVIRONMENT:integration",
        "AESM_GLOBAL_APP:webmed-spain",
        "AGO_ALERTING_ACC",
        "AESM_vmstopweekend:true",
        "AGO_AXAENVIRONMENTNAME:Integration",
        "AESM_vmstoptime:23\\:00",
        "AESM_vmstarttime:07\\:00",
        "ENVIRONMENT:INT",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "AGO_GLOBAL_APPSERVICEID:b7094bf2db3087c43fd0f9231d961971",
        "TIER:APP",
        "aes_monitoring_enabled:non-prod",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "ENVIRONMENT:DEV",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE"
      ]
    },
    {
      "entity.name": "oracle/opatch/OPatch",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:bronze",
        "AGO_ORACLE_SUPPORTED:YES",
        "AGO_ORACLE_DBARCH:STANDALONE",
        "AGO_ORACLE_VERSION:19.0",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_GLOBAL_APP:DMP-Spain",
        "AGO_DB:ORACLE",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_ORACLE_MULTIPLE_LISTENERS:NO",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "AGO_ORACLE_ASM:NO",
        "AGO_GLOBAL_APPSERVICEID:02cd8de71b0101501e377b75464bcb72",
        "host:dama303c",
        "AGO_ALERTING_ACC",
        "AGO_AXAENVIRONMENTNAME:Development",
        "AGO_ORACLE_GRID_INFRA:NO",
        "TIER:DB",
        "AESM_vmstopweekend:true",
        "AGO_ORACLE_DBROLE:PRIMARY",
        "AESM_vmstarttime:07\\:00",
        "AGO_ORACLE_SAP:NO",
        "AESM_vmstoptime:19\\:00",
        "TECHNOLOGY:ORACLE",
        "AGO_AXAGOSCOPE:True",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AESM_vmstartstop:true",
        "AGO_ORACLE_MULTIPLE_HOMES:NO",
        "aes_monitoring_enabled:non-prod",
        "AESM_GLOBAL_APP:dmp-spain",
        "AGO_ORACLE_RELEASE:19.0",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAROLE:ORACLE",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "ENVIRONMENT:DEV",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "APP:FILENET"
      ]
    },
    {
      "entity.name": "OneAgent log analytics",
      "tags": [
        "AESM_GLOBAL_RECOVERY_CLASS:gold",
        "AGO_AXAENVIRONMENTNAME:Development",
        "TIER:DB",
        "AGO_GLOBAL_APPSERVICEID:df719d9bdbeee3c0e1b4fb931d9619ba",
        "APP:PANDORA",
        "AESM_GLOBAL_APP:pandora-servicio-de-monitorizacion",
        "AGO_GLOBAL_APP:Pandora-Servicio-de-Monitorizacion",
        "ENVIRONMENT:PRO",
        "host:zdaesa204d",
        "AGO_AXAOPCOTRIGRAM:AES",
        "AGO_AXAGOSCOPE:True",
        "TECHNOLOGY:MYSQL",
        "AESM_GLOBAL_ENVIRONMENT:development",
        "AGO_AXAATSLEGALENTITY:AXA-SEGUROS-SPAIN",
        "AGO_AXAROLE:APACHE",
        "AGO_CSP_REGION:WESTEUROPE",
        "AGO_OS:Linux",
        "AGO_DEFAULT_ASSIGNMENT_GROUP:DIS-SERV_L2_ITSP",
        "AGO_AXAPLATFORM:AZURE_IAAS",
        "AGO_AXAPATCHENVIRONMENT:ACCEPTANCE",
        "AGO_ALERTING_ACC"
      ]
    }
  ],
  "types": [
    {
      "indexRange": [
        0,
        0
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                23
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        1,
        2
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                25
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        3,
        3
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                26
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        4,
        4
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                22
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        5,
        5
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                27
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        6,
        7
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                20
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        8,
        8
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                36
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        9,
        9
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                22
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        10,
        10
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                26
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        11,
        11
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                34
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        12,
        12
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                32
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        13,
        14
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                20
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        15,
        15
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                25
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        16,
        16
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                20
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        17,
        17
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                26
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        18,
        18
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                36
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    },
    {
      "indexRange": [
        19,
        19
      ],
      "mappings": {
        "entity.name": {
          "type": "string"
        },
        "tags": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                20
              ],
              "mappings": {
                "element": {
                  "type": "string"
                }
              }
            }
          ]
        }
      }
    }
  ],
  "metadata": {
    "grail": {
      "analysisTimeframe": {
        "end": "2026-07-02T06:07:30.200000000Z",
        "start": "2026-07-02T04:07:30.200000000Z"
      },
      "canonicalQuery": "fetch dt.entity.process_group_instance\n| fields entity.name, tags\n| limit 20",
      "contributions": {
        "buckets": []
      },
      "dqlVersion": "V1_0",
      "executionTimeMilliseconds": 134,
      "flags": [
        "CLASSIC_ENTITY_MIGRATION_ADVISED"
      ],
      "locale": "es",
      "notifications": [
        {
          "arguments": [],
          "message": "Give the new `smartscapeNodes` command a try to work with entities from the new Smartscape storage.",
          "messageFormat": "Give the new `smartscapeNodes` command a try to work with entities from the new Smartscape storage.",
          "messageFormatSpecifierTypes": [],
          "notificationType": "DEPRECATED_ENTITY_DATAOBJECT",
          "severity": "INFO",
          "syntaxPosition": {
            "start": {
              "column": 7,
              "index": 6,
              "line": 1
            },
            "end": {
              "column": 38,
              "index": 37,
              "line": 1
            }
          }
        }
      ],
      "query": "fetch dt.entity.process_group_instance\n| fields entity.name, tags\n| limit 20",
      "queryId": "f7e3b431-397c-4da2-ae4c-70bb4fd825d0",
      "sampled": false,
      "scannedBytes": 0,
      "scannedDataPoints": 0,
      "scannedRecords": 20,
      "timezone": "Europe/Madrid"
    }
  }
}
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
{
  "error": {
    "message": "FIELD_DOES_NOT_EXIST",
    "details": {
      "exceptionType": "DQL-RESULT_TYPE",
      "errorType": "FIELD_DOES_NOT_EXIST",
      "errorMessage": "The field instance_of doesn't exist.",
      "arguments": [
        "instance_of"
      ],
      "queryString": "fetch dt.entity.service\n| fields entity.name, sid = id, runs_on = instance_of[dt.entity.process_group], hosts = runs_on[dt.entity.host]\n| limit 10",
      "errorMessageFormatSpecifierTypes": [
        "FIELD_NAME"
      ],
      "errorMessageFormat": "The field %1$s doesn't exist.",
      "queryId": "5b7a3b8d-5516-43c8-a73c-2ea52bb58546",
      "syntaxErrorPosition": {
        "start": {
          "column": 43,
          "index": 66,
          "line": 2
        },
        "end": {
          "column": 53,
          "index": 76,
          "line": 2
        }
      }
    },
    "code": 400
  }
}

{
  "error": {
    "message": "PARSE_ERROR",
    "details": {
      "exceptionType": "DQL-ERROR-PARSING",
      "errorType": "PARSE_ERROR",
      "errorMessage": "`*` isn't allowed here. Please check the autocomplete suggestions before the error for alternative options.",
      "arguments": [
        "`*`"
      ],
      "queryString": "fetch dt.entity.service | fieldsAdd relacionados = * | limit 2",
      "errorMessageFormatSpecifierTypes": [
        "INPUT_QUERY_PART"
      ],
      "errorMessageFormat": "%1$s isn't allowed here. Please check the autocomplete suggestions before the error for alternative options.",
      "queryId": "e7c840ee-4d9b-4a5e-9a50-87fbe2e2e0f9",
      "syntaxErrorPosition": {
        "start": {
          "column": 52,
          "index": 51,
          "line": 1
        },
        "end": {
          "column": 52,
          "index": 51,
          "line": 1
        }
      }
    },
    "code": 400
  }
}
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
{
  "records": [
    {
      "timeframe": {
        "start": "2026-07-02T06:09:00.000000000+02:00",
        "end": "2026-07-02T08:10:00.000000000+02:00"
      },
      "interval": "60000000000",
      "dt.entity.service": "SERVICE-0032B51154EFEBAF",
      "reqs": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        1,
        2,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        1,
        1,
        null,
        null
      ],
      "fails": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        1,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        0,
        null,
        null
      ],
      "p90": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        212485,
        292198.3334707228,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        77584,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        282246,
        247847,
        null,
        null
      ]
    },
    {
      "timeframe": {
        "start": "2026-07-02T06:09:00.000000000+02:00",
        "end": "2026-07-02T08:10:00.000000000+02:00"
      },
      "interval": "60000000000",
      "dt.entity.service": "SERVICE-003A5AC83C3F548E",
      "reqs": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        8,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        12,
        null
      ],
      "fails": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        null
      ],
      "p90": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        322475.9801359839,
        1164.967299619952,
        752.5577390760445,
        590.3279155431779,
        501.14643985882896,
        578.778017274565,
        514.4036250727241,
        501.14643985882896,
        595.9669119384025,
        733.1033336023511,
        849.6572445027384,
        566.1633960093126,
        509.3372465822616,
        496.404628004456,
        537.1782192490668,
        475.35870033102213,
        590.3279155431779,
        487.97332159627456,
        455.205050945597,
        578.6149697573421,
        604.2324430376233,
        643.7571567079984,
        492.5945989728797,
        487.97332159627456,
        645.5272906632085,
        424.82862225136984,
        457.86990963607667,
        476.08477015210025,
        406.8172824025668,
        440.0697588327282,
        417.42487220430087,
        424.82862225136984,
        443.63739224186486,
        447.4735088797972,
        392.93815833998235,
        432.56016431716967,
        566.5351670489665,
        489.70920109909605,
        370.05308266400795,
        637.3246811552019,
        410.3350168697554,
        360.3258799271612,
        637.3246811552019,
        414.22103244963574,
        746.1061856173798,
        414.22103244963574,
        399.72742706802137,
        470.78769797692553,
        373.0530928086904,
        354.3640459916745,
        339.34017300324774,
        null
      ]
    },
    {
      "timeframe": {
        "start": "2026-07-02T06:09:00.000000000+02:00",
        "end": "2026-07-02T08:10:00.000000000+02:00"
      },
      "interval": "60000000000",
      "dt.entity.service": "SERVICE-0051AD475857E5C3",
      "reqs": [
        55,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      "fails": [
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      "p90": [
        66986.76330258009,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]
    },
    {
      "timeframe": {
        "start": "2026-07-02T06:09:00.000000000+02:00",
        "end": "2026-07-02T08:10:00.000000000+02:00"
      },
      "interval": "60000000000",
      "dt.entity.service": "SERVICE-00522A03B8E6D8E5",
      "reqs": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        4,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      "fails": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      "p90": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        6456.731970267429,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ]
    },
    {
      "timeframe": {
        "start": "2026-07-02T06:09:00.000000000+02:00",
        "end": "2026-07-02T08:10:00.000000000+02:00"
      },
      "interval": "60000000000",
      "dt.entity.service": "SERVICE-00602F4E9B68A507",
      "reqs": [
        null,
        2,
        null,
        4,
        2,
        null,
        2,
        2,
        2,
        2,
        2,
        null,
        null,
        4,
        2,
        2,
        2,
        2,
        4,
        6,
        2,
        2,
        6,
        4,
        2,
        null,
        2,
        null,
        2,
        2,
        null,
        null,
        null,
        4,
        2,
        2,
        null,
        null,
        10,
        2,
        null,
        null,
        null,
        2,
        4,
        8,
        6,
        2,
        4,
        4,
        null,
        2,
        null,
        6,
        8,
        4,
        null,
        4,
        8,
        14,
        12,
        4,
        8,
        8,
        8,
        8,
        14,
        8,
        10,
        11,
        3,
        9,
        10,
        18,
        18,
        16,
        10,
        13,
        8,
        12,
        11,
        14,
        12,
        21,
        15,
        10,
        15,
        8,
        6,
        19,
        18,
        20,
        5,
        16,
        22,
        29,
        22,
        52,
        36,
        29,
        25,
        32,
        25,
        24,
        43,
        33,
        31,
        25,
        44,
        29,
        30,
        36,
        54,
        52,
        62,
        47,
        51,
        73,
        89,
        66,
        null
      ],
      "fails": [
        null,
        0,
        null,
        0,
        0,
        null,
        0,
        0,
        0,
        0,
        0,
        null,
        null,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        null,
        0,
        null,
        0,
        0,
        null,
        null,
        null,
        0,
        0,
        0,
        null,
        null,
        0,
        0,
        null,
        null,
        null,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        null,
        0,
        null,
        0,
        0,
        0,
        null,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        null
      ],
      "p90": [
        null,
        139905.0413731102,
        null,
        757868.7132958773,
        128293.48860385886,
        null,
        279810.08274622,
        146099.1667353616,
        133973.52660516,
        197855.60695422126,
        206615.42304855637,
        null,
        null,
        139905.0413731102,
        133973.52660516,
        139905.0413731102,
        197855.60695422126,
        1515737.4265917528,
        139905.0413731102,
        290486.6752622794,
        152567.52945622941,
        225315.71652235417,
        196820.47814984404,
        133973.52660516,
        128293.48860385886,
        null,
        159322.27106086258,
        null,
        133973.52660516,
        139905.0413731102,
        null,
        null,
        null,
        159322.27106086258,
        146099.1667353616,
        146099.1667353616,
        null,
        null,
        156485.27958691664,
        146099.1667353616,
        null,
        null,
        null,
        133973.52660516,
        305135.0589124585,
        256586.97720771743,
        145975.28422811656,
        133973.52660516,
        133973.52660516,
        166376.07062565262,
        null,
        166376.07062565262,
        null,
        224284.24556346028,
        173742.1685776608,
        133973.52660516,
        null,
        535894.1064206386,
        155050.48052955707,
        381954.1909548297,
        544910.0088679228,
        197855.60695422126,
        770202.6020455098,
        192550.65051137796,
        335484.3643258944,
        156413.18810925237,
        173742.1685776608,
        144736.4591556663,
        195020.52987693268,
        189467.17832396983,
        146099.1667353616,
        247516.47618608485,
        321152.9666689894,
        175083.68188760395,
        172121.62702821902,
        234900.73100917402,
        289516.0965175602,
        182879.171476729,
        149781.78207794318,
        194479.28910680313,
        131019.90684448341,
        212719.10380756567,
        335449.75369174784,
        197698.3357917714,
        333930.71692362614,
        147249.28446131936,
        177868.0524132363,
        1274578.1684868955,
        188475.93558495262,
        242375.0157584808,
        215763.06933475618,
        1118660.8764666799,
        146099.1667353616,
        277400.32651251287,
        182905.27516075384,
        257497.2107536228,
        219393.07526604342,
        201184.33707006864,
        215237.15151454054,
        306217.51512156334,
        215763.06933475618,
        220173.52765054995,
        153107.9087846001,
        147263.4720251178,
        209176.76400869232,
        206615.42304855637,
        220348.33998480323,
        157787.10007419076,
        209981.47587383998,
        212835.82252317228,
        241333.29219593093,
        197855.60695422126,
        265325.6319145708,
        148557.14456929138,
        260145.61040912734,
        204557.63368160604,
        206615.42304855637,
        228108.8786453747,
        232099.11024968963,
        279572.82215550187,
        null
      ]
    }
  ],
  "types": [
    {
      "indexRange": [
        0,
        4
      ],
      "mappings": {
        "timeframe": {
          "type": "timeframe"
        },
        "interval": {
          "type": "duration"
        },
        "dt.entity.service": {
          "type": "string"
        },
        "reqs": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                120
              ],
              "mappings": {
                "element": {
                  "type": "double"
                }
              }
            }
          ]
        },
        "fails": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                120
              ],
              "mappings": {
                "element": {
                  "type": "double"
                }
              }
            }
          ]
        },
        "p90": {
          "type": "array",
          "types": [
            {
              "indexRange": [
                0,
                120
              ],
              "mappings": {
                "element": {
                  "type": "double"
                }
              }
            }
          ]
        }
      }
    }
  ],
  "metadata": {
    "grail": {
      "analysisTimeframe": {
        "end": "2026-07-02T06:10:00.000000000Z",
        "start": "2026-07-02T04:09:00.000000000Z"
      },
      "canonicalQuery": "timeseries from:-2h, by:{dt.entity.service}, {reqs = sum(dt.service.request.count), fails = sum(dt.service.request.failure_count), p90 = percentile(dt.service.request.response_time, 90)}\n| limit 5",
      "contributions": {
        "buckets": [
          {
            "name": "default_metrics",
            "scannedBytes": 0,
            "table": "metrics"
          }
        ]
      },
      "dqlVersion": "V1_0",
      "executionTimeMilliseconds": 669,
      "flags": [
        "CLASSIC_ENTITY_MIGRATION_ADVISED"
      ],
      "locale": "es",
      "notifications": [
        {
          "arguments": [],
          "message": "Smartscape ids are provided through the `dt.smartscape.*` fields.",
          "messageFormat": "Smartscape ids are provided through the `dt.smartscape.*` fields.",
          "messageFormatSpecifierTypes": [],
          "notificationType": "DEPRECATED_ENTITY_FIELD",
          "severity": "INFO",
          "syntaxPosition": {
            "start": {
              "column": 163,
              "index": 162,
              "line": 1
            },
            "end": {
              "column": 179,
              "index": 178,
              "line": 1
            }
          }
        }
      ],
      "query": "timeseries { reqs = sum(dt.service.request.count), fails = sum(dt.service.request.failure_count), p90 = percentile(dt.service.request.response_time, 90) }, by: { dt.entity.service }, from: -2h\n| limit 5",
      "queryId": "bb6f2c6b-5ef4-49cd-a2e2-7f8cf1623f9f",
      "sampled": false,
      "scannedBytes": 0,
      "scannedDataPoints": 1291910,
      "scannedRecords": 0,
      "timezone": "Europe/Madrid"
    },
    "metrics": [
      {
        "metric.key": "dt.service.request.count",
        "displayName": "Service request count",
        "description": "Number of requests received by a given service. To learn how Dynatrace detects and analyzes services, see [Services](https://dt-url.net/am-services).",
        "unit": "count",
        "fieldName": "reqs",
        "aggregation": "sum"
      },
      {
        "metric.key": "dt.service.request.failure_count",
        "displayName": "Service failure count",
        "description": "Number of failed requests received by a given service. To learn how Dynatrace detects and analyzes services, see [Services](https://dt-url.net/am-services).",
        "unit": "count",
        "fieldName": "fails",
        "aggregation": "sum"
      },
      {
        "metric.key": "dt.service.request.response_time",
        "displayName": "Service request response time",
        "description": "Response time of a service measured in microseconds on the server side (server side measurements do not include e.g. proxy and networking times). Response time is the time until a response is sent to a calling application, process or other service. It does not include further asynchronous processing. To learn how Dynatrace calculates service timings, see [Service analysis timings](https://dt-url.net/service-timings).",
        "unit": "us",
        "fieldName": "p90",
        "aggregation": "percentile"
      }
    ]
  }
}
```

### C2. Familia clásica (fallback)
```dql
timeseries { reqs = sum(builtin:service.requestCount.total), fails = sum(builtin:service.errors.total.count), rt = avg(builtin:service.response.time) }, by: { dt.entity.service }, from: -2h
| limit 5
```
Pega aquí la salida:
```
{
  "error": {
    "message": "UNKNOWN_PARAMETER_DEFINED",
    "details": {
      "exceptionType": "DQL-SYNTAX-ERROR",
      "errorType": "UNKNOWN_PARAMETER_DEFINED",
      "errorMessage": "There isn't a parameter builtin.",
      "arguments": [
        "builtin"
      ],
      "queryString": "timeseries { reqs = sum(builtin:service.requestCount.total), fails = sum(builtin:service.errors.total.count), rt = avg(builtin:service.response.time) }, by: { dt.entity.service }, from: -2h\n| limit 5",
      "errorMessageFormatSpecifierTypes": [
        "PARAMETER_KEY"
      ],
      "errorMessageFormat": "There isn't a parameter %1$s.",
      "queryId": "fd089d6d-9c55-4173-bbba-3ac915a7d95c",
      "syntaxErrorPosition": {
        "start": {
          "column": 25,
          "index": 24,
          "line": 1
        },
        "end": {
          "column": 58,
          "index": 57,
          "line": 1
        }
      }
    },
    "code": 400
  }
}
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
{
  "records": [
    {
      "dt.entity.service": "SERVICE-54CDA28F2EA69DDF",
      "span.name": "GET /api/v1/policies/find",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-54CDA28F2EA69DDF",
      "span.name": "PolicyController/getPolicies",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-193D6334DE98A852",
      "span.name": "SELECT SRPNCS_PRI",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-193D6334DE98A852",
      "span.name": "ExpertReportsService/getExpertReportPT",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-4F76C678F2043452",
      "span.name": "SMPODH",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-4F76C678F2043452",
      "span.name": "SMPODH",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-4F76C678F2043452",
      "span.name": "SMPODH",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-4F76C678F2043452",
      "span.name": "SMPODH",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-4F76C678F2043452",
      "span.name": "SMPODH",
      "span.status_code": null
    },
    {
      "dt.entity.service": "SERVICE-4F76C678F2043452",
      "span.name": "SMPODH",
      "span.status_code": null
    }
  ],
  "types": [
    {
      "indexRange": [
        0,
        9
      ],
      "mappings": {
        "dt.entity.service": {
          "type": "string"
        },
        "span.name": {
          "type": "string"
        },
        "span.status_code": {
          "type": "undefined"
        }
      }
    }
  ],
  "metadata": {
    "grail": {
      "analysisTimeframe": {
        "end": "2026-07-02T06:10:48.828749875Z",
        "start": "2026-07-02T05:10:48.828749875Z"
      },
      "canonicalQuery": "fetch spans, from:-1h\n| fields dt.entity.service, span.name, span.status_code\n| limit 10",
      "contributions": {
        "buckets": [
          {
            "matchedRecordsRatio": 1,
            "name": "default_spans",
            "scannedBytes": 24976020,
            "table": "spans"
          }
        ]
      },
      "dqlVersion": "V1_0",
      "executionTimeMilliseconds": 42,
      "flags": [
        "CLASSIC_ENTITY_MIGRATION_ADVISED"
      ],
      "locale": "es",
      "notifications": [
        {
          "arguments": [],
          "message": "Smartscape ids are provided through the `dt.smartscape.*` fields.",
          "messageFormat": "Smartscape ids are provided through the `dt.smartscape.*` fields.",
          "messageFormatSpecifierTypes": [],
          "notificationType": "DEPRECATED_ENTITY_FIELD",
          "severity": "INFO",
          "syntaxPosition": {
            "start": {
              "column": 10,
              "index": 32,
              "line": 2
            },
            "end": {
              "column": 26,
              "index": 48,
              "line": 2
            }
          }
        }
      ],
      "query": "fetch spans, from: -1h\n| fields dt.entity.service, span.name, span.status_code\n| limit 10",
      "queryId": "5ab4e946-c939-43e2-8075-fe118de7e8e5",
      "sampled": false,
      "scannedBytes": 24976020,
      "scannedDataPoints": 0,
      "scannedRecords": 402320,
      "timezone": "Europe/Madrid"
    }
  }
}
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
