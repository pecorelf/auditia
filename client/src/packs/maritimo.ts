// Industry Pack · Servicios marítimos — remolcadores portuarios
// Cliente de referencia: SAAM Towage Chile

import type { IndustryPack } from "./types";

export const maritimo: IndustryPack = {
  id: "maritimo",
  cliente: "SAAM Towage Chile",
  industria: "Servicios marítimos · remolcadores portuarios",
  sector: "Servicios marítimos · remolcadores portuarios",
  logoPath: "/logo-saam.png",
  descripcionOperacion:
    "Operador de remolcadores portuarios con bases de Arica a Punta Arenas. Dotación embarcada " +
    "en turnos de guardia, faenas de atraque y desatraque, y un gasto dominado por combustible " +
    "marino, astilleros y repuestos de motores.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro", "cinco", "seis"],

  p2p: {
    areasEmpleado: [
      "Operaciones Remolcadores", "Mantenimiento y Flota", "Abastecimiento",
      "Administración y Finanzas", "Tecnología", "Comercial", "Legal", "Personas",
      "Seguridad y Medio Ambiente", "Compras", "Base Valparaíso", "Base San Antonio",
      "Base Mejillones", "Base San Vicente", "Base Puerto Montt",
    ],
    cargos: [
      { cargo: "Marinero", peso: 5, sueldo: [900_000, 1_400_000] },
      { cargo: "Contramaestre", peso: 2, sueldo: [1_300_000, 1_900_000] },
      { cargo: "Oficial de Máquinas", peso: 2, sueldo: [1_800_000, 2_600_000] },
      { cargo: "Jefe de Máquinas", peso: 1, sueldo: [2_600_000, 3_800_000] },
      { cargo: "Patrón de remolcador", peso: 2, sueldo: [2_800_000, 4_200_000] },
      { cargo: "Mecánico de flota", peso: 3, sueldo: [1_100_000, 1_700_000] },
      { cargo: "Despachador de operaciones", peso: 2, sueldo: [1_100_000, 1_600_000] },
      { cargo: "Supervisor de faena", peso: 2, sueldo: [1_800_000, 2_600_000] },
      { cargo: "Coordinador de operaciones", peso: 1, sueldo: [1_700_000, 2_500_000] },
      { cargo: "Jefe", peso: 1, sueldo: [2_500_000, 3_800_000] },
      { cargo: "Subgerente", peso: 1, sueldo: [3_800_000, 5_500_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Astillero", "Servicios", "Comercial", "Marítima", "Naviera", "Suministros", "Transportes",
        "Insumos", "Repuestos", "Materiales", "Consultora", "Asesorías", "Soluciones", "Arriendo",
        "Tecnología", "Inversiones", "Ingeniería", "Talleres", "Buceo", "Agencia", "Sociedad", "Logística",
      ],
      rubros: [
        "Marítimos", "Navales", "de Amarre", "de Buceo", "de Bunkering", "de Remolque", "Portuarios",
        "Técnicos", "de Mantención", "de Repuestos", "Hidráulicos", "de Pintura Naval", "de Certificación",
        "de Rescate", "de Combustibles", "de Lubricantes", "de Cabos y Estachas", "de Soldadura", "de Provisiones",
      ],
      regiones: [
        "Valparaíso", "San Antonio", "Mejillones", "Antofagasta", "Iquique", "Arica", "San Vicente",
        "Talcahuano", "Coronel", "Quintero", "Coquimbo", "Lirquén", "Puerto Montt", "Chacabuco",
        "Punta Arenas", "del Pacífico", "del Estrecho", "Austral", "del Norte", "Patagonia", "Central", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Combustible marino (bunkering)", "Astillero y dique seco", "Repuestos y motores",
      "Mantención y talleres", "Agencias y servicios portuarios", "Buceo e inspección submarina",
      "Lubricantes y químicos", "Provisiones y víveres", "Seguridad y EPP", "Consultoría", "Tecnología", "Seguros",
    ],
    areasOC: [
      "Compras", "Operaciones Remolcadores", "Mantenimiento y Flota", "Abastecimiento",
      "TI", "Personas", "Comercial", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Bunkering IFO 380 remolcador", "Suministro MGO faena portuaria", "Varada y dique seco programado",
      "Overhaul motor principal", "Repuestos sistema hidráulico", "Cambio de cabos y estachas",
      "Inspección submarina de casco", "Limpieza y pintura de obra viva", "Certificación de equipos de rescate",
      "Servicio de amarre y desamarre", "Agenciamiento portuario", "Provisiones y víveres tripulación",
      "Lubricantes y químicos de máquinas", "Mantención de defensas neumáticas", "Renovación EPP dotación embarcada",
      "Servicio de buzos mariscadores", "Reparación de winche de remolque", "Servicios profesionales asesoría",
      "Consultoría procesos", "Renovación licencias software flota",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "INVERSIONES FENIX SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Subgerente" } },
        { razonSocial: "COMERCIAL DEL VALLE LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Abastecimiento", cargo: "Jefe" } },
        { razonSocial: "SERVICIOS INTEGRALES KOLLA SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Administración y Finanzas", cargo: "Coordinador de operaciones" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS QUILLOTA SPA", categoria: "Consultoría", email: "info@aequillota.cl" },
        { razonSocial: "GESTIÓN COMERCIAL VALPARAÍSO LTDA", categoria: "Agencias y servicios portuarios", email: "contacto@gcvalpo.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría", email: "rcabrera1987@gmail.com" },
        { razonSocial: "CONSULTORÍA TÉCNICA AUSTRAL LTDA", categoria: "Consultoría", email: "consultoria.austral@hotmail.com" },
        { razonSocial: "SUMINISTROS NAVALES SUR SPA", categoria: "Repuestos y motores", email: "ventas.suministros2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TRANSPORTES BRAVA PATAGONIA SPA", categoria: "Mantención y talleres", email: "contacto@bravapatagonia.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "TI", descripcion: "Consultoría análisis estratégico" },
      backdating: { descripcion: "Compra urgente con regularización posterior" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Operaciones Remolcadores", cargo: "Marinero" },
        { nombre: "Walter Bahamondes Pereira", area: "Operaciones Remolcadores", cargo: "Marinero" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Comercial", cargo: "Despachador de operaciones", ingreso: "2025-11-12", sueldoCLP: 5_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Mecánico de flota", ingreso: "2025-08-04", sueldoCLP: 4_900_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Despachador de operaciones", ingreso: "2025-12-20", sueldoCLP: 6_200_000 },
      ],
    },
  },
};
