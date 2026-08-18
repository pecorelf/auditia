import { getPackActivo } from "../packs";
// Espacio 2 — Audit Hub data. Foco: indicadores de control y riesgo,
// no rentabilidad. La empresa la define el pack de industria activo.

export type KPI = {
  id: string;
  label: string;
  value: string;
  delta: number; // % change vs período anterior
  deltaIsPositive: boolean; // un menor valor puede ser "positivo" según el KPI
  detail: string;
  unit?: string;
};

export const kpisHero: KPI[] = [
  {
    id: "match3",
    label: "3-way match completo",
    value: "82,4%",
    delta: 3.1,
    deltaIsPositive: true,
    detail: "OC ↔ Recepción ↔ Factura coincidentes (objetivo: 95%)",
  },
  {
    id: "excepciones",
    label: "Excepciones de control",
    value: "147",
    delta: -8.6,
    deltaIsPositive: true,
    detail: "Mes actual vs mes anterior",
  },
  {
    id: "dso",
    label: "Días pago vs término",
    value: "+4,2",
    delta: 1.3,
    deltaIsPositive: false,
    detail: "Días promedio sobre el término contractual",
  },
  {
    id: "concProv",
    label: "Concentración top-10 proveedores",
    value: "38,7%",
    delta: 2.4,
    deltaIsPositive: false,
    detail: "Riesgo de dependencia. Objetivo: < 35%",
  },
  {
    id: "agingAR",
    label: "Cuentas por cobrar > 90 días",
    value: "11,9%",
    delta: -1.8,
    deltaIsPositive: true,
    detail: "Sobre saldo total. Objetivo: < 10%",
  },
  {
    id: "incidCyber",
    label: "Incidentes Ciber relevantes",
    value: "3",
    delta: 0,
    deltaIsPositive: true,
    detail: "Trimestre en curso. Ninguno crítico.",
  },
];

// Serie de excepciones P2P por mes
export const excepcionesMes = [
  { mes: "Dic-25", total: 198, criticas: 12, altas: 41, medias: 89, bajas: 56 },
  { mes: "Ene-26", total: 211, criticas: 14, altas: 38, medias: 96, bajas: 63 },
  { mes: "Feb-26", total: 187, criticas: 9,  altas: 35, medias: 81, bajas: 62 },
  { mes: "Mar-26", total: 173, criticas: 8,  altas: 32, medias: 74, bajas: 59 },
  { mes: "Abr-26", total: 161, criticas: 7,  altas: 28, medias: 71, bajas: 55 },
  { mes: "May-26", total: 147, criticas: 6,  altas: 24, medias: 68, bajas: 49 },
];

// Distribución de hallazgos por categoría
export const hallazgosCategoria = [
  { categoria: "Sin OC previa", valor: 47, severidad: "high" },
  { categoria: "Aprobación fuera de matriz", valor: 32, severidad: "high" },
  { categoria: "Documento incompleto", valor: 28, severidad: "med" },
  { categoria: "Inconsistencia de monto", valor: 21, severidad: "med" },
  { categoria: "Vendor data mismatch", valor: 12, severidad: "high" },
  { categoria: "Aging excedido", valor: 7, severidad: "low" },
];

// Concentración por proveedor (top 10)
export const concentracionProv = [
  { proveedor: "Distribuidora El Roble", participacion: 8.4 },
  { proveedor: "Maquinarias Industriales", participacion: 5.9 },
  { proveedor: "Servicios Logísticos Aconcagua", participacion: 4.7 },
  { proveedor: "Embalajes Premium", participacion: 4.1 },
  { proveedor: "Transportes Cordillera", participacion: 3.6 },
  { proveedor: "Insumos Químicos Andes", participacion: 3.2 },
  { proveedor: "Soluciones IT GlobalTech", participacion: 2.8 },
  { proveedor: "Combustibles del Norte", participacion: 2.4 },
  { proveedor: "Servicios Vigilancia Centinela", participacion: 1.9 },
  { proveedor: "Resto (40+)", participacion: 62.0 },
];

// Aging de CxC
export const agingCxC = [
  { rango: "0-30 días", valor: 4_280, riesgo: "low" },
  { rango: "31-60 días", valor: 1_640, riesgo: "low" },
  { rango: "61-90 días", valor: 720, riesgo: "med" },
  { rango: "91-180 días", valor: 540, riesgo: "med" },
  { rango: "> 180 días", valor: 380, riesgo: "high" },
];

// Vistas del simulador
export type SimVariable = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
};

export const simVariables: SimVariable[] = [
  { id: "rotacionCompras", label: "Rotación área Compras", min: 0, max: 50, step: 1, default: 12, unit: "%/año" },
  { id: "automatMatching", label: "Automatización 3-way matching", min: 0, max: 100, step: 5, default: 60, unit: "%" },
  { id: "umbralAprob", label: "Umbral aprobación gerencial", min: 1_000_000, max: 20_000_000, step: 500_000, default: 5_000_000, unit: "CLP" },
  { id: "firmaDigital", label: "Cobertura firma digital", min: 0, max: 100, step: 5, default: 35, unit: "%" },
];

// Calcula índice de riesgo operacional sintético basado en variables
export const computeRiskScore = (vals: Record<string, number>): number => {
  const rotacion = vals.rotacionCompras ?? 12;
  const automat = vals.automatMatching ?? 60;
  const umbral = vals.umbralAprob ?? 5_000_000;
  const firma = vals.firmaDigital ?? 35;
  // Modelo sintético: más rotación + menos automatización + umbrales muy altos + poca firma digital = más riesgo
  const score =
    (rotacion / 50) * 30 +
    ((100 - automat) / 100) * 30 +
    ((umbral - 1_000_000) / 19_000_000) * 15 +
    ((100 - firma) / 100) * 25;
  return Math.max(0, Math.min(100, score));
};

// Áreas auditables y su nivel de cobertura
export const coberturaAreas = [
  { area: "Procure-to-Pay", cobertura: 92, riesgo: "med" },
  { area: "Order-to-Cash", cobertura: 78, riesgo: "high" },
  { area: "Nómina y RRHH", cobertura: 84, riesgo: "med" },
  { area: "Tesorería", cobertura: 96, riesgo: "low" },
  { area: "TI & Ciberseguridad", cobertura: 61, riesgo: "high" },
  { area: "Inventarios", cobertura: 73, riesgo: "med" },
  { area: "Compliance Tributario", cobertura: 88, riesgo: "low" },
  { area: "Sostenibilidad", cobertura: 42, riesgo: "high" },
];

// Resumen para inyectar al system prompt de AuditIA (Espacio 2)
export const buildHubContext = () => ({
  empresa: getPackActivo().cliente,
  periodo: "FY 2025-26 (cierre May 2026)",
  kpisHero,
  excepcionesMes,
  hallazgosCategoria,
  concentracionProv,
  agingCxC,
  coberturaAreas,
});
