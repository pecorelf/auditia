// Endpoint de chat (SSE) como función serverless de Vercel.
//
// Usa la firma clásica de Node (req, res): es la que @vercel/node invoca.
// Mantiene el mismo contrato que server.js, así que el frontend no cambia:
//   event: chunk  → { text }
//   event: done   → { ok: true }
//   event: error  → { error }

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

  // Gate de acceso — evita que cualquiera con el link consuma la API key.
  if (GATE && req.headers["x-demo-password"] !== GATE) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "Falta ANTHROPIC_API_KEY en el entorno de Vercel" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { messages, system, maxTokens = 4096 } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Se requiere el arreglo messages" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof (res as any).flushHeaders === "function") (res as any).flushHeaders();

  const enviar = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      system: system || undefined,
      messages,
    });

    for await (const evt of stream) {
      if (evt.type === "content_block_delta" && evt.delta.type === "text_delta") {
        enviar("chunk", { text: evt.delta.text });
      }
    }

    enviar("done", { ok: true });
  } catch (err: any) {
    const raw = String(err?.message || err);
    const lower = raw.toLowerCase();
    const msg =
      lower.includes("rate_limit") ? "Se alcanzó el límite de solicitudes. Espera unos segundos."
      : lower.includes("authentication") || lower.includes("401") ? "La API key no es válida."
      : lower.includes("overloaded") ? "El modelo está sobrecargado. Reintenta en un momento."
      : `Error al consultar el modelo: ${raw}`;
    enviar("error", { error: msg });
  } finally {
    res.end();
  }
}
