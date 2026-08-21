// Industry Pack · Caja de Compensación — beneficios, crédito social y prestaciones
// Cliente de referencia: Caja Los Andes
//
// Particularidades del sector que aparecen en el vocabulario:
//   · Fiscalizada por la Superintendencia de Seguridad Social (SUSESO)
//   · Los afiliados llegan por empresas adherentes, no por contratación directa
//   · Tres negocios muy distintos bajo el mismo techo: crédito social,
//     prestaciones legales (licencias médicas y subsidios) y beneficios
//     (convenios comerciales y centros vacacionales)
//   · El descuento por planilla es el mecanismo de recaudación: si la empresa
//     adherente no entera, el crédito queda expuesto

import type { IndustryPack } from "./types";

export const caja: IndustryPack = {
  id: "caja",
  cliente: "Caja Los Andes",
  industria: "Caja de Compensación · crédito social y beneficios",
  sector: "Seguridad social · caja de compensación de asignación familiar",
  logoPath: "/logo-cla.png",
  descripcionOperacion:
    "Caja de compensación fiscalizada por la Superintendencia de Seguridad Social, con " +
    "afiliados que ingresan a través de empresas adherentes. Opera crédito social con " +
    "descuento por planilla, prestaciones legales como licencias médicas y subsidios, y una " +
    "red de beneficios que incluye convenios comerciales y centros vacacionales propios. " +
    "El gasto se concentra en contraloría médica, cobranza, campañas de colocación, " +
    "operación de los centros y la plataforma de crédito.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro", "cinco", "seis"],

  p2p: {
    areasEmpleado: [
      "Crédito Social", "Prestaciones y Beneficios", "Licencias Médicas y Subsidios",
      "Cobranza", "Red de Sucursales", "Empresas Adherentes", "Turismo y Centros Vacacionales",
      "Riesgo de Crédito", "Cumplimiento Normativo", "Contraloría", "Tecnología",
      "Personas", "Administración y Finanzas", "Marketing", "Compras",
    ],
    cargos: [
      { cargo: "Ejecutivo de sucursal", peso: 5, sueldo: [850_000, 1_400_000] },
      { cargo: "Ejecutivo de empresas adherentes", peso: 3, sueldo: [1_100_000, 1_900_000] },
      { cargo: "Ejecutivo de contact center", peso: 3, sueldo: [750_000, 1_100_000] },
      { cargo: "Analista de crédito social", peso: 3, sueldo: [1_200_000, 1_900_000] },
      { cargo: "Analista de licencias médicas", peso: 2, sueldo: [1_100_000, 1_800_000] },
      { cargo: "Gestor de cobranza", peso: 2, sueldo: [800_000, 1_300_000] },
      { cargo: "Contralor médico", peso: 1, sueldo: [3_000_000, 4_800_000] },
      { cargo: "Especialista de cumplimiento", peso: 2, sueldo: [1_800_000, 2_700_000] },
      { cargo: "Jefe de sucursal", peso: 1, sueldo: [2_200_000, 3_200_000] },
      { cargo: "Jefe", peso: 1, sueldo: [2_500_000, 3_800_000] },
      { cargo: "Subgerente", peso: 1, sueldo: [3_800_000, 5_600_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Consultora", "Asesorías", "Servicios", "Comercial", "Soluciones", "Tecnología",
        "Sistemas", "Sociedad", "Estudio", "Agencia", "Gestión", "Imprenta", "Distribuidora",
        "Capacitación", "Auditores", "Turismo", "Hotelería", "Contact", "Cobranzas", "Médica",
      ],
      rubros: [
        "Previsionales", "Financieros", "de Crédito", "de Cobranza", "Médicos", "de Salud",
        "de Cumplimiento", "de Verificación", "Digitales", "de Datos", "Regulatorios",
        "de Impresión", "de Despacho", "Legales", "de Riesgo", "de Capacitación",
        "Publicitarios", "de Hotelería", "de Alimentación", "de Mantención",
      ],
      regiones: [
        "Santiago", "Providencia", "Las Condes", "Ñuñoa", "Maipú", "Puente Alto",
        "Valparaíso", "Viña del Mar", "Concepción", "Antofagasta", "La Serena", "Temuco",
        "Puerto Montt", "Rancagua", "Talca", "Iquique", "Andina", "Central", "del Pacífico", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Contraloría médica", "Contact center y BPO", "Cobranza externa",
      "Buró de crédito y scoring", "Plataforma de crédito social",
      "Impresión y despacho", "Convenios comerciales", "Operación de centros vacacionales",
      "Alimentación y hotelería", "Mantención de recintos", "Marketing y campañas",
      "Servicios legales", "Consultoría regulatoria", "Verificación de identidad",
      "Capacitación", "Seguros",
    ],
    areasOC: [
      "Compras", "Crédito Social", "Prestaciones y Beneficios", "Tecnología",
      "Turismo y Centros Vacacionales", "Marketing", "Cobranza", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Servicio de contraloría médica de licencias", "Campaña de colocación crédito social",
      "Tercerización de cobranza temprana", "Plataforma de originación de crédito",
      "Servicios de scoring y buró de crédito", "Impresión y despacho de estados de cuenta",
      "Mantención de centro vacacional", "Servicio de alimentación en centros",
      "Renovación de convenios comerciales de beneficios", "Campaña de afiliación de empresas adherentes",
      "Asesoría regulatoria ante SUSESO", "Servicio de verificación de identidad",
      "Capacitación de ejecutivos de sucursal", "Arriendo y habilitación de sucursal",
      "Auditoría externa de cartera de crédito", "Plataforma de firma electrónica avanzada",
      "Servicio de contact center de prestaciones", "Servicios profesionales asesoría",
      "Consultoría procesos", "Renovación licencias software analítico",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "ASESORÍAS FINANCIERAS ANDINA SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Subgerente" } },
        { razonSocial: "SERVICIOS DE COBRANZA CENTRAL LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Cobranza", cargo: "Jefe" } },
        { razonSocial: "CONSULTORA GESTIÓN BENEFICIOS SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Prestaciones y Beneficios", cargo: "Analista de crédito social" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS QUILLOTA SPA", categoria: "Consultoría regulatoria", email: "info@aequillota.cl" },
        { razonSocial: "GESTIÓN COMERCIAL PROVIDENCIA LTDA", categoria: "Marketing y campañas", email: "contacto@gcprovidencia.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría regulatoria", email: "rcabrera1987@gmail.com" },
        { razonSocial: "SERVICIOS MÉDICOS AUSTRAL LTDA", categoria: "Contraloría médica", email: "servicios.austral@hotmail.com" },
        { razonSocial: "PROVEEDORA HOTELERA SUR SPA", categoria: "Alimentación y hotelería", email: "ventas.hotelera2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TURISMO BRAVA PATAGONIA SPA", categoria: "Operación de centros vacacionales", email: "contacto@bravapatagonia.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría regulatoria", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "Tecnología", descripcion: "Consultoría análisis de cartera" },
      backdating: { descripcion: "Compra urgente con regularización posterior" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Red de Sucursales", cargo: "Ejecutivo de sucursal" },
        { nombre: "Walter Bahamondes Pereira", area: "Red de Sucursales", cargo: "Ejecutivo de sucursal" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Crédito Social", cargo: "Ejecutivo de empresas adherentes", ingreso: "2025-11-12", sueldoCLP: 5_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Analista de crédito social", ingreso: "2025-08-04", sueldoCLP: 4_900_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Analista de licencias médicas", ingreso: "2025-12-20", sueldoCLP: 6_200_000 },
      ],
    },
  },

  operacion: {
    sedes: [
      "Sucursal Santiago Centro", "Sucursal Providencia", "Sucursal Concepción",
      "Centro Vacacional Cordillera", "Casa Matriz",
    ],
    unidades: [
      "Red de Sucursales", "Crédito Social", "Prestaciones y Beneficios",
      "Licencias Médicas y Subsidios", "Contact Center", "Cobranza",
      "Turismo y Centros Vacacionales",
    ],
    cargosOperativos: [
      { cargo: "Ejecutivo de sucursal", peso: 5, sueldo: [850_000, 1_400_000] },
      { cargo: "Ejecutivo de contact center", peso: 3, sueldo: [750_000, 1_100_000] },
      { cargo: "Ejecutivo de empresas adherentes", peso: 3, sueldo: [1_100_000, 1_900_000] },
      { cargo: "Gestor de cobranza", peso: 2, sueldo: [800_000, 1_300_000] },
      { cargo: "Jefe de sucursal", peso: 1, sueldo: [2_200_000, 3_200_000] },
    ],
    cargosAdministrativos: [
      { cargo: "Analista de crédito social", peso: 3, sueldo: [1_200_000, 1_900_000] },
      { cargo: "Analista de licencias médicas", peso: 3, sueldo: [1_100_000, 1_800_000] },
      { cargo: "Especialista de cumplimiento", peso: 2, sueldo: [1_800_000, 2_700_000] },
      { cargo: "Coordinador de operaciones", peso: 2, sueldo: [1_600_000, 2_400_000] },
      { cargo: "Analista de Personas", peso: 1, sueldo: [1_200_000, 1_800_000] },
    ],
    etiquetaActivo: "Sucursal",
    activos: [
      "Sucursal Santiago Centro", "Sucursal Providencia", "Sucursal Las Condes",
      "Sucursal Maipú", "Sucursal Puente Alto", "Sucursal Ñuñoa", "Sucursal Valparaíso",
      "Sucursal Viña del Mar", "Sucursal Rancagua", "Sucursal Talca", "Sucursal Concepción",
      "Sucursal Temuco", "Sucursal Puerto Montt", "Sucursal La Serena", "Sucursal Antofagasta",
      "Centro Vacacional Cordillera",
    ],
    etiquetaDotacion: "dotación de atención",
    etiquetaFaena: "jornada de atención",
    actividades: [
      "Operativo de afiliación en empresa adherente", "Charla de beneficios en terreno",
      "Atención extendida por peak de pago", "Campaña de colocación de crédito social",
      "Operativo de pensionados", "Gestión de cobranza en terreno",
      "Recepción de licencias médicas en sucursal", "Temporada alta en centro vacacional",
      "Feria de beneficios con stand", "Visita a empresa adherente",
      "Refuerzo por cierre de mes", "Capacitación de ejecutivos en regiones",
    ],
    ciudades: [
      "Santiago", "Valparaíso", "Viña del Mar", "Rancagua", "Talca", "Concepción",
      "Temuco", "Puerto Montt", "La Serena", "Antofagasta", "Iquique", "Arica",
      "Chillán", "Osorno", "Copiapó",
    ],
    tiposVehiculo: [
      "Camioneta pool", "Auto ejecutivo", "Van operativos en terreno",
      "SUV supervisión", "Auto fuerza de venta",
    ],
    convenios: ["Convenio Red Comercial 2024-2027", "Sindicato Administrativo 2025-2027"],
    bonosConvenio: [
      "Bono de colocación", "Bono de atención extendida", "Bono de operativo en terreno",
      "Bono de reemplazo", "Bono de sucursal completa", "Asignación de zona", "Asignación de colación",
    ],
    bonoPrincipal: "Bono de colocación",
    bonoDotacionCompleta: "Bono de sucursal completa",
  },
};
