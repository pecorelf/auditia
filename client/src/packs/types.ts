// Contrato de un Industry Pack.
//
// El MOTOR (src/engine/) no sabe nada de ninguna industria: recibe un pack y
// genera el dataset, planta los hallazgos y los detecta. Todo lo que cambia de
// un cliente a otro vive acá.
//
// Para agregar una industria nueva: crear un archivo en src/packs/ que exporte
// un IndustryPack y registrarlo en src/packs/index.ts. No se toca el motor.

export type CargoSpec = {
  cargo: string;
  /** Peso relativo en la dotación. Un cargo con peso 5 aparece 5x más que uno con peso 1. */
  peso: number;
  /** Rango de sueldo base mensual en CLP [mín, máx]. */
  sueldo: [number, number];
};

export type ProveedorPlantado = {
  /** Razón social ficticia — debe sonar creíble para la industria. */
  razonSocial: string;
  categoria: string;
  email?: string;
};

export type ColisionPlantada = {
  /** Proveedor que comparte cuenta bancaria con un empleado. */
  razonSocial: string;
  /** Datos del empleado en colisión — el cargo debe ser sensible (compras, pagos, finanzas). */
  empleado: { nombre: string; area: string; cargo: string };
};

export type P2PPack = {
  /** Áreas de la organización a las que pertenecen los empleados. */
  areasEmpleado: string[];
  /** Cargos con su peso en la dotación y su banda salarial. */
  cargos: CargoSpec[];
  bancos: string[];
  /** Componentes para generar razones sociales proceduralmente. */
  razonSocial: {
    prefijos: string[];
    rubros: string[];
    regiones: string[];
    sufijos: string[];
  };
  categoriasProveedor: string[];
  /** Áreas que emiten órdenes de compra. */
  areasOC: string[];
  /** Nombres de aprobadores (formato "M. Salazar"). */
  aprobadores: string[];
  /** Descripciones de OC — el vocabulario de gasto real de la industria. */
  descripcionesOC: string[];
  /** Umbral de aprobación gerencial en CLP. Define el rango del fraccionamiento. */
  umbralAprobacionCLP: number;

  plantados: {
    /** 3 proveedores que comparten cuenta bancaria con un empleado. */
    colisiones: ColisionPlantada[];
    /** 2 proveedores creados hace poco y ya con facturación alta. */
    fantasmas: ProveedorPlantado[];
    /** 3 proveedores B2B con email de dominio personal. */
    emailPersonal: ProveedorPlantado[];
    /** 1 proveedor inactivo que reaparece con factura reciente. */
    inactivo: ProveedorPlantado;
    /** 1 proveedor con casi todo su gasto aprobado por una sola persona. */
    concentracion: ProveedorPlantado;
    /** Concepto usado en las OC fraccionadas bajo el umbral. */
    fraccionamiento: { area: string; descripcion: string };
    /** Concepto usado en las OC emitidas después de su factura. */
    backdating: { descripcion: string };
    /** 2 trabajadores que comparten cuenta bancaria entre sí. */
    cuentaCompartida: { nombre: string; area: string; cargo: string }[];
    /** 3 personas con sueldo muy por sobre la banda de su cargo. */
    sueldosAtipicos: { nombre: string; area: string; cargo: string; ingreso: string; sueldoCLP: number }[];
  };
};

/**
 * Vocabulario de la operación de terreno. Alimenta los espacios de Gastos y
 * Remuneraciones, que trabajan sobre turnos, sedes y personal operativo.
 */
export type OperacionPack = {
  /** Sedes o bases donde hay operación: "Base Valparaíso", "Sucursal Providencia", "Tienda Maipú". */
  sedes: string[];
  /** Unidades organizacionales de terreno. */
  unidades: string[];
  /** Cargos operativos — los que hacen turnos. */
  cargosOperativos: CargoSpec[];
  /** Cargos administrativos o de apoyo. */
  cargosAdministrativos: CargoSpec[];
  /** Cómo se llama el activo al que se asigna un turno: remolcador, sucursal, tienda, faena. */
  etiquetaActivo: string;
  /** Nombres de esos activos. */
  activos: string[];
  /** Cómo se llama al personal operativo en conjunto: "dotación embarcada", "dotación de faena". */
  etiquetaDotacion: string;
  /** Cómo se llama una jornada operativa: "faena", "turno de sala", "jornada". */
  etiquetaFaena: string;
  /** Actividades concretas que motivan un turno o un viaje. */
  actividades: string[];
  /** Ciudades con operación, para viajes y rendiciones. */
  ciudades: string[];
  /** Tipos de vehículo de la flota de apoyo. */
  tiposVehiculo: string[];
  /** Convenios colectivos vigentes [operativo, administrativo]. */
  convenios: [string, string];
  /** Bonos autorizados por el convenio. */
  bonosConvenio: string[];
  /** Bono principal del personal operativo — es el que aparece duplicado en el hallazgo. */
  bonoPrincipal: string;
  /** Bono ligado a operar con el equipo completo. */
  bonoDotacionCompleta: string;
};

export type IndustryPack = {
  /** Slug único — es lo que se guarda como pack activo. */
  id: string;
  /** Nombre visible del cliente. Aparece en headers y en el contexto de AuditIA. */
  cliente: string;
  /** Industria en una línea, para el selector del Admin. */
  industria: string;
  /** Sector como se muestra en las fichas de datos. */
  sector: string;
  /** Ruta del logo en /public. Si no existe, cae al wordmark de texto. */
  logoPath: string;
  /** Cómo describir la operación en una frase — se inyecta en los prompts. */
  descripcionOperacion: string;
  /**
   * Espacios que este pack puede mostrar. Los espacios 01-03 y el Coach son
   * agnósticos; "cinco" (Gastos) y "seis" (Remuneraciones) todavía tienen el
   * vocabulario marítimo embebido en src/data/, así que sólo el pack marítimo
   * los declara. Un espacio no declarado no aparece en el menú.
   */
  espaciosDisponibles: string[];
  p2p: P2PPack;
  operacion: OperacionPack;
};
