// Health check — verifica que las funciones desplegaron y que el entorno está completo.

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
    apiKeyPresente: Boolean(process.env.ANTHROPIC_API_KEY),
    gateActivo: Boolean(process.env.DEMO_PASSWORD),
    ts: Date.now(),
  });
}
