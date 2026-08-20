// Industry Pack · Energía — generación hidroeléctrica de pasada
// Cliente de referencia: Tinguiririca Energía
//
// Particularidades del sector que aparecen en el vocabulario:
//   · Centrales de pasada (no embalse): el recurso es el caudal del río, no un
//     stock almacenado, así que la hidrología manda sobre la producción
//   · Fiscalización cruzada: Coordinador Eléctrico Nacional, SEC y SMA
//   · El caudal ecológico es una obligación de la RCA, no una buena práctica
//   · Gasto dominado por mantención mayor de unidades, obras civiles en
//     bocatoma y túneles de aducción, y peajes de transmisión

import type { IndustryPack } from "./types";

export const energia: IndustryPack = {
  id: "energia",
  cliente: "Tinguiririca Energía",
  industria: "Energía · generación hidroeléctrica",
  sector: "Energía · generación hidroeléctrica de pasada",
  logoPath: "/logo-energia.png",
  descripcionOperacion:
    "Generadora hidroeléctrica de pasada con dos centrales en el valle del Tinguiririca, " +
    "Región de O'Higgins, operadas en turnos continuos y coordinadas con el Coordinador " +
    "Eléctrico Nacional. El gasto se concentra en mantención mayor de unidades generadoras, " +
    "obras civiles en bocatoma y túneles de aducción, servicios ambientales asociados a la " +
    "RCA y contratos de operación y mantenimiento.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro", "cinco", "seis"],

  p2p: {
    areasEmpleado: [
      "Operación de Centrales", "Mantenimiento Electromecánico", "Obras Civiles",
      "Gestión Hidrológica", "Comercialización de Energía", "Medio Ambiente y Comunidades",
      "Seguridad y Salud Ocupacional", "Administración y Finanzas", "Tecnología y Automatización",
      "Personas", "Legal y Regulatorio", "Abastecimiento", "Compras",
      "Central La Higuera", "Central La Confluencia",
    ],
    cargos: [
      { cargo: "Operador de central", peso: 5, sueldo: [1_300_000, 2_100_000] },
      { cargo: "Operador de sala de control", peso: 3, sueldo: [1_500_000, 2_300_000] },
      { cargo: "Mantenedor mecánico", peso: 3, sueldo: [1_400_000, 2_200_000] },
      { cargo: "Mantenedor eléctrico e instrumentista", peso: 3, sueldo: [1_600_000, 2_500_000] },
      { cargo: "Técnico hidrológico", peso: 2, sueldo: [1_200_000, 1_900_000] },
      { cargo: "Supervisor de turno", peso: 2, sueldo: [2_300_000, 3_400_000] },
      { cargo: "Ingeniero de operaciones", peso: 2, sueldo: [2_400_000, 3_700_000] },
      { cargo: "Analista de comercialización", peso: 2, sueldo: [1_800_000, 2_800_000] },
      { cargo: "Jefe de central", peso: 1, sueldo: [3_500_000, 5_000_000] },
      { cargo: "Jefe", peso: 1, sueldo: [2_800_000, 4_200_000] },
      { cargo: "Subgerente", peso: 1, sueldo: [4_200_000, 6_200_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Servicios", "Comercial", "Ingeniería", "Montajes", "Constructora", "Maestranza",
        "Suministros", "Consultora", "Asesorías", "Soluciones", "Tecnología", "Inversiones",
        "Talleres", "Transportes", "Sociedad", "Hidro", "Electro", "Contratistas",
        "Instrumentación", "Perforaciones",
      ],
      rubros: [
        "Hidroeléctricos", "Electromecánicos", "de Turbinas", "de Generadores", "de Subestaciones",
        "de Transmisión", "de Obras Civiles", "de Túneles", "Hidrológicos", "Ambientales",
        "de Mantención", "de Izaje", "de Automatización", "de Instrumentación", "de Soldadura",
        "de Aislación", "Geotécnicos", "de Topografía",
      ],
      regiones: [
        "San Fernando", "Rancagua", "Santa Cruz", "Chimbarongo", "Nancagua", "Placilla",
        "Machalí", "Rengo", "San Vicente", "Curicó", "Talca", "Santiago", "Valparaíso",
        "del Tinguiririca", "de Colchagua", "de Cachapoal", "Cordillera", "Central", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Turbinas y generadores", "Subestaciones y transformadores", "Obras civiles",
      "Mantención electromecánica", "Automatización y SCADA", "Servicios hidrológicos",
      "Monitoreo ambiental", "Transmisión y peajes", "Repuestos y suministros",
      "Seguridad y EPP", "Consultoría", "Servicios legales y regulatorios",
      "Tecnología", "Seguros",
    ],
    areasOC: [
      "Compras", "Operación de Centrales", "Mantenimiento Electromecánico", "Obras Civiles",
      "Tecnología y Automatización", "Personas", "Medio Ambiente y Comunidades", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Mantención mayor turbina Francis", "Overhaul de generador unidad 1",
      "Inspección de túnel de aducción", "Limpieza y mantención de desarenador",
      "Mantención de bocatoma y compuertas", "Revisión de subestación elevadora",
      "Cambio de transformador de poder", "Servicio de monitoreo de caudal ecológico",
      "Estudio hidrológico de la cuenca", "Mantención plataforma SCADA",
      "Contratista de obras civiles en canal", "Transporte especial de rotor",
      "Servicios de buceo en obra de captación", "Mantención de válvula esférica",
      "Monitoreo ambiental comprometido en RCA", "Renovación EPP personal de central",
      "Asesoría regulatoria ante el Coordinador", "Servicios profesionales asesoría",
      "Consultoría procesos", "Renovación licencias software de gestión de activos",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "SERVICIOS ELECTROMECÁNICOS CORDILLERA SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Subgerente" } },
        { razonSocial: "CONTRATISTAS DEL TINGUIRIRICA LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Obras Civiles", cargo: "Jefe" } },
        { razonSocial: "INGENIERÍA INTEGRAL COLCHAGUA SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Administración y Finanzas", cargo: "Ingeniero de operaciones" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS SAN FERNANDO SPA", categoria: "Consultoría", email: "info@aesanfernando.cl" },
        { razonSocial: "MONTAJES GESTIÓN CENTRAL LTDA", categoria: "Mantención electromecánica", email: "contacto@mgcentral.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría", email: "rcabrera1987@gmail.com" },
        { razonSocial: "CONSULTORÍA HIDROLÓGICA AUSTRAL LTDA", categoria: "Servicios hidrológicos", email: "consultoria.austral@hotmail.com" },
        { razonSocial: "SUMINISTROS INDUSTRIALES RENGO SPA", categoria: "Repuestos y suministros", email: "ventas.suministros2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TRANSPORTES BRAVA CACHAPOAL SPA", categoria: "Obras civiles", email: "contacto@bravacachapoal.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "Tecnología y Automatización", descripcion: "Consultoría análisis de disponibilidad de activos" },
      backdating: { descripcion: "Compra urgente por indisponibilidad de unidad" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Operación de Centrales", cargo: "Operador de central" },
        { nombre: "Walter Bahamondes Pereira", area: "Operación de Centrales", cargo: "Operador de central" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Comercialización de Energía", cargo: "Analista de comercialización", ingreso: "2025-11-12", sueldoCLP: 6_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología y Automatización", cargo: "Técnico hidrológico", ingreso: "2025-08-04", sueldoCLP: 5_400_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Ingeniero de operaciones", ingreso: "2025-12-20", sueldoCLP: 7_200_000 },
      ],
    },
  },

  operacion: {
    sedes: [
      "Central La Higuera", "Central La Confluencia", "Sala de Control",
      "Obra de Captación", "Oficina San Fernando",
    ],
    unidades: [
      "Operación La Higuera", "Operación La Confluencia", "Sala de Control",
      "Mantenimiento Electromecánico", "Obras Civiles", "Gestión Hidrológica",
      "Medio Ambiente y Comunidades",
    ],
    cargosOperativos: [
      { cargo: "Operador de central", peso: 5, sueldo: [1_300_000, 2_100_000] },
      { cargo: "Operador de sala de control", peso: 3, sueldo: [1_500_000, 2_300_000] },
      { cargo: "Mantenedor mecánico", peso: 3, sueldo: [1_400_000, 2_200_000] },
      { cargo: "Mantenedor eléctrico e instrumentista", peso: 2, sueldo: [1_600_000, 2_500_000] },
      { cargo: "Jefe de central", peso: 1, sueldo: [3_500_000, 5_000_000] },
    ],
    cargosAdministrativos: [
      { cargo: "Supervisor de turno", peso: 3, sueldo: [2_300_000, 3_400_000] },
      { cargo: "Ingeniero de operaciones", peso: 2, sueldo: [2_400_000, 3_700_000] },
      { cargo: "Técnico hidrológico", peso: 2, sueldo: [1_200_000, 1_900_000] },
      { cargo: "Analista de comercialización", peso: 2, sueldo: [1_800_000, 2_800_000] },
      { cargo: "Analista de Personas", peso: 1, sueldo: [1_300_000, 1_900_000] },
    ],
    etiquetaActivo: "Unidad",
    activos: [
      "Unidad 1 La Higuera", "Unidad 2 La Higuera", "Unidad 1 La Confluencia",
      "Unidad 2 La Confluencia", "Turbina Francis 1", "Turbina Francis 2",
      "Generador G-01", "Generador G-02", "Transformador T-01", "Transformador T-02",
      "Subestación Elevadora", "Bocatoma La Higuera", "Bocatoma La Confluencia",
      "Desarenador Norte", "Túnel de Aducción", "Válvula Esférica V-03",
    ],
    etiquetaDotacion: "dotación de central",
    etiquetaFaena: "turno de operación",
    actividades: [
      "Parada programada de unidad", "Mantención mayor de turbina", "Crecida del río por lluvias",
      "Operación en deshielo", "Sincronización al sistema tras mantención",
      "Inspección de túnel de aducción", "Limpieza de desarenador",
      "Emergencia por indisponibilidad forzada", "Maniobra coordinada con el CEN",
      "Prueba de caudal ecológico", "Mantención de subestación", "Turno de control remoto",
    ],
    ciudades: [
      "San Fernando", "Santa Cruz", "Chimbarongo", "Nancagua", "Placilla", "Rengo",
      "Rancagua", "Machalí", "San Vicente", "Curicó", "Talca", "Santiago",
      "Valparaíso", "Chillán", "Los Andes",
    ],
    tiposVehiculo: [
      "Camioneta pool", "Camioneta 4x4", "Bus de acercamiento",
      "SUV supervisión", "Van traslado de turno",
    ],
    convenios: ["Convenio Generación 2024-2027", "Sindicato Administrativo 2025-2027"],
    bonosConvenio: [
      "Bono de turno", "Bono de disponibilidad", "Bono nocturno", "Bono de reemplazo",
      "Bono de dotación completa", "Asignación de zona", "Asignación de colación",
    ],
    bonoPrincipal: "Bono de turno",
    bonoDotacionCompleta: "Bono de dotación completa",
  },
};
