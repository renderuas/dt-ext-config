import { queryExecutionClient } from '@dynatrace-sdk/client-query';
import { problemsClient } from '@dynatrace-sdk/client-classic-environment-v2';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface ProblemRecord {
  eventid: string;
  display_id: string;
  eventName: string;
  startTime: number;
  status: string;
  description: string;
  affectedHostsGroup?: string[];
  rootCauseHostsGroup?: string[];
  affsOS?: string[];
  rootCauseHostsOS?: string[];
  affectedHostsTags?: any[];
  rootCauseHostsTags?: any[];
  affectedCustomDevicesTags?: any[];
  rootCauseCustomDevicesTags?: any[];
  affectedOsServicesTags?: any[];
  affectedProcessGroupsTags?: any[];
  affectedProcessGroupInstancesTags?: any[];
  rootCauseProcessGroupsTags?: any[];
  rootCauseProcessGroupInstancesTags?: any[];
  [key: string]: any;
}

interface OutputRecord {
  ACK: string;
  Id: string;
  StartTime: string;
  Name: string;
  problemDetails: string;
  OS: string;
  owner: string;
  hostsGroup: string;
  Duracion: string;
  Affected_entities: string;
  Status: string;
  Root_cause: string;
  Tipo_entidad: string;
  'event.id': string;
  Last_comment: string;
  icon?: string;
}

// ============================================================================
// CONFIGURACIÓN DE OWNER (FÁCIL DE MODIFICAR)
// ============================================================================

const OWNER_RULES = [

  // ===== REGLAS DE PLATAFORMA PAAS — MÁXIMA PRIORIDAD =====
  {
    name: 'PaaS Platform - Host es pod/nodo de plataforma PaaS (OpenShift, Kubernetes, etc.)',
    condition: (ctx: OwnerContext) => ctx.hasTagPrefix('PaaS'),
    owner: 'APP',
    priority: 110,
  },

  // ===== PATRONES QUE SIEMPRE SON APP =====
  {
    // Problemas cuyo contenido indica que son de aplicación
    // independientemente del OS, HostGroup o tags.
    // Para añadir nuevos casos: editar ALWAYS_APP_PATTERNS.
    name: 'Patrones siempre APP (GC, Filenet, etc.)',
    condition: (ctx: OwnerContext) =>
      ALWAYS_APP_PATTERNS.some(pattern =>
        ctx.problemDetails.includes(pattern.toLowerCase())
      ),
    owner: 'APP',
    priority: 105,
  },

  // ===== PATRONES QUE SIEMPRE SON OS =====
  {
    // Problemas cuya entidad afectada pertenece a un proceso/servicio de SO
    // (ej: ControlM), donde el owner es el OS que sustenta el proceso.
    // Para añadir nuevos casos: editar ALWAYS_OS_PATTERNS.
    name: 'Patrones siempre OS (ControlM, etc.) - según SO del host',
    condition: (ctx: OwnerContext) =>
      ALWAYS_OS_PATTERNS.some(pattern => {
        const p = pattern.toLowerCase();
        return (
          ctx.problemDetails.includes(p) ||
          ctx.affectedEntities.some(e => (e || '').toLowerCase().includes(p))
        );
      }),
    owner: (ctx: OwnerContext): string => {
      if (ctx.osType.includes('LINUX'))   return 'Linux';
      if (ctx.osType.includes('WINDOWS')) return 'Windows';
      // OS no resuelto (ej: os_service sin host): usar default por patrón
      const matched = ALWAYS_OS_PATTERNS.find(p => {
        const pl = p.toLowerCase();
        return (
          ctx.problemDetails.includes(pl) ||
          ctx.affectedEntities.some(e => (e || '').toLowerCase().includes(pl))
        );
      });
      if (matched) {
        const def = ALWAYS_OS_PATTERN_DEFAULTS[matched.toLowerCase()];
        if (def) return def;
      }
      return 'APP'; // fallback si no hay OS resuelto ni default definido
    },
    priority: 103,
  },

  // ===== REGLAS CITRIX CON LÓGICA CONDICIONAL (PRIORIDAD MÁXIMA) =====
  {
    name: 'CITRIX Producción + Disco C:\\ → Windows (Dashboard)',
    condition: (ctx: OwnerContext) => {
      const isCitrixProd = isCitrixProduction(ctx.hostsGroup);
      const hasDashboardDrive = isCitrixDashboardDrive(ctx.problemDetails);
      const isDiskProblem = ['disk', 'file system', 'filesystem', 'space', 'mount']
        .some(kw => ctx.problemDetails.includes(kw));
      return isCitrixProd && hasDashboardDrive && isDiskProblem;
    },
    owner: 'Windows',
    priority: 97.5,
  },
  {
    name: 'CITRIX (Otros discos o NO producción) → CITRIX_SILVA_ONLY',
    condition: (ctx: OwnerContext) => {
      const isCitrix = extractTechFromHostGroup(ctx.hostsGroup) === 'CITRIX';
      const isDiskProblem = ['disk', 'file system', 'filesystem', 'space', 'mount']
        .some(kw => ctx.problemDetails.includes(kw));
      // Se aplica si es CITRIX con problema de disco pero NO cumple la regla anterior
      if (!isCitrix || !isDiskProblem) return false;
      // Verifica que NO sea el caso de Citrix producción + disco C:
      const isCitrixProd = isCitrixProduction(ctx.hostsGroup);
      const hasDashboardDrive = isCitrixDashboardDrive(ctx.problemDetails);
      return !(isCitrixProd && hasDashboardDrive);
    },
    owner: 'CITRIX_SILVA_ONLY',
    priority: 97,
  },

  // ===== REGLAS DE SISTEMA DE ARCHIVOS =====
  {
    name: 'Sistema de Archivos Linux - Rutas Críticas',
    condition: (ctx: OwnerContext) =>
      ctx.isLinuxOsFs() && ctx.osType?.includes('LINUX'),
    owner: 'Linux',
    priority: 100,
  },
  {
    // Filesystem Linux de datos dedicado a BBDD.
    // Configurable en DB_DATA_FS_PATHS.
    name: 'Sistema de Archivos Linux - Rutas BD -> BD',
    condition: (ctx: OwnerContext) => {
      const isLinuxDisk =
        ['disk', 'file system', 'filesystem', 'space', 'mount']
          .some(kw => ctx.problemDetails.includes(kw)) &&
        ctx.osType.includes('LINUX');

      if (!isLinuxDisk) return false;
      if (ctx.isLinuxOsFs()) return false;

      return DB_DATA_FS_PATHS.some(path => ctx.matchesLinuxDataPath(path));
    },
    owner: 'BD',
    priority: 99.5,
  },
  {
    // Disco Linux de datos (no crítico SO) -> APP.
    // Si APP_DATA_FS_PATHS tiene rutas, se usa como allow-list explícita.
    // Si está vacío, aplica a cualquier ruta Linux no crítica.
    name: 'Sistema de Archivos Linux - Disco de datos -> APP',
    condition: (ctx: OwnerContext) => {
      const isLinuxDisk =
        ['disk', 'file system', 'filesystem', 'space', 'mount']
          .some(kw => ctx.problemDetails.includes(kw)) &&
        ctx.osType.includes('LINUX') &&
        ctx.hasUnixLikePath();

      if (!isLinuxDisk) return false;
      if (ctx.isLinuxOsFs()) return false;
      if (DB_DATA_FS_PATHS.some(path => ctx.matchesLinuxDataPath(path))) return false;
      if (APP_DATA_FS_PATHS.length > 0) {
        return APP_DATA_FS_PATHS.some(path => ctx.matchesLinuxDataPath(path));
      }

      return true;
    },
    owner: 'APP',
    priority: 99,
  },
  {
    name: 'Sistema de Archivos Windows - Volúmenes del SO (C:\\)',
    condition: (ctx: OwnerContext) =>
      ctx.isWindowsOsFs() && ctx.osType?.includes('WINDOWS'),
    owner: 'Windows',
    priority: 100,
  },
  {
    // Disco Windows que NO es C:\ → responsabilidad de APP.
    // Ejemplos: D:\, E:\, F:\ → discos de datos de aplicación.
    // Si el TECH del HostGroup está en HOST_TECHNOLOGY_OWNER_MAP
    // (CITRIX, DC, etc.), deja que Tech Map lo gestione.
    name: 'Sistema de Archivos Windows - Disco de datos (no C:\\) → APP',
    condition: (ctx: OwnerContext) => {
      const isWinDisk =
        ['disk', 'file system', 'filesystem', 'space', 'mount']
          .some(kw => ctx.problemDetails.includes(kw)) &&
        ctx.osType.includes('WINDOWS') &&
        /[a-z]:\\/i.test(ctx.problemDetails);

      if (!isWinDisk) return false;
      if (ctx.isWindowsOsFs()) return false;

      const tech = extractTechFromHostGroup(ctx.hostsGroup);
      if (tech && tech in HOST_TECHNOLOGY_OWNER_MAP) return false;

      return true;
    },
    owner: 'APP',
    priority: 95,
  },

  // ===== ASIGNACION DIRECTA DE OS SERVICES =====
  {
    name: 'OS Service - Asignacion directa configurable',
    // No depende de entityType porque en algunos eventos os:service
    // DQL no lo resuelve y llega como OTRO/CUSTOM_DEVICE.
    condition: (ctx: OwnerContext) => !!ctx.getOsServiceDirectOwner(),
    owner: (ctx: OwnerContext): string => ctx.getOsServiceDirectOwner() || 'APP',
    priority: 97,
  },

  // ===== REGLAS DE GRUPO DE HOSTS =====
  {
    name: 'Host Technology Map - segmento TECH del HostGroup',
    condition: (ctx: OwnerContext) => {
      const tech = extractTechFromHostGroup(ctx.hostsGroup);
      return !!tech && tech in HOST_TECHNOLOGY_OWNER_MAP;
    },
    owner: (ctx: OwnerContext): string => {
      const tech = extractTechFromHostGroup(ctx.hostsGroup)!;
      const mapped = HOST_TECHNOLOGY_OWNER_MAP[tech];
      return mapped === null ? '_EXCLUIDO_' : (mapped || 'APP');
    },
    priority: 96,
  },
  {
    name: 'Grupo BD - TIER=DB en HostGroup',
    condition: (ctx: OwnerContext) => {
      const parts = (ctx.hostsGroup || '').toUpperCase().split('_');
      return parts.length > 1 && parts[1] === 'DB';
    },
    owner: 'BD',
    priority: 92,
  },

  // ===== REGLA OS_SERVICE vía TAG AGO_OS =====
  {
    name: 'Tag AGO_OS (cualquier entidad: servicio, proceso, OS_SERVICE, HOST)',
    condition: (ctx: OwnerContext) => !!ctx.getTagValue('AGO_OS'),
    owner: (ctx: OwnerContext): string => ctx.getTagValue('AGO_OS') || 'APP',
    priority: 90,
  },

  // ===== FALLBACKS =====
  {
    name: 'HOST - OS fallback (solo cuando hostsGroup vacío)',
    condition: (ctx: OwnerContext) =>
      ctx.entityType.includes('HOST') &&
      !ctx.hostsGroup &&
      (ctx.osType.includes('LINUX') || ctx.osType.includes('WINDOWS')),
    owner: (ctx: OwnerContext): string =>
      ctx.osType.includes('LINUX') ? 'Linux' : 'Windows',
    priority: 50,
  },
  {
    name: 'Grupo de Aplicaciones',
    condition: (_ctx: OwnerContext) => true,
    owner: 'APP',
    priority: 10,
  },
];



// ============================================================================
// PATRONES Y CONSTANTES
// ============================================================================

// Configuración de Citrix: entornos de producción y discos para dashboard
const CITRIX_PRODUCTION_ENVIRONMENTS = new Set(['PRO', 'PROD', 'PRODUCTION', 'PRD']);
const CITRIX_DASHBOARD_DRIVES = new Set(['c:\\']);

const EXCLUDED_PROBLEM_TITLES = [
  '[AESM] Peticiones lentas ESB  (Blanqueo Capitales)'
];

const ALWAYS_APP_PATTERNS = [
  'filenet',
  'jboss not available',
  'long garbage-collection time',
  'hinrich',
  'papyrus',
  'GC Repetitivos',
  'filebeat'
];

const ALWAYS_OS_PATTERNS = [
  'controlm',
];

// OS por defecto para cada patrón cuando DQL no resuelve el osType
// (ej: entidades os:service o procesos sin host asociado)
const ALWAYS_OS_PATTERN_DEFAULTS: Record<string, string> = {
  'controlm': 'Linux',
};

const HOST_TECHNOLOGY_OWNER_MAP: Record<string, string | null> = {
  'DC':          'Windows',
  // 'CITRIX':      'Windows',  // ← COMENTADO: usar nuevas reglas con lógica condicional
  'SAS':         'Linux',
  'VERINT':      'Windows',
  'CONTROLM':    'Linux',
  'DUMMY':       null,
  'DLP':         'Linux',
  'PRINTSERVER': 'Windows',
};

// Filesystems de OS (Linux y Windows).
const LINUX_OS_FS_PATHS = [
  '/var/log/audit', '/var/log', '/var/spool', '/boot/efi', '/usr/sbin',
  '/usr/bin', '/usr/lib', '/usr/share', '/bin', '/sbin', '/etc', '/dev',
  '/proc', '/sys', '/lib', '/usr', '/var', '/root', '/tmp', '/boot',
  '/mnt', '/'
];

const WINDOWS_OS_FS_DRIVES = [
  'C:\\',
];

// Filesystems Linux de datos con owner explícito.
// Lista de nuevas rutas para clasificar APP o BD.
const DB_DATA_FS_PATHS = [
  '/dbmaint',
];

const APP_DATA_FS_PATHS = [
  '/export/home',
];

// Asignacion directa para os:service por nombre/descripcion.
// Se evalua por contains (case-insensitive) contra:
// - Nombres de entidades afectadas (ej: "Group Policy Client")
// - problemDetails
// - tags consolidados del problema
// Primer match gana.
const OS_SERVICE_DIRECT_OWNER_RULES: Array<{ contains: string; owner: string }> = [
  { contains: 'group policy client', owner: 'Windows' },
  { contains: 'gpsvc', owner: 'Windows' },
  { contains: 'httpd', owner: 'APP' },
];

const ENTITY_TYPE_MAPPING = [
  ['affectedServices', 'SERVICE'],
  ['affectedApplications', 'APPLICATION'],
  ['affectedMobileApplications', 'MOBILE_APPLICATION'],
  ['affectedCustomApplications', 'CUSTOM_APPLICATION'],
  ['affectedCloudApplications', 'CLOUD_APPLICATION'],
  ['affectedSyntheticTests', 'SYNTHETIC_TEST'],
  ['affectedHttpChecks', 'HTTP_CHECK'],
  ['affectedMultiprotocolMonitors', 'MULTIPROTOCOL_MONITOR'],
  ['affectedHosts', 'HOST'],
  ['affectedCustomDevices', 'CUSTOM_DEVICE'],
  ['affectedEnvironment', 'ENVIRONMENT'],
  ['affectedDatabases', 'DATABASE'],
  ['affectedProcessGroups', 'PROCESS_GROUP'],
  ['affectedProcesses', 'PROCESS'],
  ['affectedProcessGroupInstances', 'PROCESS_GROUP_INSTANCE'],
  ['affectedKubernetesClusters', 'KUBERNETES_CLUSTER'],
  ['affectedKubernetesNodes', 'KUBERNETES_NODE'],
  ['affectedHypervisors', 'HYPERVISOR'],
  ['affectedOsServices', 'OS_SERVICE'],
] as const;

const ROOT_CAUSE_FIELDS = [
  'rootCauseServices', 'rootCauseApplications', 'rootCauseMobileApplications',
  'rootCauseCustomApplications', 'rootCauseCloudApplications',
  'rootCauseSyntheticTests', 'rootCauseHttpChecks', 'rootCauseMultiprotocolMonitors',
  'rootCauseHosts', 'rootCauseCustomDevices', 'rootCauseEnvironment',
  'rootCauseDatabases', 'rootCauseProcessGroups', 'rootCauseProcesses',
  'rootCauseProcessGroupInstances', 'rootCauseKubernetesClusters',
  'rootCauseKubernetesNodes', 'rootCauseHypervisors', 'rootCauseOsServices',
];

// ============================================================================
// CLASES Y CONTEXTO PARA OWNER
// ============================================================================

class OwnerContext {
  problemDetails: string;
  problemName: string;
  hostsGroup: string;
  osType: string;
  entityType: string;
  affectedEntities: string[];
  osServiceTags: string[];
  private linuxFsPaths: Set<string>;
  private windowsFsDrives: Set<string>;

  constructor(
    problemDetails: string,
    problemName: string,
    hostsGroup: string,
    osType: string,
    entityType: string,
    affectedEntities: string[] = [],
    osServiceTags: string[] = []
  ) {
    this.problemDetails = (problemDetails || '').toLowerCase();
    this.problemName = (problemName || '').toLowerCase();
    this.hostsGroup = hostsGroup || '';
    this.osType = (osType || '').toUpperCase();
    this.entityType = (entityType || '').toUpperCase();
    this.affectedEntities = affectedEntities;
    this.osServiceTags = osServiceTags;
    this.linuxFsPaths = new Set(LINUX_OS_FS_PATHS);
    this.windowsFsDrives = new Set(WINDOWS_OS_FS_DRIVES.map(d => d.toLowerCase()));
  }

  hasTag(tagKeyOrFull: string): boolean {
    const search = tagKeyOrFull.toLowerCase();
    return this.osServiceTags.some(tag => {
      const t = tag.trim().toLowerCase();
      if (t === search) return true;
      if (t.startsWith(search + ':')) return true;
      return false;
    });
  }

  hasTagPrefix(prefix: string): boolean {
    const search = prefix.toLowerCase();
    return this.osServiceTags.some(tag => tag.trim().toLowerCase().startsWith(search));
  }

  getTagValue(key: string): string | undefined {
    const prefix = key.toLowerCase() + ':';
    return this.osServiceTags
      .map(t => String(t).trim())
      .find(t => t.toLowerCase().startsWith(prefix))
      ?.split(':').slice(1).join(':');
  }

  isLinuxOsFs(): boolean {
    const isFsProblem = ['disk', 'file system', 'filesystem', 'space', 'mount']
      .some(keyword => this.problemDetails.includes(keyword));
    if (!isFsProblem) return false;
    const rootFsRegex = /(?:\bon\s+|\bmount\s+point\s+|\bfilesystem\s+|\bdisk\s+|\bpartition\s+)\/(?:\s|$)/i;
    if (rootFsRegex.test(this.problemDetails)) return true;
    return Array.from(this.linuxFsPaths)
      .filter(p => p !== '/')
      .some(path => this.matchesPath(path));
  }

  isWindowsOsFs(): boolean {
    const isFsProblem = ['disk', 'file system', 'filesystem', 'space', 'mount']
      .some(keyword => this.problemDetails.includes(keyword));
    if (!isFsProblem) return false;
    return Array.from(this.windowsFsDrives).some(drive =>
      this.problemDetails.includes(drive)
    );
  }

  hasUnixLikePath(): boolean {
    // Detecta rutas tipo Linux/Unix para diferenciar discos de datos de eventos no-FS.
    return /(?:^|[^a-z0-9_])(\/[a-z0-9._\-/]+)(?=$|[^a-z0-9_])/i.test(this.problemDetails);
  }

  matchesLinuxDataPath(path: string): boolean {
    return this.matchesPath(path);
  }

  getOsServiceDirectOwner(): string | undefined {
    const haystacks = [
      this.problemDetails,
      this.problemName,
      ...this.affectedEntities.map(e => String(e || '').toLowerCase()),
      ...this.osServiceTags.map(t => String(t || '').toLowerCase()),
    ];

    const match = OS_SERVICE_DIRECT_OWNER_RULES.find(rule => {
      const needle = String(rule.contains || '').toLowerCase().trim();
      if (!needle) return false;
      return haystacks.some(h => h.includes(needle));
    });

    return match?.owner;
  }

  private matchesPath(path: string): boolean {
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pathRegex = new RegExp(
      `(^|[^a-z0-9_])${escapedPath}(?=$|[^a-z0-9_])`,
      'i'
    );
    return pathRegex.test(this.problemDetails);
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

const formatDate = (timestamp: number): string => {
  try {
    return new Date(timestamp).toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      dateStyle: 'short',
      timeStyle: 'medium'
    });
  } catch {
    return String(timestamp);
  }
};

const normalizeProblemTitle = (title: string): string =>
  String(title || '').trim().replace(/\s+/g, ' ').toLowerCase();

const excludedTitlesSet = new Set(
  EXCLUDED_PROBLEM_TITLES.map(normalizeProblemTitle)
);

const shouldExcludeProblemByTitle = (title: string): boolean =>
  excludedTitlesSet.has(normalizeProblemTitle(title));

const extractProblemDetails = (description: string): string => {
  const text = String(description || '').trim();
  if (!text) return '';
  const lastBoldIndex = text.lastIndexOf('**');
  if (lastBoldIndex === -1) return text;
  const trimmedAfterBold = text.slice(lastBoldIndex + 2).trim();
  return trimmedAfterBold || text;
};

const formatDuration = (nanoseconds: number): string => {
  const seconds = Math.floor(nanoseconds / 1_000_000_000);
  const days    = Math.floor(seconds / (24 * 60 * 60));
  const hours   = Math.floor((seconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs    = seconds % 60;
  let str = '';
  if (days > 0)    str += days + 'd ';
  if (hours > 0)   str += hours + 'h ';
  if (minutes > 0) str += minutes + 'm ';
  str += secs + 's';
  return str.trim();
};

const getDurationIcon = (nanoseconds: number): string => {
  const seconds = Math.floor(nanoseconds / 1_000_000_000);
  if (seconds >= 24 * 60 * 60) return '🔥';
  if (seconds >= 1 * 60 * 60)  return '⚠️';
  return 'ℹ️';
};

const extractTechFromHostGroup = (hostGroup: string): string | undefined => {
  const parts = (hostGroup || '').toUpperCase().split('_');
  return parts.length > 2 ? parts[2] : undefined;
};

const isCitrixProduction = (hostGroup: string): boolean => {
  const parts = (hostGroup || '').toUpperCase().split('_');
  // Verifica: 3er segmento = CITRIX y 4º segmento = PRO/PROD/PRODUCTION/PRD
  const isCitrix = parts.length > 2 && parts[2] === 'CITRIX';
  const isProduction = parts.length > 3 && CITRIX_PRODUCTION_ENVIRONMENTS.has(parts[3]);
  return isCitrix && isProduction;
};

const isCitrixDashboardDrive = (problemDetails: string): boolean => {
  // Extrae el disco usando expresión regular [a-z]:\\ y verifica si está en la lista
  const driveMatch = (problemDetails || '').toLowerCase().match(/[a-z]:\\/i);
  if (!driveMatch) return false;
  return CITRIX_DASHBOARD_DRIVES.has(driveMatch[0].toLowerCase());
};

/**
 * Normaliza tags de DQL (objetos o strings) a formato "key:value" o "key"
 */
const flatTags = (raw: any): string[] => {
  if (!Array.isArray(raw)) return [];
  return (raw as any[]).flat(Infinity).filter(Boolean).map(item => {
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'object' && item !== null) {
      if (item.stringRepresentation) return String(item.stringRepresentation).trim();
      const key   = String(item.key   || '').trim();
      const value = String(item.value || '').trim();
      return value ? `${key}:${value}` : key;
    }
    return String(item).trim();
  }).filter(Boolean);
};

/**
 * Obtiene los tags de un problema via API REST como fallback
 * cuando DQL no puede resolver la entidad (ej: os:service / CUSTOM_DEVICE deprecado)
 */
const fetchProblemTagsFromApi = async (problemId: string): Promise<string[]> => {
  try {
    const problem = await problemsClient.getProblem({ problemId });
    return (problem?.entityTags || [])
      .map((t: any) => {
        if (t.stringRepresentation) return String(t.stringRepresentation).trim();
        const key   = String(t.key   || '').trim();
        const value = String(t.value || '').trim();
        return value ? `${key}:${value}` : key;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

const determineOwner = (
  problemDetails: string,
  problemName: string,
  hostsGroup: string,
  osType: string,
  entityType: string,
  affectedEntities: string[] = [],
  osServiceTags: string[] = []
): string => {
  const ctx = new OwnerContext(
    problemDetails, problemName, hostsGroup, osType, entityType, affectedEntities, osServiceTags
  );
  const sortedRules = [...OWNER_RULES].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  for (const rule of sortedRules) {
    try {
      if (rule.condition(ctx)) {
        return typeof rule.owner === 'function'
          ? (rule.owner as (ctx: OwnerContext) => string)(ctx)
          : rule.owner as string;
      }
    } catch (e) {
      console.warn(`Error evaluando regla "${rule.name}":`, e);
    }
  }
  return 'DESCONOCIDO';
};

const getEntityTypes = (record: ProblemRecord, rootCauseFields: string[]): string => {
  const tipos = new Set<string>();
  ENTITY_TYPE_MAPPING.forEach(([field, type]) => {
    if (Array.isArray(record[field]) && record[field].some(Boolean)) tipos.add(type);
  });
  if (tipos.size === 0) {
    rootCauseFields.forEach(field => {
      if (Array.isArray(record[field]) && record[field].some(Boolean)) {
        const affectedField = field.replace('rootCause', 'affected');
        const [, type] = ENTITY_TYPE_MAPPING.find(([f]) => f === affectedField) || [undefined, 'OTRO'];
        if (type) tipos.add(type);
      }
    });
  }
  return Array.from(tipos).join(', ') || 'OTRO';
};

const extractAffectedEntitiesName = (
  record: ProblemRecord,
  affected_names: string[]
): string => {
  let result = affected_names.join(', ');
  const eventName = record.eventName || '';
  const match = eventName.match(/^(.+?)\s+is\s+/i);
  if (match) {
    const extractedName = match[1].trim();
    if (extractedName && extractedName.length > 3 && !extractedName.includes('.')) {
      if (!result.includes(extractedName)) result = extractedName;
    }
  }
  return result;
};

// ============================================================================
// QUERY DQL
// ============================================================================

const buildDQLQuery = (alertingProfiles: string[]): string => {
  const profilesFilter = alertingProfiles.map(p => `"${p}"`).join(',');
  return `
fetch dt.davis.problems, from: now()-24h, to: now()
| filter event.status == "ACTIVE"
| filter in(labels.alerting_profile, {${profilesFilter}})
| filter event.kind == "DAVIS_PROBLEM"
| fields display_id, event.id, event.name, event.start, event.status, event.kind, event.description, resolved_problem_duration, root_cause_entity_id, affected_entity_ids, related_entity_ids
| expand affected_entity_ids
| lookup [fetch dt.entity.service | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.service."
| lookup [fetch dt.entity.application | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.application."
| lookup [fetch dt.entity.mobile_application | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.mobile_application."
| lookup [fetch dt.entity.custom_application | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.custom_application."
| lookup [fetch dt.entity.cloud_application | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.cloud_application."
| lookup [fetch dt.entity.synthetic_test | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.synthetic_test."
| lookup [fetch dt.entity.http_check | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.http_check."
| lookup [fetch dt.entity.multiprotocol_monitor | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.multiprotocol_monitor."
| lookup [fetch dt.entity.host | fields id, entity.name, osType, hostGroupName, tags], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.host."
| lookup [fetch dt.entity.custom_device | fields id, entity.name, tags], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.custom_device."
| lookup [fetch dt.entity.environment | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.environment."
| lookup [fetch dt.entity.database | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.database."
| lookup [fetch dt.entity.process_group | fields id, entity.name, tags], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.process_group."
| lookup [fetch dt.entity.process | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.process."
| lookup [fetch dt.entity.process_group_instance | fields id, entity.name, tags], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.process_group_instance."
| lookup [fetch dt.entity.kubernetes_cluster | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.kubernetes_cluster."
| lookup [fetch dt.entity.kubernetes_node | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.kubernetes_node."
| lookup [fetch dt.entity.hypervisor | fields id, entity.name], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.hypervisor."
| lookup [fetch dt.entity.service | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.service."
| lookup [fetch dt.entity.application | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.application."
| lookup [fetch dt.entity.mobile_application | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.mobile_application."
| lookup [fetch dt.entity.custom_application | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.custom_application."
| lookup [fetch dt.entity.cloud_application | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.cloud_application."
| lookup [fetch dt.entity.synthetic_test | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.synthetic_test."
| lookup [fetch dt.entity.http_check | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.http_check."
| lookup [fetch dt.entity.multiprotocol_monitor | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.multiprotocol_monitor."
| lookup [fetch dt.entity.host | fields id, entity.name, osType, hostGroupName, tags], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.host."
| lookup [fetch dt.entity.custom_device | fields id, entity.name, tags], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.custom_device."
| lookup [fetch dt.entity.environment | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.environment."
| lookup [fetch dt.entity.database | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.database."
| lookup [fetch dt.entity.process_group | fields id, entity.name, tags], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.process_group."
| lookup [fetch dt.entity.process | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.process."
| lookup [fetch dt.entity.process_group_instance | fields id, entity.name, tags], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.process_group_instance."
| lookup [fetch dt.entity.kubernetes_cluster | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.kubernetes_cluster."
| lookup [fetch dt.entity.kubernetes_node | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.kubernetes_node."
| lookup [fetch dt.entity.hypervisor | fields id, entity.name], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.hypervisor."
| lookup [fetch dt.entity.os_service | fields id, entity.name, entity.display_name, tags], sourceField:affected_entity_ids, lookupField:id, prefix:"lookup.os_service."
| lookup [fetch dt.entity.os_service | fields id, entity.name, entity.display_name, tags], sourceField:root_cause_entity_id, lookupField:id, prefix:"lookup.root_cause.os_service."
| summarize {
    eventid = takeFirst(event.id),
    eventName = takeFirst(event.name),
    startTime = takeFirst(event.start),
    status = takeFirst(event.status),
    problemClosedDuration = takeFirst(resolved_problem_duration),
    root_cause_entity_id = takeFirst(root_cause_entity_id),
    description = takeFirst(event.description),
    affectedServices = collectDistinct(lookup.service.entity.name),
    affectedApplications = collectDistinct(lookup.application.entity.name),
    affectedMobileApplications = collectDistinct(lookup.mobile_application.entity.name),
    affectedCustomApplications = collectDistinct(lookup.custom_application.entity.name),
    affectedCloudApplications = collectDistinct(lookup.cloud_application.entity.name),
    affectedSyntheticTests = collectDistinct(lookup.synthetic_test.entity.name),
    affectedHttpChecks = collectDistinct(lookup.http_check.entity.name),
    affectedMultiprotocolMonitors = collectDistinct(lookup.multiprotocol_monitor.entity.name),
    affectedHosts = collectDistinct(lookup.host.entity.name),
    affectedHostsOS = collectDistinct(lookup.host.osType),
    affectedHostsGroup = collectDistinct(lookup.host.hostGroupName),
    affectedHostsTags = collectDistinct(lookup.host.tags),
    affectedCustomDevices = collectDistinct(lookup.custom_device.entity.name),
    affectedCustomDevicesTags = collectDistinct(lookup.custom_device.tags),
    affectedEnvironment = collectDistinct(lookup.environment.entity.name),
    affectedDatabases = collectDistinct(lookup.database.entity.name),
    affectedProcessGroups = collectDistinct(lookup.process_group.entity.name),
    affectedProcessGroupsTags = collectDistinct(lookup.process_group.tags),
    affectedProcesses = collectDistinct(lookup.process.entity.name),
    affectedProcessGroupInstances = collectDistinct(lookup.process_group_instance.entity.name),
    affectedProcessGroupInstancesTags = collectDistinct(lookup.process_group_instance.tags),
    affectedKubernetesClusters = collectDistinct(lookup.kubernetes_cluster.entity.name),
    affectedKubernetesNodes = collectDistinct(lookup.kubernetes_node.entity.name),
    affectedHypervisors = collectDistinct(lookup.hypervisor.entity.name),
    affectedOsServices = collectDistinct(coalesce(lookup.os_service.entity.name, lookup.os_service.entity.display_name)),
    affectedOsServicesTags = collectDistinct(lookup.os_service.tags),
    rootCauseServices = collectDistinct(lookup.root_cause.service.entity.name),
    rootCauseApplications = collectDistinct(lookup.root_cause.application.entity.name),
    rootCauseMobileApplications = collectDistinct(lookup.root_cause.mobile_application.entity.name),
    rootCauseCustomApplications = collectDistinct(lookup.root_cause.custom_application.entity.name),
    rootCauseCloudApplications = collectDistinct(lookup.root_cause.cloud_application.entity.name),
    rootCauseSyntheticTests = collectDistinct(lookup.root_cause.synthetic_test.entity.name),
    rootCauseHttpChecks = collectDistinct(lookup.root_cause.http_check.entity.name),
    rootCauseMultiprotocolMonitors = collectDistinct(lookup.root_cause.multiprotocol_monitor.entity.name),
    rootCauseHosts = collectDistinct(lookup.root_cause.host.entity.name),
    rootCauseHostsOS = collectDistinct(lookup.root_cause.host.osType),
    rootCauseHostsGroup = collectDistinct(lookup.root_cause.host.hostGroupName),
    rootCauseHostsTags = collectDistinct(lookup.root_cause.host.tags),
    rootCauseCustomDevices = collectDistinct(lookup.root_cause.custom_device.entity.name),
    rootCauseCustomDevicesTags = collectDistinct(lookup.root_cause.custom_device.tags),
    rootCauseEnvironment = collectDistinct(lookup.root_cause.environment.entity.name),
    rootCauseDatabases = collectDistinct(lookup.root_cause.database.entity.name),
    rootCauseProcessGroups = collectDistinct(lookup.root_cause.process_group.entity.name),
    rootCauseProcessGroupsTags = collectDistinct(lookup.root_cause.process_group.tags),
    rootCauseProcesses = collectDistinct(lookup.root_cause.process.entity.name),
    rootCauseProcessGroupInstances = collectDistinct(lookup.root_cause.process_group_instance.entity.name),
    rootCauseProcessGroupInstancesTags = collectDistinct(lookup.root_cause.process_group_instance.tags),
    rootCauseKubernetesClusters = collectDistinct(lookup.root_cause.kubernetes_cluster.entity.name),
    rootCauseKubernetesNodes = collectDistinct(lookup.root_cause.kubernetes_node.entity.name),
    rootCauseHypervisors = collectDistinct(lookup.root_cause.hypervisor.entity.name),
    rootCauseOsServices = collectDistinct(lookup.root_cause.os_service.entity.name),
    rootCauseOsServicesTags = collectDistinct(lookup.root_cause.os_service.tags)
}, by: {event.id, display_id, event.kind}
| join [
    fetch dt.davis.problems, from: now()-24h, to: now()
    | filter event.status == "ACTIVE"
    | filter in(labels.alerting_profile, {${profilesFilter}})
    | filter event.kind == "DAVIS_PROBLEM"
    | fields eventid = event.id, related_entity_ids
    | expand related_entity_ids
    | lookup [fetch dt.entity.host | fields id, entity.name], sourceField:related_entity_ids, lookupField:id, prefix:"lookup.related.host."
    | summarize relatedHosts = collectDistinct(lookup.related.host.entity.name), by: {eventid}
], kind:leftOuter, on:{left[eventid] == right[eventid]}, fields:{relatedHosts}
| fieldsAdd currentTime = toTimestamp(now())
| fieldsAdd relatedHosts = coalesce(relatedHosts, array())
| fieldsAdd affected_names = arrayRemoveNulls(arrayConcat(affectedApplications, affectedMobileApplications, affectedCustomApplications, affectedCloudApplications, affectedSyntheticTests, affectedServices, affectedHosts, affectedCustomDevices, affectedEnvironment, affectedMultiprotocolMonitors, affectedDatabases, affectedProcessGroups, affectedProcesses, affectedHttpChecks, affectedProcessGroupInstances, affectedKubernetesClusters, affectedHypervisors, affectedKubernetesNodes, affectedOsServices, relatedHosts))
| fieldsAdd Status = if((status == "ACTIVE"), "🔴", else:if((status == "CLOSED"), "🟢", else:""))
| fieldsAdd Duracion = if((status == "CLOSED"), problemClosedDuration, else:if((status == "ACTIVE"), currentTime - startTime))
| sort startTime desc
| filter arraySize(affected_names) > 0
`;
};

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function fetchProblemsWithProfiles(
  alertingProfiles: string[] = [
    "[AESM] Alertas_24x7",
    "[AESM]_Alertas_24x7_Synthetic",
    "[AESM] Alertas_24x7_PRUEBAS_PRO"
  ]
) {
  const query = buildDQLQuery(alertingProfiles);

  try {
    const token = await queryExecutionClient.queryExecute({ body: { query } });
    let pollResult;

    for (let attempt = 0; attempt < 30; attempt++) {
      pollResult = await queryExecutionClient.queryPoll({
        requestToken: token.requestToken,
        requestTimeoutMilliseconds: 1000 * 60
      });

      const state = pollResult?.state;
      if (state === 'FAILED' || state === 'CANCELED') {
        throw new Error(`La consulta DQL terminó con estado ${state}`);
      }
      if (pollResult?.result?.records) break;
      if (attempt > 5) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt - 5)));
      }
    }

    const rawRecords = (pollResult?.result?.records || []) as ProblemRecord[];
    const records = rawRecords.filter(r => !shouldExcludeProblemByTitle(r.eventName));

    const mappings: Record<string, { type: string }> = {
      'ACK':               { type: 'string' },
      'Id':                { type: 'string' },
      'StartTime':         { type: 'string' },
      'Name':              { type: 'string' },
      'problemDetails':    { type: 'string' },
      'OS':                { type: 'string' },
      'owner':             { type: 'string' },
      'hostsGroup':        { type: 'string' },
      'Duracion':          { type: 'string' },
      'Affected_entities': { type: 'string' },
      'Status':            { type: 'string' },
      'Root_cause':        { type: 'string' },
      'Tipo_entidad':      { type: 'string' },
      'event.id':          { type: 'string' },
      'Last_comment':      { type: 'string' }
    };

    const types = [{ mappings, indexRange: [0, records ? records.length : 0] }];
    const dataFrame = { records: [] as OutputRecord[], types };

    if (records && records.length > 0) {

      // Obtener comentarios en paralelo
      const commentsPromises = records.map(r =>
        problemsClient.getComments({ problemId: r.eventid })
          .catch(() => ({ comments: [] }))
      );
      const allComments = await Promise.all(commentsPromises);

      // Procesar cada registro
      for (let i = 0; i < records.length; i++) {
        const record   = records[i];
        const eventId  = record.eventid;
        const displayId = record.display_id;

        const tipoEntidad = getEntityTypes(record, ROOT_CAUSE_FIELDS);

        const affectedNames = Array.isArray(record.affected_names)
          ? record.affected_names : [];
        const affectedEntitiesStr = extractAffectedEntitiesName(record, affectedNames);

        // ── Grupo de hosts ──────────────────────────────────────────────────
        const affectedHostsGroup  = (record.affectedHostsGroup  || []).filter(Boolean);
        const rootCauseHostsGroup = (record.rootCauseHostsGroup || []).filter(Boolean);
        const hostGroupValues = affectedHostsGroup.length > 0
          ? affectedHostsGroup : rootCauseHostsGroup;
        let hostsGroupStr = [...new Set(hostGroupValues)].join(', ');

        // Fallback 1: extraer HostGroup desde tags de entidades DQL
        if (!hostsGroupStr) {
          const allEntityTags = [
            ...flatTags(record.affectedCustomDevicesTags),
            ...flatTags(record.rootCauseCustomDevicesTags),
            ...flatTags(record.affectedOsServicesTags),
            ...flatTags(record.affectedHostsTags),
            ...flatTags(record.rootCauseHostsTags),
            ...flatTags(record.affectedProcessGroupsTags),
            ...flatTags(record.affectedProcessGroupInstancesTags),
            ...flatTags(record.rootCauseProcessGroupsTags),
            ...flatTags(record.rootCauseProcessGroupInstancesTags),
          ];
          const hostGroupTag = allEntityTags.find(t =>
            t.toLowerCase().startsWith('hostgroup:')
          );
          if (hostGroupTag) {
            hostsGroupStr = hostGroupTag.split(':').slice(1).join(':').trim();
          }
        }

        // ── SO ──────────────────────────────────────────────────────────────
        const affectedHostsOS  = (record.affectedHostsOS  || []).filter(Boolean);
        const rootCauseHostsOS = (record.rootCauseHostsOS || []).filter(Boolean);
        const osValues = affectedHostsOS.length > 0 ? affectedHostsOS : rootCauseHostsOS;
        const osStr = osValues.length > 0
          ? [...new Set(osValues)].join(', ')
          : (tipoEntidad !== 'HOST' && !tipoEntidad.includes('HOST') ? 'N/A' : '');

        const problemDetails = extractProblemDetails(record.description);

        // ── Tags consolidados desde DQL ─────────────────────────────────────
        let osServiceTags = [
          ...flatTags(record.affectedHostsTags),
          ...flatTags(record.rootCauseHostsTags),
          ...flatTags(record.affectedCustomDevicesTags),
          ...flatTags(record.rootCauseCustomDevicesTags),
          ...flatTags(record.affectedOsServicesTags),
          ...flatTags(record.affectedProcessGroupsTags),
          ...flatTags(record.affectedProcessGroupInstancesTags),
          ...flatTags(record.rootCauseProcessGroupsTags),
          ...flatTags(record.rootCauseProcessGroupInstancesTags),
        ];

        // ── Fallback 2: API REST cuando DQL no resuelve la entidad ──────────
        // Se activa cuando no hay tags útiles Y no hay hostsGroup
        // (típico de entidades os:service con ID CUSTOM_DEVICE deprecado en DQL)
        const hasUsefulTags = osServiceTags.some(t =>
          t && !t.startsWith('null') && t.length > 0
        );

        if (!hasUsefulTags && !hostsGroupStr) {
          const apiTags = await fetchProblemTagsFromApi(eventId);
          if (apiTags.length > 0) {
            // Enriquecer osServiceTags con los tags de la API
            osServiceTags = [...apiTags, ...osServiceTags];

            // Intentar extraer hostsGroup de los tags de la API
            const hostGroupTag = apiTags.find(t =>
              t.toLowerCase().startsWith('hostgroup:')
            );
            if (hostGroupTag) {
              hostsGroupStr = hostGroupTag.split(':').slice(1).join(':').trim();
            }
          }
        }

        // ── Determinar owner ────────────────────────────────────────────────
        const owner = determineOwner(
          problemDetails, record.eventName || '', hostsGroupStr, osStr,
          tipoEntidad, affectedNames, osServiceTags
        );

        // Filtrar problemas excluidos del dashboard (no aparecen en 24x7)
        if (owner === '_EXCLUIDO_' || owner === 'CITRIX_SILVA_ONLY') continue;

        // ── Root cause ──────────────────────────────────────────────────────
        const rootCauseCandidates = ROOT_CAUSE_FIELDS
          .flatMap(f => Array.isArray(record[f]) ? record[f] : [])
          .filter(Boolean);
        const rootCause = rootCauseCandidates[0] || '';

        // ── Duración ────────────────────────────────────────────────────────
        let duracionStr = '';
        let icon = '';
        if (record.Duracion) {
          duracionStr = formatDuration(Number(record.Duracion));
          icon        = getDurationIcon(Number(record.Duracion));
        }

        // ── Último comentario ───────────────────────────────────────────────
        const commentsList = allComments[i];
        const lastComment  = commentsList?.comments?.length > 0
          ? commentsList.comments[commentsList.comments.length - 1]?.content || ''
          : '';
        const hasAck = (commentsList?.comments || []).some((comment: any) =>
          /\b(ack|acknowledged)\b/i.test(String(comment?.content || ''))
        );
        const ackStatus = hasAck ? '✅' : '';

        const outputRecord: OutputRecord = {
          ACK:               ackStatus,
          Id: `[${displayId}](https://vnk09715.apps.dynatrace.com/ui/apps/dynatrace.classic.problems/#problems/problemdetails;pid=${eventId})`,
          StartTime:         formatDate(record.startTime),
          Name:              record.eventName,
          problemDetails,
          OS:                osStr,
          owner,
          hostsGroup:        hostsGroupStr,
          Duracion:          duracionStr,
          Affected_entities: affectedEntitiesStr,
          Status:            record.Status || '',
          Root_cause:        rootCause,
          Tipo_entidad:      tipoEntidad,
          'event.id':        eventId,
          Last_comment:      lastComment,
          icon
        };

        dataFrame.records.push(outputRecord);
      }
    }

    return dataFrame;

  } catch (error) {
    console.error('Error ejecutando consulta DQL o procesando resultados:', error);
    return {
      records: [],
      types: [{ mappings: { 'Error': { type: 'string' } }, indexRange: [0, 1] }]
    };
  }
}

export default async function () {
  return fetchProblemsWithProfiles();
}
