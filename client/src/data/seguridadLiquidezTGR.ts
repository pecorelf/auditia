// Riesgos transversales de Tesorería — los dos del mapa que no se detectan
// cruzando transacciones y por eso van en un módulo aparte:
//
//   A. Ciberataques a plataformas de pago  → sí da hallazgos, pero sobre eventos
//      de seguridad (autenticación, sesiones, configuración), no sobre pagos.
//   B. Pérdida de liquidez operativa       → NO es detección. Es proyección de
//      caja. Se muestra como tal y nunca como "hallazgo".
//
// El módulo de seguridad se cruza con la cadena del espacio principal: el mismo
// funcionario que registró el pago y alzó el embargo aparece accediendo fuera de
// horario en esas fechas. Ese cruce es lo que justifica que el módulo exista.
//
// DATOS SINTÉTICOS. Nada corresponde a sistemas, personas o eventos reales.

import { funcionarios, cadena, detectarHallazgos } from "./procesosTGR";

// ─────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────

export type EventoSeguridad = {
  id: string;
  fecha: string;
  hora: string;
  sistema: string;
  tipo: "Autenticación fallida" | "Sesión iniciada" | "Cambio de configuración" | "Consulta masiva";
  usuario: string;
  origen: string;
  ubicacion: string;
  dentroDeRed: boolean;
  dentroDeHorario: boolean;
};

export type RafagaAutenticacion = {
  id: string;
  fecha: string;
  ventanaMinutos: number;
  intentos: number;
  cuentasProbadas: number;
  origenes: number;
  pais: string;
  sistema: string;
  bloqueada: boolean;
};

export type SesionConcurrente = {
  usuario: string;
  cargo: string;
  fecha: string;
  sesionA: { hora: string; ubicacion: string; ip: string };
  sesionB: { hora: string; ubicacion: string; ip: string };
  minutosEntre: number;
};

export type CambioConfiguracion = {
  id: string;
  fecha: string;
  hora: string;
  componente: string;
  cambio: string;
  usuario: string;
  dentroDeVentana: boolean;
  conTicket: boolean;
};

export type PuntoLiquidez = {
  dia: number;
  fecha: string;
  etiqueta: string;
  saldoBaseCLP: number;
  saldoAdversoCLP: number;
};

// ─────────────────────────────────────────────────────────────────────
// SEED Y FECHAS
// ─────────────────────────────────────────────────────────────────────
let _seed = 20261009;
const rng = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };
const pick = <T,>(a: T[]): T => a[Math.floor(rng() * a.length)];
const entre = (a: number, b: number) => Math.floor(a + rng() * (b - a));
const HOY = new Date();
const iso = (d: Date) => d.toISOString().split("T")[0];
const masDias = (base: Date | string, d: number) =>
  iso(new Date((typeof base === "string" ? new Date(base) : base).getTime() + d * 86400000));

const SISTEMAS_EXPUESTOS = [
  "Portal de pago de contribuyentes", "Pasarela de recaudación",
  "Portal de convenios de pago", "Servicio de consulta de deuda",
];
const PAISES_EXTERNOS = ["Federación Rusa", "Países Bajos", "Brasil", "Estados Unidos", "Vietnam", "Indonesia"];
const COMPONENTES = [
  "Pasarela de pago — reglas de validación", "Portal de contribuyentes — control de sesión",
  "Servicio de conciliación — endpoint de carga", "Firewall de aplicación — lista de excepciones",
  "Integración bancaria — certificado de canal",
];

// ─────────────────────────────────────────────────────────────────────
// A. SEGURIDAD DE PLATAFORMAS DE PAGO
// ─────────────────────────────────────────────────────────────────────

// 🚨 SEG-01: ráfagas de autenticación fallida (enumeración de cuentas)
export const rafagas: RafagaAutenticacion[] = [];
for (let i = 0; i < 7; i++) {
  const intentos = entre(4_200, 38_000);
  rafagas.push({
    id: `RAF-${String(i + 1).padStart(3, "0")}`,
    fecha: masDias(HOY, -entre(2, 110)),
    ventanaMinutos: entre(4, 40),
    intentos,
    cuentasProbadas: Math.round(intentos * (0.7 + rng() * 0.25)),
    origenes: entre(40, 900),
    pais: pick(PAISES_EXTERNOS),
    sistema: pick(SISTEMAS_EXPUESTOS),
    bloqueada: rng() < 0.45,
  });
}
rafagas.sort((a, b) => b.intentos - a.intentos);

// 🚨 SEG-02: sesiones simultáneas desde ubicaciones incompatibles
export const sesionesConcurrentes: SesionConcurrente[] = [];
const UBICACIONES_PAR: [string, string][] = [
  ["Santiago, Chile", "Kyiv, Ucrania"],
  ["Valparaíso, Chile", "Lagos, Nigeria"],
  ["Concepción, Chile", "Ciudad de Panamá, Panamá"],
  ["Santiago, Chile", "Bucarest, Rumania"],
];
UBICACIONES_PAR.forEach(([a, b], k) => {
  const f = funcionarios[18 + k * 23];
  const hora = entre(1, 5);
  sesionesConcurrentes.push({
    usuario: f.nombre,
    cargo: f.cargo,
    fecha: masDias(HOY, -entre(5, 95)),
    sesionA: { hora: `${String(hora).padStart(2, "0")}:${String(entre(10, 58)).padStart(2, "0")}`, ubicacion: a, ip: `190.${entre(1, 250)}.${entre(1, 250)}.${entre(1, 250)}` },
    sesionB: { hora: `${String(hora).padStart(2, "0")}:${String(entre(10, 58)).padStart(2, "0")}`, ubicacion: b, ip: `${entre(5, 200)}.${entre(1, 250)}.${entre(1, 250)}.${entre(1, 250)}` },
    minutosEntre: entre(1, 12),
  });
});

// 🚨 SEG-03: cambios de configuración fuera de ventana autorizada
export const cambiosConfig: CambioConfiguracion[] = [];
const CAMBIOS = [
  "Se desactivó el límite de intentos por cuenta",
  "Se amplió la lista de IP exceptuadas del filtro",
  "Se deshabilitó el registro detallado de la pasarela",
  "Se extendió la vigencia de sesión a 12 horas",
  "Se agregó un endpoint de carga sin autenticación mutua",
  "Se renovó el certificado del canal fuera de procedimiento",
];
CAMBIOS.forEach((cambio, k) => {
  const f = funcionarios[30 + k * 17];
  cambiosConfig.push({
    id: `CFG-${String(k + 1).padStart(3, "0")}`,
    fecha: masDias(HOY, -entre(8, 120)),
    hora: `${String(entre(21, 23)).padStart(2, "0")}:${String(entre(5, 58)).padStart(2, "0")}`,
    componente: COMPONENTES[k % COMPONENTES.length],
    cambio,
    usuario: f.nombre,
    dentroDeVentana: false,
    conTicket: rng() < 0.3,
  });
});

// 🚨 SEG-04: accesos fuera de horario y fuera de la red institucional
//
// Acá está el cruce con la cadena: el mismo funcionario que registró el pago y
// alzó el embargo accede de madrugada, desde fuera de la red, en esas fechas.
export const eventos: EventoSeguridad[] = [];
let _evId = 1;

const nuevoEvento = (o: Partial<EventoSeguridad> & { fecha: string; usuario: string }): EventoSeguridad => ({
  id: `EV-${String(_evId++).padStart(5, "0")}`,
  hora: o.hora || `${String(entre(9, 18)).padStart(2, "0")}:${String(entre(0, 59)).padStart(2, "0")}`,
  sistema: o.sistema || pick(["Sistema de Recaudación", "Sistema de Cobranza", "Sistema de Tesorería"]),
  tipo: o.tipo || "Sesión iniciada",
  origen: o.origen || `10.20.${entre(1, 250)}.${entre(1, 250)}`,
  ubicacion: o.ubicacion || "Red institucional",
  dentroDeRed: o.dentroDeRed ?? true,
  dentroDeHorario: o.dentroDeHorario ?? true,
  ...o,
} as EventoSeguridad);

// Ruido de fondo legítimo
for (let i = 0; i < 1800; i++) {
  eventos.push(nuevoEvento({
    fecha: masDias(HOY, -entre(0, 120)),
    usuario: pick(funcionarios).nombre,
  }));
}

// El cruce con la cadena
export const accesosDeLaCadena: EventoSeguridad[] = [];
if (cadena.length > 0) {
  const nombre = cadena[0].funcionario;
  cadena.forEach((c) => {
    [c.paso1.fecha, c.paso3.fecha].forEach((fecha) => {
      const ev = nuevoEvento({
        fecha,
        usuario: nombre,
        hora: `0${entre(1, 4)}:${String(entre(10, 58)).padStart(2, "0")}`,
        sistema: "Sistema de Recaudación",
        tipo: "Sesión iniciada",
        origen: `186.${entre(1, 250)}.${entre(1, 250)}.${entre(1, 250)}`,
        ubicacion: "Conexión residencial — fuera de la red",
        dentroDeRed: false,
        dentroDeHorario: false,
      });
      eventos.push(ev);
      accesosDeLaCadena.push(ev);
    });
  });
}

// Otros accesos fuera de horario, no asociados a la cadena
for (let i = 0; i < 24; i++) {
  eventos.push(nuevoEvento({
    fecha: masDias(HOY, -entre(1, 120)),
    usuario: pick(funcionarios).nombre,
    hora: `0${entre(0, 5)}:${String(entre(0, 59)).padStart(2, "0")}`,
    origen: `201.${entre(1, 250)}.${entre(1, 250)}.${entre(1, 250)}`,
    ubicacion: "Fuera de la red institucional",
    dentroDeRed: false,
    dentroDeHorario: false,
  }));
}

export const detectarSeguridad = () => {
  const fueraDeHorario = eventos.filter((e) => !e.dentroDeHorario && !e.dentroDeRed);
  const nombreCadena = cadena.length ? cadena[0].funcionario : null;

  return {
    rafagas: {
      cantidad: rafagas.length,
      intentosTotal: rafagas.reduce((a, r) => a + r.intentos, 0),
      sinBloquear: rafagas.filter((r) => !r.bloqueada).length,
      casos: rafagas,
    },
    sesionesConcurrentes: { cantidad: sesionesConcurrentes.length, casos: sesionesConcurrentes },
    cambiosConfig: {
      cantidad: cambiosConfig.length,
      sinTicket: cambiosConfig.filter((c) => !c.conTicket).length,
      casos: cambiosConfig,
    },
    accesosFueraDeHorario: {
      cantidad: fueraDeHorario.length,
      casos: fueraDeHorario.slice(0, 20),
      /** Los que coinciden con las fechas de la cadena — el cruce que importa. */
      coincidenConLaCadena: {
        funcionario: nombreCadena,
        cantidad: accesosDeLaCadena.length,
        casos: accesosDeLaCadena,
      },
    },
  };
};

// ─────────────────────────────────────────────────────────────────────
// B. LIQUIDEZ OPERATIVA — proyección, no detección
// ─────────────────────────────────────────────────────────────────────
//
// No hay "hallazgos" acá. Hay una proyección de caja a 90 días con dos
// escenarios, y un piso operativo. Lo que la conecta con la auditoría es que el
// escenario adverso incorpora lo que los otros módulos ya detectaron: la
// recaudación que no ingresó y la cartera que prescribe sin gestión.

/** Piso bajo el cual la operación no puede cubrir sus compromisos del mes. */
export const PISO_OPERATIVO_CLP = 420_000_000_000;

const SALDO_INICIAL_CLP = 640_000_000_000;

/**
 * Qué mueve el escenario adverso.
 *
 * NO son los montos de los hallazgos: suman millones frente a una caja de
 * cientos de miles de millones, y fingir que la mueven sería deshonesto.
 *
 * Lo que sí la mueve es el otro riesgo transversal de esta misma pantalla. La
 * recaudación se concentra en una ventana de pocos días al mes. Si la plataforma
 * de pago queda fuera de servicio durante esa ventana — que es exactamente el
 * objetivo de un ataque de denegación — el ingreso del mes no entra a tiempo.
 * Ahí los dos riesgos transversales dejan de ser temas separados.
 */
export const SUPUESTO_ADVERSO =
  "Plataforma de pago indisponible durante la ventana de recaudación del mes, " +
  "con recuperación parcial y diferida del ingreso";

/** Porción del ingreso del pico que no entra a tiempo en el escenario adverso. */
const PERDIDA_DEL_PICO = 0.72;

export const proyeccion: PuntoLiquidez[] = [];

const h = detectarHallazgos();
/** Monto que los otros módulos ya detectaron como no ingresado. Contexto, no driver. */
export const YA_DETECTADO_NO_INGRESADO_CLP =
  h.sinRegistro.montoTotal + h.lotesNoIngresados.montoTotal;

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

let saldoBase = SALDO_INICIAL_CLP;
let saldoAdverso = SALDO_INICIAL_CLP;
let picosVistos = 0;

for (let d = 0; d <= 90; d += 5) {
  const fecha = masDias(HOY, d);
  const f = new Date(fecha);

  // Los ingresos por recaudación se concentran alrededor del día 20 de cada mes
  const diaMes = f.getUTCDate();
  const pico = diaMes >= 18 && diaMes <= 24;
  if (pico) picosVistos++;
  const ingreso = pico ? entre(150_000_000_000, 190_000_000_000) : entre(12_000_000_000, 26_000_000_000);
  const egreso = entre(44_000_000_000, 58_000_000_000);

  saldoBase = saldoBase + ingreso - egreso;

  // En el escenario adverso el primer pico se pierde casi completo y los
  // siguientes se recuperan solo en parte.
  const factor = pico ? (picosVistos === 1 ? 1 - PERDIDA_DEL_PICO : 0.82) : 0.95;
  saldoAdverso = saldoAdverso + ingreso * factor - egreso;

  proyeccion.push({
    dia: d,
    fecha,
    etiqueta: `${f.getUTCDate()} ${MESES[f.getUTCMonth()]}`,
    saldoBaseCLP: Math.round(saldoBase),
    saldoAdversoCLP: Math.round(saldoAdverso),
  });
}

/** Primer punto en que el escenario adverso perfora el piso operativo. */
export const cruceDelPiso = proyeccion.find((p) => p.saldoAdversoCLP < PISO_OPERATIVO_CLP) || null;

/** Días de cobertura del saldo actual al ritmo de egreso, sin ingresos nuevos. */
export const diasDeCobertura = Math.round(SALDO_INICIAL_CLP / 10_200_000_000);
