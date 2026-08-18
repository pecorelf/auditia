// Endpoint de chat como función serverless de Vercel.
//
// Reemplaza a server.js en producción. Mantiene el mismo contrato SSE que ya
// consume useClaude.ts, así que el frontend no cambia:
//   event: chunk  → { text }
//   event: done   → { ok: true }
//   event: error  → { error }
//
// En local se sigue usando server.js (npm run dev); ambos hablan el mismo protocolo.

import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "nodejs", maxDuration: 60 };

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const GATE = process.env.DEMO_PASSWORD;

const sse = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Gate de acceso — evita que cualquiera con el link consuma la API key.
  if (GATE) {
    const enviado = req.headers.get("x-demo-password");
    if (enviado !== GATE) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "Falta ANTHROPIC_API_KEY en el entorno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), { status: 400 });
  }

  const { messages, system, maxTokens = 4096 } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Se requiere el arreglo messages" }), { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const push = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(sse(event, data)));
        } catch {
          /* el cliente cerró la conexión */
        }
      };

      // Heartbeat: mantiene viva la conexión mientras se espera a la API.
      const hb = setInterval(() => push("ping", { t: Date.now() }), 3000);

      try {
        const resp = await anthropic.messages.stream({
          model: MODEL,
          max_tokens: maxTokens,
          system: system || undefined,
          messages,
        });

        clearInterval(hb);

        for await (const evt of resp) {
          if (evt.type === "content_block_delta" && evt.delta.type === "text_delta") {
            push("chunk", { text: evt.delta.text });
          }
        }

        push("done", { ok: true });
      } catch (err: any) {
        clearInterval(hb);
        // Mensajes de error en español, como en server.js
        const raw = err?.message || String(err);
        const msg =
          raw.includes("rate_limit") ? "Se alcanzó el límite de solicitudes. Espera unos segundos."
          : raw.includes("authentication") || raw.includes("401") ? "La API key no es válida."
          : raw.includes("overloaded") ? "El modelo está sobrecargado. Reintenta en un momento."
          : `Error al consultar el modelo: ${raw}`;
        push("error", { error: msg });
      } finally {
        try { controller.close(); } catch { /* ya cerrado */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
