// Industry Pack · Sector Público — Servicio de Tesorerías
// Cliente de referencia: Tesorería General de la República
//
// Particularidades del sector que aparecen en el vocabulario:
//   · No tiene clientes sino contribuyentes, y no vende: recauda por mandato legal
//   · Fiscalizada por la Contraloría General de la República, no por una
//     superintendencia sectorial
//   · Compra por Ley de Compras Públicas: licitaciones, convenio marco, trato
//     directo fundado — el vocabulario de abastecimiento es distinto al privado
//   · El mayor riesgo financiero no es el gasto sino el ingreso que no entra y la
//     deuda que prescribe

import type { IndustryPack } from "./types";

export const tesoreria: IndustryPack = {
  id: "tesoreria",
  cliente: "Tesorería General de la República",
  industria: "Sector Público · Servicio de Tesorerías",
  sector: "Sector público · recaudación fiscal y administración del Tesoro",
  logoPath: "/logo-tgr.png",
  descripcionOperacion:
    "Servicio público responsable de recaudar los ingresos fiscales a través de la red bancaria y " +
    "otros canales autorizados, ejercer la cobranza administrativa y judicial de los créditos " +
    "fiscales, y custodiar los fondos del Tesoro Público. Opera con tesorerías regionales a lo " +
    "largo del país y está sujeta a la fiscalización de la Contraloría General de la República.",
  espaciosDisponibles: ["tesoreria", "uno", "dos", "tres", "cuatro", "cinco", "seis"],

  p2p: {
    areasEmpleado: [
      "Recaudación", "Cobranza Administrativa", "Cobranza Judicial", "Operaciones de Tesorería",
      "Conciliación Bancaria", "Contabilidad Fiscal", "Fiscalía", "Tecnología",
      "Control Interno", "Administración y Finanzas", "Personas", "Abastecimiento",
      "Atención de Contribuyentes", "Tesorería Regional Metropolitana", "Tesorería Regional Valparaíso",
    ],
    cargos: [
      { cargo: "Administrativo", peso: 5, sueldo: [750_000, 1_250_000] },
      { cargo: "Ejecutivo de atención", peso: 4, sueldo: [850_000, 1_400_000] },
      { cargo: "Recaudador Fiscal", peso: 3, sueldo: [1_100_000, 1_800_000] },
      { cargo: "Analista de conciliación", peso: 3, sueldo: [1_200_000, 1_900_000] },
      { cargo: "Abogado de Cobranza", peso: 2, sueldo: [1_900_000, 3_000_000] },
      { cargo: "Contador fiscal", peso: 2, sueldo: [1_400_000, 2_200_000] },
      { cargo: "Ministro de fe", peso: 1, sueldo: [1_300_000, 2_000_000] },
      { cargo: "Jefe de Unidad", peso: 2, sueldo: [2_400_000, 3_600_000] },
      { cargo: "Tesorero Regional", peso: 1, sueldo: [4_000_000, 5_800_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Consultora", "Asesorías", "Servicios", "Comercial", "Soluciones", "Tecnología",
        "Sistemas", "Sociedad", "Estudio", "Imprenta", "Distribuidora", "Capacitación",
        "Auditores", "Ingeniería", "Seguridad", "Mantención", "Transportes", "Suministros",
        "Archivo", "Contact",
      ],
      rubros: [
        "Informáticos", "de Software", "Documentales", "de Archivo", "de Impresión",
        "de Despacho", "Legales", "Notariales", "de Cobranza", "de Capacitación",
        "de Seguridad", "de Aseo", "de Mantención", "Logísticos", "de Digitalización",
        "de Ciberseguridad", "de Conectividad", "Contables",
      ],
      regiones: [
        "Santiago", "Providencia", "Valparaíso", "Viña del Mar", "Concepción", "Antofagasta",
        "La Serena", "Temuco", "Puerto Montt", "Rancagua", "Talca", "Iquique", "Arica",
        "Punta Arenas", "Copiapó", "Andina", "Central", "del Pacífico", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Sistemas y licencias de software", "Servicios informáticos", "Digitalización de expedientes",
      "Archivo y custodia documental", "Impresión y despacho de notificaciones",
      "Servicios notariales y receptores", "Ciberseguridad", "Conectividad y enlaces",
      "Seguridad y vigilancia", "Aseo y mantención de oficinas", "Capacitación",
      "Consultoría", "Auditoría externa", "Suministros de oficina",
    ],
    areasOC: [
      "Abastecimiento", "Tecnología", "Recaudación", "Cobranza Judicial",
      "Operaciones de Tesorería", "Personas", "Control Interno", "Administración y Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Licencias del sistema de recaudación", "Mantención del sistema de cobranza",
      "Digitalización de expedientes de cobranza", "Impresión y despacho de notificaciones",
      "Servicios de receptores judiciales", "Enlaces de conectividad con bancos recaudadores",
      "Monitoreo de ciberseguridad", "Custodia de archivo documental",
      "Servicio de aseo de oficinas regionales", "Servicio de vigilancia de recintos",
      "Capacitación en normativa de cobranza", "Habilitación de oficina de atención",
      "Auditoría externa de procesos", "Plataforma de firma electrónica avanzada",
      "Suministros de oficina por convenio marco", "Soporte de plataforma de pagos",
      "Consultoría de procesos", "Servicios profesionales de asesoría",
      "Renovación de licencias de analítica", "Mantención de equipamiento computacional",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "ASESORÍAS INFORMÁTICAS ANDINA SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Abastecimiento", cargo: "Jefe de Unidad" } },
        { razonSocial: "SERVICIOS DOCUMENTALES CENTRAL LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Tecnología", cargo: "Jefe de Unidad" } },
        { razonSocial: "CONSULTORA GESTIÓN FISCAL SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Administración y Finanzas", cargo: "Contador fiscal" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS QUILLOTA SPA", categoria: "Consultoría", email: "info@aequillota.cl" },
        { razonSocial: "SISTEMAS GESTIÓN PROVIDENCIA LTDA", categoria: "Servicios informáticos", email: "contacto@sgprovidencia.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría", email: "rcabrera1987@gmail.com" },
        { razonSocial: "ESTUDIO JURÍDICO AUSTRAL LTDA", categoria: "Servicios notariales y receptores", email: "estudio.austral@hotmail.com" },
        { razonSocial: "DIGITALIZACIÓN DOCUMENTAL SUR SPA", categoria: "Digitalización de expedientes", email: "ventas.digital2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TRANSPORTES BRAVA PATAGONIA SPA", categoria: "Archivo y custodia documental", email: "contacto@bravapatagonia.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "Tecnología", descripcion: "Consultoría de análisis de datos de cartera" },
      backdating: { descripcion: "Compra urgente con regularización posterior" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Atención de Contribuyentes", cargo: "Ejecutivo de atención" },
        { nombre: "Walter Bahamondes Pereira", area: "Atención de Contribuyentes", cargo: "Ejecutivo de atención" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Recaudación", cargo: "Recaudador Fiscal", ingreso: "2025-11-12", sueldoCLP: 5_400_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Analista de conciliación", ingreso: "2025-08-04", sueldoCLP: 4_600_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Abastecimiento", cargo: "Contador fiscal", ingreso: "2025-12-20", sueldoCLP: 5_900_000 },
      ],
    },
  },

  operacion: {
    sedes: [
      "Tesorería Regional Metropolitana", "Tesorería Regional Valparaíso",
      "Tesorería Regional Biobío", "Tesorería Regional Antofagasta", "Tesorería General",
    ],
    unidades: [
      "Recaudación", "Cobranza Administrativa", "Cobranza Judicial",
      "Operaciones de Tesorería", "Conciliación Bancaria", "Atención de Contribuyentes",
      "Control Interno",
    ],
    cargosOperativos: [
      { cargo: "Ejecutivo de atención", peso: 5, sueldo: [850_000, 1_400_000] },
      { cargo: "Administrativo", peso: 4, sueldo: [750_000, 1_250_000] },
      { cargo: "Recaudador Fiscal", peso: 3, sueldo: [1_100_000, 1_800_000] },
      { cargo: "Ministro de fe", peso: 2, sueldo: [1_300_000, 2_000_000] },
      { cargo: "Jefe de Unidad", peso: 1, sueldo: [2_400_000, 3_600_000] },
    ],
    cargosAdministrativos: [
      { cargo: "Analista de conciliación", peso: 3, sueldo: [1_200_000, 1_900_000] },
      { cargo: "Abogado de Cobranza", peso: 3, sueldo: [1_900_000, 3_000_000] },
      { cargo: "Contador fiscal", peso: 2, sueldo: [1_400_000, 2_200_000] },
      { cargo: "Coordinador de operaciones", peso: 2, sueldo: [1_600_000, 2_400_000] },
      { cargo: "Analista de Personas", peso: 1, sueldo: [1_200_000, 1_800_000] },
    ],
    etiquetaActivo: "Tesorería",
    activos: [
      "Tesorería Regional Metropolitana", "Tesorería Regional Valparaíso",
      "Tesorería Regional Biobío", "Tesorería Regional Antofagasta",
      "Tesorería Regional Araucanía", "Tesorería Regional Los Lagos",
      "Tesorería Regional Maule", "Tesorería Regional O'Higgins",
      "Tesorería Regional Coquimbo", "Tesorería Regional Tarapacá",
      "Tesorería Regional Atacama", "Tesorería Regional Ñuble",
      "Tesorería Regional Los Ríos", "Tesorería Regional Magallanes",
      "Tesorería Regional Aysén", "Tesorería General",
    ],
    etiquetaDotacion: "dotación de atención",
    etiquetaFaena: "jornada de atención",
    actividades: [
      "Atención extendida por vencimiento tributario", "Operativo de contribuyentes en terreno",
      "Peak de permisos de circulación", "Cierre de recaudación mensual",
      "Notificación judicial en terreno", "Remate de bienes embargados",
      "Campaña de convenios de pago", "Atención por vencimiento de contribuciones",
      "Refuerzo por operación renta", "Capacitación normativa a tesorerías regionales",
      "Traslado de expedientes a archivo", "Conciliación de cierre de ejercicio",
    ],
    ciudades: [
      "Santiago", "Valparaíso", "Viña del Mar", "Rancagua", "Talca", "Concepción",
      "Temuco", "Puerto Montt", "La Serena", "Antofagasta", "Iquique", "Arica",
      "Chillán", "Osorno", "Punta Arenas",
    ],
    tiposVehiculo: [
      "Camioneta pool", "Auto institucional", "Van operativos en terreno",
      "SUV supervisión", "Furgón de traslado de expedientes",
    ],
    convenios: ["Estatuto Administrativo · ANEF 2024-2027", "Asociación de Funcionarios 2025-2027"],
    bonosConvenio: [
      "Asignación de función crítica", "Bono de atención extendida", "Bono de operativo en terreno",
      "Bono de reemplazo", "Bono de dotación completa", "Asignación de zona", "Asignación de colación",
    ],
    bonoPrincipal: "Asignación de función crítica",
    bonoDotacionCompleta: "Bono de dotación completa",
  },
};
