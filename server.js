// server.js — Express + SSE + Anthropic SDK
// Node 22+ / 24 / 25 compatible. Key lessons from CMPC POC:
//   1) Use res.on("close") NOT req.on("close") — Node 25 quirk.
//   2) Fake-streaming: messages.create() no-stream + manual chunking.
//      Native SDK streaming is unstable on Node 25 under some conditions.
//   3) Heartbeats every 3s during wait to Anthropic.
//   4) Capture unhandledRejection + uncaughtException to never crash.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const PORT = process.env.PORT || 3001;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("\n  ✗ Falta ANTHROPIC_API_KEY en .env\n");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ──────────────────────────────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ ok: true, model: MODEL, ts: Date.now() });
});

// ──────────────────────────────────────────────────────────────────────
// SSE chat endpoint — fake-stream by chunking the full response
// ──────────────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages, system, maxTokens = 4096, tools } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  // SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  let closed = false;
  // CRITICAL: res.on("close") — Node 25 quirk. Do NOT use req.on("close").
  res.on("close", () => {
    closed = true;
  });

  const send = (event, data) => {
    if (closed) return;
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      closed = true;
    }
  };

  // Heartbeat every 3s while waiting for Anthropic
  const heartbeat = setInterval(() => {
    if (closed) return;
    try {
      res.write(`:hb\n\n`);
    } catch {
      closed = true;
    }
  }, 3000);

  try {
    send("status", { phase: "thinking" });

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: system || undefined,
      messages,
      ...(Array.isArray(tools) && tools.length > 0 ? { tools } : {}),
    });

    clearInterval(heartbeat);
    if (closed) return;

    // Extract text content
    const full = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    send("status", { phase: "streaming" });

    // Fake-stream by chunking — roughly word-by-word for fluid UX
    const chunks = full.match(/[^\s]+\s*|\s+/g) || [full];
    for (const chunk of chunks) {
      if (closed) return;
      send("chunk", { text: chunk });
      // Small variable delay for realism, but stays fast (~25-45ms)
      await new Promise((r) => setTimeout(r, 18 + Math.random() * 22));
    }

    send("done", {
      usage: response.usage,
      stop_reason: response.stop_reason,
    });
  } catch (err) {
    clearInterval(heartbeat);
    console.error("[/api/chat] error:", err?.message || err);
    if (!closed) {
      // Traducir errores comunes a mensajes útiles en español
      let friendly = err?.message || "Error inesperado";
      const lower = String(friendly).toLowerCase();
      if (lower.includes("overloaded") || lower.includes("out of memory") || lower.includes("oom")) {
        friendly = "El servicio está saturado temporalmente. Por favor reintenta en unos segundos.";
      } else if (lower.includes("rate") && lower.includes("limit")) {
        friendly = "Límite de uso alcanzado. Espera un momento y reintenta.";
      } else if (lower.includes("timeout") || lower.includes("etimedout")) {
        friendly = "La consulta tomó demasiado tiempo. Intenta una pregunta más específica.";
      } else if (lower.includes("invalid_request") || lower.includes("400")) {
        friendly = "La consulta tiene un formato inválido. Reintenta o limpia el chat.";
      } else if (lower.includes("authentication") || lower.includes("401")) {
        friendly = "Falla de autenticación del servicio. Contacta al administrador.";
      }
      send("error", {
        message: friendly,
        status: err?.status || 500,
      });
    }
  } finally {
    clearInterval(heartbeat);
    if (!closed) {
      try {
        res.end();
      } catch {}
    }
  }
});

// ──────────────────────────────────────────────────────────────────────
// One-shot endpoint para generar JSON estructurado (plan, evaluación)
// No usa SSE — devuelve directo. Usado por Audit Expert / Generar Plan.
// ──────────────────────────────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {
  const { messages, system, maxTokens = 4096, tools } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: system || undefined,
      messages,
      ...(Array.isArray(tools) && tools.length > 0 ? { tools } : {}),
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    res.json({
      text,
      usage: response.usage,
      stop_reason: response.stop_reason,
    });
  } catch (err) {
    console.error("[/api/generate] error:", err?.message || err);
    let friendly = err?.message || "Error inesperado";
    const lower = String(friendly).toLowerCase();
    if (lower.includes("overloaded") || lower.includes("out of memory")) {
      friendly = "El servicio está saturado. Reintenta en unos segundos.";
    } else if (lower.includes("timeout")) {
      friendly = "La generación tomó demasiado. Intenta con un prompt más conciso.";
    }
    res.status(err?.status || 500).json({ error: friendly });
  }
});

// ──────────────────────────────────────────────────────────────────────
// Safety net: never crash the server
// ──────────────────────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});

app.listen(PORT, () => {
  console.log("\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  ●  AuditIA — backend de auditoría interna`);
  console.log(`     http://localhost:${PORT}`);
  console.log(`     model: ${MODEL}`);
  console.log(`     node:  ${process.version}`);
  console.log("  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
});
