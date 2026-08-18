// Store de compromisos de auditoría generados desde Hallazgos Activos.
// Persiste en localStorage. Al recargar, aparecen en el dashboard del Espacio 2.

export type Compromiso = {
  id: string;
  fechaCreacion: string;
  titulo: string;
  descripcion: string;
  severidad: "Crítica" | "Alta" | "Media";
  proceso: string;
  responsableSugerido: string;
  fechaCompromiso: string;
  procedimiento: string;
  origenAlerta: string;
  estado: "Generado" | "Asignado" | "En proceso" | "Cerrado";
};

const KEY = "auditia.compromisos";

const HOY = () => new Date().toISOString().slice(0, 10);
const addDays = (date: string, days: number) =>
  new Date(new Date(date).getTime() + days * 86400000).toISOString().split("T")[0];

export const listarCompromisos = (): Compromiso[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const guardarCompromiso = (c: Compromiso) => {
  const todos = listarCompromisos();
  todos.unshift(c); // más recientes arriba
  try {
    localStorage.setItem(KEY, JSON.stringify(todos.slice(0, 50))); // limitar a 50
  } catch {}
};

export const eliminarCompromiso = (id: string) => {
  const todos = listarCompromisos().filter((c) => c.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(todos));
  } catch {}
};

export const limpiarCompromisos = () => {
  try { localStorage.removeItem(KEY); } catch {}
};

// Helper: cuando el usuario hace click en "Generar compromiso" en una AlertCard,
// armamos un compromiso con info plausible derivada del título y severidad.
export const generarDesdeAlerta = (alerta: {
  titulo: string;
  descripcion: string;
  severidad: "Crítica" | "Alta" | "Media";
  metrica?: string;
  accion?: string;
}): Compromiso => {
  // Heurística: el proceso lo inferimos del título
  let proceso = "Compras";
  let responsable = "Patricia Soto";
  const t = alerta.titulo.toLowerCase();
  if (t.includes("empleado")) { proceso = "Nómina"; responsable = "Andrea Pino"; }
  else if (t.includes("pago") || t.includes("tesoreria") || t.includes("tesorería")) { proceso = "Tesorería"; responsable = "Felipe Henríquez"; }
  else if (t.includes("inventario")) { proceso = "Inventarios"; responsable = "Luis Torres"; }
  else if (t.includes("ti ") || t.includes(" ti") || t.includes("acceso") || t.includes("usuario")) { proceso = "TI"; responsable = "Carlos Robles"; }

  // Plazo según severidad
  const plazo = alerta.severidad === "Crítica" ? 60 : alerta.severidad === "Alta" ? 90 : 180;

  const ts = Date.now().toString(36).toUpperCase();
  return {
    id: `COM-2026-${ts.slice(-5)}`,
    fechaCreacion: HOY(),
    titulo: alerta.titulo,
    descripcion: alerta.descripcion,
    severidad: alerta.severidad,
    proceso,
    responsableSugerido: responsable,
    fechaCompromiso: addDays(HOY(), plazo),
    procedimiento: alerta.accion || "Definir procedimiento de remediación",
    origenAlerta: "Hallazgo activo · Monitoreo continuo AuditIA",
    estado: "Generado",
  };
};
