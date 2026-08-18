// MOTOR P2P — agnóstico de industria.
//
// Genera el universo Procure-to-Pay (empleados, proveedores, OCs, facturas),
// planta los 14 hallazgos y los detecta. Todo el vocabulario, los cargos, las
// razones sociales y los nombres de los casos plantados vienen del IndustryPack
// que se pasa como parámetro. Este archivo NO menciona ningún cliente.
//
// HALLAZGOS PLANTADOS (14 categorías):
//   INTEGRIDAD DE MAESTROS
//     1. Colisión empleado↔proveedor (mismo banco + cuenta) — 3 casos
//     2. Proveedores fantasma (creados <90 días, ya con facturación alta) — 2 casos
//     3. Email personal en proveedor B2B — 3 casos
//     4. Proveedor inactivo con factura reciente — 1 caso
//   ANOMALÍAS EN ÓRDENES DE COMPRA
//     5. Fraccionamiento bajo el umbral de aprobación — 12 casos
//     6. Backdating (factura emitida antes de su OC) — 4 casos
//     7. Concentración de aprobador en un proveedor — 1 caso
//   ANOMALÍAS EN FACTURAS Y PAGOS
//     8. Facturas sin OC previa — 23 casos
//     9. Facturas duplicadas — 2 pares
//    10. Facturas emitidas en fin de semana — 8 casos
//    11. Montos exactamente redondos — 5 casos
//    12. Pago antes de la fecha de la factura — 3 casos
//   NÓMINA
//    13. Empleados con cuenta bancaria compartida — 2 casos
//    14. Sueldos atípicos para el cargo — 3 casos

import type { IndustryPack } from "../packs/types";

export type Proveedor = {
  id: string;
  rut: string;
  razonSocial: string;
  categoria: string;
  cuentaBanco: string;
  banco: string;
  fechaAlta: string;
  estado: "Activo" | "Inactivo" | "Bloqueado";
  contactoEmail: string;
};

export type OrdenCompra = {
  id: string;
  fecha: string;
  proveedorId: string;
  area: string;
  monto: number;
  aprobador: string;
  estado: "Aprobada" | "Recibida" | "Cancelada";
  descripcion: string;
};

export type Factura = {
  id: string;
  fecha: string;
  fechaPago: string | null;
  proveedorId: string;
  ocId: string | null;
  monto: number;
  estado: "Pagada" | "Pendiente" | "Vencida";
};

export type Empleado = {
  id: string;
  rut: string;
  nombre: string;
  area: string;
  cargo: string;
  banco: string;
  cuentaBanco: string;
  fechaIngreso: string;
  sueldoBase: number; // CLP mensual
};

// Pools de nombres chilenos — compartidos por todas las industrias.
const NOMBRES = [
  "María","Pedro","Andrea","Javier","Carolina","Rodrigo","Patricia","Felipe","Soledad","Luis",
  "Constanza","Marcelo","Valentina","Cristián","Daniela","Eduardo","Francisca","Gonzalo","Loreto","Mauricio",
  "Pamela","Sebastián","Tamara","Víctor","Ximena","Bárbara","César","Diego","Elisa","Fabián",
  "Gabriela","Héctor","Ivonne","Joaquín","Karla","Lautaro","Macarena","Néstor","Olga","Pablo",
  "Raquel","Sergio","Trinidad","Ulises","Verónica","Yasna","Aníbal","Beatriz","Camilo","Denisse",
  "Esteban","Fernanda","Gustavo","Helena","Ignacio","Josefina","Kevin","Liliana","Natalia","Óscar",
  "Priscila","Rocío","Simón","Teresa","Walter","Yolanda","Alexis","Berenice","Cristóbal","Dafne",
  "Emanuel","Florencia","Genaro","Hilda","Iván","Jacinta","Lucas","Magdalena","Nicolás","Paulina",
  "Renato","Sandra","Tomás","Valeria","Zoe","Adolfo","Bianca","Conrado","Domitila",
];

const APELLIDOS = [
  "González","Soto","Vargas","Muñoz","Pino","Aravena","Reyes","Cárdenas","Vega","Henríquez",
  "Bravo","Torres","Espinoza","Olivares","Saavedra","Lillo","Rojas","Pizarro","Maldonado","Salinas",
  "Cisternas","Fuenzalida","Quintana","Hidalgo","Lagos","Toledo","Núñez","Briceño","Vidal","Mora",
  "Aguilar","Pacheco","Castro","Riveros","Faúndez","Ibáñez","Tapia","Becerra","Carrasco","Espina",
  "Yáñez","Vilches","Bustos","Cornejo","Acuña","Romero","Donoso","Garrido","Norambuena","Sandoval",
  "Cofré","Bolados","Mella","Inostroza","Cortés","Lorca","Aguayo","Mardones","Rivera","Ojeda",
  "Iturra","Letelier","Plaza","Tobar","Arenas","Mancilla","Almonacid","Bahamondes","Cifuentes",
  "Pereira","Lobos","Ramírez","Astudillo","Quiroga","Cabrera","Sepúlveda","Martínez","Pérez","López",
  "Silva","Díaz","Fuentes","Morales","Contreras","Araya","Herrera","Sánchez","Flores",
];

export type P2PDataset = ReturnType<typeof generarP2P>;

/** Genera el universo P2P completo para un pack de industria. */
export function generarP2P(pack: IndustryPack) {
  const P = pack.p2p;

  // Expande los cargos según su peso: un cargo con peso 5 aparece 5 veces en el pool.
  const CARGOS_EXPANDIDOS: string[] = [];
  P.cargos.forEach((c) => { for (let k = 0; k < c.peso; k++) CARGOS_EXPANDIDOS.push(c.cargo); });

  // ─────────────────────────────────────────────────────────────────────
  // Utilidades
  // ─────────────────────────────────────────────────────────────────────
  const rng = (() => {
    let seed = 4242;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  })();
  const pick = <T,>(arr: T[]) => arr[Math.floor(rng() * arr.length)];

  const randomRUT = () => {
    const n = 4_000_000 + Math.floor(rng() * 22_000_000);
    const dv = pick(["0","1","2","3","4","5","6","7","8","9","K"]);
    const s = n.toString();
    return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}-${dv}`;
  };
  const randomCuenta = () => Math.floor(10_000_000 + rng() * 90_000_000).toString();
  const randomDate = (yearStart: number, yearEnd: number, monthStart = 0, monthEnd = 11) => {
    const start = new Date(yearStart, monthStart, 1).getTime();
    const end = new Date(yearEnd, monthEnd, 28).getTime();
    return new Date(start + rng() * (end - start)).toISOString().split("T")[0];
  };
  const addDays = (date: string, days: number) =>
    new Date(new Date(date).getTime() + days * 86400000).toISOString().split("T")[0];

  const isWeekend = (date: string) => {
    const d = new Date(date).getDay();
    return d === 0 || d === 6;
  };

  // ─────────────────────────────────────────────────────────────────────
  // Pools para generación procedural
  // ─────────────────────────────────────────────────────────────────────
  const NOMBRES = [
    "María","Pedro","Andrea","Javier","Carolina","Rodrigo","Patricia","Felipe","Soledad","Luis",
    "Constanza","Marcelo","Valentina","Cristián","Daniela","Eduardo","Francisca","Gonzalo","Loreto","Mauricio",
    "Pamela","Sebastián","Tamara","Víctor","Ximena","Bárbara","César","Diego","Elisa","Fabián",
    "Gabriela","Héctor","Ivonne","Joaquín","Karla","Lautaro","Macarena","Néstor","Olga","Pablo",
    "Raquel","Sergio","Trinidad","Ulises","Verónica","Yasna","Aníbal","Beatriz","Camilo","Denisse",
    "Esteban","Fernanda","Gustavo","Helena","Ignacio","Josefina","Kevin","Liliana","Natalia","Óscar",
    "Priscila","Rocío","Simón","Teresa","Walter","Yolanda","Alexis","Berenice","Cristóbal","Dafne",
    "Emanuel","Florencia","Genaro","Hilda","Iván","Jacinta","Lucas","Magdalena","Nicolás","Paulina",
    "Renato","Sandra","Tomás","Valeria","Ximena","Zoe","Adolfo","Bianca","Conrado","Domitila",
  ];

  const APELLIDOS = [
    "González","Soto","Vargas","Muñoz","Pino","Aravena","Reyes","Cárdenas","Vega","Henríquez",
    "Bravo","Torres","Espinoza","Olivares","Saavedra","Lillo","Rojas","Pizarro","Maldonado","Salinas",
    "Cisternas","Fuenzalida","Quintana","Hidalgo","Lagos","Toledo","Núñez","Briceño","Vidal","Mora",
    "Aguilar","Pacheco","Castro","Riveros","Faúndez","Ibáñez","Tapia","Becerra","Carrasco","Espina",
    "Yáñez","Vilches","Bustos","Cornejo","Acuña","Romero","Donoso","Garrido","Norambuena","Sandoval",
    "Cofré","Bolados","Mella","Inostroza","Cortés","Lorca","Aguayo","Mardones","Rivera","Ojeda",
    "Iturra","Letelier","Plaza","Tobar","Arenas","Mancilla","Almonacid","Bahamondes","Cifuentes",
    "Pereira","Lobos","Ramírez","Astudillo","Quiroga","Cabrera","Sepúlveda","Martínez","Pérez","López",
    "Silva","Díaz","Fuentes","Morales","Rojas","Contreras","Araya","Herrera","Sánchez","Flores",
  ];












  const generaRS = (i: number) => {
    if (i % 3 === 0) return `${pick(P.razonSocial.prefijos)} ${pick(P.razonSocial.regiones)} ${pick(P.razonSocial.sufijos)}`;
    if (i % 3 === 1) return `${pick(P.razonSocial.prefijos)} ${pick(P.razonSocial.rubros)} ${pick(P.razonSocial.sufijos)}`;
    return `${pick(P.razonSocial.prefijos)} ${pick(P.razonSocial.rubros)} ${pick(P.razonSocial.regiones)} ${pick(P.razonSocial.sufijos)}`;
  };



  // Email helper — la mayoría con dominio corporativo, pero algunos con personal (planted)
  const generaEmail = (rs: string) => {
    const slug = rs.toLowerCase().split(" ")[0].replace(/[^a-z]/g, "");
    return `contacto@${slug}.cl`;
  };

  // Bandas salariales — vienen del pack, no del motor.
    const BANDAS: Record<string, [number, number]> = {};
    P.cargos.forEach((c) => { BANDAS[c.cargo] = c.sueldo; });

    const sueldoEstandar = (cargo: string): number => {
      const [min, max] = BANDAS[cargo] || [800_000, 1_500_000];
      return Math.floor(min + rng() * (max - min));
    };

  // ─────────────────────────────────────────────────────────────────────
  // EMPLEADOS — 2.500 registros (matching el spec de la empresa)
  // ─────────────────────────────────────────────────────────────────────
  const N_EMPLEADOS = 2500;
  const empleados: Empleado[] = [];

  for (let i = 0; i < N_EMPLEADOS; i++) {
    const cargo = pick(CARGOS_EXPANDIDOS);
    empleados.push({
      id: `E${String(i + 1).padStart(5, "0")}`,
      rut: randomRUT(),
      nombre: `${pick(NOMBRES)} ${pick(APELLIDOS)}`,
      area: pick(P.areasEmpleado),
      cargo,
      banco: pick(P.bancos),
      cuentaBanco: randomCuenta(),
      fechaIngreso: randomDate(2015, 2024),
      sueldoBase: sueldoEstandar(cargo),
    });
  }

  // 🚨 HALLAZGO #1: 3 empleados específicos cuya cuenta aparecerá en proveedores
  // (los acomodamos en áreas sensibles)
  const COLISION_EMP_IDX = [42, 287, 1133];
  const COLISION_INFO = P.plantados.colisiones.map((c) => c.empleado);
  COLISION_EMP_IDX.forEach((idx, k) => {
    empleados[idx].area = COLISION_INFO[k].area;
    empleados[idx].cargo = COLISION_INFO[k].cargo;
    empleados[idx].nombre = COLISION_INFO[k].nombre;
    empleados[idx].sueldoBase = sueldoEstandar(COLISION_INFO[k].cargo);
  });

  // 🚨 HALLAZGO #13: 2 empleados con cuenta bancaria compartida entre sí
  const SHARED_BANK = "BCI";
  const SHARED_CUENTA = "33445566";
  const SHARED_PAIR_IDX = [811, 1872];
  SHARED_PAIR_IDX.forEach((idx) => {
    empleados[idx].banco = SHARED_BANK;
    empleados[idx].cuentaBanco = SHARED_CUENTA;
  });
  // Hacerlos identificables en el demo: misma área, ingresos cercanos
    P.plantados.cuentaCompartida.forEach((info, k) => {
      const idx = SHARED_PAIR_IDX[k];
      empleados[idx].area = info.area;
      empleados[idx].cargo = info.cargo;
      empleados[idx].nombre = info.nombre;
      empleados[idx].fechaIngreso = k === 0 ? "2024-08-15" : "2024-09-02";
      empleados[idx].sueldoBase = sueldoEstandar(info.cargo);
    });

    // 🚨 HALLAZGO #14: 3 sueldos atípicos (analistas recién ingresados con sueldo de gerencia)
  const SUELDO_ATIPICO_IDX = [567, 1402, 2089];
  const SUELDO_ATIPICO_INFO = P.plantados.sueldosAtipicos.map((x) => ({
      nombre: x.nombre, area: x.area, cargo: x.cargo, ingreso: x.ingreso, sueldo: x.sueldoCLP,
    }));
  SUELDO_ATIPICO_IDX.forEach((idx, k) => {
    const info = SUELDO_ATIPICO_INFO[k];
    empleados[idx].nombre = info.nombre;
    empleados[idx].area = info.area;
    empleados[idx].cargo = info.cargo;
    empleados[idx].fechaIngreso = info.ingreso;
    empleados[idx].sueldoBase = info.sueldo;
  });

  // ─────────────────────────────────────────────────────────────────────
  // PROVEEDORES — 1.200 registros
  // ─────────────────────────────────────────────────────────────────────
  const N_PROVEEDORES = 1200;
  const proveedores: Proveedor[] = [];

  for (let i = 0; i < N_PROVEEDORES; i++) {
    const rs = generaRS(i);
    proveedores.push({
      id: `P${String(i + 1).padStart(5, "0")}`,
      rut: randomRUT(),
      razonSocial: rs,
      categoria: pick(P.categoriasProveedor),
      cuentaBanco: randomCuenta(),
      banco: pick(P.bancos),
      fechaAlta: randomDate(2018, 2024),
      estado: rng() > 0.12 ? "Activo" : (rng() > 0.5 ? "Inactivo" : "Bloqueado"),
      contactoEmail: generaEmail(rs),
    });
  }

  // 🚨 HALLAZGO #1 (cont): 3 proveedores con cuenta = empleados
  const COLISION_PROV = P.plantados.colisiones.map((c, k) => ({
      id: `P0120${k + 1}`,
      rs: c.razonSocial,
      empIdx: COLISION_EMP_IDX[k],
    }));
  COLISION_PROV.forEach((c) => {
    const emp = empleados[c.empIdx];
    proveedores.push({
      id: c.id,
      rut: randomRUT(),
      razonSocial: c.rs,
      categoria: P.categoriasProveedor[0],
      cuentaBanco: emp.cuentaBanco, // ← MISMA CUENTA
      banco: emp.banco,             // ← MISMO BANCO
      fechaAlta: "2025-08-15",
      estado: "Activo",
      contactoEmail: `contacto@${c.rs.split(" ")[0].toLowerCase()}.cl`,
    });
  });

  // 🚨 HALLAZGO #2: proveedores fantasma (creados hace poco, ya con facturación grande)
    const FANTASMA_ALTAS = ["2026-03-08", "2026-04-02"];
    P.plantados.fantasmas.forEach((f, k) => {
      proveedores.push({
        id: `P0120${4 + k}`, rut: randomRUT(),
        razonSocial: f.razonSocial, categoria: f.categoria,
        cuentaBanco: randomCuenta(), banco: pick(P.bancos),
        fechaAlta: FANTASMA_ALTAS[k], estado: "Activo",
        contactoEmail: f.email || generaEmail(f.razonSocial),
      });
    });

    // 🚨 HALLAZGO #3: proveedores B2B con email de dominio personal
    const EMAIL_ALTAS = ["2025-06-22", "2024-11-09", "2025-02-14"];
    P.plantados.emailPersonal.forEach((f, k) => {
      proveedores.push({
        id: `P0120${6 + k}`, rut: randomRUT(),
        razonSocial: f.razonSocial, categoria: f.categoria,
        cuentaBanco: randomCuenta(), banco: pick(P.bancos),
        fechaAlta: EMAIL_ALTAS[k], estado: "Activo",
        contactoEmail: f.email!,
      });
    });

    // 🚨 HALLAZGO #4: proveedor "Inactivo" que reaparece con factura reciente
    proveedores.push({
      id: "P01209", rut: randomRUT(),
      razonSocial: P.plantados.inactivo.razonSocial,
      categoria: P.plantados.inactivo.categoria,
      cuentaBanco: randomCuenta(), banco: pick(P.bancos),
      fechaAlta: "2019-04-18", estado: "Inactivo",
      contactoEmail: P.plantados.inactivo.email || generaEmail(P.plantados.inactivo.razonSocial),
    });

    // 🚨 HALLAZGO #7: proveedor "blanco" para concentración de aprobador
    proveedores.push({
      id: "P01210", rut: randomRUT(),
      razonSocial: P.plantados.concentracion.razonSocial,
      categoria: P.plantados.concentracion.categoria,
      cuentaBanco: randomCuenta(), banco: pick(P.bancos),
      fechaAlta: "2024-03-10", estado: "Activo",
      contactoEmail: P.plantados.concentracion.email || generaEmail(P.plantados.concentracion.razonSocial),
    });

  // ─────────────────────────────────────────────────────────────────────
  // ÓRDENES DE COMPRA — ~3.500 registros
  // ─────────────────────────────────────────────────────────────────────




  // Índices de proveedores activos (solo entre los 1200 procedurales — para evitar que
  // las OCs procedurales contaminen los hallazgos plantados en los proveedores P01201-P01210)
  const idxActivos = proveedores
    .slice(0, 1200)
    .map((p, i) => (p.estado === "Activo" ? i : -1))
    .filter((i) => i >= 0);

  const N_OC_BASE = 3460;
  const ordenesCompra: OrdenCompra[] = [];

  // Helper: fecha que no caiga en sábado/domingo (las OCs procedurales se emiten en hábiles)
  const businessDate = (yStart: number, yEnd: number) => {
    let d = randomDate(yStart, yEnd);
    let dt = new Date(d);
    // si cae en sábado o domingo, mover al lunes
    while (dt.getDay() === 0 || dt.getDay() === 6) {
      dt = new Date(dt.getTime() + 86400000);
    }
    return dt.toISOString().split("T")[0];
  };

  for (let i = 0; i < N_OC_BASE; i++) {
    const monto = Math.floor(500_000 + rng() * 14_500_000);
    const provIdx = idxActivos[Math.floor(rng() * idxActivos.length)];
    ordenesCompra.push({
      id: `OC-${String(i + 1).padStart(6, "0")}`,
      fecha: businessDate(2025, 2026),
      proveedorId: proveedores[provIdx].id,
      area: pick(P.areasOC),
      monto,
      aprobador: pick(P.aprobadores),
      estado: rng() > 0.05 ? "Aprobada" : "Cancelada",
      descripcion: pick(P.descripcionesOC),
    });
  }

  // 🚨 HALLAZGO #5: 12 OCs justo bajo el umbral de aprobación gerencial del pack
    const UMBRAL = P.umbralAprobacionCLP;
  const SPLIT_VENDOR = proveedores[idxActivos[6]].id;
  for (let i = 0; i < 12; i++) {
    ordenesCompra.push({
      id: `OC-${String(N_OC_BASE + i + 1).padStart(6, "0")}`,
      fecha: businessDate(2025, 2026),
      proveedorId: SPLIT_VENDOR,
      area: P.plantados.fraccionamiento.area,
      monto: UMBRAL - 300_000 + Math.floor(rng() * 290_000),
      aprobador: P.aprobadores[3],
      estado: "Aprobada",
      descripcion: P.plantados.fraccionamiento.descripcion,
    });
  }

  // 🚨 HALLAZGO #7: Concentración de aprobador para P01210 (15 de 17 OCs aprobadas por G. Núñez, ~95% del valor)
  for (let i = 0; i < 15; i++) {
    ordenesCompra.push({
      id: `OC-${String(N_OC_BASE + 12 + i + 1).padStart(6, "0")}`,
      fecha: businessDate(2025, 2026),
      proveedorId: "P01210",
      area: P.areasOC[1],
      monto: 5_500_000 + Math.floor(rng() * 4_000_000), // 5.5M-9.5M cada una
      aprobador: P.aprobadores[5],
      estado: "Aprobada",
      descripcion: `Servicios ${P.plantados.concentracion.categoria.toLowerCase()}`,
    });
  }
  // + 2 OCs del mismo proveedor con otro aprobador, mucho más pequeñas para diluir poco
  for (let i = 0; i < 2; i++) {
    ordenesCompra.push({
      id: `OC-${String(N_OC_BASE + 27 + i + 1).padStart(6, "0")}`,
      fecha: businessDate(2025, 2026),
      proveedorId: "P01210",
      area: P.areasOC[1],
      monto: 1_500_000 + Math.floor(rng() * 1_000_000),
      aprobador: P.aprobadores[4],
      estado: "Aprobada",
      descripcion: `Servicios ${P.plantados.concentracion.categoria.toLowerCase()}`,
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // FACTURAS — ~4.200 registros
  // ─────────────────────────────────────────────────────────────────────
  const facturas: Factura[] = [];

  // Helper: dado un base date y un offset de días, fuerza día hábil
  const businessDateFromBase = (base: string, offsetDays: number) => {
    let dt = new Date(new Date(base).getTime() + offsetDays * 86400000);
    while (dt.getDay() === 0 || dt.getDay() === 6) {
      dt = new Date(dt.getTime() + 86400000);
    }
    return dt.toISOString().split("T")[0];
  };

  // Facturas vinculadas a OCs procedurales (la mayoría)
  ordenesCompra.slice(0, N_OC_BASE).forEach((oc, i) => {
    if (oc.estado === "Cancelada") return;
    const variacion = 0.93 + rng() * 0.12;
    const monto = Math.floor(oc.monto * variacion);
    const fechaFact = businessDateFromBase(oc.fecha, 8 + Math.floor(rng() * 35));
    const pagada = rng() > 0.18;
    facturas.push({
      id: `FA-${String(i + 1).padStart(6, "0")}`,
      fecha: fechaFact,
      fechaPago: pagada ? businessDateFromBase(fechaFact, 12 + Math.floor(rng() * 40)) : null,
      proveedorId: oc.proveedorId,
      ocId: oc.id,
      monto,
      estado: pagada ? "Pagada" : (rng() > 0.5 ? "Pendiente" : "Vencida"),
    });
  });

  // Facturas para las OCs de split (las 12)
  ordenesCompra.slice(N_OC_BASE, N_OC_BASE + 12).forEach((oc, i) => {
    facturas.push({
      id: `FA-${String(facturas.length + i + 1).padStart(6, "0")}`,
      fecha: businessDateFromBase(oc.fecha, 10),
      fechaPago: businessDateFromBase(oc.fecha, 32),
      proveedorId: oc.proveedorId,
      ocId: oc.id,
      monto: oc.monto - Math.floor(rng() * 50_000),
      estado: "Pagada",
    });
  });

  // Facturas para OCs de concentración aprobador (las 17 del P01210)
  ordenesCompra.slice(N_OC_BASE + 12, N_OC_BASE + 12 + 17).forEach((oc, i) => {
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: businessDateFromBase(oc.fecha, 8 + Math.floor(rng() * 20)),
      fechaPago: businessDateFromBase(oc.fecha, 25 + Math.floor(rng() * 30)),
      proveedorId: oc.proveedorId,
      ocId: oc.id,
      monto: oc.monto - Math.floor(rng() * 100_000),
      estado: "Pagada",
    });
  });

  // 🚨 HALLAZGO #8: 23 facturas SIN OC previa
  for (let i = 0; i < 23; i++) {
    const monto = Math.floor(800_000 + rng() * 6_500_000);
    const fechaFact = businessDate(2025, 2026);
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: fechaFact,
      fechaPago: rng() > 0.3 ? businessDateFromBase(fechaFact, 12 + Math.floor(rng() * 25)) : null,
      proveedorId: proveedores[idxActivos[Math.floor(rng() * idxActivos.length)]].id,
      ocId: null,
      monto,
      estado: rng() > 0.3 ? "Pagada" : "Pendiente",
    });
  }

  // 🚨 HALLAZGO #2 (cont): 2 facturas grandes a proveedores fantasma
  facturas.push(
    {
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: "2026-04-20", fechaPago: "2026-05-02",
      proveedorId: "P01204", ocId: null, monto: 18_500_000, estado: "Pagada",
    },
    {
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: "2026-05-05", fechaPago: "2026-05-15",
      proveedorId: "P01205", ocId: null, monto: 24_200_000, estado: "Pagada",
    },
  );

  // 🚨 HALLAZGO #4 (cont): 1 factura reciente a proveedor "Inactivo"
  facturas.push({
    id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
    fecha: "2026-04-13", fechaPago: "2026-04-28", // 2026-04-12 era domingo
    proveedorId: "P01209", ocId: null, monto: 8_700_000, estado: "Pagada",
  });

  // 🚨 HALLAZGO #1 (cont): facturas a los proveedores con colisión bancaria empleado-proveedor
  // Estos proveedores fueron creados específicamente para el plant; les damos volumen visible.
  const COLISION_INVOICES = [
    // P01201 (Inversiones Fenix — empleado Andrea Vargas, Subgerente Compras)
    { provId: "P01201", fecha: "2025-09-22", monto: 7_800_000 },
    { provId: "P01201", fecha: "2025-11-18", monto: 9_200_000 },
    { provId: "P01201", fecha: "2026-02-09", monto: 12_500_000 },
    { provId: "P01201", fecha: "2026-04-15", monto: 8_900_000 },
    // P01202 (Comercial del Valle — empleado Eduardo Lillo, Jefe Logística)
    { provId: "P01202", fecha: "2025-10-08", monto: 5_600_000 },
    { provId: "P01202", fecha: "2026-01-19", monto: 7_300_000 },
    { provId: "P01202", fecha: "2026-03-24", monto: 6_800_000 },
    // P01203 (Servicios Integrales Kolla — empleado Ivonne Castro, Especialista Finanzas)
    { provId: "P01203", fecha: "2025-12-11", monto: 4_200_000 },
    { provId: "P01203", fecha: "2026-03-05", monto: 5_900_000 },
  ];
  COLISION_INVOICES.forEach((c) => {
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: c.fecha,
      fechaPago: businessDateFromBase(c.fecha, 20),
      proveedorId: c.provId,
      ocId: null,
      monto: c.monto,
      estado: "Pagada",
    });
  });

  // 🚨 HALLAZGO #3 (cont): facturas a proveedores con email personal
  const EMAIL_INVOICES = [
    { provId: "P01206", fecha: "2025-10-22", monto: 3_400_000 }, // Asesores Independientes (gmail)
    { provId: "P01206", fecha: "2026-02-13", monto: 4_100_000 },
    { provId: "P01207", fecha: "2026-01-08", monto: 2_800_000 }, // Consultoría Técnica Austral (hotmail)
    { provId: "P01207", fecha: "2026-04-02", monto: 3_200_000 },
    { provId: "P01208", fecha: "2025-11-26", monto: 1_900_000 }, // Suministros Generales Sur (outlook)
    { provId: "P01208", fecha: "2026-03-17", monto: 2_400_000 },
  ];
  EMAIL_INVOICES.forEach((c) => {
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: c.fecha,
      fechaPago: businessDateFromBase(c.fecha, 22),
      proveedorId: c.provId,
      ocId: null,
      monto: c.monto,
      estado: "Pagada",
    });
  });

  // 🚨 HALLAZGO #9: 2 pares de facturas duplicadas
  // Usamos proveedores activos garantizados y ocId: null en la "duplicada" para evitar cruces inconsistentes
  const dupProv1 = proveedores[idxActivos[127]].id;
  facturas.push(
    { id: `FA-${String(facturas.length + 1).padStart(6, "0")}`, fecha: "2026-02-10", fechaPago: "2026-02-25", proveedorId: dupProv1, ocId: null, monto: 3_450_000, estado: "Pagada" },
    { id: `FA-${String(facturas.length + 1).padStart(6, "0")}`, fecha: "2026-02-12", fechaPago: "2026-02-27", proveedorId: dupProv1, ocId: null, monto: 3_450_000, estado: "Pagada" },
  );
  const dupProv2 = proveedores[idxActivos[314]].id;
  facturas.push(
    { id: `FA-${String(facturas.length + 1).padStart(6, "0")}`, fecha: "2026-03-18", fechaPago: "2026-04-02", proveedorId: dupProv2, ocId: null, monto: 1_980_000, estado: "Pagada" },
    { id: `FA-${String(facturas.length + 1).padStart(6, "0")}`, fecha: "2026-03-19", fechaPago: "2026-04-03", proveedorId: dupProv2, ocId: null, monto: 1_980_000, estado: "Pagada" },
  );

  // 🚨 HALLAZGO #6: 4 facturas backdated (fecha de factura ANTES de la fecha de OC)
  // Creamos OCs nuevas dedicadas para esto (no overrides) para evitar contaminar otras facturas
  const BACKDATED = [
    { provIdx: 89,  factDate: "2025-09-12", ocDate: "2025-10-08", monto: 4_280_000, area: P.areasOC[2], aprobador: P.aprobadores[1] },
    { provIdx: 412, factDate: "2026-01-05", ocDate: "2026-01-22", monto: 6_750_000, area: P.areasOC[4], aprobador: P.aprobadores[3] },
    { provIdx: 633, factDate: "2025-11-19", ocDate: "2025-12-10", monto: 3_120_000, area: P.areasOC[1], aprobador: P.aprobadores[2] },
    { provIdx: 808, factDate: "2026-02-27", ocDate: "2026-03-20", monto: 5_890_000, area: P.areasOC[6], aprobador: P.aprobadores[4] },
  ];
  BACKDATED.forEach((b, idx) => {
    const ocId = `OC-${String(N_OC_BASE + 12 + 17 + idx + 1).padStart(6, "0")}`;
    ordenesCompra.push({
      id: ocId,
      fecha: b.ocDate,
      proveedorId: proveedores[b.provIdx].id,
      area: b.area,
      monto: b.monto,
      aprobador: b.aprobador,
      estado: "Aprobada",
      descripcion: P.plantados.backdating.descripcion,
    });
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: b.factDate,
      fechaPago: addDays(b.factDate, 25),
      proveedorId: proveedores[b.provIdx].id,
      ocId,
      monto: b.monto,
      estado: "Pagada",
    });
  });

  // 🚨 HALLAZGO #10: 8 facturas emitidas en fin de semana (domingos)
  const WEEKEND_DATES = [
    "2026-01-04","2026-02-08","2026-03-01","2026-03-15",
    "2026-04-05","2026-04-19","2026-05-03","2026-05-17",
  ];
  WEEKEND_DATES.forEach((d, i) => {
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: d,
      fechaPago: addDays(d, 18 + Math.floor(rng() * 20)),
      proveedorId: proveedores[idxActivos[200 + i * 50]].id,
      ocId: null,
      monto: 2_000_000 + Math.floor(rng() * 8_000_000),
      estado: "Pagada",
    });
  });

  // 🚨 HALLAZGO #11: 5 facturas con monto exactamente redondo
  const ROUND_AMOUNTS = [5_000_000, 7_000_000, 10_000_000, 12_000_000, 15_000_000];
  ROUND_AMOUNTS.forEach((m, i) => {
    const fecha = businessDate(2025, 2026);
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha,
      fechaPago: addDays(fecha, 20),
      proveedorId: proveedores[idxActivos[400 + i * 100]].id,
      ocId: null,
      monto: m,
      estado: "Pagada",
    });
  });

  // 🚨 HALLAZGO #12: 3 facturas con pago ANTES de la fecha de la factura
  const PAID_BEFORE = [
    { fact: "2026-03-20", pago: "2026-03-15", monto: 4_100_000, provIdx: 256 },
    { fact: "2026-04-08", pago: "2026-04-02", monto: 6_800_000, provIdx: 489 },
    { fact: "2026-05-12", pago: "2026-05-07", monto: 3_400_000, provIdx: 723 },
  ];
  PAID_BEFORE.forEach((p) => {
    facturas.push({
      id: `FA-${String(facturas.length + 1).padStart(6, "0")}`,
      fecha: p.fact,
      fechaPago: p.pago,
      proveedorId: proveedores[idxActivos[p.provIdx]].id,
      ocId: null,
      monto: p.monto,
      estado: "Pagada",
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // buildPagosContext — serializa TODOS los hallazgos para AuditIA
  // ─────────────────────────────────────────────────────────────────────
  const buildPagosContext = () => {
    const today = new Date("2026-05-26");

    const montoFacturado = facturas.reduce((a, f) => a + f.monto, 0);
    const pagadas = facturas.filter((f) => f.estado === "Pagada").length;
    const sinOC = facturas.filter((f) => f.ocId === null).length;

    // #1 Colisión empleado↔proveedor
    const empBankMap = new Map(empleados.map((e) => [`${e.banco}|${e.cuentaBanco}`, e]));
    const h1 = proveedores
      .filter((p) => empBankMap.has(`${p.banco}|${p.cuentaBanco}`))
      .map((p) => {
        const e = empBankMap.get(`${p.banco}|${p.cuentaBanco}`)!;
        const factsP = facturas.filter((f) => f.proveedorId === p.id);
        return {
          proveedor: p.razonSocial, provId: p.id, rutProveedor: p.rut,
          empleado: e.nombre, rutEmpleado: e.rut, areaEmp: e.area, cargoEmp: e.cargo,
          banco: p.banco, cuentaCompartida: p.cuentaBanco,
          facturasCount: factsP.length,
          montoTotalCLP: factsP.reduce((a, f) => a + f.monto, 0),
        };
      });

    // #2 Proveedores fantasma
    const h2 = proveedores
      .filter((p) => {
        const days = (today.getTime() - new Date(p.fechaAlta).getTime()) / 86400000;
        if (days > 120) return false;
        const facts = facturas.filter((f) => f.proveedorId === p.id);
        return facts.reduce((a, f) => a + f.monto, 0) > 10_000_000;
      })
      .map((p) => {
        const facts = facturas.filter((f) => f.proveedorId === p.id);
        return {
          id: p.id, razonSocial: p.razonSocial, rut: p.rut, fechaAlta: p.fechaAlta,
          diasDesdeAlta: Math.floor((today.getTime() - new Date(p.fechaAlta).getTime()) / 86400000),
          facturasCount: facts.length,
          montoTotalCLP: facts.reduce((a, f) => a + f.monto, 0),
          emailContacto: p.contactoEmail,
        };
      });

    // #3 Email personal en proveedor
    const personalDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "live.com"];
    const h3 = proveedores
      .filter((p) => personalDomains.some((d) => p.contactoEmail.includes(d)))
      .map((p) => ({
        id: p.id, razonSocial: p.razonSocial, email: p.contactoEmail,
        categoria: p.categoria, estado: p.estado,
        facturasCount: facturas.filter((f) => f.proveedorId === p.id).length,
      }));

    // #4 Proveedor inactivo con factura reciente
    const h4 = proveedores
      .filter((p) => p.estado === "Inactivo")
      .map((p) => {
        const facts = facturas.filter((f) => f.proveedorId === p.id);
        const recientes = facts.filter((f) => new Date(f.fecha) > new Date("2026-01-01"));
        if (recientes.length === 0) return null;
        return {
          id: p.id, razonSocial: p.razonSocial, estado: p.estado,
          facturasRecientes: recientes.length,
          montoRecienteCLP: recientes.reduce((a, f) => a + f.monto, 0),
        };
      })
      .filter((x) => x !== null);

    // #5 Split de aprobación (OCs 4.5M-4.99M, mismo proveedor/área/aprobador)
    const split = ordenesCompra.filter(
      (oc) => oc.monto >= 4_500_000 && oc.monto < 5_000_000
    );
    // Agrupar para detectar el patrón concentrado
    const splitGroups = new Map<string, OrdenCompra[]>();
    split.forEach((oc) => {
      const k = `${oc.proveedorId}|${oc.area}|${oc.aprobador}`;
      if (!splitGroups.has(k)) splitGroups.set(k, []);
      splitGroups.get(k)!.push(oc);
    });
    const h5 = Array.from(splitGroups.entries())
      .filter(([_, ocs]) => ocs.length >= 3)
      .map(([_, ocs]) => ({
        proveedorId: ocs[0].proveedorId,
        proveedor: proveedores.find((p) => p.id === ocs[0].proveedorId)?.razonSocial,
        area: ocs[0].area,
        aprobador: ocs[0].aprobador,
        ocCount: ocs.length,
        montoTotalCLP: ocs.reduce((a, o) => a + o.monto, 0),
        montoPromedioCLP: Math.round(ocs.reduce((a, o) => a + o.monto, 0) / ocs.length),
        umbralAprobacion: 5_000_000,
      }));

    // #6 Backdating (factura anterior a OC)
    const ocById = new Map(ordenesCompra.map((o) => [o.id, o]));
    const h6 = facturas
      .filter((f) => {
        if (!f.ocId) return false;
        const oc = ocById.get(f.ocId);
        if (!oc) return false;
        return new Date(f.fecha) < new Date(oc.fecha);
      })
      .map((f) => {
        const oc = ocById.get(f.ocId!)!;
        return {
          facturaId: f.id, fechaFactura: f.fecha,
          ocId: oc.id, fechaOC: oc.fecha,
          diasBackdating: Math.floor((new Date(oc.fecha).getTime() - new Date(f.fecha).getTime()) / 86400000),
          proveedor: proveedores.find((p) => p.id === f.proveedorId)?.razonSocial,
          montoCLP: f.monto,
        };
      });

    // #7 Concentración aprobador-proveedor (>80% del valor de un proveedor por un solo aprobador)
    const concentracion: Record<string, Record<string, number>> = {};
    ordenesCompra.forEach((oc) => {
      if (!concentracion[oc.proveedorId]) concentracion[oc.proveedorId] = {};
      concentracion[oc.proveedorId][oc.aprobador] =
        (concentracion[oc.proveedorId][oc.aprobador] || 0) + oc.monto;
    });
    const h7 = Object.entries(concentracion)
      .map(([provId, byAprob]) => {
        const total = Object.values(byAprob).reduce((a, b) => a + b, 0);
        if (total < 50_000_000) return null; // ignorar proveedores con poco volumen
        const ocCount = ordenesCompra.filter((oc) => oc.proveedorId === provId).length;
        if (ocCount < 5) return null; // necesita masa crítica de OCs
        const entries = Object.entries(byAprob);
        const top = entries.sort((a, b) => b[1] - a[1])[0];
        const pct = top[1] / total;
        if (pct < 0.85) return null; // solo concentración alta
        return {
          proveedorId: provId,
          proveedor: proveedores.find((p) => p.id === provId)?.razonSocial,
          aprobadorDominante: top[0],
          ocAprobadasPorEste: ordenesCompra.filter((oc) => oc.proveedorId === provId && oc.aprobador === top[0]).length,
          ocTotalProveedor: ocCount,
          porcentajeValor: Math.round(pct * 100),
          valorConcentradoCLP: top[1],
          valorTotalProveedorCLP: total,
        };
      })
      .filter((x) => x !== null);

    // #8 Facturas sin OC (ya contado arriba)
    const h8count = sinOC;

    // #9 Duplicadas
    const dupSet: any[] = [];
    for (let i = 0; i < facturas.length; i++) {
      for (let j = i + 1; j < facturas.length; j++) {
        const a = facturas[i], b = facturas[j];
        if (a.proveedorId === b.proveedorId && a.monto === b.monto) {
          const diff = Math.abs(new Date(a.fecha).getTime() - new Date(b.fecha).getTime()) / 86400000;
          if (diff <= 7) {
            dupSet.push({
              facturaA: a.id, facturaB: b.id,
              proveedor: proveedores.find((p) => p.id === a.proveedorId)?.razonSocial,
              montoCLP: a.monto, fechaA: a.fecha, fechaB: b.fecha,
              diasEntreFacturas: Math.round(diff),
            });
          }
        }
      }
    }

    // #10 Facturas en fin de semana
    const h10 = facturas
      .filter((f) => isWeekend(f.fecha))
      .map((f) => ({
        facturaId: f.id, fecha: f.fecha,
        diaSemana: new Date(f.fecha).getDay() === 0 ? "Domingo" : "Sábado",
        proveedor: proveedores.find((p) => p.id === f.proveedorId)?.razonSocial,
        montoCLP: f.monto,
      }));

    // #11 Montos exactamente redondos (múltiplos de CLP 1M con cero hasta el centavo)
    const h11 = facturas
      .filter((f) => f.monto % 1_000_000 === 0 && f.monto >= 5_000_000)
      .map((f) => ({
        facturaId: f.id, fecha: f.fecha, montoCLP: f.monto,
        proveedor: proveedores.find((p) => p.id === f.proveedorId)?.razonSocial,
      }));

    // #12 Pago antes de fecha de factura
    const h12 = facturas
      .filter((f) => f.fechaPago && new Date(f.fechaPago) < new Date(f.fecha))
      .map((f) => ({
        facturaId: f.id, fechaFactura: f.fecha, fechaPago: f.fechaPago,
        diasAntes: Math.floor((new Date(f.fecha).getTime() - new Date(f.fechaPago!).getTime()) / 86400000),
        proveedor: proveedores.find((p) => p.id === f.proveedorId)?.razonSocial,
        montoCLP: f.monto,
      }));

    // #13 Empleados con cuenta compartida entre sí
    const empAccountGroups = new Map<string, Empleado[]>();
    empleados.forEach((e) => {
      const k = `${e.banco}|${e.cuentaBanco}`;
      if (!empAccountGroups.has(k)) empAccountGroups.set(k, []);
      empAccountGroups.get(k)!.push(e);
    });
    const h13 = Array.from(empAccountGroups.entries())
      .filter(([_, es]) => es.length > 1)
      .map(([k, es]) => ({
        banco: k.split("|")[0],
        cuentaCompartida: k.split("|")[1],
        empleados: es.map((e) => ({
          id: e.id, nombre: e.nombre, area: e.area, cargo: e.cargo, ingreso: e.fechaIngreso,
        })),
      }));

    // #14 Sueldos atípicos: comparar contra el promedio del cargo
    const sueldoStats: Record<string, { sum: number; count: number }> = {};
    empleados.forEach((e) => {
      if (!sueldoStats[e.cargo]) sueldoStats[e.cargo] = { sum: 0, count: 0 };
      sueldoStats[e.cargo].sum += e.sueldoBase;
      sueldoStats[e.cargo].count++;
    });
    const promedioPorCargo: Record<string, number> = {};
    Object.entries(sueldoStats).forEach(([cargo, s]) => {
      promedioPorCargo[cargo] = s.sum / s.count;
    });
    const h14 = empleados
      .filter((e) => {
        const prom = promedioPorCargo[e.cargo] || 0;
        return prom > 0 && e.sueldoBase > prom * 2.0; // sueldo > 2x el promedio del cargo
      })
      .map((e) => ({
        id: e.id, nombre: e.nombre, area: e.area, cargo: e.cargo,
        ingreso: e.fechaIngreso,
        sueldoCLP: e.sueldoBase,
        promedioCargoCLP: Math.round(promedioPorCargo[e.cargo]),
        vecesPromedio: Number((e.sueldoBase / promedioPorCargo[e.cargo]).toFixed(1)),
      }));

    return {
      empresa: {
        nombre: pack.cliente,
        sector: pack.sector,
        empleados: 2500,
        sedes: 5,
        proveedoresActivos: 1200,
      },
      resumen: {
        empleadosEnBase: empleados.length,
        proveedoresEnBase: proveedores.length,
        proveedoresActivos: proveedores.filter((p) => p.estado === "Activo").length,
        ordenesCompra: ordenesCompra.length,
        facturas: facturas.length,
        montoFacturadoCLP: montoFacturado,
        facturasPagadas: pagadas,
        facturasSinOC: sinOC,
      },
      hallazgos: {
        "01_colision_empleado_proveedor": {
          descripcion: `Proveedores con la misma cuenta bancaria que un empleado de ${pack.cliente}`,
          severidad: "Crítica",
          cantidad: h1.length,
          casos: h1,
        },
        "02_proveedores_fantasma": {
          descripcion: "Proveedores creados hace menos de 120 días con facturación acumulada > CLP 10M",
          severidad: "Crítica",
          cantidad: h2.length,
          casos: h2,
        },
        "03_email_personal_proveedor": {
          descripcion: "Proveedores B2B con email de contacto en dominio personal (gmail/hotmail/outlook)",
          severidad: "Alta",
          cantidad: h3.length,
          casos: h3,
        },
        "04_proveedor_inactivo_con_factura_reciente": {
          descripcion: "Proveedores con estado Inactivo que tienen facturas emitidas en el año en curso",
          severidad: "Alta",
          cantidad: h4.length,
          casos: h4,
        },
        "05_split_de_aprobacion": {
          descripcion: "OCs en rango CLP 4.5M-4.99M (justo bajo umbral CLP 5M) que se repiten para mismo proveedor/área/aprobador",
          severidad: "Alta",
          cantidad: h5.reduce((a, g) => a + g.ocCount, 0),
          grupos: h5,
        },
        "06_backdating_oc": {
          descripcion: "Facturas con fecha anterior a la fecha de su OC asociada (la OC se emitió después de la factura)",
          severidad: "Crítica",
          cantidad: h6.length,
          casos: h6,
        },
        "07_concentracion_aprobador": {
          descripcion: "Proveedores donde >80% del valor de las OC fue aprobado por un solo usuario (violación de SoD)",
          severidad: "Alta",
          cantidad: h7.length,
          casos: h7,
        },
        "08_facturas_sin_oc": {
          descripcion: "Facturas registradas sin orden de compra previa",
          severidad: "Media",
          cantidad: h8count,
          umbralTolerable: "10 por trimestre",
        },
        "09_facturas_duplicadas": {
          descripcion: "Pares de facturas del mismo proveedor con mismo monto y emitidas dentro de 7 días",
          severidad: "Alta",
          cantidad: dupSet.length,
          casos: dupSet,
        },
        "10_facturas_fin_de_semana": {
          descripcion: "Facturas con fecha de emisión en sábado o domingo (inusual para B2B)",
          severidad: "Media",
          cantidad: h10.length,
          casos: h10,
        },
        "11_montos_redondos": {
          descripcion: "Facturas con monto exactamente múltiplo de CLP 1M (CLP 5M, 10M, etc.) — patrón sospechoso",
          severidad: "Media",
          cantidad: h11.length,
          casos: h11,
        },
        "12_pago_antes_de_factura": {
          descripcion: "Facturas con fecha de pago anterior a la fecha de emisión de la factura (imposible operativamente)",
          severidad: "Crítica",
          cantidad: h12.length,
          casos: h12,
        },
        "13_empleados_cuenta_compartida": {
          descripcion: "Empleados que comparten la misma cuenta bancaria (potencial empleado fantasma o error de maestro)",
          severidad: "Alta",
          cantidad: h13.length,
          casos: h13,
        },
        "14_sueldos_atipicos": {
          descripcion: "Empleados con sueldo base > 2x el promedio del cargo (potencial fraude o error)",
          severidad: "Alta",
          cantidad: h14.length,
          casos: h14,
        },
      },
      archivos: [
        { nombre: "01_Maestro_Proveedores.xlsx", filas: proveedores.length, periodo: "Vigente al 26-may-2026" },
        { nombre: "02_Ordenes_Compra_FY26.xlsx", filas: ordenesCompra.length, periodo: "Ene 2025 - May 2026" },
        { nombre: "03_Facturas_Pagos_FY26.xlsx", filas: facturas.length, periodo: "Ene 2025 - May 2026" },
        { nombre: "04_Maestro_Empleados.xlsx", filas: empleados.length, periodo: "Vigente al 26-may-2026" },
      ],
      notaImportante: `${pack.cliente} opera con muestreo tradicional ~80 transacciones por test. AuditIA analiza el 100% del universo: 2.500 empleados, 1.200 proveedores, 3.500+ órdenes de compra y 4.200+ facturas.`,
    };
  };

  return { empleados, proveedores, ordenesCompra, facturas, buildPagosContext };
}
