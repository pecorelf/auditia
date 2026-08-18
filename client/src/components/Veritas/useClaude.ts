// useClaude — hook que consume el SSE de /api/chat
// IMPORTANTE: hace fetch absoluto a http://localhost:3001 (no a /api con proxy).
import { apiUrl, apiHeaders } from "../../lib/api";

import { useCallback, useRef, useState } from "react";


export type Msg = { role: "user" | "assistant"; content: string };

type StreamOptions = {
  system?: string;
  history: Msg[];
  userMessage: string;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
  onDone?: (full: string) => void;
  onError?: (msg: string) => void;
};

const isAbortError = (e: any) =>
  e?.name === "AbortError" ||
  e?.message === "Aborted" ||
  e?.code === "ABORT_ERR" ||
  String(e).toLowerCase().includes("abort");

export function useClaude() {
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const receivedFirstChunk = useRef(false);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const send = useCallback(async (opts: StreamOptions) => {
    const { system, history, userMessage, maxTokens = 4096 } = opts;

    stop();
    const ac = new AbortController();
    abortRef.current = ac;

    setStreaming(true);
    setStreamText("");
    receivedFirstChunk.current = false;

    let fullText = "";
    // Throttle de updates: actualizamos streamText máx cada 150ms para evitar
    // re-renders en cada chunk (puede causar OOM en respuestas largas)
    let lastUpdate = 0;
    let pendingUpdate: number | null = null;
    const flushUpdate = () => {
      setStreamText(fullText);
      lastUpdate = Date.now();
      pendingUpdate = null;
    };

    try {
      const resp = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system,
          messages: [...history, { role: "user", content: userMessage }],
          maxTokens,
        }),
        signal: ac.signal,
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          if (!block.trim() || block.startsWith(":")) continue;

          const lines = block.split("\n");
          let event = "message";
          let data = "";
          for (const ln of lines) {
            if (ln.startsWith("event:")) event = ln.slice(6).trim();
            else if (ln.startsWith("data:")) data += ln.slice(5).trim();
          }
          if (!data) continue;

          let payload: any;
          try {
            payload = JSON.parse(data);
          } catch {
            continue;
          }

          if (event === "chunk") {
            receivedFirstChunk.current = true;
            fullText += payload.text;
            opts.onChunk?.(payload.text);
            // Throttle: actualizar inmediato si pasaron 150ms, si no programar
            const now = Date.now();
            if (now - lastUpdate >= 150) {
              flushUpdate();
            } else if (pendingUpdate === null) {
              pendingUpdate = window.setTimeout(flushUpdate, 150 - (now - lastUpdate));
            }
          } else if (event === "done") {
            // Forzar última actualización antes del done
            if (pendingUpdate !== null) {
              clearTimeout(pendingUpdate);
              pendingUpdate = null;
            }
            setStreamText(fullText);
            opts.onDone?.(fullText);
          } else if (event === "error") {
            opts.onError?.(payload.message || "Error desconocido");
          }
        }
      }
    } catch (err: any) {
      if (isAbortError(err)) {
        // expected, no-op
      } else {
        opts.onError?.(err?.message || "Error de red");
      }
    } finally {
      if (pendingUpdate !== null) {
        clearTimeout(pendingUpdate);
      }
      setStreaming(false);
      abortRef.current = null;
    }

    return fullText;
  }, [stop]);

  return { streaming, streamText, send, stop };
}
