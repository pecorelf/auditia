// Procesos Críticos de Tesorería — los tres de criticidad muy alta del mapa:
//   1. Recaudación de ingresos fiscales
//   2. Cobranza administrativa y judicial
//   3. Custodia y administración de fondos del Tesoro Público
//
// El valor de cruzarlos: por separado cada proceso entrega hallazgos correctos
// pero incompletos. Cruzados aparece la CADENA — un pago se recauda en la red
// bancaria y queda registrado, la conciliación no cuadra y el monto nunca
// ingresa a la cuenta del Tesoro, y aun así se cierra la cobranza y se alza el
// embargo. El dinero desaparece entre las junturas de los tres procesos.
//
// TODOS LOS DATOS SON SINTÉTICOS. Ningún RUT, nombre o folio corresponde a una
// persona o expediente real.
//
// HALLAZGOS PLANTADOS (15):
//   RECAUDACIÓN
//     REC-01 Pagos recaudados en banco sin registro en el sistema (crítico)
//     REC-02 Diferencias de conciliación sin resolver más de 30 días (crítico)
//     REC-03 Lotes informados por el banco que nunca ingresaron (alto)
//     REC-04 Reversas de pago sin respaldo documentado (alto)
//     REC-05 Devoluciones duplicadas al mismo contribuyente (medio)
//   COBRANZA
//     COB-01 Deudas prescritas sin gestión registrada (crítico)
//     COB-02 Deudas que prescriben dentro de 90 días sin gestión (alto)
//     COB-03 Condonaciones sobre la facultad del funcionario (crítico)
//     COB-04 Embargos alzados sin pago íntegro registrado (crítico)
//     COB-05 Cobros a contribuyentes con deuda ya extinguida (alto)
//     COB-06 Juicios con plazo procesal vencido (medio)
//   CUSTODIA
//     CUS-01 Egresos fuera de la matriz de facultades (crítico)
//     CUS-02 Traspasos entre cuentas sin segunda firma (crítico)
//     CUS-03 Accesos vigentes de funcionarios desvinculados (alto)
//     CUS-04 Descuadre entre saldo contable y bancario (alto)
//   CRUCE DE LOS TRES
//     TGR-00 Cadena recaudación → custodia → cobranza (crítico)

// ─────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────

export type Contribuyente = {
  id: string;
  rut: string;
  nombre: string;
  tipo: "Persona natural" | "Persona jurídica";
  region: string;
};

export type Funcionario = {
  id: string;
  nombre: string;
  cargo: string;
  unidad: string;
  tesoreria: string;
  /** Tope de condonación que puede autorizar, en CLP. */
  facultadCondonacionCLP: number;
  /** Tope de egreso que puede autorizar, en CLP. */
  facultadEgresoCLP: number;
  estado: "Activo" | "Desvinculado";
  fechaDesvinculacion: string | null;
};

export type LoteRecaudacion = {
  id: string;
  banco: string;
  fecha: string;
  pagosInformados: number;
  montoInformadoCLP: number;
  montoIngresadoCLP: number;
  estado: "Conciliado" | "Con diferencia" | "No ingresado";
  diasSinResolver: number;
};

export type PagoRecaudado = {
  id: string;
  contribuyenteId: string;
  concepto: string;
  montoCLP: number;
  fechaPago: string;
  banco: string;
  canal: "Banco en línea" | "Caja bancaria" | "Portal TGR" | "Convenio institucional";
  loteId: string;
  /** El pago llegó al sistema de ingresos de la Tesorería. */
  registradoEnSistema: boolean;
  /** El pago cuadró contra la cartola bancaria. */
  conciliado: boolean;
  reversado: boolean;
  reversaConRespaldo: boolean;
  registradoPor: string | null;
};

export type Deuda = {
  id: string;
  contribuyenteId: string;
  concepto: string;
  montoOriginalCLP: number;
  interesesCLP: number;
  multasCLP: number;
  condonacionCLP: number;
  condonadaPor: string | null;
  fechaExigibilidad: string;
  /** Plazo legal de prescripción asociado al folio. */
  fechaPrescripcion: string;
  etapa: "Cobranza administrativa" | "Cobranza judicial" | "Pagada" | "Extinguida";
  conEmbargo: boolean;
  fechaAlzamiento: string | null;
  alzadoPor: string | null;
  montoPagadoCLP: number;
  ultimaGestion: string | null;
  plazoProcesalVence: string | null;
};

export type MovimientoTesoro = {
  id: string;
  cuenta: string;
  tipo: "Ingreso" | "Egreso" | "Traspaso";
  glosa: string;
  montoCLP: number;
  fecha: string;
  autorizadoPor: string;
  segundaFirma: string | null;
  saldoContableCLP: number;
  saldoBancarioCLP: number;
};

export type AccesoSistema = {
  id: string;
  funcionarioId: string;
  sistema: string;
  perfil: string;
  vigente: boolean;
  ultimoAcceso: string;
};

// ─────────────────────────────────────────────────────────────────────
// FECHAS — ancladas a la fecha de ejecución, no literales
// ─────────────────────────────────────────────────────────────────────
const HOY = new Date();
const iso = (d: Date) => d.toISOString().split("T")[0];
const masDias = (base: Date | string, d: number) =>
  iso(new Date((typeof base === "string" ? new Date(base) : base).getTime() + d * 86400000));
const diasEntre = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

/** Ventana de análisis: los últimos 180 días hasta hoy. */
const INICIO = masDias(HOY, -180);
export const PERIODO = `${INICIO} a ${iso(HOY)}`;

// ─────────────────────────────────────────────────────────────────────
// SEED DETERMINISTA
// ─────────────────────────────────────────────────────────────────────
let _seed = 20261008;
const rng = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };
const pick = <T,>(a: T[]): T => a[Math.floor(rng() * a.length)];
const entre = (a: number, b: number) => Math.floor(a + rng() * (b - a));

const randomRUT = () => {
  const n = 5_000_000 + Math.floor(rng() * 20_000_000);
  const s = n.toString();
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}-${pick(["0","1","2","3","4","5","6","7","8","9","K"])}`;
};

// ─────────────────────────────────────────────────────────────────────
// POOLS
// ─────────────────────────────────────────────────────────────────────
const NOMBRES = ["María","Pedro","Andrea","Javier","Carolina","Rodrigo","Patricia","Felipe","Soledad","Luis","Constanza","Marcelo","Cristián","Daniela","Eduardo","Francisca","Gonzalo","Loreto","Mauricio","Pamela","Sebastián","Tamara","Víctor","Ximena","Bárbara","César","Diego","Elisa","Fabián","Gabriela","Héctor","Ivonne","Joaquín","Karla","Lautaro","Macarena","Néstor","Olga","Pablo","Raquel","Sergio","Valeria","Nicolás","Paulina","Hernán","Marta"];
const APELLIDOS = ["González","Soto","Vargas","Muñoz","Pino","Aravena","Reyes","Cárdenas","Vega","Henríquez","Bravo","Torres","Espinoza","Olivares","Saavedra","Lillo","Rojas","Pizarro","Maldonado","Salinas","Cisternas","Quintana","Hidalgo","Lagos","Toledo","Núñez","Vidal","Mora","Aguilar","Pacheco","Mancilla","Cifuentes","Ojeda","Mardones","Iturra","Tobar","Fuentes","Contreras","Araya","Herrera"];
const GIROS = ["Comercializadora","Constructora","Servicios","Transportes","Inversiones","Importadora","Asesorías","Distribuidora","Agrícola","Inmobiliaria","Logística","Ingeniería"];
const SUFIJOS = ["SpA","Ltda","S.A."];

const REGIONES = ["Metropolitana","Valparaíso","Biobío","Maule","O'Higgins","Araucanía","Antofagasta","Los Lagos","Coquimbo","Tarapacá","Atacama","Ñuble","Los Ríos","Arica y Parinacota","Magallanes","Aysén"];

const TESORERIAS = [
  "Tesorería Regional Metropolitana", "Tesorería Regional Valparaíso",
  "Tesorería Regional Biobío", "Tesorería Regional Antofagasta",
  "Tesorería Regional Araucanía", "Tesorería General",
];

const UNIDADES = [
  "Recaudación", "Cobranza Administrativa", "Cobranza Judicial",
  "Operaciones de Tesorería", "Conciliación Bancaria", "Contabilidad Fiscal",
  "Fiscalía", "Tecnología", "Control Interno",
];

const CARGOS = [
  "Tesorero Regional", "Jefe de Unidad", "Recaudador Fiscal",
  "Abogado de Cobranza", "Analista de conciliación", "Ejecutivo de atención",
  "Contador fiscal", "Ministro de fe", "Administrativo",
];

const BANCOS = ["BancoEstado","Banco de Chile","BCI","Santander","Itaú","Scotiabank","Security","Falabella"];

const CONCEPTOS_RECAUDACION = [
  "IVA mensual (F29)", "Impuesto a la renta (F22)", "Contribuciones de bienes raíces",
  "Permiso de circulación", "Multas de tránsito", "Patente municipal",
  "Derechos aduaneros", "Multas de juzgado de policía local",
  "Cotizaciones previsionales en convenio", "Reintegro de beneficios",
  "Derechos de inscripción", "Tasas por servicios del Estado",
];

const CONCEPTOS_DEUDA = [
  "IVA no declarado", "Renta no pagada", "Contribuciones morosas",
  "Multa fiscal", "Crédito fiscal impago", "Derechos aduaneros morosos",
  "Patente morosa", "Reintegro de subsidio", "Tasa impaga",
];

const CUENTAS_TESORO = [
  "Cuenta Única Fiscal — Principal", "Cuenta Única Fiscal — Recaudación",
  "Cuenta Pagadora Central", "Cuenta de Depósitos en Garantía",
  "Cuenta de Devoluciones", "Cuenta Regional Valparaíso",
  "Cuenta Regional Biobío", "Cuenta de Fondos en Custodia",
];

const GLOSAS_EGRESO = [
  "Devolución de impuesto a la renta", "Pago de sentencia judicial",
  "Transferencia a servicio público", "Devolución por pago en exceso",
  "Pago a proveedor del Estado", "Restitución de garantía",
  "Transferencia a fondo sectorial", "Regularización contable",
];

const SISTEMAS = ["Sistema de Recaudación","Sistema de Cobranza","Sistema de Tesorería","Portal de Convenios","Contabilidad Fiscal"];
const PERFILES = ["Consulta","Operador","Supervisor","Administrador"];

// ─────────────────────────────────────────────────────────────────────
// FUNCIONARIOS — 140
// ─────────────────────────────────────────────────────────────────────
export const funcionarios: Funcionario[] = [];
for (let i = 0; i < 140; i++) {
  const cargo = pick(CARGOS);
  const jerarquia = cargo === "Tesorero Regional" ? 3 : cargo === "Jefe de Unidad" ? 2 : 1;
  const desvinculado = rng() < 0.07;
  funcionarios.push({
    id: `F${String(i + 1).padStart(4, "0")}`,
    nombre: `${pick(NOMBRES)} ${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
    cargo,
    unidad: pick(UNIDADES),
    tesoreria: pick(TESORERIAS),
    facultadCondonacionCLP: jerarquia === 3 ? 20_000_000 : jerarquia === 2 ? 5_000_000 : 1_000_000,
    facultadEgresoCLP: jerarquia === 3 ? 150_000_000 : jerarquia === 2 ? 40_000_000 : 8_000_000,
    estado: desvinculado ? "Desvinculado" : "Activo",
    fechaDesvinculacion: desvinculado ? masDias(HOY, -entre(20, 300)) : null,
  });
}
const funById = new Map(funcionarios.map((f) => [f.id, f]));
const activos = funcionarios.filter((f) => f.estado === "Activo");

// ─────────────────────────────────────────────────────────────────────
// CONTRIBUYENTES — 9.000
// ─────────────────────────────────────────────────────────────────────
export const contribuyentes: Contribuyente[] = [];
for (let i = 0; i < 9000; i++) {
  const juridica = rng() < 0.38;
  contribuyentes.push({
    id: `C${String(i + 1).padStart(6, "0")}`,
    rut: randomRUT(),
    nombre: juridica
      ? `${pick(GIROS)} ${pick(APELLIDOS)} ${pick(SUFIJOS)}`
      : `${pick(NOMBRES)} ${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
    tipo: juridica ? "Persona jurídica" : "Persona natural",
    region: pick(REGIONES),
  });
}
const contById = new Map(contribuyentes.map((c) => [c.id, c]));

// ─────────────────────────────────────────────────────────────────────
// 1. RECAUDACIÓN — lotes y pagos
// ─────────────────────────────────────────────────────────────────────
export const lotes: LoteRecaudacion[] = [];
export const pagos: PagoRecaudado[] = [];
let _loteId = 1, _pagoId = 1;

const montoPorConcepto = (c: string) =>
  c.startsWith("IVA") ? entre(180_000, 14_000_000)
  : c.startsWith("Impuesto a la renta") ? entre(250_000, 22_000_000)
  : c.startsWith("Contribuciones") ? entre(90_000, 2_400_000)
  : c.startsWith("Derechos aduaneros") ? entre(400_000, 18_000_000)
  : entre(40_000, 900_000);

// Un lote por banco y por día hábil de la ventana
for (let d = 180; d >= 0; d--) {
  const fecha = masDias(HOY, -d);
  const diaSemana = new Date(fecha).getUTCDay();
  if (diaSemana === 0 || diaSemana === 6) continue;

  BANCOS.forEach((banco) => {
    if (rng() < 0.45) return; // no todos los bancos envían lote todos los días
    const nPagos = entre(3, 14);
    const lote: LoteRecaudacion = {
      id: `LT-${String(_loteId++).padStart(5, "0")}`,
      banco, fecha,
      pagosInformados: nPagos,
      montoInformadoCLP: 0,
      montoIngresadoCLP: 0,
      estado: "Conciliado",
      diasSinResolver: 0,
    };

    for (let k = 0; k < nPagos; k++) {
      const cont = contribuyentes[entre(0, contribuyentes.length)];
      const concepto = pick(CONCEPTOS_RECAUDACION);
      const monto = montoPorConcepto(concepto);
      const reversado = rng() < 0.015;
      pagos.push({
        id: `PR-${String(_pagoId++).padStart(6, "0")}`,
        contribuyenteId: cont.id,
        concepto, montoCLP: monto, fechaPago: fecha, banco,
        canal: pick(["Banco en línea", "Caja bancaria", "Portal TGR", "Convenio institucional"]),
        loteId: lote.id,
        registradoEnSistema: true,
        conciliado: true,
        reversado,
        reversaConRespaldo: reversado ? rng() < 0.85 : true,
        registradoPor: pick(activos).id,
      });
      lote.montoInformadoCLP += monto;
    }
    lote.montoIngresadoCLP = lote.montoInformadoCLP;
    lotes.push(lote);
  });
}

const pagosPorLote = new Map<string, PagoRecaudado[]>();
pagos.forEach((p) => pagosPorLote.set(p.loteId, [...(pagosPorLote.get(p.loteId) || []), p]));

// 🚨 REC-01: pagos recaudados en banco que nunca se registraron en el sistema
const SIN_REGISTRO = [140, 980, 2310, 3875, 5240, 6690, 8115, 9430, 10870, 12240, 13615];
SIN_REGISTRO.forEach((i) => {
  const p = pagos[i % pagos.length];
  p.registradoEnSistema = false;
  p.conciliado = false;
  p.registradoPor = null;
  const lote = lotes.find((l) => l.id === p.loteId);
  if (lote) {
    lote.montoIngresadoCLP -= p.montoCLP;
    lote.estado = "Con diferencia";
    lote.diasSinResolver = diasEntre(lote.fecha, iso(HOY));
  }
});

// 🚨 REC-03: lotes completos informados por el banco que nunca ingresaron
const LOTES_NO_INGRESADOS = [55, 310, 740, 1180];
LOTES_NO_INGRESADOS.forEach((i) => {
  const l = lotes[i % lotes.length];
  l.estado = "No ingresado";
  l.montoIngresadoCLP = 0;
  l.diasSinResolver = diasEntre(l.fecha, iso(HOY));
  (pagosPorLote.get(l.id) || []).forEach((p) => { p.registradoEnSistema = false; p.conciliado = false; });
});

// 🚨 REC-04: reversas de pago sin respaldo documentado
const REVERSAS_SIN_RESPALDO = [420, 1760, 3090, 4480, 6010, 7330, 9020, 11450];
REVERSAS_SIN_RESPALDO.forEach((i) => {
  const p = pagos[i % pagos.length];
  p.reversado = true;
  p.reversaConRespaldo = false;
  p.montoCLP = Math.max(p.montoCLP, entre(2_000_000, 12_000_000));
});

// 🚨 REC-05: devoluciones duplicadas al mismo contribuyente
export const devolucionesDuplicadas: { contribuyente: string; pagoA: string; pagoB: string; montoCLP: number; diasEntre: number }[] = [];
const DUPLICADAS = [230, 1540, 4120, 7650, 10300];
DUPLICADAS.forEach((i) => {
  const base = pagos[i % pagos.length];
  const copia: PagoRecaudado = {
    ...base,
    id: `PR-${String(_pagoId++).padStart(6, "0")}`,
    fechaPago: masDias(base.fechaPago, entre(1, 5)),
  };
  pagos.push(copia);
  devolucionesDuplicadas.push({
    contribuyente: contById.get(base.contribuyenteId)?.nombre || base.contribuyenteId,
    pagoA: base.id, pagoB: copia.id, montoCLP: base.montoCLP,
    diasEntre: diasEntre(base.fechaPago, copia.fechaPago),
  });
});

// ─────────────────────────────────────────────────────────────────────
// 2. COBRANZA — deudas
// ─────────────────────────────────────────────────────────────────────
export const deudas: Deuda[] = [];

for (let i = 0; i < 5200; i++) {
  const cont = contribuyentes[entre(0, contribuyentes.length)];
  const concepto = pick(CONCEPTOS_DEUDA);
  const original = entre(300_000, 28_000_000);
  const intereses = Math.round(original * (0.08 + rng() * 0.6));
  const multas = Math.round(original * (0.02 + rng() * 0.25));
  // Exigible entre hace 4 años y hace 2 meses; prescribe a los 3 años
  const fechaExigibilidad = masDias(HOY, -entre(60, 1460));
  const judicial = rng() < 0.34;
  const pagada = rng() < 0.22;
  deudas.push({
    id: `D-${String(i + 1).padStart(6, "0")}`,
    contribuyenteId: cont.id,
    concepto,
    montoOriginalCLP: original,
    interesesCLP: intereses,
    multasCLP: multas,
    condonacionCLP: 0,
    condonadaPor: null,
    fechaExigibilidad,
    fechaPrescripcion: masDias(fechaExigibilidad, 1095),
    etapa: pagada ? "Pagada" : judicial ? "Cobranza judicial" : "Cobranza administrativa",
    conEmbargo: judicial && rng() < 0.55,
    fechaAlzamiento: null,
    alzadoPor: null,
    montoPagadoCLP: pagada ? original + intereses + multas : 0,
    ultimaGestion: rng() < 0.82 ? masDias(HOY, -entre(1, 150)) : null,
    plazoProcesalVence: judicial ? masDias(HOY, entre(-40, 180)) : null,
  });
}
const deudaById = new Map(deudas.map((d) => [d.id, d]));

// 🚨 COB-03: condonaciones de intereses y multas sobre la facultad del funcionario
const CONDONA_SOBRE_FACULTAD = [120, 640, 1180, 1890, 2470, 3150, 3820, 4410, 4950];
CONDONA_SOBRE_FACULTAD.forEach((i) => {
  const d = deudas[i % deudas.length];
  // un funcionario de rango bajo autoriza una condonación grande
  const f = activos.find((x) => x.facultadCondonacionCLP === 1_000_000) || activos[0];
  d.interesesCLP = Math.max(d.interesesCLP, entre(6_000_000, 30_000_000));
  d.condonacionCLP = Math.round(d.interesesCLP * (0.6 + rng() * 0.4));
  d.condonadaPor = f.id;
});

// Condonaciones normales, dentro de facultad
for (let k = 0; k < 220; k++) {
  const d = deudas[entre(0, deudas.length)];
  if (d.condonacionCLP > 0) continue;
  const f = pick(activos);
  const monto = Math.min(Math.round(d.interesesCLP * (0.2 + rng() * 0.5)), f.facultadCondonacionCLP - 1);
  if (monto <= 0) continue;
  d.condonacionCLP = monto;
  d.condonadaPor = f.id;
}

// 🚨 COB-01: deudas ya prescritas sin ninguna gestión registrada
const PRESCRITAS = [80, 430, 900, 1420, 2010, 2580, 3070, 3640, 4220, 4780, 5100];
PRESCRITAS.forEach((i) => {
  const d = deudas[i % deudas.length];
  d.fechaExigibilidad = masDias(HOY, -entre(1130, 1400));
  d.fechaPrescripcion = masDias(d.fechaExigibilidad, 1095);
  d.etapa = "Cobranza administrativa";
  d.ultimaGestion = null;
  d.montoPagadoCLP = 0;
});

// 🚨 COB-02: deudas que prescriben dentro de 90 días, sin gestión en los últimos 180
const POR_PRESCRIBIR = [150, 520, 1050, 1610, 2190, 2740, 3310, 3900, 4460, 5010, 210, 760, 1320, 1980, 2630];
POR_PRESCRIBIR.forEach((i) => {
  const d = deudas[i % deudas.length];
  if (d.fechaPrescripcion < iso(HOY)) return;
  d.fechaExigibilidad = masDias(HOY, -(1095 - entre(5, 88)));
  d.fechaPrescripcion = masDias(d.fechaExigibilidad, 1095);
  d.etapa = "Cobranza administrativa";
  d.ultimaGestion = null;
  d.montoPagadoCLP = 0;
});

// 🚨 COB-04: embargos alzados sin pago íntegro registrado
const ALZADOS_SIN_PAGO = [300, 1100, 2200, 3300, 4400, 5050];
ALZADOS_SIN_PAGO.forEach((i) => {
  const d = deudas[i % deudas.length];
  d.etapa = "Cobranza judicial";
  d.conEmbargo = true;
  d.fechaAlzamiento = masDias(HOY, -entre(5, 120));
  d.alzadoPor = pick(activos).id;
  d.montoPagadoCLP = Math.round((d.montoOriginalCLP + d.interesesCLP) * (0.05 + rng() * 0.3));
});

// 🚨 COB-05: cobros a contribuyentes con deuda ya extinguida
export const cobrosImprocedentes: { deuda: string; contribuyente: string; fechaCobro: string; montoCLP: number }[] = [];
const EXTINGUIDAS = [610, 1750, 2890, 4050, 4900, 5150, 330];
EXTINGUIDAS.forEach((i) => {
  const d = deudas[i % deudas.length];
  d.etapa = "Extinguida";
  d.montoPagadoCLP = d.montoOriginalCLP + d.interesesCLP + d.multasCLP;
  cobrosImprocedentes.push({
    deuda: d.id,
    contribuyente: contById.get(d.contribuyenteId)?.nombre || d.contribuyenteId,
    fechaCobro: masDias(HOY, -entre(3, 90)),
    montoCLP: d.montoOriginalCLP + d.interesesCLP,
  });
});

// 🚨 COB-06: juicios con plazo procesal vencido
const PLAZO_VENCIDO = [410, 1230, 2050, 2870, 3690, 4510, 5090, 170, 990, 1810, 2630, 3450];
PLAZO_VENCIDO.forEach((i) => {
  const d = deudas[i % deudas.length];
  d.etapa = "Cobranza judicial";
  d.plazoProcesalVence = masDias(HOY, -entre(5, 75));
});

// ─────────────────────────────────────────────────────────────────────
// 3. CUSTODIA — movimientos del Tesoro
// ─────────────────────────────────────────────────────────────────────
export const movimientos: MovimientoTesoro[] = [];
let _movId = 1;

for (let i = 0; i < 4800; i++) {
  const tipo: MovimientoTesoro["tipo"] = rng() < 0.52 ? "Ingreso" : rng() < 0.7 ? "Egreso" : "Traspaso";
  const f = pick(activos);
  const monto = tipo === "Ingreso" ? entre(1_000_000, 180_000_000) : entre(500_000, Math.max(1_000_000, f.facultadEgresoCLP));
  const saldoContable = entre(800_000_000, 4_200_000_000);
  movimientos.push({
    id: `MV-${String(_movId++).padStart(6, "0")}`,
    cuenta: pick(CUENTAS_TESORO),
    tipo,
    glosa: tipo === "Ingreso" ? "Ingreso por recaudación" : tipo === "Traspaso" ? "Traspaso entre cuentas fiscales" : pick(GLOSAS_EGRESO),
    montoCLP: monto,
    fecha: masDias(HOY, -entre(0, 180)),
    autorizadoPor: f.id,
    // Traspasos y egresos grandes requieren segunda firma
    segundaFirma: (tipo !== "Ingreso" && monto > 20_000_000) ? pick(activos).id : null,
    saldoContableCLP: saldoContable,
    saldoBancarioCLP: saldoContable,
  });
}

// 🚨 CUS-01: egresos sobre la facultad de quien los autorizó
const EGRESOS_SOBRE_FACULTAD = [90, 620, 1340, 2080, 2760, 3410, 4120, 4650];
EGRESOS_SOBRE_FACULTAD.forEach((i) => {
  const m = movimientos[i % movimientos.length];
  const f = funById.get(m.autorizadoPor)!;
  m.tipo = "Egreso";
  m.glosa = pick(GLOSAS_EGRESO);
  m.montoCLP = Math.round(f.facultadEgresoCLP * (1.6 + rng() * 3));
  m.segundaFirma = rng() < 0.5 ? pick(activos).id : null;
});

// 🚨 CUS-02: traspasos sobre el umbral sin segunda firma
const SIN_SEGUNDA_FIRMA = [250, 880, 1590, 2320, 3010, 3780, 4390];
SIN_SEGUNDA_FIRMA.forEach((i) => {
  const m = movimientos[i % movimientos.length];
  m.tipo = "Traspaso";
  m.glosa = "Traspaso entre cuentas fiscales";
  m.montoCLP = entre(60_000_000, 480_000_000);
  m.segundaFirma = null;
});

// 🚨 CUS-04: descuadre entre saldo contable y bancario
const DESCUADRES = [130, 1010, 2150, 3290, 4210];
DESCUADRES.forEach((i) => {
  const m = movimientos[i % movimientos.length];
  m.saldoBancarioCLP = m.saldoContableCLP - entre(12_000_000, 140_000_000);
});

// ─────────────────────────────────────────────────────────────────────
// ACCESOS A SISTEMAS
// ─────────────────────────────────────────────────────────────────────
export const accesos: AccesoSistema[] = [];
let _accId = 1;
funcionarios.forEach((f) => {
  const n = entre(1, 4);
  for (let k = 0; k < n; k++) {
    const desvinculado = f.estado === "Desvinculado";
    accesos.push({
      id: `AC-${String(_accId++).padStart(5, "0")}`,
      funcionarioId: f.id,
      sistema: pick(SISTEMAS),
      perfil: pick(PERFILES),
      // La mayoría de los desvinculados tiene el acceso revocado; algunos no
      vigente: desvinculado ? rng() < 0.35 : true,
      ultimoAcceso: desvinculado
        ? masDias(f.fechaDesvinculacion!, entre(-5, 40))
        : masDias(HOY, -entre(0, 30)),
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// LA CADENA — cruce de los tres procesos
// ─────────────────────────────────────────────────────────────────────
export type CasoCadena = {
  contribuyente: string;
  rut: string;
  funcionario: string;
  cargo: string;
  tesoreria: string;
  paso1: { que: string; fecha: string; detalle: string; montoCLP: number };
  paso2: { que: string; fecha: string; detalle: string; diasDespues: number };
  paso3: { que: string; fecha: string; detalle: string; diasDespues: number };
  montoCLP: number;
};

export const cadena: CasoCadena[] = [];

const FUNCIONARIO_CADENA = activos[23];
FUNCIONARIO_CADENA.nombre = "Rodrigo Mancilla Ojeda";
FUNCIONARIO_CADENA.cargo = "Recaudador Fiscal";
FUNCIONARIO_CADENA.unidad = "Recaudación";
FUNCIONARIO_CADENA.tesoreria = "Tesorería Regional Valparaíso";

for (let k = 0; k < 5; k++) {
  const cont = contribuyentes[1200 + k * 940];
  const monto = entre(11_000_000, 46_000_000);
  const fPago = masDias(HOY, -(150 - k * 22));
  const fConciliacion = masDias(fPago, entre(2, 5));
  const fAlzamiento = masDias(fConciliacion, entre(3, 9));

  // Paso 1 — el pago entra por caja bancaria y queda registrado
  const lote = lotes[Math.min(lotes.length - 1, 40 + k * 37)];
  const pago: PagoRecaudado = {
    id: `PR-${String(_pagoId++).padStart(6, "0")}`,
    contribuyenteId: cont.id,
    concepto: pick(["IVA no declarado regularizado", "Contribuciones morosas", "Renta no pagada"]),
    montoCLP: monto,
    fechaPago: fPago,
    banco: pick(BANCOS),
    canal: "Caja bancaria",
    loteId: lote.id,
    registradoEnSistema: true,
    conciliado: false,          // paso 2: nunca cuadra
    reversado: false,
    reversaConRespaldo: true,
    registradoPor: FUNCIONARIO_CADENA.id,
  };
  pagos.push(pago);
  lote.estado = "Con diferencia";
  lote.montoInformadoCLP += monto;
  lote.diasSinResolver = diasEntre(lote.fecha, iso(HOY));

  // Paso 3 — la deuda se cierra y el embargo se alza, por el mismo funcionario
  const deuda = deudas[700 + k * 810];
  deuda.contribuyenteId = cont.id;
  deuda.montoOriginalCLP = monto;
  deuda.etapa = "Pagada";
  deuda.conEmbargo = true;
  deuda.fechaAlzamiento = fAlzamiento;
  deuda.alzadoPor = FUNCIONARIO_CADENA.id;
  deuda.montoPagadoCLP = monto;
  deuda.ultimaGestion = fAlzamiento;

  cadena.push({
    contribuyente: cont.nombre,
    rut: cont.rut,
    funcionario: FUNCIONARIO_CADENA.nombre,
    cargo: FUNCIONARIO_CADENA.cargo,
    tesoreria: FUNCIONARIO_CADENA.tesoreria,
    paso1: { que: "Pago recaudado en banco", fecha: fPago, detalle: `Registrado en el sistema por ${FUNCIONARIO_CADENA.nombre}`, montoCLP: monto },
    paso2: { que: "Nunca ingresó a la Cuenta Única Fiscal", fecha: fConciliacion, detalle: "Diferencia de conciliación abierta hasta hoy", diasDespues: diasEntre(fPago, fConciliacion) },
    paso3: { que: "Cobranza cerrada y embargo alzado", fecha: fAlzamiento, detalle: `Alzado por ${FUNCIONARIO_CADENA.nombre} — el mismo que registró el pago`, diasDespues: diasEntre(fConciliacion, fAlzamiento) },
    montoCLP: monto,
  });
}

// ─────────────────────────────────────────────────────────────────────
// DETECCIÓN
// ─────────────────────────────────────────────────────────────────────
const nombreCont = (id: string) => contById.get(id)?.nombre || id;
const rutCont = (id: string) => contById.get(id)?.rut || "—";
const nombreFun = (id: string | null) => (id ? funById.get(id)?.nombre || id : "—");

export const detectarHallazgos = () => {
  const HOY_ISO = iso(HOY);

  // REC-01
  const sinRegistro = pagos
    .filter((p) => !p.registradoEnSistema)
    .map((p) => ({
      pago: p.id, contribuyente: nombreCont(p.contribuyenteId), rut: rutCont(p.contribuyenteId),
      concepto: p.concepto, banco: p.banco, fechaPago: p.fechaPago, montoCLP: p.montoCLP, lote: p.loteId,
    }));

  // REC-02
  const conciliacionAbierta = lotes
    .filter((l) => l.estado === "Con diferencia" && l.diasSinResolver > 30)
    .map((l) => ({
      lote: l.id, banco: l.banco, fecha: l.fecha,
      diferenciaCLP: l.montoInformadoCLP - l.montoIngresadoCLP,
      diasSinResolver: l.diasSinResolver,
    }));

  // REC-03
  const lotesNoIngresados = lotes
    .filter((l) => l.estado === "No ingresado")
    .map((l) => ({ lote: l.id, banco: l.banco, fecha: l.fecha, montoCLP: l.montoInformadoCLP, pagos: l.pagosInformados, diasSinResolver: l.diasSinResolver }));

  // REC-04
  const reversasSinRespaldo = pagos
    .filter((p) => p.reversado && !p.reversaConRespaldo)
    .map((p) => ({ pago: p.id, contribuyente: nombreCont(p.contribuyenteId), montoCLP: p.montoCLP, fechaPago: p.fechaPago, registradoPor: nombreFun(p.registradoPor) }));

  // COB-01
  const prescritas = deudas
    .filter((d) => d.fechaPrescripcion < HOY_ISO && d.etapa !== "Pagada" && d.etapa !== "Extinguida" && !d.ultimaGestion)
    .map((d) => ({
      deuda: d.id, contribuyente: nombreCont(d.contribuyenteId), rut: rutCont(d.contribuyenteId),
      concepto: d.concepto, montoCLP: d.montoOriginalCLP + d.interesesCLP + d.multasCLP,
      fechaPrescripcion: d.fechaPrescripcion, diasPrescrita: diasEntre(d.fechaPrescripcion, HOY_ISO),
    }));

  // COB-02
  const porPrescribir = deudas
    .filter((d) => {
      if (d.etapa === "Pagada" || d.etapa === "Extinguida") return false;
      const faltan = diasEntre(HOY_ISO, d.fechaPrescripcion);
      return faltan >= 0 && faltan <= 90 && !d.ultimaGestion;
    })
    .map((d) => ({
      deuda: d.id, contribuyente: nombreCont(d.contribuyenteId),
      concepto: d.concepto, montoCLP: d.montoOriginalCLP + d.interesesCLP + d.multasCLP,
      fechaPrescripcion: d.fechaPrescripcion, diasRestantes: diasEntre(HOY_ISO, d.fechaPrescripcion),
    }))
    .sort((a, b) => a.diasRestantes - b.diasRestantes);

  // COB-03
  const condonacionesSobreFacultad = deudas
    .filter((d) => {
      if (!d.condonadaPor || d.condonacionCLP <= 0) return false;
      const f = funById.get(d.condonadaPor);
      return !!f && d.condonacionCLP > f.facultadCondonacionCLP;
    })
    .map((d) => {
      const f = funById.get(d.condonadaPor!)!;
      return {
        deuda: d.id, contribuyente: nombreCont(d.contribuyenteId),
        condonacionCLP: d.condonacionCLP, facultadCLP: f.facultadCondonacionCLP,
        excesoCLP: d.condonacionCLP - f.facultadCondonacionCLP,
        funcionario: f.nombre, cargo: f.cargo, tesoreria: f.tesoreria,
      };
    });

  // COB-04
  const alzadosSinPago = deudas
    .filter((d) => d.conEmbargo && d.fechaAlzamiento && d.montoPagadoCLP < (d.montoOriginalCLP + d.interesesCLP) * 0.95)
    .map((d) => ({
      deuda: d.id, contribuyente: nombreCont(d.contribuyenteId),
      deudaTotalCLP: d.montoOriginalCLP + d.interesesCLP + d.multasCLP,
      pagadoCLP: d.montoPagadoCLP, saldoCLP: d.montoOriginalCLP + d.interesesCLP + d.multasCLP - d.montoPagadoCLP,
      fechaAlzamiento: d.fechaAlzamiento!, alzadoPor: nombreFun(d.alzadoPor),
    }));

  // COB-06
  const plazoVencido = deudas
    .filter((d) => d.etapa === "Cobranza judicial" && d.plazoProcesalVence && d.plazoProcesalVence < HOY_ISO)
    .map((d) => ({
      deuda: d.id, contribuyente: nombreCont(d.contribuyenteId),
      montoCLP: d.montoOriginalCLP + d.interesesCLP, venció: d.plazoProcesalVence!,
      diasVencido: diasEntre(d.plazoProcesalVence!, HOY_ISO),
    }));

  // CUS-01
  const egresosSobreFacultad = movimientos
    .filter((m) => m.tipo === "Egreso" && m.montoCLP > (funById.get(m.autorizadoPor)?.facultadEgresoCLP || Infinity))
    .map((m) => {
      const f = funById.get(m.autorizadoPor)!;
      return {
        movimiento: m.id, cuenta: m.cuenta, glosa: m.glosa, fecha: m.fecha,
        montoCLP: m.montoCLP, facultadCLP: f.facultadEgresoCLP,
        funcionario: f.nombre, cargo: f.cargo, segundaFirma: nombreFun(m.segundaFirma),
      };
    });

  // CUS-02
  const sinSegundaFirma = movimientos
    .filter((m) => m.tipo !== "Ingreso" && m.montoCLP > 20_000_000 && !m.segundaFirma)
    .map((m) => ({
      movimiento: m.id, cuenta: m.cuenta, tipo: m.tipo, glosa: m.glosa,
      fecha: m.fecha, montoCLP: m.montoCLP, autorizadoPor: nombreFun(m.autorizadoPor),
    }));

  // CUS-03
  const accesosVigentesDesvinculados = accesos
    .filter((a) => a.vigente && funById.get(a.funcionarioId)?.estado === "Desvinculado")
    .map((a) => {
      const f = funById.get(a.funcionarioId)!;
      return {
        acceso: a.id, funcionario: f.nombre, cargo: f.cargo, unidad: f.unidad,
        sistema: a.sistema, perfil: a.perfil,
        fechaDesvinculacion: f.fechaDesvinculacion!,
        diasDesdeDesvinculacion: diasEntre(f.fechaDesvinculacion!, HOY_ISO),
        ultimoAcceso: a.ultimoAcceso,
        accesoPosterior: a.ultimoAcceso > f.fechaDesvinculacion!,
      };
    });

  // CUS-04
  const descuadres = movimientos
    .filter((m) => m.saldoBancarioCLP !== m.saldoContableCLP)
    .map((m) => ({
      movimiento: m.id, cuenta: m.cuenta, fecha: m.fecha,
      saldoContableCLP: m.saldoContableCLP, saldoBancarioCLP: m.saldoBancarioCLP,
      diferenciaCLP: m.saldoContableCLP - m.saldoBancarioCLP,
    }));

  const suma = (arr: any[], campo: string) => arr.reduce((a, x) => a + (x[campo] || 0), 0);

  return {
    // Recaudación
    sinRegistro: { cantidad: sinRegistro.length, montoTotal: suma(sinRegistro, "montoCLP"), casos: sinRegistro.slice(0, 25) },
    conciliacionAbierta: { cantidad: conciliacionAbierta.length, montoTotal: suma(conciliacionAbierta, "diferenciaCLP"), casos: conciliacionAbierta.slice(0, 25) },
    lotesNoIngresados: { cantidad: lotesNoIngresados.length, montoTotal: suma(lotesNoIngresados, "montoCLP"), casos: lotesNoIngresados },
    reversasSinRespaldo: { cantidad: reversasSinRespaldo.length, montoTotal: suma(reversasSinRespaldo, "montoCLP"), casos: reversasSinRespaldo },
    devolucionesDuplicadas: { cantidad: devolucionesDuplicadas.length, montoTotal: suma(devolucionesDuplicadas, "montoCLP"), casos: devolucionesDuplicadas },
    // Cobranza
    prescritas: { cantidad: prescritas.length, montoTotal: suma(prescritas, "montoCLP"), casos: prescritas.slice(0, 25) },
    porPrescribir: { cantidad: porPrescribir.length, montoTotal: suma(porPrescribir, "montoCLP"), casos: porPrescribir.slice(0, 25) },
    condonacionesSobreFacultad: { cantidad: condonacionesSobreFacultad.length, montoTotal: suma(condonacionesSobreFacultad, "excesoCLP"), casos: condonacionesSobreFacultad },
    alzadosSinPago: { cantidad: alzadosSinPago.length, montoTotal: suma(alzadosSinPago, "saldoCLP"), casos: alzadosSinPago },
    cobrosImprocedentes: { cantidad: cobrosImprocedentes.length, montoTotal: suma(cobrosImprocedentes, "montoCLP"), casos: cobrosImprocedentes },
    plazoVencido: { cantidad: plazoVencido.length, montoTotal: suma(plazoVencido, "montoCLP"), casos: plazoVencido.slice(0, 20) },
    // Custodia
    egresosSobreFacultad: { cantidad: egresosSobreFacultad.length, montoTotal: suma(egresosSobreFacultad, "montoCLP"), casos: egresosSobreFacultad },
    sinSegundaFirma: { cantidad: sinSegundaFirma.length, montoTotal: suma(sinSegundaFirma, "montoCLP"), casos: sinSegundaFirma },
    accesosVigentesDesvinculados: { cantidad: accesosVigentesDesvinculados.length, casos: accesosVigentesDesvinculados.slice(0, 25) },
    descuadres: { cantidad: descuadres.length, montoTotal: suma(descuadres, "diferenciaCLP"), casos: descuadres },
    // Cruce
    cadena: { cantidad: cadena.length, montoTotal: cadena.reduce((a, c) => a + c.montoCLP, 0), casos: cadena },
  };
};

// ─────────────────────────────────────────────────────────────────────
// CONTEXTO PARA AUDITIA
// ─────────────────────────────────────────────────────────────────────
export const buildProcesosTGRContext = () => {
  const h = detectarHallazgos();
  const recaudado = pagos.filter((p) => p.registradoEnSistema).reduce((a, p) => a + p.montoCLP, 0);
  const carteraMorosa = deudas
    .filter((d) => d.etapa === "Cobranza administrativa" || d.etapa === "Cobranza judicial")
    .reduce((a, d) => a + d.montoOriginalCLP + d.interesesCLP + d.multasCLP, 0);

  return {
    institucion: {
      sector: "Sector público · Servicio de Tesorerías",
      naturaleza: "Datos sintéticos. Ningún RUT, nombre o folio corresponde a una persona o expediente real.",
      contribuyentes: contribuyentes.length,
      funcionarios: funcionarios.length,
      pagosRecaudados: pagos.length,
      lotesBancarios: lotes.length,
      deudasEnCartera: deudas.length,
      movimientosDelTesoro: movimientos.length,
      periodo: PERIODO,
      montoRecaudadoCLP: recaudado,
      carteraMorosaCLP: carteraMorosa,
    },
    procesosAuditados: [
      "Recaudación de ingresos fiscales — criticidad muy alta. Riesgos: fugas de recaudación, errores de conciliación bancaria, recaudaciones no registradas, fraude interno o externo, fallas en integraciones con bancos y organismos recaudadores.",
      "Cobranza administrativa y judicial — criticidad muy alta. Riesgos: prescripción de deudas, errores en embargos y medidas cautelares, condonaciones indebidas de intereses o multas, cobros improcedentes, demandas contra el Estado y exposición reputacional.",
      "Custodia y administración de fondos del Tesoro Público — criticidad muy alta. Riesgos: uso indebido de fondos públicos, fraude financiero, errores de registro contable, falta de segregación de funciones, fallas en controles de acceso y pérdida de liquidez operativa.",
    ],
    hallazgos: h,
    notaImportante:
      "Los tres procesos se auditan hoy por separado, y por separado cada uno entrega hallazgos correctos pero " +
      "incompletos. Cruzados aparece la cadena: un pago se recauda en la red bancaria y queda registrado, la " +
      "conciliación nunca cuadra y el monto no ingresa a la Cuenta Única Fiscal, y aun así se cierra la cobranza y " +
      "se alza el embargo — todo por el mismo funcionario. Cada paso, aislado, es una transacción legítima que pasa " +
      "el control de su propio proceso. Son " + h.cadena.cantidad + " casos por CLP " +
      Math.round(h.cadena.montoTotal / 1_000_000) + " millones. " +
      "El hallazgo de mayor impacto financiero individual es la prescripción: CLP " +
      Math.round(h.prescritas.montoTotal / 1_000_000) + " millones ya perdidos por inacción, más CLP " +
      Math.round(h.porPrescribir.montoTotal / 1_000_000) + " millones que prescriben dentro de 90 días y todavía " +
      "se pueden salvar.",
  };
};
