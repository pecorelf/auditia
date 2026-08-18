// Industry Pack · Retail — cadena de tiendas con e-commerce
// Cliente de referencia: Retail Andina (genérico)

import type { IndustryPack } from "./types";

export const retail: IndustryPack = {
  id: "retail",
  cliente: "Retail Andina",
  industria: "Retail · cadena de tiendas y e-commerce",
  sector: "Retail · cadena de tiendas con canal digital",
  logoPath: "/logo-retail.png",
  descripcionOperacion:
    "Cadena de tiendas con centro de distribución propio y canal e-commerce. El gasto se " +
    "concentra en transporte y última milla, packaging, campañas de temporada, mantención de " +
    "salas y equipos de frío, y servicios de guardias y aseo.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro", "cinco", "seis"],

  p2p: {
    areasEmpleado: [
      "Operaciones Tienda", "Comercial y Compras", "Logística y Distribución", "E-commerce",
      "Marketing", "Prevención de Pérdidas", "Finanzas", "Tecnología", "Personas",
      "Centro de Distribución", "Trade Marketing", "Servicio al Cliente", "Expansión",
      "Abastecimiento", "Contraloría",
    ],
    cargos: [
      { cargo: "Vendedor", peso: 5, sueldo: [600_000, 950_000] },
      { cargo: "Cajero", peso: 4, sueldo: [600_000, 900_000] },
      { cargo: "Reponedor", peso: 3, sueldo: [600_000, 850_000] },
      { cargo: "Operario de bodega", peso: 3, sueldo: [700_000, 1_050_000] },
      { cargo: "Jefe de sección", peso: 2, sueldo: [1_100_000, 1_700_000] },
      { cargo: "Administrador de tienda", peso: 2, sueldo: [1_800_000, 2_700_000] },
      { cargo: "Analista de categoría", peso: 2, sueldo: [1_400_000, 2_200_000] },
      { cargo: "Supervisor de centro de distribución", peso: 1, sueldo: [1_600_000, 2_400_000] },
      { cargo: "Jefe", peso: 2, sueldo: [2_300_000, 3_500_000] },
      { cargo: "Subgerente", peso: 1, sueldo: [3_500_000, 5_200_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Distribuidora", "Comercial", "Servicios", "Transportes", "Importadora", "Soluciones",
        "Agencia", "Publicidad", "Suministros", "Insumos", "Consultora", "Arriendo",
        "Tecnología", "Inversiones", "Montajes", "Sociedad", "Logística", "Mobiliario",
        "Refrigeración", "Seguridad",
      ],
      rubros: [
        "Comerciales", "Logísticos", "de Última Milla", "de Packaging", "de Trade Marketing",
        "Publicitarios", "de Refrigeración", "de Mantención", "de Aseo", "de Seguridad",
        "de Mobiliario", "de Góndolas", "Digitales", "de Retail", "de Capacitación",
        "de Bodegaje", "de Instalación", "de Señalética",
      ],
      regiones: [
        "Santiago", "Providencia", "Maipú", "Puente Alto", "Quilicura", "Pudahuel", "Valparaíso",
        "Viña del Mar", "Concepción", "Antofagasta", "La Serena", "Temuco", "Puerto Montt",
        "Rancagua", "Talca", "Andina", "Central", "del Pacífico", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Transporte y última milla", "Packaging y embalaje", "Publicidad y medios",
      "Trade marketing y activaciones", "Mantención de salas", "Equipos de frío",
      "Seguridad y guardias", "Aseo y sanitización", "Mobiliario y góndolas",
      "Tecnología y punto de venta", "Bodegaje externo", "Consultoría",
      "Capacitación", "Seguros",
    ],
    areasOC: [
      "Compras", "Operaciones Tienda", "Logística y Distribución", "Marketing",
      "Tecnología", "Personas", "E-commerce", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Campaña de temporada medios digitales", "Servicio de transporte última milla",
      "Packaging marca propia", "Mantención equipos de frío salas",
      "Servicio de guardias y prevención de pérdidas", "Arriendo de montacargas centro de distribución",
      "Remodelación de sala de ventas", "Licencias software punto de venta",
      "Servicio de aseo y sanitización", "Mobiliario y góndolas nueva tienda",
      "Activación de trade marketing", "Bodegaje externo temporada alta",
      "Señalética y material POP", "Capacitación fuerza de venta",
      "Servicio de picking y packing e-commerce", "Mantención de sistemas de climatización",
      "Estudio de satisfacción de clientes", "Servicios profesionales asesoría",
      "Consultoría procesos", "Renovación licencias software de gestión de inventario",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "DISTRIBUIDORA ANDINA COMERCIAL SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Subgerente" } },
        { razonSocial: "TRANSPORTES DEL VALLE LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Logística y Distribución", cargo: "Jefe" } },
        { razonSocial: "SERVICIOS INTEGRALES KOLLA SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Finanzas", cargo: "Analista de categoría" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS QUILLOTA SPA", categoria: "Consultoría", email: "info@aequillota.cl" },
        { razonSocial: "AGENCIA GESTIÓN CENTRAL LTDA", categoria: "Publicidad y medios", email: "contacto@agcentral.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría", email: "rcabrera1987@gmail.com" },
        { razonSocial: "PRODUCTORA DE ACTIVACIONES AUSTRAL LTDA", categoria: "Trade marketing y activaciones", email: "activaciones.austral@hotmail.com" },
        { razonSocial: "SUMINISTROS DE PACKAGING SUR SPA", categoria: "Packaging y embalaje", email: "ventas.packaging2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TRANSPORTES BRAVA PATAGONIA SPA", categoria: "Transporte y última milla", email: "contacto@bravapatagonia.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "Marketing", descripcion: "Producción de material promocional" },
      backdating: { descripcion: "Compra urgente para reposición de temporada" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Operaciones Tienda", cargo: "Reponedor" },
        { nombre: "Walter Bahamondes Pereira", area: "Operaciones Tienda", cargo: "Reponedor" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Comercial y Compras", cargo: "Analista de categoría", ingreso: "2025-11-12", sueldoCLP: 5_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Jefe de sección", ingreso: "2025-08-04", sueldoCLP: 4_900_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Analista de categoría", ingreso: "2025-12-20", sueldoCLP: 6_200_000 },
      ],
    },
  },
  operacion: {
    sedes: ["Tienda Santiago Centro", "Tienda Maipú", "Tienda Antofagasta", "Tienda Concepción", "Centro de Distribución Quilicura"],
    unidades: ["Operaciones Tienda", "Centro de Distribución", "E-commerce", "Prevención de Pérdidas", "Trade Marketing", "Logística y Distribución", "Servicio al Cliente"],
    cargosOperativos: [
      { cargo: "Vendedor", peso: 5, sueldo: [600_000, 950_000] },
      { cargo: "Cajero", peso: 4, sueldo: [600_000, 900_000] },
      { cargo: "Reponedor", peso: 3, sueldo: [600_000, 850_000] },
      { cargo: "Operario de bodega", peso: 3, sueldo: [700_000, 1_050_000] },
      { cargo: "Jefe de sección", peso: 1, sueldo: [1_100_000, 1_700_000] },
    ],
    cargosAdministrativos: [
      { cargo: "Administrador de tienda", peso: 3, sueldo: [1_800_000, 2_700_000] },
      { cargo: "Supervisor de centro de distribución", peso: 2, sueldo: [1_600_000, 2_400_000] },
      { cargo: "Analista de categoría", peso: 2, sueldo: [1_400_000, 2_200_000] },
      { cargo: "Coordinador de operaciones", peso: 2, sueldo: [1_500_000, 2_300_000] },
      { cargo: "Analista de Personas", peso: 1, sueldo: [1_200_000, 1_800_000] },
    ],
    etiquetaActivo: "Tienda",
    activos: ["Tienda Santiago Centro", "Tienda Apoquindo", "Tienda Providencia", "Tienda Maipú", "Tienda Ñuñoa", "Tienda Puente Alto", "Tienda Valparaíso", "Tienda Viña del Mar", "Tienda Rancagua", "Tienda Talca", "Tienda Concepción", "Tienda Temuco", "Tienda Puerto Montt", "Tienda La Serena", "Tienda Antofagasta", "CD Quilicura"],
    etiquetaDotacion: "dotación de sala",
    etiquetaFaena: "turno de sala",
    actividades: ["Inventario cíclico de sala", "Apertura de temporada", "Campaña Cyber", "Reposición nocturna", "Toma de inventario anual", "Refuerzo por peak de fin de semana", "Remodelación de sala", "Activación de trade marketing", "Peak de picking e-commerce", "Recepción de contenedor en CD", "Cambio de layout de góndolas", "Liquidación de temporada"],
    ciudades: ["Santiago", "Valparaíso", "Viña del Mar", "Rancagua", "Talca", "Concepción", "Temuco", "Puerto Montt", "La Serena", "Antofagasta", "Iquique", "Arica", "Chillán", "Osorno", "Copiapó"],
    tiposVehiculo: ["Camioneta pool", "Camión de reparto", "Van última milla", "SUV supervisión", "Furgón de traslado"],
    convenios: ["Convenio Comercio 2024-2027", "Sindicato Administrativo 2025-2027"],
    bonosConvenio: ["Bono de sala", "Bono de metas de venta", "Bono nocturno", "Bono de reemplazo", "Bono de dotación completa", "Asignación de zona", "Asignación de colación"],
    bonoPrincipal: "Bono de sala",
    bonoDotacionCompleta: "Bono de dotación completa",
  },

};
