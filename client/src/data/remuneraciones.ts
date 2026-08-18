// Remuneraciones y Dotación — vocabulario según el pack de industria activo.
// Personal operativo (el que hace turnos) + personal administrativo.
//
// El caso cruza 5 fuentes (estructuradas + NO estructuradas):
//   1. Maestro de trabajadores (contrato, cargo, base, convenio)
//   2. Turnos y guardias (bitácora operativa por activo)
//   3. Liquidaciones de sueldo (base, horas extra, bonos, descuentos)
//   4. Convenio colectivo vigente (bonos permitidos y topes)
//   5. Finiquitos del período
//
// HALLAZGOS PLANTADOS:
//   1. Horas extra pagadas > horas efectivamente registradas en turnos (crítico)
//   2. Bono de embarque pagado dos veces en el mismo período (crítico)
//   3. Liquidación pagada sin ningún turno registrado en el período (crítico)
//   4. Liquidación posterior a la fecha de finiquito (crítico)
//   5. Bono de dotación completa pagado en faenas bajo dotación mínima de seguridad (alto)
//   6. Horas extra sobre el tope legal mensual — Art. 31 Código del Trabajo (alto)
//   7. Guardias > 16 horas continuas sin descanso (alto · riesgo laboral)
//   8. Trabajadores que comparten cuenta bancaria entre sí (alto)
//   9. Bonos pagados fuera del convenio colectivo vigente (medio)
//  10. Saltos de líquido > 40% sobre la media del cargo sin cambio de cargo (medio)

import { getPackActivo } from "../packs";

const PACK = getPackActivo();
const OP = PACK.operacion;

/** Etiquetas del pack, para usar en textos de la vista y del prompt. */
export const ETIQUETAS = {
  activo: OP.etiquetaActivo,
  dotacion: OP.etiquetaDotacion,
  faena: OP.etiquetaFaena,
  bonoPrincipal: OP.bonoPrincipal,
  bonoDotacion: OP.bonoDotacionCompleta,
  convenioOperativo: OP.convenios[0],
  convenioAdministrativo: OP.convenios[1],
};

// ─────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────

export type Trabajador = {
  id: string;
  rut: string;
  nombre: string;
  cargo: string;
  embarcado: boolean;
  base: string;
  unidad: string;
  tipoContrato: "Indefinido" | "Plazo fijo" | "Por faena";
  convenio: string;
  fechaIngreso: string;
  sueldoBaseCLP: number;
  banco: string;
  cuentaBanco: string;
  estado: "Activo" | "Finiquitado";
  fechaFiniquito: string | null;
};

export type Turno = {
  id: string;
  trabajadorId: string;
  fecha: string;
  activo: string;
  base: string;
  tipo: "Guardia" | "Faena" | "Relevo" | "Administrativo";
  horaInicio: string;
  horaFin: string;
  horas: number;
  dotacionFaena: number;      // tripulantes efectivos en la faena
  dotacionMinima: number;     // mínimo de seguridad exigido
};

export type Bono = {
  tipo: string;
  montoCLP: number;
};

export type Liquidacion = {
  id: string;
  trabajadorId: string;
  periodo: string;            // YYYY-MM
  fechaPago: string;
  sueldoBaseCLP: number;
  horasExtraPagadas: number;
  montoHorasExtraCLP: number;
  bonos: Bono[];
  descuentosCLP: number;
  liquidoCLP: number;
};

export type Finiquito = {
  id: string;
  trabajadorId: string;
  fecha: string;
  causal: string;
  indemnizacionCLP: number;
  vacacionesProporcionalesCLP: number;
  totalCLP: number;
};

// ─────────────────────────────────────────────────────────────────────
// SEED DETERMINISTA
// ─────────────────────────────────────────────────────────────────────
let _seed = 20260526;
const rng = () => {
  _seed = (_seed * 9301 + 49297) % 233280;
  return _seed / 233280;
};
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const between = (a: number, b: number) => Math.floor(a + rng() * (b - a));

const randomRUT = () => {
  const n = 5_000_000 + Math.floor(rng() * 20_000_000);
  const dv = pick(["0","1","2","3","4","5","6","7","8","9","K"]);
  const s = n.toString();
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}-${dv}`;
};
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => d.toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────
// POOLS
// ─────────────────────────────────────────────────────────────────────
const NOMBRES = ["María","Pedro","Andrea","Javier","Carolina","Rodrigo","Patricia","Felipe","Soledad","Luis","Constanza","Marcelo","Cristián","Daniela","Eduardo","Francisca","Gonzalo","Loreto","Mauricio","Pamela","Sebastián","Tamara","Víctor","Ximena","Bárbara","César","Diego","Elisa","Fabián","Gabriela","Héctor","Ivonne","Joaquín","Karla","Lautaro","Macarena","Néstor","Olga","Pablo","Raquel","Sergio","Valeria","Nicolás","Paulina"];
const APELLIDOS = ["González","Soto","Vargas","Muñoz","Pino","Aravena","Reyes","Cárdenas","Vega","Henríquez","Bravo","Torres","Espinoza","Olivares","Saavedra","Lillo","Rojas","Pizarro","Maldonado","Salinas","Cisternas","Quintana","Hidalgo","Lagos","Toledo","Núñez","Vidal","Mora","Aguilar","Pacheco","Mancilla","Almonacid","Bahamondes","Cifuentes","Ojeda","Mardones","Iturra","Tobar"];

const CARGOS_EMBARCADOS = OP.cargosOperativos.map((c) => ({ cargo: c.cargo, peso: c.peso, sueldo: c.sueldo }));
const CARGOS_TIERRA = OP.cargosAdministrativos.map((c) => ({ cargo: c.cargo, peso: c.peso, sueldo: c.sueldo }));

const BASES = OP.sedes;
const UNIDADES = OP.unidades;
const BANCOS = ["BancoEstado","BCI","Santander","Banco de Chile","Itaú","Scotiabank","Security"];

const ACTIVOS = OP.activos;

export const BONOS_CONVENIO = OP.bonosConvenio;
const BONOS_FUERA_CONVENIO = ["Bono especial de gestión", "Bono discrecional operativo"];

// ─────────────────────────────────────────────────────────────────────
// TRABAJADORES — 1.200
// ─────────────────────────────────────────────────────────────────────
const N_TRAB = 1200;
export const trabajadores: Trabajador[] = [];

for (let i = 0; i < N_TRAB; i++) {
  const embarcado = rng() < 0.62;
  const pool = embarcado ? CARGOS_EMBARCADOS : CARGOS_TIERRA;
  const expand: typeof pool = [];
  pool.forEach((c) => { for (let k = 0; k < c.peso; k++) expand.push(c); });
  const c = pick(expand);
  const finiquitado = rng() < 0.035;
  trabajadores.push({
    id: `T${String(i + 1).padStart(5, "0")}`,
    rut: randomRUT(),
    nombre: `${pick(NOMBRES)} ${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
    cargo: c.cargo,
    embarcado,
    base: pick(BASES),
    unidad: embarcado ? pick(UNIDADES.slice(0, 5)) : pick(UNIDADES),
    tipoContrato: rng() < 0.82 ? "Indefinido" : (rng() < 0.6 ? "Plazo fijo" : "Por faena"),
    convenio: embarcado ? OP.convenios[0] : (rng() < 0.7 ? OP.convenios[1] : "Sin convenio"),
    fechaIngreso: iso(new Date(2012 + Math.floor(rng() * 13), Math.floor(rng() * 12), 1 + Math.floor(rng() * 27))),
    sueldoBaseCLP: between(c.sueldo[0], c.sueldo[1]),
    banco: pick(BANCOS),
    cuentaBanco: String(between(10_000_000, 99_999_999)),
    estado: finiquitado ? "Finiquitado" : "Activo",
    fechaFiniquito: finiquitado ? iso(new Date(2025, 9 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 27))) : null,
  });
}

// 🚨 HALLAZGO #8: 2 pares de trabajadores con la misma cuenta bancaria
const CUENTA_COMPARTIDA_A = { banco: "BCI", cuenta: "44556677" };
const CUENTA_COMPARTIDA_B = { banco: "Santander", cuenta: "88991122" };
[[118, 742], [305, 961]].forEach((par, k) => {
  const cfg = k === 0 ? CUENTA_COMPARTIDA_A : CUENTA_COMPARTIDA_B;
  par.forEach((idx) => {
    trabajadores[idx].banco = cfg.banco;
    trabajadores[idx].cuentaBanco = cfg.cuenta;
  });
});
trabajadores[118].nombre = "Néstor Mancilla Ojeda";
trabajadores[742].nombre = "Olga Mancilla Tobar";
trabajadores[305].nombre = "Lautaro Iturra Vega";
trabajadores[961].nombre = "Karla Iturra Bravo";

// ─────────────────────────────────────────────────────────────────────
// TURNOS — 6 meses (Oct 2025 – Mar 2026)
// ─────────────────────────────────────────────────────────────────────
const MESES = [
  { y: 2025, m: 10 }, { y: 2025, m: 11 }, { y: 2025, m: 12 },
  { y: 2026, m: 1 }, { y: 2026, m: 2 }, { y: 2026, m: 3 },
];
export const PERIODOS = MESES.map((x) => `${x.y}-${pad(x.m)}`);

export const turnos: Turno[] = [];
let _turnoId = 1;

const nuevoTurno = (t: Trabajador, y: number, m: number, dia: number, override: Partial<Turno> = {}): Turno => {
  const inicioH = t.embarcado ? pick([0, 6, 12, 18]) : pick([8, 9]);
  const horas = override.horas ?? (t.embarcado ? pick([8, 8, 12, 12, 6]) : 9);
  const finH = (inicioH + horas) % 24;
  const dotacionMinima = 4;
  const dotacionFaena = rng() < 0.985 ? between(4, 7) : 3; // ~1,5% opera bajo mínimo
  return {
    id: `TU${String(_turnoId++).padStart(6, "0")}`,
    trabajadorId: t.id,
    fecha: `${y}-${pad(m)}-${pad(dia)}`,
    activo: t.embarcado ? pick(ACTIVOS) : "—",
    base: t.base,
    tipo: t.embarcado ? pick(["Guardia", "Guardia", "Faena", "Relevo"] as const) : "Administrativo",
    horaInicio: `${pad(inicioH)}:00`,
    horaFin: `${pad(finH)}:00`,
    horas,
    dotacionFaena,
    dotacionMinima,
    ...override,
  };
};

trabajadores.forEach((t) => {
  MESES.forEach(({ y, m }) => {
    // Finiquitados dejan de tener turnos después del finiquito
    if (t.fechaFiniquito && `${y}-${pad(m)}` > t.fechaFiniquito.slice(0, 7)) return;
    const nTurnos = t.embarcado ? between(6, 12) : between(18, 22);
    const diasUsados = new Set<number>();
    for (let k = 0; k < nTurnos; k++) {
      let dia = between(1, 28);
      while (diasUsados.has(dia)) dia = between(1, 28);
      diasUsados.add(dia);
      turnos.push(nuevoTurno(t, y, m, dia));
    }
  });
});

// 🚨 HALLAZGO #7: 9 guardias > 16 horas continuas
const GUARDIAS_LARGAS_IDX = [1200, 4800, 9100, 14300, 19700, 24100, 28800, 31200, 33500];
GUARDIAS_LARGAS_IDX.forEach((idx) => {
  const t = turnos[idx % turnos.length];
  t.horas = pick([17, 18, 19, 20]);
  t.tipo = "Guardia";
  t.horaFin = `${pad((parseInt(t.horaInicio) + t.horas) % 24)}:00`;
});

// 🚨 HALLAZGO #5 (base): faenas bajo dotación mínima marcadas explícitamente
const BAJO_DOTACION_IDX = [2200, 6400, 11500, 17800, 22600];
BAJO_DOTACION_IDX.forEach((idx) => {
  const t = turnos[idx % turnos.length];
  t.tipo = "Faena";
  t.dotacionFaena = 3;
  t.dotacionMinima = 4;
});

// ─────────────────────────────────────────────────────────────────────
// LIQUIDACIONES
// ─────────────────────────────────────────────────────────────────────
export const liquidaciones: Liquidacion[] = [];
let _liqId = 1;

const turnosPorTrabPeriodo = new Map<string, Turno[]>();
turnos.forEach((t) => {
  const key = `${t.trabajadorId}|${t.fecha.slice(0, 7)}`;
  const arr = turnosPorTrabPeriodo.get(key);
  if (arr) arr.push(t); else turnosPorTrabPeriodo.set(key, [t]);
});

const valorHoraExtra = (sueldoBase: number) => Math.round((sueldoBase / 180) * 1.5);

trabajadores.forEach((t) => {
  PERIODOS.forEach((periodo) => {
    if (t.fechaFiniquito && periodo > t.fechaFiniquito.slice(0, 7)) return;
    const misTurnos = turnosPorTrabPeriodo.get(`${t.id}|${periodo}`) || [];
    const horasTurno = misTurnos.reduce((a, x) => a + x.horas, 0);
    const horasExtra = misTurnos.length && rng() < 0.45 ? Math.round(horasTurno * between(3, 12) / 100) : 0;
    const bonos: Bono[] = [];
    if (t.embarcado) {
      bonos.push({ tipo: OP.bonoPrincipal, montoCLP: between(180_000, 320_000) });
      if (rng() < 0.55) bonos.push({ tipo: OP.bonosConvenio[1], montoCLP: between(60_000, 140_000) });
      if (rng() < 0.35) bonos.push({ tipo: OP.bonosConvenio[2], montoCLP: between(80_000, 180_000) });
      if (rng() < 0.25) bonos.push({ tipo: OP.bonoDotacionCompleta, montoCLP: between(70_000, 120_000) });
    } else {
      if (rng() < 0.4) bonos.push({ tipo: OP.bonosConvenio[5], montoCLP: between(50_000, 110_000) });
      if (rng() < 0.6) bonos.push({ tipo: OP.bonosConvenio[6], montoCLP: between(40_000, 70_000) });
    }
    const montoHE = horasExtra * valorHoraExtra(t.sueldoBaseCLP);
    const totalBonos = bonos.reduce((a, b) => a + b.montoCLP, 0);
    const bruto = t.sueldoBaseCLP + montoHE + totalBonos;
    const descuentos = Math.round(bruto * 0.2);
    const [y, m] = periodo.split("-").map(Number);
    liquidaciones.push({
      id: `LIQ-${periodo}-${String(_liqId++).padStart(5, "0")}`,
      trabajadorId: t.id,
      periodo,
      fechaPago: iso(new Date(y, m - 1, 30)),
      sueldoBaseCLP: t.sueldoBaseCLP,
      horasExtraPagadas: horasExtra,
      montoHorasExtraCLP: montoHE,
      bonos,
      descuentosCLP: descuentos,
      liquidoCLP: bruto - descuentos,
    });
  });
});

const liqIdx = (trabajadorId: string, periodo: string) =>
  liquidaciones.findIndex((l) => l.trabajadorId === trabajadorId && l.periodo === periodo);

// 🚨 HALLAZGO #1: 7 liquidaciones con horas extra > horas de turno registradas
const HE_IMPOSIBLES = [
  { t: "T00042", p: "2026-01", he: 96 },
  { t: "T00187", p: "2025-11", he: 88 },
  { t: "T00311", p: "2026-02", he: 104 },
  { t: "T00528", p: "2025-12", he: 92 },
  { t: "T00744", p: "2026-03", he: 110 },
  { t: "T00902", p: "2026-01", he: 84 },
  { t: "T01098", p: "2025-10", he: 97 },
];
HE_IMPOSIBLES.forEach(({ t, p, he }) => {
  const i = liqIdx(t, p);
  if (i < 0) return;
  const trab = trabajadores.find((x) => x.id === t)!;
  liquidaciones[i].horasExtraPagadas = he;
  liquidaciones[i].montoHorasExtraCLP = he * valorHoraExtra(trab.sueldoBaseCLP);
  liquidaciones[i].liquidoCLP =
    trab.sueldoBaseCLP + liquidaciones[i].montoHorasExtraCLP +
    liquidaciones[i].bonos.reduce((a, b) => a + b.montoCLP, 0);
});

// 🚨 HALLAZGO #2: 4 casos de bono de embarque duplicado en el mismo período
const BONO_DUPLICADO = [
  { t: "T00073", p: "2025-11" }, { t: "T00429", p: "2026-01" },
  { t: "T00615", p: "2026-02" }, { t: "T00988", p: "2025-12" },
];
BONO_DUPLICADO.forEach(({ t, p }) => {
  const i = liqIdx(t, p);
  if (i < 0) return;
  const original = liquidaciones[i].bonos.find((b) => b.tipo === OP.bonoPrincipal);
  const monto = original ? original.montoCLP : 250_000;
  if (!original) liquidaciones[i].bonos.push({ tipo: OP.bonoPrincipal, montoCLP: monto });
  liquidaciones[i].bonos.push({ tipo: OP.bonoPrincipal, montoCLP: monto });
  liquidaciones[i].liquidoCLP += monto;
});

// 🚨 HALLAZGO #3: 3 liquidaciones sin ningún turno registrado en el período
const SIN_TURNOS = [
  { t: "T00256", p: "2026-02" }, { t: "T00681", p: "2026-01" }, { t: "T01142", p: "2025-12" },
];
SIN_TURNOS.forEach(({ t, p }) => {
  for (let i = turnos.length - 1; i >= 0; i--) {
    if (turnos[i].trabajadorId === t && turnos[i].fecha.slice(0, 7) === p) turnos.splice(i, 1);
  }
  turnosPorTrabPeriodo.set(`${t}|${p}`, []);
});

// 🚨 HALLAZGO #9: 6 bonos fuera del convenio colectivo
const FUERA_CONVENIO = [
  { t: "T00095", p: "2025-10" }, { t: "T00340", p: "2025-11" }, { t: "T00587", p: "2025-12" },
  { t: "T00812", p: "2026-01" }, { t: "T01005", p: "2026-02" }, { t: "T01180", p: "2026-03" },
];
FUERA_CONVENIO.forEach(({ t, p }) => {
  const i = liqIdx(t, p);
  if (i < 0) return;
  const monto = between(400_000, 900_000);
  liquidaciones[i].bonos.push({ tipo: pick(BONOS_FUERA_CONVENIO), montoCLP: monto });
  liquidaciones[i].liquidoCLP += monto;
});

// 🚨 HALLAZGO #6: 12 casos sobre el tope legal de horas extra (Art. 31 · 2h/día)
const TOPE_LEGAL_HORAS = 45;
const SOBRE_TOPE = trabajadores.filter((t) => !t.embarcado && t.estado === "Activo").slice(0, 12).map((t) => t.id);
SOBRE_TOPE.forEach((t, k) => {
  const p = PERIODOS[k % PERIODOS.length];
  const i = liqIdx(t, p);
  if (i < 0) return;
  const trab = trabajadores.find((x) => x.id === t)!;
  const he = between(48, 58);
  liquidaciones[i].horasExtraPagadas = he;
  liquidaciones[i].montoHorasExtraCLP = he * valorHoraExtra(trab.sueldoBaseCLP);
});

// ─────────────────────────────────────────────────────────────────────
// FINIQUITOS
// ─────────────────────────────────────────────────────────────────────
export const finiquitos: Finiquito[] = [];
const CAUSALES = [
  "Art. 161 · Necesidades de la empresa",
  "Art. 159 N°2 · Renuncia voluntaria",
  "Art. 159 N°4 · Vencimiento del plazo",
  "Art. 160 N°3 · No concurrencia a labores",
];
trabajadores.filter((t) => t.fechaFiniquito).forEach((t, i) => {
  const anios = Math.max(1, 2026 - Number(t.fechaIngreso.slice(0, 4)));
  const indemnizacion = t.tipoContrato === "Indefinido" ? t.sueldoBaseCLP * Math.min(anios, 11) : 0;
  const vacaciones = Math.round(t.sueldoBaseCLP * (0.3 + rng() * 0.9));
  finiquitos.push({
    id: `FIN-2026-${String(i + 1).padStart(4, "0")}`,
    trabajadorId: t.id,
    fecha: t.fechaFiniquito!,
    causal: pick(CAUSALES),
    indemnizacionCLP: indemnizacion,
    vacacionesProporcionalesCLP: vacaciones,
    totalCLP: indemnizacion + vacaciones,
  });
});

// 🚨 HALLAZGO #4: 3 liquidaciones pagadas DESPUÉS del finiquito
const PAGO_POST_FINIQUITO = finiquitos.slice(0, 3);
PAGO_POST_FINIQUITO.forEach((f) => {
  const trab = trabajadores.find((t) => t.id === f.trabajadorId)!;
  const mesFin = f.fecha.slice(0, 7);
  const idxPeriodo = PERIODOS.indexOf(mesFin);
  const periodoPost = PERIODOS[Math.min(idxPeriodo + 1, PERIODOS.length - 1)];
  if (periodoPost === mesFin) return;
  const [y, m] = periodoPost.split("-").map(Number);
  liquidaciones.push({
    id: `LIQ-${periodoPost}-${String(_liqId++).padStart(5, "0")}`,
    trabajadorId: trab.id,
    periodo: periodoPost,
    fechaPago: iso(new Date(y, m - 1, 30)),
    sueldoBaseCLP: trab.sueldoBaseCLP,
    horasExtraPagadas: 0,
    montoHorasExtraCLP: 0,
    bonos: [{ tipo: OP.bonoPrincipal, montoCLP: 250_000 }],
    descuentosCLP: Math.round(trab.sueldoBaseCLP * 0.2),
    liquidoCLP: Math.round(trab.sueldoBaseCLP * 0.8) + 250_000,
  });
});

// ─────────────────────────────────────────────────────────────────────
// DETECCIÓN DE HALLAZGOS
// ─────────────────────────────────────────────────────────────────────
const trabById = new Map(trabajadores.map((t) => [t.id, t]));

export const detectarHallazgos = () => {
  const horasPorTrabPeriodo = new Map<string, number>();
  turnos.forEach((t) => {
    const key = `${t.trabajadorId}|${t.fecha.slice(0, 7)}`;
    horasPorTrabPeriodo.set(key, (horasPorTrabPeriodo.get(key) || 0) + t.horas);
  });

  // #1 Horas extra > horas registradas
  const heImposibles = liquidaciones
    .filter((l) => {
      if (l.horasExtraPagadas === 0) return false;
      const horas = horasPorTrabPeriodo.get(`${l.trabajadorId}|${l.periodo}`) || 0;
      return l.horasExtraPagadas > horas * 0.3 + 5;
    })
    .map((l) => ({
      liquidacion: l.id, periodo: l.periodo,
      trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
      cargo: trabById.get(l.trabajadorId)?.cargo,
      base: trabById.get(l.trabajadorId)?.base,
      horasExtraPagadas: l.horasExtraPagadas,
      horasRegistradas: horasPorTrabPeriodo.get(`${l.trabajadorId}|${l.periodo}`) || 0,
      montoCLP: l.montoHorasExtraCLP,
    }));

  // #2 Bono duplicado en el mismo período
  const bonoDuplicado = liquidaciones
    .map((l) => {
      const conteo = new Map<string, { n: number; monto: number }>();
      l.bonos.forEach((b) => {
        const c = conteo.get(b.tipo) || { n: 0, monto: 0 };
        conteo.set(b.tipo, { n: c.n + 1, monto: c.monto + b.montoCLP });
      });
      const dup = [...conteo.entries()].find(([, v]) => v.n > 1);
      if (!dup) return null;
      return {
        liquidacion: l.id, periodo: l.periodo,
        trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
        bono: dup[0], veces: dup[1].n, montoDuplicadoCLP: Math.round(dup[1].monto / dup[1].n),
      };
    })
    .filter(Boolean) as any[];

  // #3 Liquidación sin turnos
  const finiquitoPorTrabPrev = new Map(finiquitos.map((f) => [f.trabajadorId, f]));
  const sinTurnos = liquidaciones
    .filter((l) => {
      if ((horasPorTrabPeriodo.get(`${l.trabajadorId}|${l.periodo}`) || 0) !== 0) return false;
      const f = finiquitoPorTrabPrev.get(l.trabajadorId);
      return !(f && l.periodo > f.fecha.slice(0, 7)); // esos se reportan como pago post-finiquito
    })
    .map((l) => ({
      liquidacion: l.id, periodo: l.periodo,
      trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
      cargo: trabById.get(l.trabajadorId)?.cargo,
      base: trabById.get(l.trabajadorId)?.base,
      liquidoCLP: l.liquidoCLP,
    }));

  // #4 Liquidación posterior al finiquito
  const finiquitoPorTrab = new Map(finiquitos.map((f) => [f.trabajadorId, f]));
  const postFiniquito = liquidaciones
    .filter((l) => {
      const f = finiquitoPorTrab.get(l.trabajadorId);
      return !!f && l.periodo > f.fecha.slice(0, 7);
    })
    .map((l) => ({
      liquidacion: l.id, periodo: l.periodo,
      trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
      fechaFiniquito: finiquitoPorTrab.get(l.trabajadorId)!.fecha,
      liquidoCLP: l.liquidoCLP,
    }));

  // #5 Bono de dotación completa en faenas bajo dotación mínima
  const faenasBajoDotacion = turnos.filter((t) => t.tipo === "Faena" && t.dotacionFaena < t.dotacionMinima);
  const trabsBajoDotacion = new Set(faenasBajoDotacion.map((t) => `${t.trabajadorId}|${t.fecha.slice(0, 7)}`));
  const bonoDotacionIndebido = liquidaciones
    .filter((l) =>
      trabsBajoDotacion.has(`${l.trabajadorId}|${l.periodo}`) &&
      l.bonos.some((b) => b.tipo === OP.bonoDotacionCompleta))
    .map((l) => ({
      liquidacion: l.id, periodo: l.periodo,
      trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
      montoBonoCLP: l.bonos.filter((b) => b.tipo === OP.bonoDotacionCompleta).reduce((a, b) => a + b.montoCLP, 0),
    }));

  // #6 Sobre tope legal de horas extra
  const idsHeImposibles = new Set(heImposibles.map((x) => x.liquidacion));
  const sobreTope = liquidaciones
    .filter((l) => l.horasExtraPagadas > TOPE_LEGAL_HORAS && !idsHeImposibles.has(l.id))
    .map((l) => ({
      liquidacion: l.id, periodo: l.periodo,
      trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
      horasExtra: l.horasExtraPagadas, topeLegal: TOPE_LEGAL_HORAS, montoCLP: l.montoHorasExtraCLP,
    }));

  // #7 Guardias > 16 horas continuas
  const guardiasLargas = turnos
    .filter((t) => t.horas > 16)
    .map((t) => ({
      turno: t.id, fecha: t.fecha, activo: t.activo, base: t.base, horas: t.horas,
      trabajador: trabById.get(t.trabajadorId)?.nombre || t.trabajadorId,
      cargo: trabById.get(t.trabajadorId)?.cargo,
    }));

  // #8 Cuentas bancarias compartidas
  const porCuenta = new Map<string, Trabajador[]>();
  trabajadores.forEach((t) => {
    const key = `${t.banco}|${t.cuentaBanco}`;
    const arr = porCuenta.get(key);
    if (arr) arr.push(t); else porCuenta.set(key, [t]);
  });
  const cuentasCompartidas = [...porCuenta.entries()]
    .filter(([, arr]) => arr.length > 1)
    .map(([key, arr]) => ({
      banco: key.split("|")[0], cuenta: key.split("|")[1],
      trabajadores: arr.map((t) => ({ id: t.id, nombre: t.nombre, cargo: t.cargo, base: t.base })),
    }));

  // #9 Bonos fuera de convenio
  const fueraConvenio = liquidaciones
    .flatMap((l) => l.bonos
      .filter((b) => !BONOS_CONVENIO.includes(b.tipo))
      .map((b) => ({
        liquidacion: l.id, periodo: l.periodo,
        trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
        convenio: trabById.get(l.trabajadorId)?.convenio,
        bono: b.tipo, montoCLP: b.montoCLP,
      })));

  // #10 Saltos de líquido sobre la media del cargo
  const mediaPorCargo = new Map<string, { suma: number; n: number }>();
  liquidaciones.forEach((l) => {
    const cargo = trabById.get(l.trabajadorId)?.cargo || "—";
    const m = mediaPorCargo.get(cargo) || { suma: 0, n: 0 };
    mediaPorCargo.set(cargo, { suma: m.suma + l.liquidoCLP, n: m.n + 1 });
  });
  const saltos = liquidaciones
    .filter((l) => {
      const cargo = trabById.get(l.trabajadorId)?.cargo || "—";
      const m = mediaPorCargo.get(cargo)!;
      return l.liquidoCLP > (m.suma / m.n) * 1.4;
    })
    .slice(0, 25)
    .map((l) => {
      const cargo = trabById.get(l.trabajadorId)?.cargo || "—";
      const m = mediaPorCargo.get(cargo)!;
      return {
        liquidacion: l.id, periodo: l.periodo,
        trabajador: trabById.get(l.trabajadorId)?.nombre || l.trabajadorId,
        cargo, liquidoCLP: l.liquidoCLP, mediaCargoCLP: Math.round(m.suma / m.n),
      };
    });

  return {
    heImposibles: { cantidad: heImposibles.length, montoTotal: heImposibles.reduce((a, x) => a + x.montoCLP, 0), casos: heImposibles },
    bonoDuplicado: { cantidad: bonoDuplicado.length, montoTotal: bonoDuplicado.reduce((a, x) => a + x.montoDuplicadoCLP, 0), casos: bonoDuplicado },
    sinTurnos: { cantidad: sinTurnos.length, montoTotal: sinTurnos.reduce((a, x) => a + x.liquidoCLP, 0), casos: sinTurnos },
    postFiniquito: { cantidad: postFiniquito.length, montoTotal: postFiniquito.reduce((a, x) => a + x.liquidoCLP, 0), casos: postFiniquito },
    bonoDotacionIndebido: { cantidad: bonoDotacionIndebido.length, montoTotal: bonoDotacionIndebido.reduce((a, x) => a + x.montoBonoCLP, 0), casos: bonoDotacionIndebido },
    sobreTope: { cantidad: sobreTope.length, montoTotal: sobreTope.reduce((a, x) => a + x.montoCLP, 0), casos: sobreTope.slice(0, 20) },
    guardiasLargas: { cantidad: guardiasLargas.length, casos: guardiasLargas.slice(0, 20) },
    cuentasCompartidas: { cantidad: cuentasCompartidas.length, casos: cuentasCompartidas },
    fueraConvenio: { cantidad: fueraConvenio.length, montoTotal: fueraConvenio.reduce((a, x) => a + x.montoCLP, 0), casos: fueraConvenio },
    saltosLiquido: { cantidad: saltos.length, casos: saltos.slice(0, 12) },
  };
};

// ─────────────────────────────────────────────────────────────────────
// CONTEXTO COMPACTO PARA AUDITIA
// ─────────────────────────────────────────────────────────────────────
export const buildRemuneracionesContext = () => {
  const h = detectarHallazgos();
  const masaSalarial = liquidaciones.reduce((a, l) => a + l.liquidoCLP, 0);
  return {
    empresa: {
      nombre: PACK.cliente,
      sector: PACK.sector,
      sedes: BASES,
      activos: { etiqueta: OP.etiquetaActivo, cantidad: ACTIVOS.length },
      trabajadores: trabajadores.length,
      dotacionOperativa: trabajadores.filter((t) => t.embarcado).length,
      personalAdministrativo: trabajadores.filter((t) => !t.embarcado).length,
      turnosRegistrados: turnos.length,
      liquidaciones: liquidaciones.length,
      finiquitos: finiquitos.length,
      periodo: "Oct 2025 – Mar 2026",
      masaSalarialPeriodoCLP: masaSalarial,
      convenios: OP.convenios,
      bonosPermitidosConvenio: BONOS_CONVENIO,
      topeLegalHorasExtraMes: TOPE_LEGAL_HORAS,
    },
    hallazgos: h,
    momentoAnalisis: "26-may-2026 13:00",
    notaImportante:
      "La masa salarial del período supera CLP " + Math.round(masaSalarial / 1_000_000_000) + ".000 millones. " +
      "Una auditoría tradicional de remuneraciones revisa una muestra de 30 a 50 liquidaciones sobre " +
      liquidaciones.length + ". AuditIA cruza el 100% de las liquidaciones contra la bitácora de turnos " +
      `por ${OP.etiquetaActivo.toLowerCase()}, el convenio colectivo vigente y los finiquitos del período: cada hora extra pagada ` +
      "contra las horas efectivamente registradas, cada bono contra el convenio que lo autoriza, y cada " +
      "liquidación contra la vigencia del contrato.",
  };
};
