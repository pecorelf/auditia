// Generación sin streaming — usada por los espacios con chat interno
// (Audit Expert y Coach de Auditor). Equivalente serverless de /api/generate.

import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "nodejs", maxDuration: 60 };

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const GATE = process.env.DEMO_PASSWORD;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  if (GATE && req.headers.get("x-demo-password") !== GATE) {
    return json({ error: "No autorizado" }, 401);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "Falta ANTHROPIC_API_KEY en el entorno" }, 500);
  }

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Body inválido" }, 400); }

  const { messages, system, maxTokens = 4096, tools } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "Se requiere el arreglo messages" }, 400);
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

    return json({ text, usage: response.usage, stop_reason: response.stop_reason });
  } catch (err: any) {
    const lower = String(err?.message || "").toLowerCase();
    const friendly =
      lower.includes("overloaded") ? "El servicio está saturado. Reintenta en unos segundos."
      : lower.includes("timeout") ? "La generación tomó demasiado. Intenta con un prompt más conciso."
      : lower.includes("authentication") || lower.includes("401") ? "La API key no es válida."
      : err?.message || "Error inesperado";
    return json({ error: friendly }, err?.status || 500);
  }
}
