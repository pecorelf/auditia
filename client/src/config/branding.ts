// Branding centralizado. La identidad del cliente ya no se escribe acá:
// viene del Industry Pack activo (src/packs/), que el Admin puede cambiar.

import { getPackActivo } from "../packs";

const pack = getPackActivo();

export const BRANDING = {
  firmName: pack.cliente,
  practice: "Auditoría Interna",
  product: "AuditIA",
  productTagline: "Auditoría continua con IA",
  logoPath: pack.logoPath,
  faviconPath: "/favicon.svg",
  industria: pack.industria,
  sector: pack.sector,
  colors: {
    brand: "#86BC25",
    brandDark: "#6FA01F",
    ink: "#0A0A0A",
    paper: "#F7F7F5",
    line: "#E5E5E5",
    riskHigh: "#DC2626",
    riskMed: "#F59E0B",
    riskLow: "#16A34A",
  },
  copyright: `© 2026 · Demo Auditoría Interna · ${pack.cliente}`,
} as const;

export const ASSISTANT_TAGLINE = "IA para monitoreo continuo de la operación.";
