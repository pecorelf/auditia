import { getPackActivo } from "../packs";
// Planilla de seguimiento de hallazgos — cliente según el pack activo
// 4 años de historia (2023, 2024, 2025, parcial 2026) · ~180 hallazgos
//
// Esta es la herramienta que ela líder de Auditoría Interna llama "el corazón"
// de la práctica: donde se registran TODOS los hallazgos de TODAS las auditorías,
// con su responsable, compromiso, fecha de vencimiento y estado.
//
// El gerente de auditoría se mide por esto: cuántos hallazgos cerrados, cuántos
// vencidos, qué % de cumplimiento por área. Es su KPI ante el directorio.
//
// PATRONES PLANTADOS para que AuditIA pueda descubrir:
//   1. Hallazgos REITERADOS (mismo problema en años sucesivos)
//   2. Área con peor cumplimiento (TI con >60% vencidos)
//   3. Crítico abierto hace >18 meses
//   4. Responsable sobrecargado (>20 compromisos)
//   5. Tendencia preocupante en severidad (críticos creciendo)
//   6. Proceso con mayor reincidencia (TI con 58% de reiterados)
//   7. Concentración estacional (cierre fiscal genera picos)

export type Hallazgo = {
  id: string;
  fechaHallazgo: string;
  proceso: string;
  area: string;
  descripcion: string;
  severidad: "Crítica" | "Alta" | "Media" | "Baja";
  compromiso: string;
  responsable: string;
  fechaCompromiso: string;
  estado: "Abierto" | "En proceso" | "Cerrado" | "No iniciado";
  fechaCierre: string | null;
  origenAuditoria: string;
  esReiterado: boolean;
  hallazgoOrigenId: string | null;
};

const HOY = new Date("2026-05-27");

const addDays = (date: string, days: number) =>
  new Date(new Date(date).getTime() + days * 86400000).toISOString().split("T")[0];

const diasEntre = (d1: string, d2: string) =>
  Math.floor((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000);

// ─────────────────────────────────────────────────────────────────────
// CATÁLOGO DE HALLAZGOS TÍPICOS (con redacción real de auditoría)
// ─────────────────────────────────────────────────────────────────────

type Plantilla = {
  proceso: string;
  area: string;
  desc: string;
  compromiso: string;
  severidad: Hallazgo["severidad"];
  recurrente?: boolean; // si tiende a reiterarse
};

const CATALOGO: Plantilla[] = [
  // ─── COMPRAS / P2P (alto volumen, alto riesgo)
  { proceso: "Compras", area: "Gerencia de Abastecimiento", desc: "Órdenes de compra emitidas sin aprobación documentada del nivel jerárquico requerido por matriz", compromiso: "Implementar workflow electrónico de aprobación con bloqueo automático fuera de matriz", severidad: "Alta", recurrente: true },
  { proceso: "Compras", area: "Gerencia de Abastecimiento", desc: "Fraccionamiento de compras bajo umbral de aprobación gerencial (CLP 5M)", compromiso: "Implementar control de detección automática por proveedor + período", severidad: "Alta", recurrente: true },
  { proceso: "Compras", area: "Gerencia de Abastecimiento", desc: "Maestro de proveedores sin revisión periódica formal: 18% sin actividad >2 años activos", compromiso: "Política de depuración semestral del maestro + responsable designado", severidad: "Media" },
  { proceso: "Compras", area: "Gerencia de Abastecimiento", desc: "Ausencia de segregación de funciones entre creación de proveedor y aprobación de pago", compromiso: "Rediseño de roles en ERP separando alta de proveedor y aprobación", severidad: "Crítica", recurrente: true },
  { proceso: "Compras", area: "Gerencia de Abastecimiento", desc: "Pagos a proveedores fuera del plazo contractual de 30 días (32% del volumen mensual)", compromiso: "Implementar dashboard de seguimiento de DPO + alerta a Tesorería", severidad: "Media" },
  { proceso: "Compras", area: "Gerencia de Abastecimiento", desc: "Facturas registradas sin OC previa exceden tolerancia política (>10 por trimestre)", compromiso: "Bloqueo automático en SAP de facturas sin referencia a OC", severidad: "Media" },
  { proceso: "Compras", area: "Gerencia de Abastecimiento", desc: "Concentración de aprobación de proveedor crítico en un único usuario (>85% del valor)", compromiso: "Implementar segundo revisor obligatorio para proveedores top-10", severidad: "Alta" },

  // ─── NÓMINA / RRHH
  { proceso: "Nómina", area: "Gerencia de Personas", desc: "Cuentas bancarias compartidas entre empleados sin justificación documentada", compromiso: "Validación periódica del maestro de personal con confirmación bancaria", severidad: "Alta" },
  { proceso: "Nómina", area: "Gerencia de Personas", desc: "Sueldos asignados fuera de la banda salarial definida para el cargo (>2x promedio)", compromiso: "Validar excepciones con Comité de Compensaciones, formalizar por escrito", severidad: "Alta" },
  { proceso: "Nómina", area: "Gerencia de Personas", desc: "Liquidaciones procesadas sin doble validación entre RRHH y Finanzas", compromiso: "Control compensatorio + revisión muestral mensual por Finanzas", severidad: "Media" },
  { proceso: "Nómina", area: "Gerencia de Personas", desc: "Horas extra registradas sin aprobación del supervisor (12% del total)", compromiso: "Implementar flujo de aprobación previa en sistema de marcaje", severidad: "Media" },
  { proceso: "Nómina", area: "Gerencia de Personas", desc: "Bonos discrecionales sin política formal de asignación documentada", compromiso: "Política formal aprobada por Comité de Compensaciones + criterios objetivos", severidad: "Media", recurrente: true },

  // ─── TI / ACCESOS (foco crítico, donde está la mayor reincidencia)
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Cuentas de usuario activas pertenecientes a ex-empleados", compromiso: "Implementar proceso automatizado de baja en sistemas con SLA de 24h post-desvinculación", severidad: "Crítica", recurrente: true },
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Usuarios con accesos de superadministrador sin revisión periódica", compromiso: "Revisión trimestral con dueño de aplicación + bitácora de aprobación", severidad: "Crítica", recurrente: true },
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Ausencia de plan formal de continuidad operacional para sistemas críticos", compromiso: "Diseñar y probar plan BCP/DRP para sistemas tier-1 (SAP, CRM, Tesorería)", severidad: "Crítica" },
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Política de contraseñas no cumple estándares (longitud, complejidad, rotación)", compromiso: "Endurecer política en Active Directory + comunicación a usuarios", severidad: "Alta", recurrente: true },
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Logs de aplicaciones críticas no centralizados ni monitoreados", compromiso: "Implementar SIEM con monitoreo 24/7 sobre eventos críticos", severidad: "Alta" },
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Falta de segregación de ambientes (desarrollo, QA, producción)", compromiso: "Separación de redes + restricción de credenciales por ambiente", severidad: "Alta", recurrente: true },
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Cambios en producción sin trazabilidad ni rollback documentado", compromiso: "Implementar gestión de cambios formal con CAB + ventanas de mantenimiento", severidad: "Alta", recurrente: true },
  { proceso: "TI", area: "Gerencia de Tecnología", desc: "Ausencia de pruebas de penetración en aplicaciones expuestas", compromiso: "Contratar pentest anual + remediación de hallazgos críticos", severidad: "Alta" },

  // ─── TESORERÍA
  { proceso: "Tesorería", area: "Gerencia de Finanzas", desc: "Conciliaciones bancarias con diferencias sin investigar por más de 60 días", compromiso: "Política de cierre mensual con diferencias resueltas o escaladas en 30 días", severidad: "Alta", recurrente: true },
  { proceso: "Tesorería", area: "Gerencia de Finanzas", desc: "Firmas autorizadas en cuentas bancarias incluyen personas ya desvinculadas", compromiso: "Revisión trimestral de poderes vigentes + actualización inmediata por egresos", severidad: "Crítica" },
  { proceso: "Tesorería", area: "Gerencia de Finanzas", desc: "Pagos manuales fuera del sistema sin doble validación", compromiso: "Eliminar pagos manuales o establecer doble firma obligatoria", severidad: "Alta" },
  { proceso: "Tesorería", area: "Gerencia de Finanzas", desc: "Saldos en cuentas inactivas sin gestión activa (CLP 280M en 6 cuentas)", compromiso: "Cierre de cuentas inactivas + consolidación en cuentas operativas", severidad: "Media" },

  // ─── INVENTARIOS
  { proceso: "Inventarios", area: "Gerencia de Operaciones", desc: "Diferencias entre inventario físico y sistema superiores al 3% sin investigar", compromiso: "Conteos cíclicos mensuales + investigación obligatoria de diferencias >1%", severidad: "Alta", recurrente: true },
  { proceso: "Inventarios", area: "Gerencia de Operaciones", desc: "Stock obsoleto sin provisión contable adecuada (CLP 420M sin movimiento >12 meses)", compromiso: "Política de provisión por antigüedad + revisión semestral por Contabilidad", severidad: "Media" },
  { proceso: "Inventarios", area: "Gerencia de Operaciones", desc: "Accesos a bodegas sin trazabilidad de quién retira material", compromiso: "Implementar control de acceso con bitácora + cierre fuera de horario", severidad: "Media" },
  { proceso: "Inventarios", area: "Gerencia de Operaciones", desc: "Ajustes de inventario de repuestos y equipos de flota sin aprobación documentada del jefe de área", compromiso: "Formato de autorización obligatorio para ajustes >CLP 500K", severidad: "Media" },

  // ─── CONTABILIDAD / CIERRE
  { proceso: "Contabilidad", area: "Gerencia de Finanzas", desc: "Asientos manuales de cierre sin revisión independiente del preparador", compromiso: "Política de four-eyes review obligatoria para asientos >CLP 10M", severidad: "Alta" },
  { proceso: "Contabilidad", area: "Gerencia de Finanzas", desc: "Cuentas puente con saldos sin depurar al cierre mensual", compromiso: "Cierre mensual con saldos en cero en cuentas puente o explicación documentada", severidad: "Media", recurrente: true },
  { proceso: "Contabilidad", area: "Gerencia de Finanzas", desc: "Conciliaciones de cuentas patrimoniales con vencimiento >30 días", compromiso: "Reagendar calendario de cierre + escalamiento a CFO si supera plazo", severidad: "Media" },

  // ─── CUMPLIMIENTO / TRIBUTARIO
  { proceso: "Cumplimiento", area: "Gerencia Legal", desc: "Modelo de prevención del delito (Ley 20.393) sin actualizar tras Ley 21.595", compromiso: "Actualización del modelo + capacitación a fuerza laboral + certificación", severidad: "Crítica" },
  { proceso: "Cumplimiento", area: "Gerencia Legal", desc: "Política anticorrupción sin proceso formal de due diligence a contrapartes", compromiso: "Implementar herramienta de DD a proveedores + clientes ≥CLP 50M anuales", severidad: "Alta" },
  { proceso: "Tributario", area: "Gerencia de Finanzas", desc: "Diferencias entre declaraciones de IVA y registros contables sin conciliar", compromiso: "Conciliación mensual obligatoria + revisión por contador firmado", severidad: "Alta" },
];

// ─────────────────────────────────────────────────────────────────────
// PERSONAS RESPONSABLES (con sus cargas)
// ─────────────────────────────────────────────────────────────────────

const RESPONSABLES = [
  { nombre: "Carlos Robles", area: "Gerencia de Tecnología", sobrecargado: true },
  { nombre: "María Espinoza", area: "Gerencia de Tecnología", sobrecargado: false },
  { nombre: "Patricia Soto", area: "Gerencia de Abastecimiento", sobrecargado: false },
  { nombre: "Rodrigo Vargas", area: "Gerencia de Abastecimiento", sobrecargado: false },
  { nombre: "Andrea Pino", area: "Gerencia de Personas", sobrecargado: false },
  { nombre: "Felipe Henríquez", area: "Gerencia de Finanzas", sobrecargado: false },
  { nombre: "Carolina Bravo", area: "Gerencia de Finanzas", sobrecargado: false },
  { nombre: "Luis Torres", area: "Gerencia de Operaciones", sobrecargado: false },
  { nombre: "Soledad Olivares", area: "Gerencia Legal", sobrecargado: false },
  { nombre: "Javier Saavedra", area: "Gerencia de Tecnología", sobrecargado: false },
];

const respPorArea = (area: string) => {
  const opciones = RESPONSABLES.filter((r) => r.area === area);
  if (opciones.length === 0) return RESPONSABLES[0].nombre;
  return opciones[Math.floor(Math.random() * opciones.length)].nombre;
};

// ─────────────────────────────────────────────────────────────────────
// SEED DETERMINISTA
// ─────────────────────────────────────────────────────────────────────
let _seed = 7777;
const rng = () => {
  _seed = (_seed * 9301 + 49297) % 233280;
  return _seed / 233280;
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

// ─────────────────────────────────────────────────────────────────────
// GENERACIÓN DE HALLAZGOS
// ─────────────────────────────────────────────────────────────────────

export const hallazgos: Hallazgo[] = [];
let _idCounter = 1;

const makeId = (year: number) => `HAL-${year}-${String(_idCounter++).padStart(3, "0")}`;

// 2023: 38 hallazgos — casi todos cerrados
// 2024: 48 hallazgos — mayoría cerrados, algunos abiertos críticos
// 2025: 58 hallazgos — mix
// 2026 parcial: 38 hallazgos — mayoría abiertos / en proceso

type AnioConfig = {
  year: number;
  count: number;
  cerradoRate: number;       // % cerrados
  enProcesoRate: number;     // % en proceso
  abiertoRate: number;       // % abiertos
  noIniciadoRate: number;    // % no iniciados
};

const ANIOS: AnioConfig[] = [
  { year: 2023, count: 38, cerradoRate: 0.90, enProcesoRate: 0.05, abiertoRate: 0.04, noIniciadoRate: 0.01 },
  { year: 2024, count: 48, cerradoRate: 0.75, enProcesoRate: 0.12, abiertoRate: 0.11, noIniciadoRate: 0.02 },
  { year: 2025, count: 58, cerradoRate: 0.45, enProcesoRate: 0.28, abiertoRate: 0.22, noIniciadoRate: 0.05 },
  { year: 2026, count: 38, cerradoRate: 0.08, enProcesoRate: 0.42, abiertoRate: 0.40, noIniciadoRate: 0.10 },
];

const asignarEstado = (cfg: AnioConfig): Hallazgo["estado"] => {
  const r = rng();
  if (r < cfg.cerradoRate) return "Cerrado";
  if (r < cfg.cerradoRate + cfg.enProcesoRate) return "En proceso";
  if (r < cfg.cerradoRate + cfg.enProcesoRate + cfg.abiertoRate) return "Abierto";
  return "No iniciado";
};

const seleccionarPlantilla = (year: number): Plantilla => {
  // En 2025 y 2026 sesgamos hacia TI para forzar reincidencia visible
  if (year >= 2025 && rng() < 0.32) {
    const ti = CATALOGO.filter((c) => c.proceso === "TI");
    return pick(ti);
  }
  return pick(CATALOGO);
};

ANIOS.forEach((cfg) => {
  for (let i = 0; i < cfg.count; i++) {
    const plantilla = seleccionarPlantilla(cfg.year);
    const mes = (() => {
      const r = rng();
      if (r < 0.4) return Math.floor(rng() * 12);
      return Math.floor(8 + rng() * 4);
    })();
    const dia = 1 + Math.floor(rng() * 27);
    const fechaHallazgo = `${cfg.year}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    if (cfg.year === 2026 && new Date(fechaHallazgo) > HOY) continue;

    const estado = asignarEstado(cfg);
    const plazoCompromiso = plantilla.severidad === "Crítica" ? 60 : plantilla.severidad === "Alta" ? 90 : 180;
    // Para los abiertos recientes (2026): plazo mayor para que NO estén vencidos por defecto
    const plazoAjustado = cfg.year === 2026 && estado !== "Cerrado"
      ? plazoCompromiso + 60 + Math.floor(rng() * 90)
      : plazoCompromiso;
    const fechaCompromiso = addDays(fechaHallazgo, plazoAjustado);
    let fechaCierre: string | null = null;
    if (estado === "Cerrado") {
      const diasReales = plazoCompromiso + (rng() < 0.3 ? Math.floor(rng() * 60) : -Math.floor(rng() * 30));
      fechaCierre = addDays(fechaHallazgo, Math.max(15, diasReales));
    }

    hallazgos.push({
      id: makeId(cfg.year),
      fechaHallazgo,
      proceso: plantilla.proceso,
      area: plantilla.area,
      descripcion: plantilla.desc,
      severidad: plantilla.severidad,
      compromiso: plantilla.compromiso,
      responsable: respPorArea(plantilla.area),
      fechaCompromiso,
      estado,
      fechaCierre,
      origenAuditoria: `Auditoría ${plantilla.proceso} FY${String(cfg.year).slice(-2)}`,
      esReiterado: false,
      hallazgoOrigenId: null,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// PATRONES PLANTADOS — sobrescribir algunos hallazgos para forzar lecciones
// ─────────────────────────────────────────────────────────────────────

// 🚨 PATRÓN 1: Hallazgo crítico de TI reiterado en 2023, 2024, 2025
// "Cuentas de usuario activas pertenecientes a ex-empleados"
const desReiterado1 = "Cuentas de usuario activas pertenecientes a ex-empleados";
const reiterados1: Hallazgo[] = [
  {
    id: "HAL-2023-005",
    fechaHallazgo: "2023-04-12",
    proceso: "TI",
    area: "Gerencia de Tecnología",
    descripcion: desReiterado1,
    severidad: "Crítica",
    compromiso: "Implementar proceso automatizado de baja en sistemas con SLA de 24h",
    responsable: "Carlos Robles",
    fechaCompromiso: "2023-06-11",
    estado: "Cerrado",
    fechaCierre: "2023-08-22",
    origenAuditoria: "Auditoría Accesos TI FY23",
    esReiterado: false,
    hallazgoOrigenId: null,
  },
  {
    id: "HAL-2024-018",
    fechaHallazgo: "2024-05-08",
    proceso: "TI",
    area: "Gerencia de Tecnología",
    descripcion: desReiterado1 + " (REITERADO de HAL-2023-005)",
    severidad: "Crítica",
    compromiso: "Reforzar proceso anterior, integrar con sistema de RRHH para baja automática",
    responsable: "Carlos Robles",
    fechaCompromiso: "2024-07-07",
    estado: "Cerrado",
    fechaCierre: "2024-11-15",
    origenAuditoria: "Auditoría Accesos TI FY24",
    esReiterado: true,
    hallazgoOrigenId: "HAL-2023-005",
  },
  {
    id: "HAL-2025-022",
    fechaHallazgo: "2025-06-03",
    proceso: "TI",
    area: "Gerencia de Tecnología",
    descripcion: desReiterado1 + " (REITERADO de HAL-2024-018)",
    severidad: "Crítica",
    compromiso: "Tercera vuelta: requerimiento formal a Gerencia General de integración HR-IT",
    responsable: "Carlos Robles",
    fechaCompromiso: "2025-08-02",
    estado: "Abierto",
    fechaCierre: null,
    origenAuditoria: "Auditoría Accesos TI FY25",
    esReiterado: true,
    hallazgoOrigenId: "HAL-2024-018",
  },
];

// 🚨 PATRÓN 2: Hallazgo crítico abierto desde 2024 (>18 meses sin cierre)
const planContinuidad: Hallazgo = {
  id: "HAL-2024-007",
  fechaHallazgo: "2024-02-14",
  proceso: "TI",
  area: "Gerencia de Tecnología",
  descripcion: "Ausencia de plan formal de continuidad operacional para sistemas críticos",
  severidad: "Crítica",
  compromiso: "Diseñar y probar plan BCP/DRP para sistemas tier-1 (SAP, CRM, Tesorería)",
  responsable: "Carlos Robles",
  fechaCompromiso: "2024-08-12",
  estado: "En proceso",
  fechaCierre: null,
  origenAuditoria: "Auditoría TI FY24",
  esReiterado: false,
  hallazgoOrigenId: null,
};

// 🚨 PATRÓN 3: Reiteración en Compras — segregación de funciones (3 años)
const desReiterado3 = "Ausencia de segregación de funciones entre creación de proveedor y aprobación de pago";
const reiterados3: Hallazgo[] = [
  {
    id: "HAL-2023-014",
    fechaHallazgo: "2023-09-20",
    proceso: "Compras",
    area: "Gerencia de Abastecimiento",
    descripcion: desReiterado3,
    severidad: "Crítica",
    compromiso: "Rediseño de roles en ERP separando alta de proveedor y aprobación",
    responsable: "Patricia Soto",
    fechaCompromiso: "2023-12-19",
    estado: "Cerrado",
    fechaCierre: "2024-02-28",
    origenAuditoria: "Auditoría P2P FY23",
    esReiterado: false,
    hallazgoOrigenId: null,
  },
  {
    id: "HAL-2024-029",
    fechaHallazgo: "2024-08-15",
    proceso: "Compras",
    area: "Gerencia de Abastecimiento",
    descripcion: desReiterado3 + " (REITERADO de HAL-2023-014)",
    severidad: "Crítica",
    compromiso: "Validar implementación previa + agregar control compensatorio mientras",
    responsable: "Patricia Soto",
    fechaCompromiso: "2024-11-13",
    estado: "En proceso",
    fechaCierre: null,
    origenAuditoria: "Auditoría P2P FY24",
    esReiterado: true,
    hallazgoOrigenId: "HAL-2023-014",
  },
];

// 🚨 PATRÓN 4: Reiteración en Tesorería — conciliaciones bancarias (2 años)
const desReiterado4 = "Conciliaciones bancarias con diferencias sin investigar por más de 60 días";
const reiterados4: Hallazgo[] = [
  {
    id: "HAL-2024-035",
    fechaHallazgo: "2024-10-11",
    proceso: "Tesorería",
    area: "Gerencia de Finanzas",
    descripcion: desReiterado4,
    severidad: "Alta",
    compromiso: "Política de cierre mensual con diferencias resueltas o escaladas en 30 días",
    responsable: "Felipe Henríquez",
    fechaCompromiso: "2025-01-09",
    estado: "Cerrado",
    fechaCierre: "2025-03-20",
    origenAuditoria: "Auditoría Tesorería FY24",
    esReiterado: false,
    hallazgoOrigenId: null,
  },
  {
    id: "HAL-2025-041",
    fechaHallazgo: "2025-11-18",
    proceso: "Tesorería",
    area: "Gerencia de Finanzas",
    descripcion: desReiterado4 + " (REITERADO de HAL-2024-035)",
    severidad: "Alta",
    compromiso: "Reforzar implementación + revisión semanal por gerente de tesorería",
    responsable: "Felipe Henríquez",
    fechaCompromiso: "2026-02-16",
    estado: "Abierto",
    fechaCierre: null,
    origenAuditoria: "Auditoría Tesorería FY25",
    esReiterado: true,
    hallazgoOrigenId: "HAL-2024-035",
  },
];

// 🚨 PATRÓN 5: Modelo de prevención del delito (urgente por Ley 21.595)
const compliance21595: Hallazgo = {
  id: "HAL-2026-008",
  fechaHallazgo: "2026-02-20",
  proceso: "Cumplimiento",
  area: "Gerencia Legal",
  descripcion: "Modelo de prevención del delito (Ley 20.393) sin actualizar tras Ley 21.595 — vencimiento normativo 01-Sep-2026",
  severidad: "Crítica",
  compromiso: "Actualización del modelo + capacitación a fuerza laboral + certificación antes 31-Ago-2026",
  responsable: "Soledad Olivares",
  fechaCompromiso: "2026-08-31",
  estado: "En proceso",
  fechaCierre: null,
  origenAuditoria: "Revisión normativa FY26",
  esReiterado: false,
  hallazgoOrigenId: null,
};

// 🚨 PATRÓN 6: Sobrecarga del responsable Carlos Robles (Gerente TI)
// Generamos varios hallazgos abiertos asignados a él
const sobrecargaCarlos: Hallazgo[] = [
  {
    id: "HAL-2025-049",
    fechaHallazgo: "2025-12-04",
    proceso: "TI",
    area: "Gerencia de Tecnología",
    descripcion: "Usuarios con accesos de superadministrador sin revisión periódica",
    severidad: "Crítica",
    compromiso: "Revisión trimestral con dueño de aplicación + bitácora",
    responsable: "Carlos Robles",
    fechaCompromiso: "2026-02-02",
    estado: "Abierto",
    fechaCierre: null,
    origenAuditoria: "Auditoría Accesos TI FY25",
    esReiterado: false,
    hallazgoOrigenId: null,
  },
  {
    id: "HAL-2026-012",
    fechaHallazgo: "2026-03-08",
    proceso: "TI",
    area: "Gerencia de Tecnología",
    descripcion: "Logs de aplicaciones críticas no centralizados ni monitoreados",
    severidad: "Alta",
    compromiso: "Implementar SIEM con monitoreo 24/7 sobre eventos críticos",
    responsable: "Carlos Robles",
    fechaCompromiso: "2026-06-06",
    estado: "En proceso",
    fechaCierre: null,
    origenAuditoria: "Auditoría TI FY26",
    esReiterado: false,
    hallazgoOrigenId: null,
  },
  {
    id: "HAL-2026-019",
    fechaHallazgo: "2026-04-02",
    proceso: "TI",
    area: "Gerencia de Tecnología",
    descripcion: "Cambios en producción sin trazabilidad ni rollback documentado",
    severidad: "Alta",
    compromiso: "Implementar gestión de cambios formal con CAB + ventanas de mantenimiento",
    responsable: "Carlos Robles",
    fechaCompromiso: "2026-07-01",
    estado: "Abierto",
    fechaCierre: null,
    origenAuditoria: "Auditoría TI FY26",
    esReiterado: false,
    hallazgoOrigenId: null,
  },
];

// Inyectar todos los plantados al inicio de la lista para que aparezcan
hallazgos.push(...reiterados1, planContinuidad, ...reiterados3, ...reiterados4, compliance21595, ...sobrecargaCarlos);

// Ordenar por fecha (descendente para que los recientes salgan primero)
hallazgos.sort((a, b) => new Date(b.fechaHallazgo).getTime() - new Date(a.fechaHallazgo).getTime());

// ─────────────────────────────────────────────────────────────────────
// MÉTRICAS DERIVADAS
// ─────────────────────────────────────────────────────────────────────

export const computeMetricasSeguimiento = () => {
  const total = hallazgos.length;
  const abiertos = hallazgos.filter((h) => h.estado === "Abierto" || h.estado === "En proceso" || h.estado === "No iniciado");
  const cerrados = hallazgos.filter((h) => h.estado === "Cerrado");

  // Vencidos: estado no cerrado y fecha compromiso < hoy
  const vencidos = abiertos.filter((h) => new Date(h.fechaCompromiso) < HOY);

  // Por severidad (de los abiertos)
  const criticosAbiertos = abiertos.filter((h) => h.severidad === "Crítica");
  const altosAbiertos = abiertos.filter((h) => h.severidad === "Alta");

  // Por proceso
  const porProceso: Record<string, { total: number; abiertos: number; cerrados: number; vencidos: number }> = {};
  hallazgos.forEach((h) => {
    if (!porProceso[h.proceso]) porProceso[h.proceso] = { total: 0, abiertos: 0, cerrados: 0, vencidos: 0 };
    porProceso[h.proceso].total++;
    if (h.estado === "Cerrado") porProceso[h.proceso].cerrados++;
    else {
      porProceso[h.proceso].abiertos++;
      if (new Date(h.fechaCompromiso) < HOY) porProceso[h.proceso].vencidos++;
    }
  });

  // Por área (cumplimiento)
  const porArea: Record<string, { total: number; cerrados: number; vencidos: number; cumplimientoPct: number }> = {};
  hallazgos.forEach((h) => {
    if (!porArea[h.area]) porArea[h.area] = { total: 0, cerrados: 0, vencidos: 0, cumplimientoPct: 0 };
    porArea[h.area].total++;
    if (h.estado === "Cerrado") porArea[h.area].cerrados++;
    else if (new Date(h.fechaCompromiso) < HOY) porArea[h.area].vencidos++;
  });
  Object.keys(porArea).forEach((a) => {
    const x = porArea[a];
    x.cumplimientoPct = Math.round((x.cerrados / x.total) * 100);
  });

  // Por año
  const porAnio: Record<string, { total: number; criticos: number; altos: number; medios: number; bajos: number }> = {};
  hallazgos.forEach((h) => {
    const y = h.fechaHallazgo.slice(0, 4);
    if (!porAnio[y]) porAnio[y] = { total: 0, criticos: 0, altos: 0, medios: 0, bajos: 0 };
    porAnio[y].total++;
    if (h.severidad === "Crítica") porAnio[y].criticos++;
    else if (h.severidad === "Alta") porAnio[y].altos++;
    else if (h.severidad === "Media") porAnio[y].medios++;
    else porAnio[y].bajos++;
  });

  // Reiterados
  const reiterados = hallazgos.filter((h) => h.esReiterado);

  // Por responsable (carga)
  const porResponsable: Record<string, number> = {};
  abiertos.forEach((h) => {
    porResponsable[h.responsable] = (porResponsable[h.responsable] || 0) + 1;
  });
  const responsablesSobrecargados = Object.entries(porResponsable)
    .filter(([_, n]) => n >= 8)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, count]) => ({ nombre, compromisosAbiertos: count }));

  // Críticos antiguos abiertos (>180 días sin cerrar)
  const criticosAntiguos = criticosAbiertos
    .filter((h) => diasEntre(h.fechaHallazgo, HOY.toISOString().slice(0, 10)) > 180)
    .map((h) => ({
      id: h.id,
      descripcion: h.descripcion,
      proceso: h.proceso,
      responsable: h.responsable,
      diasAbierto: diasEntre(h.fechaHallazgo, HOY.toISOString().slice(0, 10)),
      fechaCompromiso: h.fechaCompromiso,
      estado: h.estado,
    }));

  return {
    resumen: {
      total,
      abiertos: abiertos.length,
      cerrados: cerrados.length,
      vencidos: vencidos.length,
      pctVencidos: Math.round((vencidos.length / abiertos.length) * 100),
      criticosAbiertos: criticosAbiertos.length,
      altosAbiertos: altosAbiertos.length,
      reiterados: reiterados.length,
      pctReiterados: Math.round((reiterados.length / total) * 100),
    },
    porProceso,
    porArea,
    porAnio,
    criticosAntiguos,
    responsablesSobrecargados,
    reiteradosDetalle: reiterados.map((h) => ({
      id: h.id, descripcion: h.descripcion, proceso: h.proceso,
      area: h.area, severidad: h.severidad, estado: h.estado,
      hallazgoOrigenId: h.hallazgoOrigenId,
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────
// CONTEXTO PARA AUDITIA
// ─────────────────────────────────────────────────────────────────────

export const buildSeguimientoContext = () => {
  const m = computeMetricasSeguimiento();
  return {
    descripcion: `Planilla de seguimiento de hallazgos — ${getPackActivo().cliente} — Histórico FY23 a FY26 (parcial)`,
    notaContextual: "Esta es la 'planilla viva' de auditoría interna. Es el KPI principal con que el directorio mide al gerente de auditoría: cuántos hallazgos siguen abiertos, cuántos están vencidos, cuántos se reiteran. AuditIA tiene visibilidad sobre los 4 años completos.",
    universo: m.resumen,
    porProceso: m.porProceso,
    porAreaCumplimiento: m.porArea,
    tendenciaAnual: m.porAnio,
    hallazgosCriticosAntiguos: m.criticosAntiguos,
    responsablesSobrecargados: m.responsablesSobrecargados,
    hallazgosReiterados: m.reiteradosDetalle,
    notaImportante: "El análisis tradicional de planilla requiere días de trabajo manual con tablas dinámicas. AuditIA hace este análisis completo sobre el 100% del histórico en segundos.",
  };
};
