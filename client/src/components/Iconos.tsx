// Sistema de íconos.
//
// Antes se usaban emoji. Se ven distinto en cada sistema operativo, cambian de
// peso visual entre Windows y macOS, y tienen registro de mensajería, no de
// herramienta profesional. Acá se centraliza un set de trazo uniforme para que
// todas las secciones hablen el mismo idioma visual.
//
// Regla: el ícono nunca lleva la información solo. Siempre acompaña a una
// etiqueta de texto — quien usa lector de pantalla no debe perder nada.

import {
  Anchor, Banknote, ClipboardList, Contact, Users, ReceiptText, FileText, BookMarked,
  FilePen, Car, Truck, Fuel, Siren, Satellite, Ship, Wallet, Gauge, ShieldAlert,
  Lightbulb, TriangleAlert, Settings, LogOut, Landmark, Store, Pickaxe, Radio,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, X, Check, Lock, LockOpen,
  type LucideIcon,
} from "lucide-react";

/** Íconos por clave semántica. La clave dice QUÉ es, no cómo se ve. */
export const ICONOS: Record<string, LucideIcon> = {
  // Fuentes de datos
  trabajadores: Users,
  afiliados: Contact,
  turnos: Anchor,
  liquidaciones: ReceiptText,
  finiquitos: FileText,
  convenio: BookMarked,
  solicitudes: FilePen,
  pagos: Banknote,
  tramites: ClipboardList,
  cambiosDatos: Contact,
  proveedores: Truck,
  ordenes: ClipboardList,
  facturas: ReceiptText,
  vehiculos: Car,
  combustible: Fuel,
  multas: Siren,
  gps: Satellite,
  viajes: Gauge,
  rendiciones: Wallet,

  // Industrias
  maritimo: Ship,
  afp: Landmark,
  banca: Landmark,
  mineria: Pickaxe,
  retail: Store,
  medios: Radio,

  // Interfaz
  recomendacion: Lightbulb,
  alerta: TriangleAlert,
  riesgo: ShieldAlert,
  config: Settings,
  salir: LogOut,
  ok: Check,
  cerrar: X,
  candado: Lock,
  candadoAbierto: LockOpen,
  primera: ChevronsLeft,
  anterior: ChevronLeft,
  siguiente: ChevronRight,
  ultima: ChevronsRight,
};

type Props = {
  nombre: keyof typeof ICONOS | string;
  size?: number;
  className?: string;
  /** Trazo. 1.5 es el peso de la interfaz; 2 para énfasis. */
  strokeWidth?: number;
};

export function Icono({ nombre, size = 16, className = "", strokeWidth = 1.75 }: Props) {
  const C = ICONOS[nombre] || FileText;
  return <C size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}

/**
 * Marca de anomalía para celdas de tabla.
 *
 * Toma prestado el vocabulario de los papeles de trabajo: el auditor marca la
 * celda revisada que no cuadra. Va junto al valor, nunca en vez del valor.
 */
export function MarcaAnomalia({ titulo = "Fuera de parámetro" }: { titulo?: string }) {
  return (
    <span
      title={titulo}
      className="inline-flex items-center justify-center ml-1 align-middle text-risk-highTxt"
    >
      <TriangleAlert size={12} strokeWidth={2.25} aria-hidden="true" />
      <span className="sr-only">{titulo}</span>
    </span>
  );
}
