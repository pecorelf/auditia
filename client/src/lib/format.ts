// Formatting helpers — Chilean Spanish neutral
export const CLP = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);

export const USD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export const num = (n: number, decimals = 0) =>
  new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

export const pct = (n: number, decimals = 1) =>
  `${num(n * 100, decimals)}%`;

export const compact = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const fmtDate = (d: string | Date) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const fmtRUT = (rut: string) => {
  // Already-formatted RUTs pass through
  if (rut.includes("-")) return rut;
  const clean = rut.replace(/\D/g, "");
  if (clean.length < 2) return rut;
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
};
