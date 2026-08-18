// Industry Pack · Medios de comunicación — televisión
// Cliente de referencia: canal de TV con producción propia y corresponsalías.

import type { IndustryPack } from "./types";

export const medios: IndustryPack = {
  id: "medios",
  cliente: "Canal Nacional",
  industria: "Medios de comunicación · televisión",
  sector: "Medios de comunicación · canal de televisión",
  logoPath: "/logo-medios.png",
  descripcionOperacion:
    "Canal de televisión con operación nacional, producción propia y corresponsalías regionales. " +
    "El gasto se concentra en producción externa, arriendo de equipos, enlaces satelitales y " +
    "servicios técnicos, con equipos periodísticos desplegados en terreno.",
  espaciosDisponibles: ["uno", "dos", "tres", "cuatro"],

  p2p: {
    areasEmpleado: [
      "Prensa", "Programación", "Producción", "Administración y Finanzas", "Tecnología",
      "Comercial y Ventas", "Legal", "Personas", "Operaciones", "Corresponsalía Norte",
      "Corresponsalía Sur", "Post-producción", "Continuidad", "Marketing", "Compras",
    ],
    cargos: [
      { cargo: "Periodista", peso: 5, sueldo: [1_200_000, 2_000_000] },
      { cargo: "Camarógrafo", peso: 4, sueldo: [1_000_000, 1_600_000] },
      { cargo: "Editor", peso: 3, sueldo: [1_100_000, 1_800_000] },
      { cargo: "Productor", peso: 2, sueldo: [1_600_000, 2_500_000] },
      { cargo: "Reportero gráfico", peso: 2, sueldo: [900_000, 1_400_000] },
      { cargo: "Asistente de producción", peso: 2, sueldo: [700_000, 1_000_000] },
      { cargo: "Coordinador", peso: 1, sueldo: [1_700_000, 2_500_000] },
      { cargo: "Supervisor de contenido", peso: 1, sueldo: [2_000_000, 2_900_000] },
      { cargo: "Jefe", peso: 1, sueldo: [2_500_000, 3_800_000] },
      { cargo: "Subgerente", peso: 1, sueldo: [3_800_000, 5_500_000] },
    ],
    bancos: ["BancoEstado", "BCI", "Santander", "Banco de Chile", "Itaú", "Scotiabank", "Security"],
    razonSocial: {
      prefijos: [
        "Productora", "Servicios", "Comercial", "Estudios", "Comunicaciones", "Publicidad",
        "Transportes", "Insumos", "Equipos", "Materiales", "Consultora", "Asesorías", "Soluciones",
        "Arriendo", "Tecnología", "Inversiones", "Iluminación", "Post-producción", "Sonido",
        "Producciones", "Sociedad", "Logística",
      ],
      rubros: [
        "Audiovisuales", "de Contenido", "Digitales", "Técnicos", "de Post-producción",
        "de Transmisión", "Estratégicos", "Profesionales", "de Iluminación", "Satelitales",
        "Publicitarios", "de Locaciones", "de Vigilancia", "de Sonido", "de Cámaras",
        "de Drones", "de Casting", "de Escenografía",
      ],
      regiones: [
        "Andina", "Pacífico", "Aconcagua", "Cordillera", "del Norte", "del Sur", "Central",
        "Maipo", "Maule", "Atacama", "Patagonia", "Quinta", "Bío-Bío", "del Valle", "Capital",
        "Las Condes", "Providencia", "Ñuñoa", "La Reina",
      ],
      sufijos: ["SpA", "Ltda", "SA", "S.A.", "SpA", "Ltda"],
    },
    categoriasProveedor: [
      "Producción externa", "Servicios técnicos", "Arriendo de equipos", "Post-producción",
      "Transmisión y satélite", "Locaciones y estudios", "Publicidad y medios", "Consultoría",
      "Tecnología", "Seguros",
    ],
    areasOC: [
      "Compras", "Prensa", "Producción", "Programación", "TI", "Personas", "Comercial", "Finanzas",
    ],
    aprobadores: [
      "M. Salazar", "P. Castro", "R. Méndez", "C. Vergara", "F. Aguirre",
      "G. Núñez", "T. Espinoza", "J. Riquelme", "A. Carvajal", "B. Donoso",
    ],
    descripcionesOC: [
      "Producción externa reportaje", "Arriendo cámaras temporada", "Servicio iluminación estudio",
      "Enlace satelital cobertura terreno", "Servicio transporte equipo técnico", "Consultoría procesos",
      "Equipos cómputo edición", "Suministros oficina trimestral", "Renovación licencias software edición",
      "Servicio limpieza estudios", "Arriendo drones cobertura aérea", "Servicio capacitación",
      "Mantención software administrativo", "Servicio vigilancia canal", "Materiales construcción set",
      "Reparación equipos técnicos", "Servicios profesionales asesoría", "Equipos post-producción",
    ],
    umbralAprobacionCLP: 5_000_000,

    plantados: {
      colisiones: [
        { razonSocial: "INVERSIONES FENIX SPA", empleado: { nombre: "Andrea Vargas Vega", area: "Compras", cargo: "Subgerente" } },
        { razonSocial: "COMERCIAL DEL VALLE LTDA", empleado: { nombre: "Eduardo Lillo Mora", area: "Operaciones", cargo: "Jefe" } },
        { razonSocial: "SERVICIOS INTEGRALES KOLLA SPA", empleado: { nombre: "Ivonne Castro Riveros", area: "Administración y Finanzas", cargo: "Coordinador" } },
      ],
      fantasmas: [
        { razonSocial: "ASESORÍAS ESTRATÉGICAS QUILLOTA SPA", categoria: "Consultoría", email: "info@aequillota.cl" },
        { razonSocial: "PRODUCCIONES GESTIÓN CENTRAL LTDA", categoria: "Producción externa", email: "contacto@pgcentral.cl" },
      ],
      emailPersonal: [
        { razonSocial: "ASESORES INDEPENDIENTES SPA", categoria: "Consultoría", email: "rcabrera1987@gmail.com" },
        { razonSocial: "PRODUCTORA AUDIOVISUAL AUSTRAL LTDA", categoria: "Producción externa", email: "productora.austral@hotmail.com" },
        { razonSocial: "EQUIPOS TÉCNICOS SUR SPA", categoria: "Arriendo de equipos", email: "ventas.equipos2024@outlook.com" },
      ],
      inactivo: { razonSocial: "TRANSPORTES BRAVA PATAGONIA SPA", categoria: "Servicios técnicos", email: "contacto@bravapatagonia.cl" },
      concentracion: { razonSocial: "SERVICIOS PROFESIONALES TRES VALLES LTDA", categoria: "Consultoría", email: "contacto@tresvalles.cl" },
      fraccionamiento: { area: "TI", descripcion: "Consultoría análisis estratégico" },
      backdating: { descripcion: "Compra urgente con regularización posterior" },
      cuentaCompartida: [
        { nombre: "Camilo Norambuena Sandoval", area: "Operaciones", cargo: "Asistente de producción" },
        { nombre: "Walter Bahamondes Pereira", area: "Operaciones", cargo: "Asistente de producción" },
      ],
      sueldosAtipicos: [
        { nombre: "Genaro Sepúlveda López", area: "Comercial y Ventas", cargo: "Coordinador", ingreso: "2025-11-12", sueldoCLP: 5_800_000 },
        { nombre: "Berenice Lobos Yáñez", area: "Tecnología", cargo: "Editor", ingreso: "2025-08-04", sueldoCLP: 4_900_000 },
        { nombre: "Aníbal Donoso Quiroga", area: "Compras", cargo: "Coordinador", ingreso: "2025-12-20", sueldoCLP: 6_200_000 },
      ],
    },
  },
};
