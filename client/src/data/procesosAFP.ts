// Procesos AFP — los tres que el cliente declaró representativos de su plan de auditoría:
//   1. Pagos a clientes (giros y beneficios)
//   2. Trámites de pensión
//   3. Datos de contacto de afiliados
//
// El valor de cruzarlos: por separado cada uno da hallazgos correctos pero acotados.
// Cruzados aparece la CADENA — un mismo ejecutivo modifica el contacto del afiliado,
// después cambia su cuenta bancaria, y días más tarde autoriza un giro a esa cuenta.
// Ningún control por proceso individual la detecta.
//
// HALLAZGOS PLANTADOS (13):
//   PAGOS
//     1. Pagos duplicados al mismo afiliado (crítico)
//     2. Cambio de cuenta bancaria pocos días antes de un giro alto (crítico)
//     3. Pago ejecutado sin solicitud registrada (crítico)
//     4. Quien registró el cambio de cuenta autorizó el giro — sin segregación (crítico)
//     5. Giros a colaboradores de la AFP (alto)
//     6. Monto muy fuera del historial del afiliado (medio)
//   TRÁMITES DE PENSIÓN
//     7. Trámites resueltos fuera del plazo normativo (alto)
//     8. Expedientes aprobados sin documento obligatorio (crítico)
//     9. Trámites reprocesados tres o más veces (medio)
//   DATOS DE CONTACTO
//    10. Teléfono o email compartido por afiliados sin relación (alto)
//    11. Modificaciones sin respaldo de autorización (alto)
//    12. Concentración de modificaciones en un mismo ejecutivo (medio)
//   CRUCE DE LOS TRES
//    13. Cadena contacto → cuenta → giro por el mismo ejecutivo (crítico)

// ─────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────

export type Afiliado = {
  id: string;
  rut: string;
  nombre: string;
  fondo: "A" | "B" | "C" | "D" | "E";
  estado: "Activo" | "Pensionado" | "Cesante";
  banco: string;
  cuentaBanco: string;
  telefono: string;
  email: string;
  sucursal: string;
  esColaborador: boolean;
};

export type Ejecutivo = {
  id: string;
  nombre: string;
  rol: "Ejecutivo de sucursal" | "Ejecutivo de contact center" | "Agente previsional" | "Analista previsional";
  sucursal: string;
};

export type SolicitudGiro = {
  id: string;
  afiliadoId: string;
  tipo: string;
  montoCLP: number;
  fechaSolicitud: string;
  canal: "Sucursal" | "Web" | "Contact center" | "App";
  estado: "Aprobada" | "Rechazada" | "Pendiente";
};

export type Pago = {
  id: string;
  afiliadoId: string;
  solicitudId: string | null;
  tipo: string;
  montoCLP: number;
  fechaPago: string;
  cuentaDestino: string;
  bancoDestino: string;
  autorizadoPor: string;
};

export type TramitePension = {
  id: string;
  afiliadoId: string;
  tipo: string;
  fechaIngreso: string;
  fechaResolucion: string | null;
  diasHabiles: number;
  plazoNormativoDias: number;
  documentosRequeridos: string[];
  documentosPresentes: string[];
  vecesReprocesado: number;
  estado: "Resuelto" | "En trámite" | "Rechazado";
};

export type CambioContacto = {
  id: string;
  afiliadoId: string;
  campo: "Teléfono" | "Email" | "Dirección" | "Cuenta bancaria";
  valorAnterior: string;
  valorNuevo: string;
  fecha: string;
  ejecutivoId: string;
  canal: "Sucursal" | "Web" | "Contact center" | "App";
  conRespaldo: boolean;
};

// ─────────────────────────────────────────────────────────────────────
// SEED DETERMINISTA
// ─────────────────────────────────────────────────────────────────────
let _seed = 20260819;
const rng = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };
const pick = <T,>(a: T[]): T => a[Math.floor(rng() * a.length)];
const entre = (a: number, b: number) => Math.floor(a + rng() * (b - a));
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => d.toISOString().split("T")[0];
const masDias = (f: string, d: number) => iso(new Date(new Date(f).getTime() + d * 86400000));

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

const BANCOS = ["BancoEstado","BCI","Santander","Banco de Chile","Itaú","Scotiabank","Security","Falabella"];
const SUCURSALES = ["Santiago Centro","Providencia","Las Condes","Maipú","Ñuñoa","Valparaíso","Viña del Mar","Rancagua","Talca","Concepción","Temuco","Puerto Montt","La Serena","Antofagasta","Iquique","Arica"];

const TIPOS_GIRO = [
  "Retiro programado",
  "Renta temporal",
  "Excedente de libre disposición",
  "Cuota mortuoria",
  "Beneficio de sobrevivencia",
  "Devolución de cotizaciones",
  "Herencia de saldo",
];

const TIPOS_TRAMITE = [
  { tipo: "Pensión de vejez por edad", plazo: 30 },
  { tipo: "Pensión de vejez anticipada", plazo: 45 },
  { tipo: "Pensión de invalidez", plazo: 60 },
  { tipo: "Pensión de sobrevivencia", plazo: 30 },
  { tipo: "Bono de reconocimiento", plazo: 45 },
];

const DOCS_POR_TRAMITE: Record<string, string[]> = {
  "Pensión de vejez por edad": ["Cédula de identidad", "Certificado de nacimiento", "Selección de modalidad"],
  "Pensión de vejez anticipada": ["Cédula de identidad", "Certificado de nacimiento", "Selección de modalidad", "Certificado de saldo"],
  "Pensión de invalidez": ["Cédula de identidad", "Dictamen de la Comisión Médica", "Certificado de nacimiento", "Selección de modalidad"],
  "Pensión de sobrevivencia": ["Cédula de identidad", "Certificado de defunción", "Certificado de matrimonio o filiación", "Selección de modalidad"],
  "Bono de reconocimiento": ["Cédula de identidad", "Certificado de afiliación previsional", "Historial de cotizaciones"],
};

// ─────────────────────────────────────────────────────────────────────
// EJECUTIVOS — 85
// ─────────────────────────────────────────────────────────────────────
export const ejecutivos: Ejecutivo[] = [];
const ROLES: Ejecutivo["rol"][] = ["Ejecutivo de sucursal", "Ejecutivo de contact center", "Agente previsional", "Analista previsional"];
for (let i = 0; i < 85; i++) {
  ejecutivos.push({
    id: `EJ${String(i + 1).padStart(4, "0")}`,
    nombre: `${pick(NOMBRES)} ${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
    rol: pick(ROLES),
    sucursal: pick(SUCURSALES),
  });
}

// ─────────────────────────────────────────────────────────────────────
// AFILIADOS — 12.000
// ─────────────────────────────────────────────────────────────────────
export const afiliados: Afiliado[] = [];
const N_AFI = 12000;
const FONDOS: Afiliado["fondo"][] = ["A", "B", "C", "D", "E"];

for (let i = 0; i < N_AFI; i++) {
  const nombre = `${pick(NOMBRES)} ${pick(APELLIDOS)} ${pick(APELLIDOS)}`;
  const estadoRoll = rng();
  afiliados.push({
    id: `AF${String(i + 1).padStart(6, "0")}`,
    rut: randomRUT(),
    nombre,
    fondo: pick(FONDOS),
    estado: estadoRoll < 0.62 ? "Activo" : estadoRoll < 0.88 ? "Pensionado" : "Cesante",
    banco: pick(BANCOS),
    cuentaBanco: String(entre(10_000_000, 99_999_999)),
    telefono: `+569${entre(10_000_000, 99_999_999)}`,
    email: `${nombre.split(" ")[0].toLowerCase()}.${nombre.split(" ")[1].toLowerCase()}${entre(1, 999)}@correo.cl`,
    sucursal: pick(SUCURSALES),
    esColaborador: rng() < 0.006, // ~70 colaboradores que además son afiliados
  });
}

const afiliadoIdx = (id: string) => Number(id.slice(2)) - 1;
const afiById = new Map(afiliados.map((a) => [a.id, a]));
const ejeById = new Map(ejecutivos.map((e) => [e.id, e]));

// 🚨 HALLAZGO #10: teléfonos y emails compartidos entre afiliados sin relación
const TEL_COMPARTIDO = "+56998877665";
const EMAIL_COMPARTIDO = "gestion.previsional.ok@gmail.com";
[412, 1893, 3077, 5544, 8120, 9931].forEach((i) => { afiliados[i].telefono = TEL_COMPARTIDO; });
[733, 2410, 4901, 7318, 10502].forEach((i) => { afiliados[i].email = EMAIL_COMPARTIDO; });

// ─────────────────────────────────────────────────────────────────────
// SOLICITUDES Y PAGOS
// ─────────────────────────────────────────────────────────────────────
export const solicitudes: SolicitudGiro[] = [];
export const pagos: Pago[] = [];
let _solId = 1, _pagoId = 1;

const CANALES: SolicitudGiro["canal"][] = ["Sucursal", "Web", "Contact center", "App"];
const FECHA_BASE = "2025-10-01";

const montoTipico = (tipo: string) =>
  tipo === "Cuota mortuoria" ? entre(700_000, 1_100_000)
  : tipo === "Excedente de libre disposición" ? entre(2_000_000, 28_000_000)
  : tipo === "Herencia de saldo" ? entre(1_500_000, 22_000_000)
  : tipo === "Devolución de cotizaciones" ? entre(200_000, 3_000_000)
  : entre(280_000, 1_800_000);

for (let i = 0; i < 7400; i++) {
  const afi = afiliados[entre(0, N_AFI)];
  const tipo = pick(TIPOS_GIRO);
  const monto = montoTipico(tipo);
  const fechaSol = masDias(FECHA_BASE, entre(0, 180));
  const estado: SolicitudGiro["estado"] = rng() < 0.93 ? "Aprobada" : rng() < 0.7 ? "Rechazada" : "Pendiente";
  const sol: SolicitudGiro = {
    id: `SOL-${String(_solId++).padStart(6, "0")}`,
    afiliadoId: afi.id, tipo, montoCLP: monto,
    fechaSolicitud: fechaSol, canal: pick(CANALES), estado,
  };
  solicitudes.push(sol);

  if (estado === "Aprobada") {
    pagos.push({
      id: `PG-${String(_pagoId++).padStart(6, "0")}`,
      afiliadoId: afi.id, solicitudId: sol.id, tipo, montoCLP: monto,
      fechaPago: masDias(fechaSol, entre(2, 12)),
      cuentaDestino: afi.cuentaBanco, bancoDestino: afi.banco,
      autorizadoPor: pick(ejecutivos).id,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// CAMBIOS DE DATOS DE CONTACTO
// ─────────────────────────────────────────────────────────────────────
export const cambiosContacto: CambioContacto[] = [];
let _cbId = 1;
const CAMPOS: CambioContacto["campo"][] = ["Teléfono", "Email", "Dirección", "Cuenta bancaria"];

const nuevoCambio = (afiliadoId: string, campo: CambioContacto["campo"], fecha: string,
                     ejecutivoId: string, conRespaldo: boolean, canal?: CambioContacto["canal"]): CambioContacto => ({
  id: `CC-${String(_cbId++).padStart(6, "0")}`,
  afiliadoId, campo,
  valorAnterior: campo === "Cuenta bancaria" ? String(entre(10_000_000, 99_999_999)) : "(valor anterior)",
  valorNuevo: campo === "Cuenta bancaria" ? String(entre(10_000_000, 99_999_999)) : "(valor nuevo)",
  fecha, ejecutivoId, canal: canal || pick(CANALES), conRespaldo,
});

for (let i = 0; i < 4200; i++) {
  const afi = afiliados[entre(0, N_AFI)];
  cambiosContacto.push(
    nuevoCambio(afi.id, pick(CAMPOS), masDias(FECHA_BASE, entre(0, 180)), pick(ejecutivos).id, rng() < 0.995),
  );
}

// ─────────────────────────────────────────────────────────────────────
// TRÁMITES DE PENSIÓN
// ─────────────────────────────────────────────────────────────────────
export const tramites: TramitePension[] = [];

for (let i = 0; i < 1400; i++) {
  const afi = afiliados[entre(0, N_AFI)];
  const t = pick(TIPOS_TRAMITE);
  const requeridos = DOCS_POR_TRAMITE[t.tipo];
  const fechaIngreso = masDias(FECHA_BASE, entre(0, 165));
  const resuelto = rng() < 0.86;
  // La mayoría dentro de plazo; una cola razonable por sobre él
  const dias = rng() < 0.88 ? entre(8, t.plazo) : entre(t.plazo + 1, t.plazo + 40);
  tramites.push({
    id: `TR-${String(i + 1).padStart(5, "0")}`,
    afiliadoId: afi.id,
    tipo: t.tipo,
    fechaIngreso,
    fechaResolucion: resuelto ? masDias(fechaIngreso, dias) : null,
    diasHabiles: resuelto ? dias : entre(5, t.plazo),
    plazoNormativoDias: t.plazo,
    documentosRequeridos: requeridos,
    documentosPresentes: [...requeridos],
    vecesReprocesado: rng() < 0.96 ? entre(0, 2) : entre(3, 6),
    estado: resuelto ? "Resuelto" : rng() < 0.85 ? "En trámite" : "Rechazado",
  });
}

// 🚨 HALLAZGO #8: 9 expedientes resueltos SIN un documento obligatorio
const SIN_DOC = [40, 168, 305, 477, 622, 780, 913, 1104, 1288];
SIN_DOC.forEach((i) => {
  const t = tramites[i % tramites.length];
  t.estado = "Resuelto";
  t.fechaResolucion = t.fechaResolucion || masDias(t.fechaIngreso, 20);
  // quita un documento distinto al de identidad, para que sea claramente sustantivo
  t.documentosPresentes = t.documentosRequeridos.filter((d) => d !== t.documentosRequeridos[1]);
});

// ─────────────────────────────────────────────────────────────────────
// CASOS PLANTADOS EN PAGOS
// ─────────────────────────────────────────────────────────────────────

// 🚨 HALLAZGO #1: 6 pagos duplicados — mismo afiliado, mismo monto, días seguidos
const DUPLICADOS_IDX = [120, 640, 1180, 2050, 3310, 4720];
DUPLICADOS_IDX.forEach((i) => {
  const p = pagos[i % pagos.length];
  pagos.push({
    ...p,
    id: `PG-${String(_pagoId++).padStart(6, "0")}`,
    fechaPago: masDias(p.fechaPago, entre(1, 4)),
  });
});

// 🚨 HALLAZGO #2 y #4 y #13: la cadena completa.
// Un ejecutivo modifica el contacto, después la cuenta bancaria, y autoriza el giro.
const EJECUTIVO_CADENA = ejecutivos[17];
EJECUTIVO_CADENA.nombre = "Rodrigo Mancilla Ojeda";
EJECUTIVO_CADENA.rol = "Ejecutivo de sucursal";
EJECUTIVO_CADENA.sucursal = "Santiago Centro";

export const CADENA_CASOS: { afiliadoId: string; cambioContactoId: string; cambioCuentaId: string; pagoId: string }[] = [];

const AFILIADOS_CADENA = [2211, 4408, 6015, 7702, 9310];
AFILIADOS_CADENA.forEach((idx, k) => {
  const afi = afiliados[idx];
  afi.estado = "Pensionado";
  const fContacto = masDias(FECHA_BASE, 40 + k * 22);
  const fCuenta = masDias(fContacto, entre(1, 3));
  const fPago = masDias(fCuenta, entre(2, 6));

  const c1 = nuevoCambio(afi.id, k % 2 === 0 ? "Teléfono" : "Email", fContacto, EJECUTIVO_CADENA.id, false, "Sucursal");
  const c2 = nuevoCambio(afi.id, "Cuenta bancaria", fCuenta, EJECUTIVO_CADENA.id, false, "Sucursal");
  cambiosContacto.push(c1, c2);

  const tipo = pick(["Excedente de libre disposición", "Herencia de saldo", "Retiro programado"]);
  const monto = entre(9_000_000, 26_000_000);
  const sol: SolicitudGiro = {
    id: `SOL-${String(_solId++).padStart(6, "0")}`,
    afiliadoId: afi.id, tipo, montoCLP: monto,
    fechaSolicitud: masDias(fCuenta, 1), canal: "Sucursal", estado: "Aprobada",
  };
  solicitudes.push(sol);

  const pago: Pago = {
    id: `PG-${String(_pagoId++).padStart(6, "0")}`,
    afiliadoId: afi.id, solicitudId: sol.id, tipo, montoCLP: monto,
    fechaPago: fPago,
    cuentaDestino: c2.valorNuevo, bancoDestino: afi.banco,
    autorizadoPor: EJECUTIVO_CADENA.id,
  };
  pagos.push(pago);

  CADENA_CASOS.push({ afiliadoId: afi.id, cambioContactoId: c1.id, cambioCuentaId: c2.id, pagoId: pago.id });
});

// 🚨 HALLAZGO #3: 7 pagos ejecutados sin solicitud registrada
const SIN_SOLICITUD_IDX = [300, 900, 1500, 2400, 3600, 5100, 6300];
SIN_SOLICITUD_IDX.forEach((i) => {
  const p = pagos[i % pagos.length];
  pagos.push({
    ...p,
    id: `PG-${String(_pagoId++).padStart(6, "0")}`,
    solicitudId: null,
    montoCLP: entre(1_500_000, 7_000_000),
    fechaPago: masDias(p.fechaPago, entre(1, 20)),
  });
});

// 🚨 HALLAZGO #5: giros a colaboradores de la AFP
const colaboradores = afiliados.filter((a) => a.esColaborador).slice(0, 9);
colaboradores.forEach((afi, k) => {
  const tipo = pick(TIPOS_GIRO);
  const monto = entre(2_500_000, 12_000_000);
  const fecha = masDias(FECHA_BASE, 30 + k * 15);
  const sol: SolicitudGiro = {
    id: `SOL-${String(_solId++).padStart(6, "0")}`,
    afiliadoId: afi.id, tipo, montoCLP: monto,
    fechaSolicitud: fecha, canal: "Sucursal", estado: "Aprobada",
  };
  solicitudes.push(sol);
  pagos.push({
    id: `PG-${String(_pagoId++).padStart(6, "0")}`,
    afiliadoId: afi.id, solicitudId: sol.id, tipo, montoCLP: monto,
    fechaPago: masDias(fecha, 3),
    cuentaDestino: afi.cuentaBanco, bancoDestino: afi.banco,
    autorizadoPor: pick(ejecutivos).id,
  });
});

// 🚨 HALLAZGO #12: concentración de modificaciones en un mismo ejecutivo
const EJECUTIVO_CONCENTRA = ejecutivos[52];
EJECUTIVO_CONCENTRA.nombre = "Karla Iturra Bravo";
for (let i = 0; i < 180; i++) {
  cambiosContacto.push(
    nuevoCambio(afiliados[entre(0, N_AFI)].id, pick(CAMPOS),
      masDias(FECHA_BASE, entre(0, 180)), EJECUTIVO_CONCENTRA.id, rng() < 0.85, "Contact center"),
  );
}

// 🚨 HALLAZGO #11: modificaciones sin respaldo (además de las de la cadena)
for (let i = 0; i < 46; i++) {
  cambiosContacto.push(
    nuevoCambio(afiliados[entre(0, N_AFI)].id, pick(CAMPOS),
      masDias(FECHA_BASE, entre(0, 180)), pick(ejecutivos).id, false),
  );
}

// ─────────────────────────────────────────────────────────────────────
// DETECCIÓN
// ─────────────────────────────────────────────────────────────────────
const diasEntre = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export const detectarHallazgos = () => {
  const nombreAfi = (id: string) => afiById.get(id)?.nombre || id;
  const nombreEje = (id: string) => ejeById.get(id)?.nombre || id;

  // #1 Pagos duplicados
  const vistos = new Map<string, Pago>();
  const duplicados: any[] = [];
  pagos.forEach((p) => {
    const clave = `${p.afiliadoId}|${p.montoCLP}|${p.tipo}`;
    const previo = vistos.get(clave);
    if (previo && Math.abs(diasEntre(previo.fechaPago, p.fechaPago)) <= 7) {
      duplicados.push({
        pagoOriginal: previo.id, pagoDuplicado: p.id,
        afiliado: nombreAfi(p.afiliadoId), tipo: p.tipo,
        montoCLP: p.montoCLP, diasEntre: Math.abs(diasEntre(previo.fechaPago, p.fechaPago)),
      });
    } else vistos.set(clave, p);
  });

  // #2 Cambio de cuenta poco antes de un giro alto
  const cambiosCuenta = cambiosContacto.filter((c) => c.campo === "Cuenta bancaria");
  const cuentaAntesDeGiro: any[] = [];
  cambiosCuenta.forEach((c) => {
    pagos.forEach((p) => {
      if (p.afiliadoId !== c.afiliadoId) return;
      const d = diasEntre(c.fecha, p.fechaPago);
      if (d >= 0 && d <= 10 && p.montoCLP >= 5_000_000) {
        cuentaAntesDeGiro.push({
          afiliado: nombreAfi(p.afiliadoId), cambioId: c.id, pagoId: p.id,
          diasEntre: d, montoCLP: p.montoCLP,
          ejecutivoCambio: nombreEje(c.ejecutivoId), autorizoPago: nombreEje(p.autorizadoPor),
          conRespaldo: c.conRespaldo,
        });
      }
    });
  });

  // #3 Pagos sin solicitud
  const sinSolicitud = pagos.filter((p) => p.solicitudId === null).map((p) => ({
    pagoId: p.id, afiliado: nombreAfi(p.afiliadoId), tipo: p.tipo,
    montoCLP: p.montoCLP, fechaPago: p.fechaPago, autorizadoPor: nombreEje(p.autorizadoPor),
  }));

  // #4 Sin segregación: quien cambió la cuenta autorizó el pago
  const sinSegregacion = cuentaAntesDeGiro.filter((x) => x.ejecutivoCambio === x.autorizoPago);

  // #5 Giros a colaboradores
  const aColaboradores = pagos
    .filter((p) => afiById.get(p.afiliadoId)?.esColaborador)
    .map((p) => ({
      pagoId: p.id, afiliado: nombreAfi(p.afiliadoId), tipo: p.tipo,
      montoCLP: p.montoCLP, fechaPago: p.fechaPago, autorizadoPor: nombreEje(p.autorizadoPor),
    }));

  // #6 Monto atípico: se compara contra la mediana del MISMO tipo de giro.
  // (Comparar contra el historial del afiliado no sirve: la mayoría tiene un
  // solo giro en el período.)
  const porTipo = new Map<string, number[]>();
  pagos.forEach((p) => porTipo.set(p.tipo, [...(porTipo.get(p.tipo) || []), p.montoCLP]));
  const medianaTipo = new Map<string, number>();
  porTipo.forEach((arr, tipo) => {
    const ord = [...arr].sort((a, b) => a - b);
    medianaTipo.set(tipo, ord[Math.floor(ord.length / 2)]);
  });
  const atipicos = pagos
    .filter((p) => p.montoCLP > (medianaTipo.get(p.tipo) || 0) * 5)
    .sort((a, b) => b.montoCLP - a.montoCLP)
    .map((p) => ({
      pagoId: p.id, afiliado: nombreAfi(p.afiliadoId), tipo: p.tipo,
      montoCLP: p.montoCLP, medianaTipoCLP: medianaTipo.get(p.tipo) || 0,
      autorizadoPor: nombreEje(p.autorizadoPor),
    }));

  // #7 Fuera de plazo normativo
  const fueraPlazo = tramites
    .filter((t) => t.estado === "Resuelto" && t.diasHabiles > t.plazoNormativoDias)
    .map((t) => ({
      tramiteId: t.id, tipo: t.tipo, afiliado: nombreAfi(t.afiliadoId),
      diasHabiles: t.diasHabiles, plazoNormativoDias: t.plazoNormativoDias,
      excesoDias: t.diasHabiles - t.plazoNormativoDias,
    }));

  // #8 Resueltos sin documento obligatorio
  const sinDocumento = tramites
    .filter((t) => t.estado === "Resuelto" && t.documentosPresentes.length < t.documentosRequeridos.length)
    .map((t) => ({
      tramiteId: t.id, tipo: t.tipo, afiliado: nombreAfi(t.afiliadoId),
      faltantes: t.documentosRequeridos.filter((d) => !t.documentosPresentes.includes(d)),
      fechaResolucion: t.fechaResolucion,
    }));

  // #9 Reprocesados
  const reprocesados = tramites
    .filter((t) => t.vecesReprocesado >= 3)
    .map((t) => ({ tramiteId: t.id, tipo: t.tipo, afiliado: nombreAfi(t.afiliadoId), veces: t.vecesReprocesado }));

  // #10 Contacto compartido
  const porTelefono = new Map<string, Afiliado[]>();
  const porEmail = new Map<string, Afiliado[]>();
  afiliados.forEach((a) => {
    porTelefono.set(a.telefono, [...(porTelefono.get(a.telefono) || []), a]);
    porEmail.set(a.email, [...(porEmail.get(a.email) || []), a]);
  });
  const contactoCompartido = [
    ...[...porTelefono.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => ({ campo: "Teléfono", valor: k, afiliados: v.map((a) => ({ id: a.id, nombre: a.nombre, sucursal: a.sucursal })) })),
    ...[...porEmail.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => ({ campo: "Email", valor: k, afiliados: v.map((a) => ({ id: a.id, nombre: a.nombre, sucursal: a.sucursal })) })),
  ];

  // #11 Sin respaldo de autorización
  const sinRespaldo = cambiosContacto.filter((c) => !c.conRespaldo).map((c) => ({
    cambioId: c.id, afiliado: nombreAfi(c.afiliadoId), campo: c.campo,
    fecha: c.fecha, ejecutivo: nombreEje(c.ejecutivoId), canal: c.canal,
  }));

  // #12 Concentración por ejecutivo
  const porEjecutivo = new Map<string, number>();
  cambiosContacto.forEach((c) => porEjecutivo.set(c.ejecutivoId, (porEjecutivo.get(c.ejecutivoId) || 0) + 1));
  const mediaCambios = cambiosContacto.length / ejecutivos.length;
  const concentracion = [...porEjecutivo.entries()]
    .filter(([, n]) => n > mediaCambios * 3)
    .map(([id, n]) => ({
      ejecutivo: nombreEje(id), rol: ejeById.get(id)?.rol,
      modificaciones: n, mediaEquipo: Math.round(mediaCambios),
    }));

  // #13 LA CADENA: contacto → cuenta → giro, mismo ejecutivo
  const cadena = CADENA_CASOS.map((c) => {
    const cc = cambiosContacto.find((x) => x.id === c.cambioContactoId)!;
    const cb = cambiosContacto.find((x) => x.id === c.cambioCuentaId)!;
    const pg = pagos.find((x) => x.id === c.pagoId)!;
    return {
      afiliado: nombreAfi(c.afiliadoId),
      ejecutivo: nombreEje(cc.ejecutivoId),
      paso1: { que: `Cambio de ${cc.campo.toLowerCase()}`, fecha: cc.fecha, conRespaldo: cc.conRespaldo },
      paso2: { que: "Cambio de cuenta bancaria", fecha: cb.fecha, diasDespues: diasEntre(cc.fecha, cb.fecha), conRespaldo: cb.conRespaldo },
      paso3: { que: `Giro de ${pg.tipo}`, fecha: pg.fechaPago, diasDespues: diasEntre(cb.fecha, pg.fechaPago), montoCLP: pg.montoCLP, autorizadoPor: nombreEje(pg.autorizadoPor) },
      montoCLP: pg.montoCLP,
    };
  });

  return {
    duplicados: { cantidad: duplicados.length, montoTotal: duplicados.reduce((a, x) => a + x.montoCLP, 0), casos: duplicados },
    cuentaAntesDeGiro: { cantidad: cuentaAntesDeGiro.length, montoTotal: cuentaAntesDeGiro.reduce((a, x) => a + x.montoCLP, 0), casos: cuentaAntesDeGiro.slice(0, 20) },
    sinSolicitud: { cantidad: sinSolicitud.length, montoTotal: sinSolicitud.reduce((a, x) => a + x.montoCLP, 0), casos: sinSolicitud },
    sinSegregacion: { cantidad: sinSegregacion.length, montoTotal: sinSegregacion.reduce((a, x) => a + x.montoCLP, 0), casos: sinSegregacion },
    aColaboradores: { cantidad: aColaboradores.length, montoTotal: aColaboradores.reduce((a, x) => a + x.montoCLP, 0), casos: aColaboradores },
    montosAtipicos: { cantidad: atipicos.length, casos: atipicos.slice(0, 12) },
    fueraPlazo: { cantidad: fueraPlazo.length, casos: fueraPlazo.slice(0, 20) },
    sinDocumento: { cantidad: sinDocumento.length, casos: sinDocumento },
    reprocesados: { cantidad: reprocesados.length, casos: reprocesados.slice(0, 15) },
    contactoCompartido: { cantidad: contactoCompartido.length, casos: contactoCompartido },
    sinRespaldo: { cantidad: sinRespaldo.length, casos: sinRespaldo.slice(0, 20) },
    concentracion: { cantidad: concentracion.length, casos: concentracion },
    cadena: { cantidad: cadena.length, montoTotal: cadena.reduce((a, x) => a + x.montoCLP, 0), casos: cadena },
  };
};

// ─────────────────────────────────────────────────────────────────────
// CONTEXTO PARA AUDITIA
// ─────────────────────────────────────────────────────────────────────
export const buildProcesosAFPContext = () => {
  const h = detectarHallazgos();
  const montoTotalPagos = pagos.reduce((a, p) => a + p.montoCLP, 0);
  return {
    empresa: {
      sector: "Previsional · Administradora de Fondos de Pensiones",
      afiliados: afiliados.length,
      ejecutivos: ejecutivos.length,
      solicitudes: solicitudes.length,
      pagos: pagos.length,
      tramitesPension: tramites.length,
      cambiosDeContacto: cambiosContacto.length,
      periodo: "Oct 2025 – Mar 2026",
      montoTotalPagadoCLP: montoTotalPagos,
    },
    procesosAuditados: [
      "Pagos a clientes — duplicidad, movimientos inusuales, cambios de cuenta corriente, pagos vs. solicitudes, pagos a colaboradores y mecanismo de autorización de giros",
      "Trámites de pensión — cumplimiento de plazos, completitud de requisitos y cumplimiento normativo",
      "Datos de contacto de clientes — datos compartidos entre afiliados, respaldo de autorización y origen de la modificación",
    ],
    hallazgos: h,
    momentoAnalisis: "19-ago-2026 09:00",
    notaImportante:
      "Estos son los TRES procesos que el propio cliente declaró representativos de su plan de auditoría. " +
      "El punto central de la demo: los tres se auditan hoy por separado, y por separado cada uno da " +
      "hallazgos correctos pero incompletos. Cruzados aparece la cadena — un mismo ejecutivo modifica el " +
      "dato de contacto del afiliado, dos días después cambia su cuenta bancaria, y días más tarde " +
      "autoriza el giro a esa cuenta nueva. Ningún control por proceso individual la detecta, porque " +
      "cada paso por sí solo es una transacción legítima. Son " + h.cadena.cantidad + " casos por CLP " +
      Math.round(h.cadena.montoTotal / 1_000_000) + " millones.",
  };
};
