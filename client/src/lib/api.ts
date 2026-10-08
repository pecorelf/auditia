// Resolución del backend.
//
// En local (Vite dev en 5173) el backend es server.js en el 3001.
// En Vercel las funciones viven en el mismo origen bajo /api.

const DEV_BACKEND_PORT = "3001";

export const esDesarrollo = () =>
  typeof window !== "undefined" && window.location.port === "5173";

export const apiUrl = (path: string) => {
  if (esDesarrollo()) {
    return `${window.location.protocol}//${window.location.hostname}:${DEV_BACKEND_PORT}${path}`;
  }
  return path; // mismo origen en Vercel
};

export const apiHeaders = (): Record<string, string> => ({
  "Content-Type": "application/json",
});
