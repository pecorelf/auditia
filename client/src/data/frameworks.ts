// Espacio 3 — Marcos regulatorios y de control precargados.
// AuditIA opera con los principios y estructura, no con texto literal.

export type Marco = {
  id: string;
  nombre: string;
  emisor: string;
  ambito: string;
  componentes: string[];
  ultActualizacion: string;
  descripcion: string;
  iconColor: string;
};

export const MARCOS: Marco[] = [
  {
    id: "coso-erm",
    nombre: "COSO ERM 2017",
    emisor: "Committee of Sponsoring Organizations of the Treadway Commission",
    ambito: "Gestión de riesgos empresariales",
    componentes: [
      "Gobernanza y Cultura",
      "Estrategia y Definición de Objetivos",
      "Desempeño",
      "Revisión y Modificación",
      "Información, Comunicación y Reporte",
    ],
    ultActualizacion: "Sept 2017",
    descripcion:
      "Marco integrado de gestión de riesgos que vincula estrategia, riesgo y desempeño. Reemplaza al COSO ERM 2004.",
    iconColor: "#86BC25",
  },
  {
    id: "coso-ic",
    nombre: "COSO Internal Control – IF 2013",
    emisor: "Committee of Sponsoring Organizations of the Treadway Commission",
    ambito: "Control interno",
    componentes: [
      "Entorno de Control",
      "Evaluación de Riesgos",
      "Actividades de Control",
      "Información y Comunicación",
      "Actividades de Supervisión",
    ],
    ultActualizacion: "May 2013",
    descripcion:
      "Marco de referencia mundial para diseño, implementación y evaluación de control interno. Base de SOX 404.",
    iconColor: "#0EA5E9",
  },
  {
    id: "iia",
    nombre: "IIA Global Internal Audit Standards",
    emisor: "Institute of Internal Auditors",
    ambito: "Práctica profesional de auditoría interna",
    componentes: [
      "Propósito, Autoridad y Responsabilidad",
      "Independencia y Objetividad",
      "Competencia y Cuidado Profesional",
      "Gestión de la Actividad",
      "Naturaleza del Trabajo",
      "Planificación del Trabajo",
      "Ejecución del Trabajo",
      "Comunicación de Resultados y Monitoreo",
    ],
    ultActualizacion: "Ene 2024 (vigentes desde Ene 2025)",
    descripcion:
      "Estándares globales de auditoría interna. Estructura actualizada en 2024 que reemplaza el IPPF anterior.",
    iconColor: "#000000",
  },
  {
    id: "ncg-cmf",
    nombre: "Normas CMF (Chile)",
    emisor: "Comisión para el Mercado Financiero",
    ambito: "Gobierno corporativo, riesgos y reporting (Chile)",
    componentes: [
      "NCG 461 — Memoria integrada y reportes ESG",
      "NCG 385 — Gobierno corporativo emisores valores",
      "NCG 269 — Auditoría interna en bancos",
      "NCG 309 — Riesgo operacional bancos",
      "NCG 454 — Ciberseguridad y resiliencia operacional",
    ],
    ultActualizacion: "2024-2026 (actualizaciones varias)",
    descripcion:
      "Normativa chilena aplicable a emisores de valores, bancos, compañías de seguros y otros fiscalizados CMF.",
    iconColor: "#F59E0B",
  },
  {
    id: "ley-20393",
    nombre: "Ley N° 20.393",
    emisor: "República de Chile",
    ambito: "Responsabilidad penal de personas jurídicas",
    componentes: [
      "Identificación de actividades de riesgo",
      "Designación Encargado de Prevención (EPD)",
      "Establecimiento de protocolos y procedimientos",
      "Sistema de denuncias y canal ético",
      "Investigación y aplicación de sanciones",
      "Supervisión y certificación del modelo",
    ],
    ultActualizacion: "Última modificación: Ley 21.595 (Ago 2023) — delitos económicos",
    descripcion:
      "Establece la responsabilidad penal de personas jurídicas en delitos de lavado de activos, financiamiento al terrorismo, cohecho, receptación, entre otros. Ley 21.595 amplió significativamente el catálogo.",
    iconColor: "#DC2626",
  },
  {
    id: "iso-27001",
    nombre: "ISO/IEC 27001:2022",
    emisor: "International Organization for Standardization",
    ambito: "Seguridad de la información",
    componentes: [
      "Contexto de la organización",
      "Liderazgo",
      "Planificación (evaluación y tratamiento de riesgos)",
      "Soporte",
      "Operación",
      "Evaluación del desempeño",
      "Mejora",
      "Anexo A: 93 controles (4 dominios: organizacionales, personas, físicos, tecnológicos)",
    ],
    ultActualizacion: "Oct 2022",
    descripcion:
      "Estándar internacional para Sistemas de Gestión de Seguridad de la Información (SGSI). Anexo A reestructurado en 2022.",
    iconColor: "#6366F1",
  },
  {
    id: "iso-31000",
    nombre: "ISO 31000:2018",
    emisor: "International Organization for Standardization",
    ambito: "Gestión de riesgos",
    componentes: [
      "Principios",
      "Marco de referencia",
      "Proceso de gestión de riesgos",
    ],
    ultActualizacion: "Feb 2018",
    descripcion:
      "Directrices genéricas y principios para gestión de riesgos. Aplicable a cualquier organización, complementa a COSO ERM.",
    iconColor: "#A855F7",
  },
];

// Riesgos emergentes catalogados — para AuditIA sugiera focos de auditoría
export const RIESGOS_EMERGENTES = [
  {
    riesgo: "Gobierno de IA y modelos generativos",
    impacto: "Alto",
    relevancia: "Crítica para 2026",
    marcosRelacionados: ["coso-erm", "iso-27001"],
    detalle: "Gestión del ciclo de vida de modelos, sesgos, explicabilidad, uso de datos sensibles, riesgos de terceros (LLMs).",
  },
  {
    riesgo: "Resiliencia operacional y third-party risk",
    impacto: "Alto",
    relevancia: "NCG 454 + DORA (EU) como referente",
    marcosRelacionados: ["ncg-cmf", "iso-27001"],
    detalle: "Continuidad operacional ante ciberataques, dependencias críticas de proveedores TI, planes de respuesta y recuperación.",
  },
  {
    riesgo: "Cumplimiento Ley 21.595 — Delitos Económicos",
    impacto: "Alto",
    relevancia: "Vigente desde Sept 2024 (parcial)",
    marcosRelacionados: ["ley-20393"],
    detalle: "Ampliación masiva del catálogo de delitos imputables. Requiere actualización del Modelo de Prevención del Delito.",
  },
  {
    riesgo: "ESG reporting y aseguramiento",
    impacto: "Medio-Alto",
    relevancia: "NCG 461 obligatoria",
    marcosRelacionados: ["ncg-cmf", "coso-erm"],
    detalle: "Reporte integrado, datos no financieros, métricas climáticas, alineación con IFRS S1/S2 y CSRD (EU).",
  },
  {
    riesgo: "Fraude y conducta",
    impacto: "Alto",
    relevancia: "Persistente",
    marcosRelacionados: ["coso-ic", "ley-20393"],
    detalle: "Esquemas evolucionan con tecnología. Crítico fortalecer canales de denuncia y data analytics para detección temprana.",
  },
  {
    riesgo: "Privacidad de datos y Ley 21.719",
    impacto: "Alto",
    relevancia: "Nueva Ley de Protección de Datos Chile (vigente Dic 2026)",
    marcosRelacionados: ["iso-27001", "ncg-cmf"],
    detalle: "Reemplaza Ley 19.628. Establece Agencia de Protección, sanciones similares a GDPR, nuevos derechos ARCO+.",
  },
];

export const buildFrameworksContext = () => ({
  marcosDisponibles: MARCOS.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    emisor: m.emisor,
    ambito: m.ambito,
    componentes: m.componentes,
    ultActualizacion: m.ultActualizacion,
  })),
  riesgosEmergentes: RIESGOS_EMERGENTES,
});
