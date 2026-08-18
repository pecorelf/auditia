// Industry Pack · AFP — Administradora de Fondos de Pensiones
// Cliente de referencia: AFP Capital
//
// Particularidades del sector que aparecen en el vocabulario:
//   · Fiscalizada por la Superintendencia de Pensiones
//   · Fuerza de venta regulada (agentes previsionales inscritos en el registro)
//   · Gasto fuerte en custodia de valores, data de mercado y despacho de cartolas
//   · La comisión sobre remuneración imponible es el ingreso, no el AUM

import type { IndustryPack } from "./types";

export const afp: IndustryPack = {
  id: "afp",
  cliente: "AFP Capital",
  industria: "AFP · Administradora de Fondos de Pensiones",
  sector: "Previsional · administración de fondos de pensiones",
  logoPath: "/logo-afp.png",
  descripcionOperacion:
    "Administradora de Fondos de Pensiones fiscalizada por la Superintendencia de Pensiones. " +
    "Opera cinco fondos, una red de sucursales a lo largo del país y una fuerza de venta de " +
    "agentes previsionales inscritos en el registro. El gasto se concentra en custodia de valores, " +
    "terminales de información de mercado, despacho de cartolas cuatrimestrales y campañas de " +
    "captación y retención de afiliados.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro"],

  p2p: {
    areasEmpleado: [
      "Inversiones", "Operaciones Previsionales", "Servicio al Afiliado", "Cumplimiento Normativo",
      "Riesgo", "Contraloría", "Legal", "Tecnología", "Comercial", "Marketing", "Personas",
      "Finanzas", "Red de Sucursales", "Beneficios y Pensiones", "Recaudación y Cobranza",
    ],
    cargos: [
      { cargo: "Agente previsional", peso: 5, sueldo: [800_000, 1_500_000] },
      { cargo: "Ejecutivo de sucursal", peso: 4, sueldo: [900_000, 1_400_000] },
      { cargo: "Ejecutivo de servicio al afiliado", peso: 3, sueldo: [800_000, 1_200_000] },
      { cargo: "Analista previsional", peso: 3, sueldo: [1_200_000, 1_800_000] },
      { cargo: "Analista de inversiones", peso: 2, sueldo: [2_000_000, 3_000_000] },
      { cargo: "Especialista de cumplimiento", peso: 2, sueldo: [1_800_000, 2_700_000] },
      { cargo: "Portfolio Manager", peso: 1, sueldo: [4_500_000, 7_000_000] },
      { cargo: "Actuario", peso: 1, sueldo: [2_800_000, 4_200_000] },
      { cargo: "Jefe", peso: 2, sueldo: [2_500_000, 3_800_000] },
      { cargo: "Subgerente", peso: 1, sueldo: [3_800_000, 5_500_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Consultora", "Asesorías", "Servicios", "Comercial", "Soluciones", "Tecnología",
        "Inversiones", "Sociedad", "Estudio", "Agencia", "Gestión", "Análisis", "Imprenta",
        "Distribuidora", "Capacitación", "Auditores", "Corredora", "Datos", "Sistemas", "Archivo",
      ],
      rubros: [
        "Actuariales", "Previsionales", "Financieros", "de Cumplimiento", "de Custodia",
        "de Mercado", "Regulatorios", "Digitales", "de Datos", "de Cobranza", "de Impresión",
        "de Despacho", "Legales", "de Riesgo", "de Capacitación", "Publicitarios",
        "de Verificación", "Contact Center", "de Archivo", "Tributarios",
      ],
      regiones: [
        "Santiago", "Providencia", "Las Condes", "Vitacura", "Ñuñoa", "Valparaíso", "Viña del Mar",
        "Concepción", "Antofagasta", "La Serena", "Temuco", "Puerto Montt", "Rancagua", "Talca",
        "Iquique", "Andina", "del Pacífico", "Central", "Cordillera", "Capital",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Custodia de valores", "Información de mercado", "Impresión y despacho de cartolas",
      "Contact center y BPO", "Tecnología y core previsional", "Consultoría actuarial",
      "Cumplimiento y regulatorio", "Marketing y campañas", "Servicios legales",
      "Verificación de identidad", "Archivo y custodia documental", "Capacitación",
      "Auditoría externa", "Seguros",
    ],
    areasOC: [
      "Compras", "Inversiones", "Operaciones Previsionales", "Tecnología",
      "Comercial", "Marketing", "Cumplimiento Normativo", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Licencias terminal de información de mercado", "Servicio de custodia de valores",
      "Impresión y despacho cartolas cuatrimestrales", "Campaña de captación de afiliados",
      "Consultoría actuarial estudio de tablas", "Tercerización contact center previsional",
      "Mantención plataforma core previsional", "Servicio de verificación de identidad",
      "Capacitación certificación agentes previsionales", "Asesoría regulatoria Superintendencia",
      "Arriendo y habilitación de sucursal", "Auditoría externa de procesos",
      "Plataforma de firma electrónica avanzada", "Servicio de archivo y custodia documental",
      "Campaña de retención de afiliados", "Data histórica de instrumentos financieros",
      "Servicio de cobranza de cotizaciones impagas", "Consultoría procesos",
      "Renovación licencias software analítico", "Estudio de satisfacción de afiliados",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "ASESORÍAS PREVISIONALES ANDINA SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Subgerente" } },
        { razonSocial: "SERVICIOS DE DATOS CENTRAL LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Tecnología", cargo: "Jefe" } },
        { razonSocial: "CONSULTORA GESTIÓN CAPITAL SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Finanzas", cargo: "Analista previsional" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS QUILLOTA SPA", categoria: "Consultoría actuarial", email: "info@aequillota.cl" },
        { razonSocial: "GESTIÓN COMERCIAL PROVIDENCIA LTDA", categoria: "Marketing y campañas", email: "contacto@gcprovidencia.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Cumplimiento y regulatorio", email: "rcabrera1987@gmail.com" },
        { razonSocial: "CONSULTORÍA ACTUARIAL AUSTRAL LTDA", categoria: "Consultoría actuarial", email: "consultoria.austral@hotmail.com" },
        { razonSocial: "SERVICIOS DE CAPACITACIÓN SUR SPA", categoria: "Capacitación", email: "capacitacion.agentes2024@outlook.com" },
      ],
      inactivo: { razonSocial: "IMPRENTA Y DESPACHO PATAGONIA SPA", categoria: "Impresión y despacho de cartolas", email: "contacto@imprentapatagonia.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Cumplimiento y regulatorio", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "Tecnología", descripcion: "Consultoría análisis de datos previsionales" },
      backdating: { descripcion: "Compra urgente con regularización posterior" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Red de Sucursales", cargo: "Ejecutivo de sucursal" },
        { nombre: "Walter Bahamondes Pereira", area: "Red de Sucursales", cargo: "Ejecutivo de sucursal" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Comercial", cargo: "Agente previsional", ingreso: "2025-11-12", sueldoCLP: 5_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Analista previsional", ingreso: "2025-08-04", sueldoCLP: 4_900_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Ejecutivo de sucursal", ingreso: "2025-12-20", sueldoCLP: 6_200_000 },
      ],
    },
  },
};
