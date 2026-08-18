// Industry Pack · Minería — faena de cobre
// Cliente de referencia: Minera Altoandina (genérico)

import type { IndustryPack } from "./types";

export const mineria: IndustryPack = {
  id: "mineria",
  cliente: "Minera Altoandina",
  industria: "Minería · faena de cobre",
  sector: "Minería · extracción y procesamiento de cobre",
  logoPath: "/logo-mineria.png",
  descripcionOperacion:
    "Faena minera de cobre con rajo, planta concentradora y campamento en régimen de turnos. " +
    "El gasto se concentra en neumáticos OTR, servicios de tronadura, reactivos de flotación, " +
    "mantención de equipo pesado y contratos de contratistas en faena.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro"],

  p2p: {
    areasEmpleado: [
      "Operaciones Mina", "Planta Concentradora", "Mantenimiento Mina", "Mantenimiento Planta",
      "Geología", "Abastecimiento", "Seguridad y Salud Ocupacional", "Medio Ambiente y Comunidades",
      "Finanzas", "Tecnología", "Personas", "Compras", "Planificación Minera",
      "Servicios a la Faena", "Contratos",
    ],
    cargos: [
      { cargo: "Operador de equipo pesado", peso: 5, sueldo: [1_400_000, 2_300_000] },
      { cargo: "Operador de planta", peso: 4, sueldo: [1_300_000, 2_100_000] },
      { cargo: "Mantenedor mecánico", peso: 3, sueldo: [1_500_000, 2_400_000] },
      { cargo: "Mantenedor eléctrico e instrumentista", peso: 2, sueldo: [1_700_000, 2_600_000] },
      { cargo: "Supervisor de turno", peso: 2, sueldo: [2_400_000, 3_500_000] },
      { cargo: "Geólogo", peso: 1, sueldo: [2_200_000, 3_400_000] },
      { cargo: "Ingeniero de procesos", peso: 2, sueldo: [2_300_000, 3_600_000] },
      { cargo: "Analista de contratos", peso: 2, sueldo: [1_400_000, 2_100_000] },
      { cargo: "Jefe de turno", peso: 1, sueldo: [3_000_000, 4_400_000] },
      { cargo: "Jefe", peso: 1, sueldo: [2_800_000, 4_200_000] },
      { cargo: "Superintendente", peso: 1, sueldo: [5_000_000, 7_500_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Servicios", "Comercial", "Suministros", "Maestranza", "Transportes", "Ingeniería",
        "Contratistas", "Perforaciones", "Constructora", "Insumos", "Repuestos", "Consultora",
        "Arriendo", "Tecnología", "Inversiones", "Talleres", "Sociedad", "Logística",
        "Montajes", "Distribuidora",
      ],
      rubros: [
        "Mineros", "Industriales", "de Tronadura", "de Perforación", "de Mantención",
        "de Movimiento de Tierra", "Metalúrgicos", "de Neumáticos", "de Reactivos",
        "de Correas", "Hidráulicos", "de Soldadura", "de Izaje", "de Transporte",
        "de Campamento", "de Aseo Industrial", "Eléctricos", "de Instrumentación",
      ],
      regiones: [
        "Calama", "Antofagasta", "Mejillones", "Copiapó", "Diego de Almagro", "Iquique",
        "Sierra Gorda", "María Elena", "Tocopilla", "Vallenar", "La Serena", "Rancagua",
        "del Norte", "Andina", "Altiplánica", "del Desierto", "Cordillera", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Neumáticos OTR", "Explosivos y tronadura", "Repuestos equipo pesado",
      "Reactivos y químicos de flotación", "Mantención de correas", "Contratistas movimiento de tierra",
      "Perforación diamantina", "Transporte de concentrado", "Catering y campamento",
      "EPP y seguridad", "Servicios eléctricos", "Consultoría", "Tecnología", "Seguros",
    ],
    areasOC: [
      "Compras", "Operaciones Mina", "Mantenimiento Mina", "Abastecimiento",
      "Tecnología", "Personas", "Planta Concentradora", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Neumáticos OTR camión de extracción", "Servicio de tronadura y explosivos",
      "Reactivos de flotación planta concentradora", "Mantención mayor molino SAG",
      "Repuestos pala hidráulica", "Cambio de correa transportadora",
      "Contrato de catering y campamento", "Servicio de perforación diamantina",
      "Transporte de concentrado a puerto", "Arriendo de equipos de apoyo",
      "EPP dotación de faena", "Servicio de aseo industrial",
      "Mantención de chancador primario", "Montaje electromecánico",
      "Servicio de topografía y control geotécnico", "Suministro de bolas de molienda",
      "Mantención de flota liviana", "Servicios profesionales asesoría",
      "Consultoría procesos", "Renovación licencias software de planificación minera",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "SERVICIOS MINEROS ALTIPLANO SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Superintendente" } },
        { razonSocial: "COMERCIAL DEL DESIERTO LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Abastecimiento", cargo: "Jefe" } },
        { razonSocial: "MAESTRANZA INTEGRAL KOLLA SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Contratos", cargo: "Analista de contratos" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS CALAMA SPA", categoria: "Consultoría", email: "info@aecalama.cl" },
        { razonSocial: "CONTRATISTAS GESTIÓN NORTE LTDA", categoria: "Contratistas movimiento de tierra", email: "contacto@cgnorte.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría", email: "rcabrera1987@gmail.com" },
        { razonSocial: "SERVICIOS TÉCNICOS ALTIPLÁNICOS LTDA", categoria: "Repuestos equipo pesado", email: "servicios.altiplanicos@hotmail.com" },
        { razonSocial: "SUMINISTROS INDUSTRIALES NORTE SPA", categoria: "EPP y seguridad", email: "ventas.suministros2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TRANSPORTES BRAVA ATACAMA SPA", categoria: "Transporte de concentrado", email: "contacto@bravaatacama.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "Tecnología", descripcion: "Consultoría análisis estratégico" },
      backdating: { descripcion: "Compra urgente por detención de equipo crítico" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Operaciones Mina", cargo: "Operador de equipo pesado" },
        { nombre: "Walter Bahamondes Pereira", area: "Operaciones Mina", cargo: "Operador de equipo pesado" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Servicios a la Faena", cargo: "Analista de contratos", ingreso: "2025-11-12", sueldoCLP: 7_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Ingeniero de procesos", ingreso: "2025-08-04", sueldoCLP: 6_900_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Analista de contratos", ingreso: "2025-12-20", sueldoCLP: 8_200_000 },
      ],
    },
  },
};
