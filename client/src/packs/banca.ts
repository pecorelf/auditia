// Industry Pack · Banca — banco universal
// Cliente de referencia: Banco Andes (genérico)

import type { IndustryPack } from "./types";

export const banca: IndustryPack = {
  id: "banca",
  cliente: "Banco Andes",
  industria: "Banca · banco universal",
  sector: "Servicios financieros · banca universal",
  logoPath: "/logo-banca.png",
  descripcionOperacion:
    "Banco universal con banca personas y empresas, red de sucursales y cajeros automáticos, " +
    "fiscalizado por la CMF. El gasto se concentra en procesamiento de medios de pago, core " +
    "bancario, transporte de valores, buró de crédito y campañas de captación.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro", "cinco", "seis"],

  p2p: {
    areasEmpleado: [
      "Banca Personas", "Banca Empresas", "Riesgo de Crédito", "Tesorería", "Operaciones",
      "Cumplimiento y Prevención de LA/FT", "Ciberseguridad", "Tecnología", "Red de Sucursales",
      "Medios de Pago", "Cobranza", "Finanzas", "Legal", "Personas", "Contraloría",
    ],
    cargos: [
      { cargo: "Ejecutivo de cuentas", peso: 5, sueldo: [1_100_000, 1_900_000] },
      { cargo: "Cajero", peso: 4, sueldo: [800_000, 1_200_000] },
      { cargo: "Ejecutivo comercial", peso: 3, sueldo: [1_200_000, 2_100_000] },
      { cargo: "Analista de riesgo", peso: 3, sueldo: [1_600_000, 2_500_000] },
      { cargo: "Analista de operaciones", peso: 2, sueldo: [1_300_000, 2_000_000] },
      { cargo: "Especialista de cumplimiento", peso: 2, sueldo: [1_900_000, 2_900_000] },
      { cargo: "Ingeniero de sistemas", peso: 2, sueldo: [2_000_000, 3_200_000] },
      { cargo: "Gerente de sucursal", peso: 1, sueldo: [3_200_000, 4_800_000] },
      { cargo: "Jefe", peso: 2, sueldo: [2_500_000, 3_800_000] },
      { cargo: "Subgerente", peso: 1, sueldo: [4_000_000, 6_000_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Consultora", "Asesorías", "Servicios", "Comercial", "Soluciones", "Tecnología",
        "Sistemas", "Sociedad", "Estudio", "Agencia", "Gestión", "Procesos", "Imprenta",
        "Seguridad", "Capacitación", "Auditores", "Datos", "Transportes", "Distribuidora", "Contact",
      ],
      rubros: [
        "Financieros", "Bancarios", "de Medios de Pago", "de Cumplimiento", "de Cobranza",
        "de Verificación", "Digitales", "de Datos", "Regulatorios", "de Impresión",
        "de Despacho", "Legales", "de Riesgo", "de Capacitación", "Publicitarios",
        "de Valores", "Contact Center", "de Ciberseguridad", "Tributarios", "de Tasación",
      ],
      regiones: [
        "Santiago", "Providencia", "Las Condes", "Vitacura", "Ñuñoa", "Valparaíso", "Viña del Mar",
        "Concepción", "Antofagasta", "La Serena", "Temuco", "Puerto Montt", "Rancagua", "Talca",
        "Andina", "del Pacífico", "Central", "Cordillera", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Procesamiento de medios de pago", "Core bancario y licencias", "Red de cajeros y mantención",
      "Transporte de valores", "Buró de crédito y scoring", "Verificación de identidad",
      "Contact center y cobranza", "Impresión y despacho de estados de cuenta",
      "Ciberseguridad", "Marketing y campañas", "Servicios legales", "Tasaciones",
      "Consultoría regulatoria", "Seguridad física", "Auditoría externa", "Seguros",
    ],
    areasOC: [
      "Compras", "Tecnología", "Operaciones", "Medios de Pago",
      "Comercial", "Cumplimiento y Prevención de LA/FT", "Personas", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Licencias core bancario", "Procesamiento de tarjetas de crédito",
      "Mantención red de cajeros automáticos", "Servicio de transporte de valores",
      "Servicios de scoring crediticio", "Impresión y despacho de estados de cuenta",
      "Campaña de captación banca personas", "Plataforma de firma electrónica avanzada",
      "Tercerización de cobranza temprana", "Consultoría cumplimiento normativo CMF",
      "Servicio de verificación de identidad", "Monitoreo de ciberseguridad 24/7",
      "Arriendo y habilitación de sucursal", "Servicio de guardias y seguridad física",
      "Tasaciones para créditos hipotecarios", "Capacitación normativa a la red",
      "Auditoría externa de estados financieros", "Servicios profesionales asesoría",
      "Consultoría procesos", "Renovación licencias software analítico",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "ASESORÍAS FINANCIERAS ANDINA SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Subgerente" } },
        { razonSocial: "SERVICIOS DE DATOS CENTRAL LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Tecnología", cargo: "Jefe" } },
        { razonSocial: "CONSULTORA GESTIÓN CAPITAL SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Finanzas", cargo: "Analista de operaciones" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS QUILLOTA SPA", categoria: "Consultoría regulatoria", email: "info@aequillota.cl" },
        { razonSocial: "GESTIÓN COMERCIAL PROVIDENCIA LTDA", categoria: "Marketing y campañas", email: "contacto@gcprovidencia.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría regulatoria", email: "rcabrera1987@gmail.com" },
        { razonSocial: "ESTUDIO LEGAL AUSTRAL LTDA", categoria: "Servicios legales", email: "estudio.austral@hotmail.com" },
        { razonSocial: "SERVICIOS DE TASACIÓN SUR SPA", categoria: "Tasaciones", email: "tasaciones.sur2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TRANSPORTES DE VALORES PATAGONIA SPA", categoria: "Transporte de valores", email: "contacto@tvpatagonia.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría regulatoria", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "Tecnología", descripcion: "Consultoría análisis estratégico" },
      backdating: { descripcion: "Compra urgente con regularización posterior" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Red de Sucursales", cargo: "Cajero" },
        { nombre: "Walter Bahamondes Pereira", area: "Red de Sucursales", cargo: "Cajero" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Banca Personas", cargo: "Ejecutivo de cuentas", ingreso: "2025-11-12", sueldoCLP: 5_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Analista de operaciones", ingreso: "2025-08-04", sueldoCLP: 4_900_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Analista de riesgo", ingreso: "2025-12-20", sueldoCLP: 6_200_000 },
      ],
    },
  },
  operacion: {
    sedes: ["Sucursal Santiago Centro", "Sucursal Providencia", "Sucursal Antofagasta", "Sucursal Concepción", "Sucursal Puerto Montt"],
    unidades: ["Red de Sucursales", "Banca Personas", "Banca Empresas", "Operaciones", "Cobranza", "Medios de Pago", "Contact Center"],
    cargosOperativos: [
      { cargo: "Cajero", peso: 5, sueldo: [800_000, 1_200_000] },
      { cargo: "Ejecutivo de cuentas", peso: 4, sueldo: [1_100_000, 1_900_000] },
      { cargo: "Ejecutivo comercial", peso: 3, sueldo: [1_200_000, 2_100_000] },
      { cargo: "Ejecutivo de contact center", peso: 2, sueldo: [750_000, 1_100_000] },
      { cargo: "Gerente de sucursal", peso: 1, sueldo: [3_200_000, 4_800_000] },
    ],
    cargosAdministrativos: [
      { cargo: "Analista de operaciones", peso: 3, sueldo: [1_300_000, 2_000_000] },
      { cargo: "Analista de riesgo", peso: 3, sueldo: [1_600_000, 2_500_000] },
      { cargo: "Especialista de cumplimiento", peso: 2, sueldo: [1_900_000, 2_900_000] },
      { cargo: "Ingeniero de sistemas", peso: 2, sueldo: [2_000_000, 3_200_000] },
      { cargo: "Analista de Personas", peso: 1, sueldo: [1_200_000, 1_800_000] },
    ],
    etiquetaActivo: "Sucursal",
    activos: ["Sucursal Santiago Centro", "Sucursal Apoquindo", "Sucursal Providencia", "Sucursal Maipú", "Sucursal Ñuñoa", "Sucursal Valparaíso", "Sucursal Viña del Mar", "Sucursal Rancagua", "Sucursal Talca", "Sucursal Concepción", "Sucursal Temuco", "Sucursal Puerto Montt", "Sucursal La Serena", "Sucursal Antofagasta", "Sucursal Iquique", "Sucursal Arica"],
    etiquetaDotacion: "dotación de sucursal",
    etiquetaFaena: "jornada de sucursal",
    actividades: ["Cierre contable de sucursal", "Atención extendida fin de mes", "Arqueo de caja extraordinario", "Campaña de captación en terreno", "Visita a cliente empresa", "Apertura de sucursal nueva", "Refuerzo por peak de pago de remuneraciones", "Operativo de cobranza en terreno", "Migración de sistema en sucursal", "Auditoría de bóveda", "Capacitación normativa a la red", "Traslado de valores programado"],
    ciudades: ["Santiago", "Valparaíso", "Viña del Mar", "Rancagua", "Talca", "Concepción", "Temuco", "Puerto Montt", "La Serena", "Antofagasta", "Iquique", "Arica", "Chillán", "Osorno", "Copiapó"],
    tiposVehiculo: ["Camioneta pool", "Auto ejecutivo", "Van operativa", "SUV supervisión", "Auto fuerza de venta"],
    convenios: ["Convenio Red Comercial 2024-2027", "Sindicato Administrativo 2025-2027"],
    bonosConvenio: ["Bono de metas comerciales", "Bono de atención extendida", "Bono de cierre de mes", "Bono de reemplazo", "Bono de sucursal completa", "Asignación de zona", "Asignación de colación"],
    bonoPrincipal: "Bono de metas comerciales",
    bonoDotacionCompleta: "Bono de sucursal completa",
  },

};
