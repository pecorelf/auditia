// Gastos, Rendiciones y Traslados — vocabulario según el pack de industria activo.
// Operador de remolcadores portuarios con bases de Arica a Punta Arenas.
//
// El caso combina 6 fuentes de datos (estructuradas + NO estructuradas):
//   1. Maestro de vehículos (flota propia)
//   2. Personal operativo (marineros, contramaestres, choferes, supervisor de faenaes)
//   3. Viajes registrados con GPS (fecha, ruta declarada, ruta GPS, distancia, tiempo)
//   4. Cargas de combustible (litros, monto, estación)
//   5. Rendiciones de viáticos (viaje, ítems, montos, ciudad)
//   6. Faenas y eventos asignados (equipo enviado, presupuesto, confirmación en bitácora)
//
// HALLAZGOS PLANTADOS:
//   A. Combustible y ruta
//     1. Velocidades imposibles calculadas (>200 km/h) → fraude de tiempo
//     2. Cargas de combustible > capacidad del estanque
//     3. Descargas sospechosas de combustible (patrón de robo)
//     4. Excesos de velocidad > 150 km/h (riesgo laboral)
//   B. Viáticos y rendiciones
//     5. Viáticos rendidos sin viaje GPS asociado (persona estaba en San Antonio)
//     6. Doble cobro de viático mismo día, misma persona
//     7. Anticipos no rendidos > 60 días
//     8. Boletas de restaurante en ciudades donde el tripulante no estaba
//   C. Faenas
//     9. Doble equipo enviado al mismo evento (descoordinación entre unidades)
//     10. Faena sin confirmación en bitácora (faena asignada y costeada que nunca se registró)
//     11. Costo desproporcionado por faena (>3x el promedio del tipo)
//   D. Servicios externos
//     12. Uso de Uber Black/premium sin justificación
//     13. Uso de Uber cuando había vehículo de flota disponible en la zona
//   E. Uso de vehículos
//     14. Uso de vehículo fuera de horario laboral (fin de semana no autorizado)
//     15. Multas de tránsito no reembolsadas por el chofer responsable

import { getPackActivo } from "../packs";

const PACK = getPackActivo();
const OP = PACK.operacion;

export const ETIQUETAS_GASTOS = {
  faena: OP.etiquetaFaena,
  sedes: OP.sedes,
};

// ─────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────

export type Vehiculo = {
  id: string;
  patente: string;
  tipo: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadEstanqueLitros: number;
  rendimientoKmPorLitro: number;
  asignadoA: string | null; // ID de persona con asignación permanente, null = pool
  base: string;
  estado: "Activo" | "Mantención" | "Baja";
};

export type Persona = {
  id: string;
  rut: string;
  nombre: string;
  cargo: string;
  unidad: string;
  base: string;
};

export type Viaje = {
  id: string;
  vehiculoId: string;
  choferId: string;
  fechaInicio: string; // ISO
  fechaFin: string;    // ISO
  origen: string;
  destino: string;
  distanciaDeclaradaKm: number;   // reportada por el chofer
  distanciaGPSKm: number;         // registrada por sistema GPS de flota
  tiempoDeclaradoHoras: number;   // rendido por el chofer
  tiempoGPSHoras: number;         // según GPS
  velocidadMaximaGPS: number;     // pico registrado
  velocidadPromedioCalculadaKmH: number; // distanciaDeclaradaKm / tiempoDeclaradoHoras
  faenaId: string | null;     // vinculado a una faena
  fueraDeHorario: boolean;        // si empezó/terminó sábado o domingo sin justificación
};

export type CargaCombustible = {
  id: string;
  vehiculoId: string;
  fecha: string;
  litros: number;
  precioLitro: number;
  montoTotal: number;
  estacion: string;
  ciudad: string;
  nivelEstanqueAntesPct: number; // 0-100
  nivelEstanqueDespuesPct: number;
};

export type Viatico = {
  id: string;
  personaId: string;
  faenaId: string | null;
  fechaViaje: string;
  ciudad: string;
  concepto: "Alimentación" | "Alojamiento" | "Movilización" | "Otros" | "Anticipo";
  monto: number;
  estado: "Rendido" | "Anticipo pendiente" | "Rechazado";
  fechaRendicion: string | null;
  boletaId: string; // referencia a documento
};

export type Faena = {
  id: string;
  fecha: string;
  evento: string;
  ubicacion: string;
  unidad: string;
  equipoAsignado: string[]; // IDs de personas
  vehiculosAsignados: string[]; // IDs de vehículos
  presupuestoCLP: number;
  costoEjecutadoCLP: number;
  confirmadaEnBitacora: boolean;
  minutosEmitidos: number;
};

export type ServicioExterno = {
  id: string;
  personaId: string;
  fecha: string;
  proveedor: "Uber" | "Uber Black" | "Cabify" | "Taxi oficial" | "Rent a Car";
  origen: string;
  destino: string;
  monto: number;
  ciudad: string;
  categoria: "Estándar" | "Premium";
};

export type Multa = {
  id: string;
  vehiculoId: string;
  choferId: string;
  fecha: string;
  ubicacion: string;
  causa: "Exceso de velocidad" | "Estacionamiento" | "Cruce indebido" | "No uso de cinturón";
  montoUTM: number;
  reembolsadaPorChofer: boolean;
};

// ─────────────────────────────────────────────────────────────────────
// SEED + helpers
// ─────────────────────────────────────────────────────────────────────
let _seed = 24680;
const rng = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };
const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

const NOMBRES = ["María","Pedro","Andrea","Javier","Carolina","Rodrigo","Patricia","Felipe","Soledad","Luis","Constanza","Marcelo","Cristián","Daniela","Eduardo","Francisca","Gonzalo","Loreto","Mauricio","Pamela","Sebastián","Tamara","Víctor","Ximena","Bárbara","César","Diego","Elisa","Fabián","Gabriela","Héctor","Ivonne","Joaquín","Karla","Lautaro","Macarena","Néstor","Olga","Pablo","Raquel"];
const APELLIDOS = ["González","Soto","Vargas","Muñoz","Pino","Aravena","Reyes","Cárdenas","Vega","Henríquez","Bravo","Torres","Espinoza","Olivares","Saavedra","Lillo","Rojas","Pizarro","Maldonado","Salinas","Cisternas","Quintana","Hidalgo","Lagos","Toledo","Núñez","Vidal","Mora","Aguilar","Pacheco"];

const randomRUT = () => {
  const n = 8_000_000 + Math.floor(rng() * 12_000_000);
  const dv = pick(["0","1","2","3","4","5","6","7","8","9","K"]);
  const s = n.toString();
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}-${dv}`;
};

const randomPatente = () => {
  const letras = "BCDFGHJKLMNPRSTVWXYZ";
  const l1 = letras[Math.floor(rng() * letras.length)];
  const l2 = letras[Math.floor(rng() * letras.length)];
  const l3 = letras[Math.floor(rng() * letras.length)];
  const l4 = letras[Math.floor(rng() * letras.length)];
  const n1 = Math.floor(rng() * 10);
  const n2 = Math.floor(rng() * 10);
  return `${l1}${l2}${l3}${l4}·${n1}${n2}`;
};

// Ciudades y distancias para cálculos realistas
const RUTAS: Record<string, { destino: string; kmReal: number; horasNormal: number }[]> = {
  "San Antonio": [
    { destino: "Valparaíso", kmReal: 116, horasNormal: 1.5 },
    { destino: "San Vicente", kmReal: 500, horasNormal: 6.5 },
    { destino: "Puerto Montt", kmReal: 675, horasNormal: 8.5 },
    { destino: "La Serena", kmReal: 470, horasNormal: 6 },
    { destino: "Mejillones", kmReal: 1370, horasNormal: 17 },
    { destino: "Mejillones", kmReal: 1570, horasNormal: 19 },
    { destino: "Rancagua", kmReal: 87, horasNormal: 1.2 },
    { destino: "Talca", kmReal: 255, horasNormal: 3.5 },
    { destino: "Chillán", kmReal: 400, horasNormal: 5.2 },
    { destino: "Puerto Montt", kmReal: 1020, horasNormal: 13 },
  ],
  "Mejillones": [
    { destino: "Mejillones", kmReal: 200, horasNormal: 2.8 },
    { destino: "Iquique", kmReal: 415, horasNormal: 5.5 },
    { destino: "Copiapó", kmReal: 570, horasNormal: 7 },
    { destino: "San Antonio", kmReal: 1370, horasNormal: 17 },
  ],
  "San Vicente": [
    { destino: "Los Ángeles", kmReal: 110, horasNormal: 1.5 },
    { destino: "Chillán", kmReal: 105, horasNormal: 1.4 },
    { destino: "Puerto Montt", kmReal: 285, horasNormal: 3.8 },
    { destino: "San Antonio", kmReal: 500, horasNormal: 6.5 },
  ],
  "Valparaíso": [
    { destino: "Quintero", kmReal: 45, horasNormal: 0.8 },
    { destino: "San Antonio", kmReal: 116, horasNormal: 1.5 },
    { destino: "San Antonio", kmReal: 105, horasNormal: 1.4 },
  ],
  "Puerto Montt": [
    { destino: "Villarrica", kmReal: 90, horasNormal: 1.3 },
    { destino: "Valdivia", kmReal: 165, horasNormal: 2.2 },
    { destino: "San Vicente", kmReal: 285, horasNormal: 3.8 },
    { destino: "Osorno", kmReal: 265, horasNormal: 3.5 },
  ],
};

const FAENAS_SAAM = OP.actividades;

const ESTACIONES_COMBUSTIBLE = ["Copec", "Shell", "Petrobras", "Enex", "YPF", "Terpel"];

// Fecha inicio del período: octubre 2025 - marzo 2026 (6 meses)
const FECHA_INICIO = new Date(2025, 9, 1);
const FECHA_FIN = new Date(2026, 2, 31);
const DIAS_TOTAL = Math.floor((FECHA_FIN.getTime() - FECHA_INICIO.getTime()) / 86400000);

const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtDateTime = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");
const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3600000);

// ─────────────────────────────────────────────────────────────────────
// MAESTRO DE VEHÍCULOS (80)
// ─────────────────────────────────────────────────────────────────────
export const vehiculos: Vehiculo[] = [];

const TIPO_CONFIG: Record<Vehiculo["tipo"], { capacidad: number; rendimiento: number; marca: string[]; modelo: string[] }> = {
  "Camioneta pool":    { capacidad: 50, rendimiento: 13, marca: ["Toyota","Nissan","Hyundai"],           modelo: ["Yaris","Versa","Accent"] },
  "Camioneta 4x4":            { capacidad: 80, rendimiento: 9,  marca: ["Toyota","Nissan","Chevrolet","Mazda"], modelo: ["Hilux","Frontier","D-Max","BT-50"] },
  "Bus de relevo": { capacidad: 120,rendimiento: 5,  marca: ["Mercedes-Benz","Ford","Iveco"],        modelo: ["Sprinter","Transit","Daily"] },
  "SUV supervisión":       { capacidad: 65, rendimiento: 10, marca: ["Toyota","Kia","Hyundai"],              modelo: ["Rav4","Sportage","Tucson"] },
  "Van traslado tripulación":         { capacidad: 70, rendimiento: 11, marca: ["Toyota","Hyundai"],                    modelo: ["Hiace","H1"] },
};

const TIPOS = OP.tiposVehiculo as Vehiculo["tipo"][];
const BASES = OP.sedes as Vehiculo["base"][];
const DISTRIB_TIPOS = [0.35, 0.20, 0.15, 0.20, 0.10]; // proporciones

for (let i = 0; i < 80; i++) {
  const roll = rng();
  let acc = 0;
  let tipo: Vehiculo["tipo"] = "Camioneta pool";
  for (let k = 0; k < TIPOS.length; k++) {
    acc += DISTRIB_TIPOS[k];
    if (roll < acc) { tipo = TIPOS[k]; break; }
  }
  const cfg = TIPO_CONFIG[tipo];
  // Distribución de bases: 60% San Antonio, 10-15% resto
  const baseRoll = rng();
  const base: Vehiculo["base"] = baseRoll < 0.60 ? "San Antonio"
    : baseRoll < 0.72 ? "San Vicente"
    : baseRoll < 0.83 ? "Valparaíso"
    : baseRoll < 0.92 ? "Mejillones"
    : "Puerto Montt";

  vehiculos.push({
    id: `VEH-${String(i + 1).padStart(3, "0")}`,
    patente: randomPatente(),
    tipo,
    marca: pick(cfg.marca),
    modelo: pick(cfg.modelo),
    anio: 2018 + Math.floor(rng() * 7),
    capacidadEstanqueLitros: cfg.capacidad,
    rendimientoKmPorLitro: cfg.rendimiento,
    asignadoA: null, // se asigna abajo
    base,
    estado: rng() < 0.92 ? "Activo" : rng() < 0.5 ? "Mantención" : "Baja",
  });
}

// ─────────────────────────────────────────────────────────────────────
// PERSONAL OPERATIVO (~90 personas)
// ─────────────────────────────────────────────────────────────────────
export const personas: Persona[] = [];
const CARGOS = [...OP.cargosOperativos, ...OP.cargosAdministrativos].map((c) => c.cargo) as Persona["cargo"][];
const UNIDADES = OP.unidades as Persona["unidad"][];

for (let i = 0; i < 90; i++) {
  const baseRoll = rng();
  const base: Persona["base"] = baseRoll < 0.65 ? "San Antonio"
    : baseRoll < 0.75 ? "San Vicente"
    : baseRoll < 0.83 ? "Valparaíso"
    : baseRoll < 0.92 ? "Mejillones"
    : "Puerto Montt";
  personas.push({
    id: `PER-${String(i + 1).padStart(3, "0")}`,
    rut: randomRUT(),
    nombre: `${pick(NOMBRES)} ${pick(APELLIDOS)} ${pick(APELLIDOS)}`,
    cargo: pick(CARGOS),
    unidad: pick(UNIDADES),
    base,
  });
}

// Asignar algunos vehículos a personas (los otros quedan en pool)
personas.filter((_, i) => i < 40).forEach((p, i) => {
  const veh = vehiculos.find((v) => v.asignadoA === null && v.estado === "Activo" && v.base === p.base);
  if (veh) veh.asignadoA = p.id;
});

// ─────────────────────────────────────────────────────────────────────
// COBERTURAS (~180 eventos en 6 meses)
// ─────────────────────────────────────────────────────────────────────
export const faenas: Faena[] = [];

for (let i = 0; i < 180; i++) {
  const diaOffset = Math.floor(rng() * DIAS_TOTAL);
  const fecha = new Date(FECHA_INICIO.getTime() + diaOffset * 86400000);
  const evento = pick(FAENAS_SAAM);
  const unidad = pick(UNIDADES);

  // Elegir ciudad basada en tipo de evento — simplificamos
  const origenBases = Object.keys(RUTAS);
  const origen = pick(origenBases);
  const destinos = RUTAS[origen];
  const ruta = pick(destinos);
  const ubicacion = ruta.destino;

  // Equipo: 2-5 personas
  const tamEquipo = 2 + Math.floor(rng() * 4);
  const equipoAsignado: string[] = [];
  for (let k = 0; k < tamEquipo; k++) {
    equipoAsignado.push(pick(personas).id);
  }

  const tamVehiculos = tamEquipo <= 3 ? 1 : 2;
  const vehiculosAsignados: string[] = [];
  for (let k = 0; k < tamVehiculos; k++) {
    vehiculosAsignados.push(pick(vehiculos.filter((v) => v.estado === "Activo")).id);
  }

  const presupuesto = 500_000 + Math.floor(rng() * 3_500_000);
  const costoEjecutado = Math.round(presupuesto * (0.7 + rng() * 0.6));
  const confirmadaEnBitacora = rng() < 0.94;
  const minutosEmitidos = confirmadaEnBitacora ? 3 + Math.floor(rng() * 25) : 0;

  faenas.push({
    id: `COB-${String(i + 1).padStart(4, "0")}`,
    fecha: fmtDate(fecha),
    evento,
    ubicacion,
    unidad,
    equipoAsignado,
    vehiculosAsignados,
    presupuestoCLP: presupuesto,
    costoEjecutadoCLP: costoEjecutado,
    confirmadaEnBitacora,
    minutosEmitidos,
  });
}

console.log("[flotaViajes] iteración 1 — vehículos:", vehiculos.length, "personas:", personas.length, "faenas:", faenas.length);

// ─────────────────────────────────────────────────────────────────────
// VIAJES REGISTRADOS CON GPS (~4.500)
// Cada vehículo activo hace 30-70 viajes en 6 meses
// ─────────────────────────────────────────────────────────────────────
export const viajes: Viaje[] = [];
let _viajeId = 1;

const vehiculosActivos = vehiculos.filter((v) => v.estado === "Activo");

vehiculosActivos.forEach((v) => {
  const numViajes = 30 + Math.floor(rng() * 41);
  const choferBase = v.asignadoA || pick(personas.filter((p) => p.cargo === "Chofer" || p.cargo === "Marinero")).id;

  for (let i = 0; i < numViajes; i++) {
    const diaOffset = Math.floor(rng() * DIAS_TOTAL);
    const fecha = new Date(FECHA_INICIO.getTime() + diaOffset * 86400000);
    const horaInicio = 6 + Math.floor(rng() * 14); // 6-20h
    const inicio = new Date(fecha); inicio.setHours(horaInicio, Math.floor(rng() * 60), 0, 0);

    // Elegir ruta desde la base del vehículo
    const rutasDesdeBase = RUTAS[v.base] || RUTAS["San Antonio"];
    const ruta = pick(rutasDesdeBase);
    const kmReal = ruta.kmReal;
    const horasNormal = ruta.horasNormal;

    // Variación normal ±15% en km, ±20% en horas
    const distanciaGPS = Math.round(kmReal * (0.9 + rng() * 0.2));
    const tiempoGPS = horasNormal * (0.85 + rng() * 0.30);
    // Chofer declara aproximadamente lo mismo con pequeña variación
    const distanciaDeclarada = Math.round(distanciaGPS * (0.96 + rng() * 0.08));
    const tiempoDeclarado = tiempoGPS * (0.95 + rng() * 0.10);
    const velocidadMax = 90 + Math.floor(rng() * 30); // 90-120 km/h normal
    const velocidadPromCalc = Math.round(distanciaDeclarada / tiempoDeclarado);

    const fin = addHours(inicio, tiempoGPS);
    const diaSemana = inicio.getDay();
    const fueraDeHorario = (diaSemana === 0 || diaSemana === 6) && rng() < 0.10;

    // Un ~20% de los viajes se ligan a una faena al azar del período cercano
    let faenaId: string | null = null;
    if (rng() < 0.20) {
      const faensCercanas = faenas.filter((c) => Math.abs(new Date(c.fecha).getTime() - fecha.getTime()) < 3 * 86400000);
      if (faensCercanas.length > 0) faenaId = pick(faensCercanas).id;
    }

    viajes.push({
      id: `VJE-${String(_viajeId++).padStart(5, "0")}`,
      vehiculoId: v.id,
      choferId: choferBase,
      fechaInicio: fmtDateTime(inicio),
      fechaFin: fmtDateTime(fin),
      origen: v.base,
      destino: ruta.destino,
      distanciaDeclaradaKm: distanciaDeclarada,
      distanciaGPSKm: distanciaGPS,
      tiempoDeclaradoHoras: Math.round(tiempoDeclarado * 10) / 10,
      tiempoGPSHoras: Math.round(tiempoGPS * 10) / 10,
      velocidadMaximaGPS: velocidadMax,
      velocidadPromedioCalculadaKmH: velocidadPromCalc,
      faenaId,
      fueraDeHorario,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// CARGAS DE COMBUSTIBLE (~3.200)
// ─────────────────────────────────────────────────────────────────────
export const cargasCombustible: CargaCombustible[] = [];
let _cargaId = 1;

vehiculosActivos.forEach((v) => {
  const numCargas = 20 + Math.floor(rng() * 30);
  for (let i = 0; i < numCargas; i++) {
    const diaOffset = Math.floor(rng() * DIAS_TOTAL);
    const fecha = new Date(FECHA_INICIO.getTime() + diaOffset * 86400000);
    fecha.setHours(9 + Math.floor(rng() * 10), Math.floor(rng() * 60), 0, 0);

    const nivelAntes = 15 + Math.floor(rng() * 45); // arranca entre 15-60%
    const litrosMax = v.capacidadEstanqueLitros * (100 - nivelAntes) / 100;
    const litros = Math.round(litrosMax * (0.85 + rng() * 0.15)); // llena entre 85-100% de lo faltante
    const nivelDespues = Math.round(nivelAntes + (litros / v.capacidadEstanqueLitros) * 100);
    const precioLitro = 1150 + Math.floor(rng() * 200); // CLP
    const monto = litros * precioLitro;

    cargasCombustible.push({
      id: `COMB-${String(_cargaId++).padStart(5, "0")}`,
      vehiculoId: v.id,
      fecha: fmtDate(fecha),
      litros,
      precioLitro,
      montoTotal: monto,
      estacion: pick(ESTACIONES_COMBUSTIBLE),
      ciudad: v.base,
      nivelEstanqueAntesPct: nivelAntes,
      nivelEstanqueDespuesPct: Math.min(100, nivelDespues),
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// VIÁTICOS (~2.800) — GENERADOS A PARTIR DE VIAJES REALES
// Cada viaje inter-ciudad genera 2-3 viáticos naturales (alojamiento, alimentación, movilización)
// ─────────────────────────────────────────────────────────────────────
export const viaticos: Viatico[] = [];
let _viaticoId = 1;

const CIUDADES_VIAJE = OP.ciudades;

// Por cada viaje relevante (distancia > 100km), generar viáticos asociados a la persona
viajes.filter((v) => v.distanciaGPSKm > 100).slice(0, 900).forEach((vj) => {
  const persona = personas.find((p) => p.id === vj.choferId);
  if (!persona) return;
  const fecha = new Date(vj.fechaInicio);
  const ciudad = vj.destino;
  // 2-3 viáticos por viaje
  const items: Viatico["concepto"][] = ["Alojamiento","Alimentación","Movilización"];
  const cuantos = 2 + Math.floor(rng() * 2);
  for (let k = 0; k < cuantos; k++) {
    const concepto = items[k];
    const montoBase: Record<string, number> = { "Alojamiento": 85_000, "Alimentación": 25_000, "Movilización": 18_000 };
    const monto = Math.round(montoBase[concepto] * (0.7 + rng() * 0.8));
    viaticos.push({
      id: `VIA-${String(_viaticoId++).padStart(5, "0")}`,
      personaId: persona.id,
      faenaId: vj.faenaId,
      fechaViaje: fmtDate(fecha),
      ciudad,
      concepto,
      monto,
      estado: "Rendido",
      fechaRendicion: fmtDate(addHours(fecha, 24 + Math.floor(rng() * 96))),
      boletaId: `BOL-${String(Math.floor(rng() * 999999)).padStart(6, "0")}`,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// SERVICIOS EXTERNOS (~1.400)
// ─────────────────────────────────────────────────────────────────────
export const serviciosExternos: ServicioExterno[] = [];
let _servId = 1;

personas.slice(0, 60).forEach((p) => {
  const numServ = 10 + Math.floor(rng() * 25);
  for (let i = 0; i < numServ; i++) {
    const diaOffset = Math.floor(rng() * DIAS_TOTAL);
    const fecha = new Date(FECHA_INICIO.getTime() + diaOffset * 86400000);
    // 85% estándar, 15% premium
    const esPremium = rng() < 0.15;
    const proveedor: ServicioExterno["proveedor"] = esPremium
      ? (rng() < 0.6 ? "Uber Black" : "Cabify")
      : (rng() < 0.7 ? "Uber" : rng() < 0.5 ? "Taxi oficial" : "Rent a Car");
    const monto = esPremium ? 25_000 + Math.floor(rng() * 45_000) : 6_000 + Math.floor(rng() * 15_000);
    serviciosExternos.push({
      id: `SRV-${String(_servId++).padStart(5, "0")}`,
      personaId: p.id,
      fecha: fmtDate(fecha),
      proveedor,
      origen: p.base,
      destino: pick(CIUDADES_VIAJE),
      monto,
      ciudad: p.base,
      categoria: esPremium ? "Premium" : "Estándar",
    });
  }
});

// ─────────────────────────────────────────────────────────────────────
// MULTAS DE TRÁNSITO (~90)
// ─────────────────────────────────────────────────────────────────────
export const multas: Multa[] = [];
for (let i = 0; i < 90; i++) {
  const veh = pick(vehiculosActivos);
  const chofer = veh.asignadoA || pick(personas).id;
  const diaOffset = Math.floor(rng() * DIAS_TOTAL);
  const fecha = new Date(FECHA_INICIO.getTime() + diaOffset * 86400000);
  const causas: Multa["causa"][] = ["Exceso de velocidad","Estacionamiento","Cruce indebido","No uso de cinturón"];
  const causa = pick(causas);
  const montoUTM = causa === "Exceso de velocidad" ? 1.5 + rng() * 3 : 0.5 + rng() * 1.5;
  multas.push({
    id: `MTA-${String(i + 1).padStart(4, "0")}`,
    vehiculoId: veh.id,
    choferId: chofer,
    fecha: fmtDate(fecha),
    ubicacion: pick(CIUDADES_VIAJE),
    causa,
    montoUTM: Math.round(montoUTM * 10) / 10,
    reembolsadaPorChofer: rng() < 0.55,
  });
}


// ─────────────────────────────────────────────────────────────────────
// HALLAZGOS PLANTADOS — Aquí es donde la demo cobra vida
// ─────────────────────────────────────────────────────────────────────

// 🚨 HALLAZGO 1: Velocidades imposibles (>200 km/h calculado)
// 6 viajes donde el chofer rindió tiempo demasiado corto para la distancia
const trabsMejillones = personas.filter((p) => p.unidad === "Operaciones Mejillones" || p.unidad === "Operaciones Valparaíso").slice(0, 4);
for (let i = 0; i < 6; i++) {
  const p = trabsMejillones[i % trabsMejillones.length];
  const veh = pick(vehiculosActivos.filter((v) => v.base === "San Antonio"));
  const fecha = new Date(2026, 1, 3 + i * 5);
  fecha.setHours(6, 30, 0, 0);
  const distanciaReal = 1570; // San Antonio-Mejillones
  const tiempoDeclaradoMalo = 6.5; // rindió 6.5h para 1570km → 241 km/h
  const tiempoGPSReal = 18.5;
  viajes.push({
    id: `VJE-${String(_viajeId++).padStart(5, "0")}`,
    vehiculoId: veh.id,
    choferId: p.id,
    fechaInicio: fmtDateTime(fecha),
    fechaFin: fmtDateTime(addHours(fecha, tiempoGPSReal)),
    origen: "San Antonio",
    destino: "Mejillones",
    distanciaDeclaradaKm: distanciaReal,
    distanciaGPSKm: distanciaReal + Math.floor(rng() * 40 - 20),
    tiempoDeclaradoHoras: tiempoDeclaradoMalo,
    tiempoGPSHoras: tiempoGPSReal,
    velocidadMaximaGPS: 105,
    velocidadPromedioCalculadaKmH: Math.round(distanciaReal / tiempoDeclaradoMalo),
    faenaId: null,
    fueraDeHorario: false,
  });
}

// 🚨 HALLAZGO 2: Cargas de combustible > capacidad del estanque (12 casos)
for (let i = 0; i < 12; i++) {
  const v = pick(vehiculosActivos);
  const fecha = new Date(FECHA_INICIO.getTime() + Math.floor(rng() * DIAS_TOTAL) * 86400000);
  fecha.setHours(11 + Math.floor(rng() * 6), 0, 0, 0);
  const litrosExceso = v.capacidadEstanqueLitros * (1.15 + rng() * 0.25); // 115-140% capacidad
  const precio = 1180;
  cargasCombustible.push({
    id: `COMB-${String(_cargaId++).padStart(5, "0")}`,
    vehiculoId: v.id,
    fecha: fmtDate(fecha),
    litros: Math.round(litrosExceso),
    precioLitro: precio,
    montoTotal: Math.round(litrosExceso * precio),
    estacion: pick(ESTACIONES_COMBUSTIBLE),
    ciudad: v.base,
    nivelEstanqueAntesPct: 5 + Math.floor(rng() * 15),
    nivelEstanqueDespuesPct: 100, // sistema reporta lleno pero excedió capacidad
  });
}

// 🚨 HALLAZGO 3: Descargas sospechosas — patrón de robo (8 casos)
// Cargas altas seguidas de descenso rápido del nivel según GPS
for (let i = 0; i < 8; i++) {
  const v = pick(vehiculosActivos.filter((veh) => veh.tipo === "Bus de relevo" || veh.tipo === "Camioneta 4x4"));
  const fecha = new Date(FECHA_INICIO.getTime() + Math.floor(rng() * DIAS_TOTAL) * 86400000);
  fecha.setHours(20 + Math.floor(rng() * 3), 30, 0, 0); // horario tarde
  const litros = Math.round(v.capacidadEstanqueLitros * 0.95);
  cargasCombustible.push({
    id: `COMB-${String(_cargaId++).padStart(5, "0")}`,
    vehiculoId: v.id,
    fecha: fmtDate(fecha),
    litros,
    precioLitro: 1190,
    montoTotal: litros * 1190,
    estacion: pick(ESTACIONES_COMBUSTIBLE),
    ciudad: v.base,
    nivelEstanqueAntesPct: 10,
    nivelEstanqueDespuesPct: 45, // NO llenó al 100% aunque cargó 95% de capacidad → anomalía
  });
}

// 🚨 HALLAZGO 4: Excesos de velocidad > 150 km/h (34 casos)
for (let i = 0; i < 34; i++) {
  const v = pick(vehiculosActivos);
  const chofer = v.asignadoA || pick(personas).id;
  const fecha = new Date(FECHA_INICIO.getTime() + Math.floor(rng() * DIAS_TOTAL) * 86400000);
  fecha.setHours(7 + Math.floor(rng() * 12), 0, 0, 0);
  const rutasBase = RUTAS[v.base] || RUTAS["San Antonio"];
  const ruta = pick(rutasBase);
  viajes.push({
    id: `VJE-${String(_viajeId++).padStart(5, "0")}`,
    vehiculoId: v.id,
    choferId: chofer,
    fechaInicio: fmtDateTime(fecha),
    fechaFin: fmtDateTime(addHours(fecha, ruta.horasNormal)),
    origen: v.base,
    destino: ruta.destino,
    distanciaDeclaradaKm: ruta.kmReal,
    distanciaGPSKm: ruta.kmReal,
    tiempoDeclaradoHoras: ruta.horasNormal,
    tiempoGPSHoras: ruta.horasNormal,
    velocidadMaximaGPS: 152 + Math.floor(rng() * 40), // 152-192 km/h
    velocidadPromedioCalculadaKmH: Math.round(ruta.kmReal / ruta.horasNormal),
    faenaId: null,
    fueraDeHorario: false,
  });
}

// 🚨 HALLAZGO 5: Viáticos sin viaje GPS asociado (18 casos)
// La persona rindió viático en ciudad X pero ningún vehículo asignado a ella salió de San Antonio ese día
const personasParaHallazgo = personas.filter((p) => p.base === "San Antonio").slice(0, 10);
for (let i = 0; i < 18; i++) {
  const p = personasParaHallazgo[i % personasParaHallazgo.length];
  const fecha = new Date(FECHA_INICIO.getTime() + Math.floor(rng() * DIAS_TOTAL) * 86400000);
  const ciudadRemota = pick(["Mejillones","Iquique","Puerto Montt","Osorno","Valdivia"]);
  viaticos.push({
    id: `VIA-${String(_viaticoId++).padStart(5, "0")}`,
    personaId: p.id,
    faenaId: null,
    fechaViaje: fmtDate(fecha),
    ciudad: ciudadRemota,
    concepto: "Alojamiento",
    monto: 95_000 + Math.floor(rng() * 40_000),
    estado: "Rendido",
    fechaRendicion: fmtDate(addHours(fecha, 48)),
    boletaId: `BOL-${String(Math.floor(rng() * 999999)).padStart(6, "0")}`,
  });
}

// 🚨 HALLAZGO 6: Doble cobro de viático mismo día, misma persona (7 casos)
const personasDoble = personas.slice(20, 27);
for (let i = 0; i < 7; i++) {
  const p = personasDoble[i];
  const fecha = new Date(2026, 0, 5 + i * 4);
  const ciudad = pick(CIUDADES_VIAJE);
  const boleta = `BOL-${String(Math.floor(rng() * 999999)).padStart(6, "0")}`;
  // Rendición 1: alojamiento
  viaticos.push({
    id: `VIA-${String(_viaticoId++).padStart(5, "0")}`,
    personaId: p.id,
    faenaId: null,
    fechaViaje: fmtDate(fecha),
    ciudad,
    concepto: "Alojamiento",
    monto: 89_000,
    estado: "Rendido",
    fechaRendicion: fmtDate(addHours(fecha, 30)),
    boletaId: boleta,
  });
  // Rendición 2: exactamente la misma boleta ID, distinto ID de viático
  viaticos.push({
    id: `VIA-${String(_viaticoId++).padStart(5, "0")}`,
    personaId: p.id,
    faenaId: null,
    fechaViaje: fmtDate(fecha),
    ciudad,
    concepto: "Alojamiento",
    monto: 89_000,
    estado: "Rendido",
    fechaRendicion: fmtDate(addHours(fecha, 72)),
    boletaId: boleta, // ← mismo boleta
  });
}

// 🚨 HALLAZGO 7: Anticipos no rendidos > 60 días (13 casos)
for (let i = 0; i < 13; i++) {
  const p = pick(personas);
  const fecha = new Date(2025, 9, 5 + i * 3); // octubre-noviembre 2025
  viaticos.push({
    id: `VIA-${String(_viaticoId++).padStart(5, "0")}`,
    personaId: p.id,
    faenaId: null,
    fechaViaje: fmtDate(fecha),
    ciudad: pick(CIUDADES_VIAJE),
    concepto: "Anticipo",
    monto: 250_000 + Math.floor(rng() * 200_000),
    estado: "Anticipo pendiente",
    fechaRendicion: null,
    boletaId: `ANT-${String(i + 1).padStart(4, "0")}`,
  });
}

// 🚨 HALLAZGO 9: Doble equipo enviado al mismo evento (4 casos)
// Creamos faenas duplicadas del mismo evento por 2 unidades distintos
const eventosDobles = ["Recalada portacontenedores MSC","Emergencia por marejadas","Faena de dragado puerto","Asistencia a nave pesquera"];
for (let i = 0; i < 4; i++) {
  const evento = eventosDobles[i];
  const fecha = new Date(2026, 0, 10 + i * 12);
  const ubic = pick(CIUDADES_VIAJE);
  // Faena del unidad A
  faenas.push({
    id: `COB-${String(faenas.length + 1).padStart(4, "0")}`,
    fecha: fmtDate(fecha),
    evento,
    ubicacion: ubic,
    unidad: "Operaciones Valparaíso",
    equipoAsignado: personas.slice(i * 3, i * 3 + 3).map((p) => p.id),
    vehiculosAsignados: [vehiculosActivos[i * 2].id],
    presupuestoCLP: 1_800_000,
    costoEjecutadoCLP: 2_100_000,
    confirmadaEnBitacora: true,
    minutosEmitidos: 8,
  });
  // Faena del unidad B — mismo evento, misma fecha
  faenas.push({
    id: `COB-${String(faenas.length + 1).padStart(4, "0")}`,
    fecha: fmtDate(fecha),
    evento,
    ubicacion: ubic,
    unidad: "Operaciones Mejillones",
    equipoAsignado: personas.slice(i * 3 + 3, i * 3 + 6).map((p) => p.id),
    vehiculosAsignados: [vehiculosActivos[i * 2 + 1].id],
    presupuestoCLP: 2_200_000,
    costoEjecutadoCLP: 2_450_000,
    confirmadaEnBitacora: true,
    minutosEmitidos: 12,
  });
}

// 🚨 HALLAZGO 10: Faenas sin confirmación en bitácora (11 casos con presupuesto alto)
for (let i = 0; i < 11; i++) {
  const evento = pick(FAENAS_SAAM);
  const fecha = new Date(FECHA_INICIO.getTime() + Math.floor(rng() * DIAS_TOTAL) * 86400000);
  faenas.push({
    id: `COB-${String(faenas.length + 1).padStart(4, "0")}`,
    fecha: fmtDate(fecha),
    evento,
    ubicacion: pick(CIUDADES_VIAJE),
    unidad: pick(UNIDADES),
    equipoAsignado: personas.slice(i * 2, i * 2 + 3).map((p) => p.id),
    vehiculosAsignados: [pick(vehiculosActivos).id],
    presupuestoCLP: 2_500_000 + Math.floor(rng() * 2_000_000),
    costoEjecutadoCLP: 2_800_000 + Math.floor(rng() * 2_500_000),
    confirmadaEnBitacora: false,
    minutosEmitidos: 0,
  });
}

// 🚨 HALLAZGO 12: Uso excesivo de Uber Black sin justificación (16 casos)
const personasBlack = personas.slice(50, 55);
for (let i = 0; i < 16; i++) {
  const p = personasBlack[i % personasBlack.length];
  const fecha = new Date(FECHA_INICIO.getTime() + Math.floor(rng() * DIAS_TOTAL) * 86400000);
  serviciosExternos.push({
    id: `SRV-${String(_servId++).padStart(5, "0")}`,
    personaId: p.id,
    fecha: fmtDate(fecha),
    proveedor: "Uber Black",
    origen: p.base,
    destino: pick(CIUDADES_VIAJE),
    monto: 45_000 + Math.floor(rng() * 30_000),
    ciudad: p.base,
    categoria: "Premium",
  });
}

// 🚨 HALLAZGO 15: Multas de exceso de velocidad no reembolsadas (varias, ya generadas naturalmente)
// Nada que agregar — el detector las encuentra en el dataset existente

// ─────────────────────────────────────────────────────────────────────
// DETECTOR DE HALLAZGOS
// ─────────────────────────────────────────────────────────────────────
export const detectarHallazgos = () => {
  const personaById = new Map(personas.map((p) => [p.id, p]));
  const vehiculoById = new Map(vehiculos.map((v) => [v.id, v]));

  // 1. Velocidades imposibles (> 200 km/h calculado)
  const velocidadesImposibles = viajes.filter((v) => v.velocidadPromedioCalculadaKmH > 200);

  // 2. Cargas > capacidad
  const cargasExceso = cargasCombustible.filter((c) => {
    const v = vehiculoById.get(c.vehiculoId);
    return v ? c.litros > v.capacidadEstanqueLitros * 1.05 : false;
  });

  // 3. Descargas sospechosas (nivel-después bajo pese a alta carga)
  const descargasSospechosas = cargasCombustible.filter((c) => {
    const v = vehiculoById.get(c.vehiculoId);
    if (!v) return false;
    const litrosEsperados = (100 - c.nivelEstanqueAntesPct) / 100 * v.capacidadEstanqueLitros;
    const nivelEsperado = c.nivelEstanqueAntesPct + (c.litros / v.capacidadEstanqueLitros) * 100;
    // Si cargó lo suficiente para llegar cerca del 100% pero quedó < 60%
    return c.litros > litrosEsperados * 0.8 && c.nivelEstanqueDespuesPct < 60 && nivelEsperado > 85;
  });

  // 4. Excesos de velocidad > 150 km/h
  const excesosVelocidad = viajes.filter((v) => v.velocidadMaximaGPS > 150);

  // 5. Viáticos sin viaje GPS asociado — sólo alojamientos > CLP 50.000 en ciudad remota
  // sin viaje registrado del chofer/persona ese día ni en la ventana ±1 día
  const viaticosSinViaje = viaticos.filter((vi) => {
    if (vi.estado !== "Rendido" || vi.concepto !== "Alojamiento") return false;
    if (vi.monto < 50_000) return false;
    const persona = personaById.get(vi.personaId);
    if (!persona || persona.base === vi.ciudad) return false;
    // Buscamos viaje en ventana de ±1 día que vaya a esa ciudad
    const fechaVia = new Date(vi.fechaViaje);
    const inicio = new Date(fechaVia.getTime() - 86400000);
    const fin = new Date(fechaVia.getTime() + 86400000);
    const viajeMatch = viajes.some((vj) => {
      if (vj.choferId !== vi.personaId) return false;
      if (vj.destino !== vi.ciudad) return false;
      const fVj = new Date(vj.fechaInicio);
      return fVj >= inicio && fVj <= fin;
    });
    return !viajeMatch;
  });

  // 6. Boletas duplicadas
  const boletasSeen = new Map<string, number>();
  viaticos.forEach((vi) => {
    if (!vi.boletaId.startsWith("BOL-")) return;
    boletasSeen.set(vi.boletaId, (boletasSeen.get(vi.boletaId) || 0) + 1);
  });
  const boletasDuplicadas = viaticos.filter((vi) => (boletasSeen.get(vi.boletaId) || 0) > 1);

  // 7. Anticipos > 60 días
  const NOW = new Date("2026-05-26T13:00:00");
  const anticiposViejos = viaticos.filter((vi) => {
    if (vi.concepto !== "Anticipo") return false;
    if (vi.estado !== "Anticipo pendiente") return false;
    const dias = (NOW.getTime() - new Date(vi.fechaViaje).getTime()) / 86400000;
    return dias > 60;
  });

  // 9. Doble equipo al mismo evento
  const eventosPorFecha = new Map<string, Faena[]>();
  faenas.forEach((c) => {
    const key = `${c.evento}|${c.fecha}`;
    if (!eventosPorFecha.has(key)) eventosPorFecha.set(key, []);
    eventosPorFecha.get(key)!.push(c);
  });
  const dobleEquipo = Array.from(eventosPorFecha.entries())
    .filter(([_, faens]) => faens.length > 1)
    .map(([key, faens]) => ({ eventoFecha: key, faenas: faens, costoTotal: faens.reduce((a, c) => a + c.costoEjecutadoCLP, 0) }));

  // 10. Faenas sin confirmación en bitácora con costo alto
  const faensSinBitacora = faenas.filter((c) => !c.confirmadaEnBitacora && c.costoEjecutadoCLP > 2_000_000);

  // 12. Uso premium sin justificación (Uber Black > 3 veces en el período)
  const premiumPorPersona = new Map<string, ServicioExterno[]>();
  serviciosExternos.filter((s) => s.categoria === "Premium").forEach((s) => {
    if (!premiumPorPersona.has(s.personaId)) premiumPorPersona.set(s.personaId, []);
    premiumPorPersona.get(s.personaId)!.push(s);
  });
  const usoPremiumExcesivo = Array.from(premiumPorPersona.entries())
    .filter(([_, servs]) => servs.length >= 8)
    .map(([pid, servs]) => ({ personaId: pid, cantidad: servs.length, montoTotal: servs.reduce((a, s) => a + s.monto, 0) }));

  // 14. Uso fuera de horario (fin de semana no autorizado)
  const usoFinSemana = viajes.filter((v) => v.fueraDeHorario);

  // 15. Multas de tránsito no reembolsadas
  const multasNoReembolsadas = multas.filter((m) => !m.reembolsadaPorChofer);

  return {
    velocidadesImposibles: {
      cantidad: velocidadesImposibles.length,
      ejemplos: velocidadesImposibles.slice(0, 5).map((v) => ({
        viajeId: v.id,
        chofer: personaById.get(v.choferId)?.nombre,
        ruta: `${v.origen} → ${v.destino}`,
        distancia: v.distanciaDeclaradaKm,
        tiempoDeclarado: v.tiempoDeclaradoHoras,
        velocidadCalculada: v.velocidadPromedioCalculadaKmH,
        tiempoGPS: v.tiempoGPSHoras,
      })),
    },
    cargasExceso: {
      cantidad: cargasExceso.length,
      montoTotal: cargasExceso.reduce((a, c) => a + c.montoTotal, 0),
    },
    descargasSospechosas: {
      cantidad: descargasSospechosas.length,
      montoEstimado: descargasSospechosas.reduce((a, c) => a + c.montoTotal * 0.5, 0),
    },
    excesosVelocidad: {
      cantidad: excesosVelocidad.length,
      max: Math.max(...excesosVelocidad.map((v) => v.velocidadMaximaGPS), 0),
    },
    viaticosSinViaje: {
      cantidad: viaticosSinViaje.length,
      montoTotal: viaticosSinViaje.reduce((a, v) => a + v.monto, 0),
    },
    boletasDuplicadas: {
      cantidad: boletasDuplicadas.length,
      montoTotal: boletasDuplicadas.reduce((a, v) => a + v.monto, 0) / 2, // el sobrepago es la mitad
    },
    anticiposViejos: {
      cantidad: anticiposViejos.length,
      montoTotal: anticiposViejos.reduce((a, v) => a + v.monto, 0),
    },
    dobleEquipo: {
      cantidad: dobleEquipo.length,
      montoDuplicado: dobleEquipo.reduce((a, d) => a + d.costoTotal, 0),
    },
    faenasSinBitacora: {
      cantidad: faensSinBitacora.length,
      montoTotal: faensSinBitacora.reduce((a, c) => a + c.costoEjecutadoCLP, 0),
    },
    usoPremiumExcesivo: {
      cantidad: usoPremiumExcesivo.length,
      montoTotal: usoPremiumExcesivo.reduce((a, u) => a + u.montoTotal, 0),
    },
    usoFinSemana: {
      cantidad: usoFinSemana.length,
    },
    multasNoReembolsadas: {
      cantidad: multasNoReembolsadas.length,
      totalUTM: multasNoReembolsadas.reduce((a, m) => a + m.montoUTM, 0),
    },
  };
};

// ─────────────────────────────────────────────────────────────────────
// CONTEXTO COMPACTO PARA AUDITIA
// ─────────────────────────────────────────────────────────────────────
export const buildFlotaContext = () => {
  const h = detectarHallazgos();
  return {
    empresa: {
      nombre: PACK.cliente,
      sector: PACK.sector,
      operacion: "Nacional (Arica a Punta Arenas)",
      bases: ["San Antonio","Mejillones","San Vicente","Valparaíso","Puerto Montt"],
      flotaTotal: vehiculos.length,
      flotaActiva: vehiculos.filter((v) => v.estado === "Activo").length,
      personalOperativo: personas.length,
      viajesAnalizados: viajes.length,
      cargasCombustible: cargasCombustible.length,
      viaticosRendidos: viaticos.length,
      faenas: faenas.length,
      periodo: "Oct 2025 – Mar 2026",
    },
    hallazgos: h,
    momentoAnalisis: "26-may-2026 13:00",
    notaImportante:
      `${PACK.cliente} gasta cerca de CLP 2.400M anuales en transporte, combustible y viáticos operativos. ` +
      "La auditoría tradicional tomaría muestra de ~50 viajes sobre 4.500 y ~30 rendiciones sobre 2.800. " +
      "AuditIA cruza el 100% del universo: cada viaje contra los datos GPS de flota, cada rendición contra " +
      "la actividad real de la persona, cada faena contra su confirmación en bitácora, y cada carga contra la " +
      "capacidad del vehículo. Detecta patrones de fraude y desviación que el muestreo omite.",
  };
};
