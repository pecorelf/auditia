// Generación sin streaming — usada por Audit Expert y Coach de Auditor.

import Anthropic from "@anthropic-ai/sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { maxDuration: 60 };

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const GATE = process.env.DEMO_PASSWORD;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }
  if (GATE && req.headers["x-demo-password"] !== GATE) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "Falta ANTHROPIC_API_KEY en el entorno de Vercel" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { messages, system, maxTokens = 4096, tools } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Se requiere el arreglo messages" });
    return;
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: system || undefined,
      messages,
      ...(Array.isArray(tools) && tools.length > 0 ? { tools } : {}),
    });

    const text = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    res.status(200).json({ text, usage: response.usage, stop_reason: response.stop_reason });
  } catch (err: any) {
    const lower = String(err?.message || "").toLowerCase();
    const friendly =
      lower.includes("overloaded") ? "El servicio está saturado. Reintenta en unos segundos."
      : lower.includes("timeout") ? "La generación tomó demasiado. Intenta con un prompt más conciso."
      : lower.includes("authentication") || lower.includes("401") ? "La API key no es válida."
      : err?.message || "Error inesperado";
    res.status(err?.status || 500).json({ error: friendly });
  }
}
