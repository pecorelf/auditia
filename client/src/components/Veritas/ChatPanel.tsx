// ChatPanel — interfaz del asistente AuditIA.
// Usa streamClaude directo (no useClaude con cache) por consistencia con CMPC.
import { esDesarrollo } from "../../lib/api";

import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import { useClaude, type Msg } from "./useClaude";
import { DynamicRenderer } from "./DynamicRenderer";
import { getSystemPrompt } from "./systemPrompts";

type Props = {
  killerQuestions: string[];
  placeholder?: string;
};

export function ChatPanel({ killerQuestions, placeholder }: Props) {
  const espacio = useStore((s) => s.espacio);
  const { streaming, streamText, send, stop } = useClaude();

  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Limpiar conversación al cambiar de espacio
  useEffect(() => {
    setHistory([]);
    setError(null);
    setInput("");
  }, [espacio]);

  // Auto-scroll
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, streamText]);

  const submit = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;

    setError(null);
    setInput("");
    const newHistory = [...history, { role: "user" as const, content: msg }];
    setHistory(newHistory);

    const full = await send({
      system: getSystemPrompt(espacio),
      // Truncamos a últimas 4 entradas (2 pares user/assistant) para evitar acumulación
      // de tokens en conversaciones largas. La UI mantiene el historial completo.
      history: history.slice(-4),
      userMessage: msg,
      // Acotamos a 2048 tokens para que la respuesta no sobrecargue el DOM
      maxTokens: 2048,
      onError: (m) => setError(m),
    });

    if (full) {
      setHistory([...newHistory, { role: "assistant", content: full }]);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const reset = () => {
    stop();
    setHistory([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-deloitte-line">
      {/* Header del panel */}
      <div className="px-4 py-3 border-b border-deloitte-line flex items-center justify-between bg-deloitte-paper/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-deloitte-ink flex items-center justify-center relative">
            <div className="w-2 h-2 rounded-full bg-deloitte-green absolute bottom-1 right-1" />
            <span className="text-white text-[11.5px] font-serif italic">V</span>
          </div>
          <div>
            <div className="text-[14px] font-semibold leading-tight">AuditIA</div>
            <div className="text-[11.5px] text-deloitte-mute leading-tight">
              {espacio === "uno" ? "Sobre los archivos del cliente" :
               espacio === "procesos" ? "Sobre los tres procesos críticos" :
               espacio === "dos" ? "Sobre el Audit Hub" :
               espacio === "cinco" ? "Sobre gastos y rendiciones" :
               espacio === "seis" ? "Sobre remuneraciones y turnos" :
               "Marcos regulatorios y de control"}
            </div>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={reset}
            className="text-[12px] text-deloitte-mute hover:text-deloitte-ink"
          >
            Nueva conversación
          </button>
        )}
      </div>

      {/* Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {history.length === 0 && !streaming && (
          <div className="space-y-3">
            <div className="text-[14px] text-deloitte-slate leading-relaxed">
              {placeholder || "Hazme una pregunta sobre los datos que tienes a la vista. Puedo encontrar patrones, comparar, calcular y construir visualizaciones al vuelo."}
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="eyebrow">Preguntas sugeridas</div>
              {killerQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => submit(q)}
                  className="w-full text-left text-[13px] px-3 py-2 rounded border border-deloitte-line bg-white hover:bg-deloitte-paper hover:border-deloitte-green transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((m, i) => (
          <div key={i}>
            {m.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-deloitte-ink text-white rounded-lg rounded-br-sm px-3 py-2 max-w-[85%] text-[14px] leading-relaxed">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="veritas-bubble rounded-r-md px-4 py-3 text-[14px] text-deloitte-slate">
                <DynamicRenderer text={m.content} />
              </div>
            )}
          </div>
        ))}

        {streaming && (
          <div className="veritas-bubble rounded-r-md px-4 py-3 text-[14px] text-deloitte-slate">
            {streamText ? (
              <>
                {/* Durante streaming: texto plano sin parseo. Cuando termina,
                    el history se actualiza y se renderea con Markdown una sola vez. */}
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {streamText.replace(/<<<SPEC>>>[\s\S]*?(<<<END_SPEC>>>|$)/g, "[generando visualización...]")}
                </div>
                <span className="streaming-caret"></span>
              </>
            ) : (
              <div className="flex items-center gap-1 text-deloitte-mute">
                <span className="dot-pulse w-1.5 h-1.5 rounded-full bg-deloitte-green inline-block" />
                <span className="dot-pulse w-1.5 h-1.5 rounded-full bg-deloitte-green inline-block" />
                <span className="dot-pulse w-1.5 h-1.5 rounded-full bg-deloitte-green inline-block" />
                <span className="ml-2 text-[12px]">AuditIA está pensando…</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-[13px] text-risk-highTxt border border-risk-high/30 bg-red-50 rounded px-3 py-2">
            <strong>Error:</strong> {error}
            <div className="mt-1 text-[12px] text-deloitte-mute">
              {esDesarrollo() ? (
                <>Abre <code>http://localhost:3001/health</code>: si no responde, el
                servidor local no está corriendo (revisa el archivo .env y la consola SERVER).</>
              ) : (
                <>Abre <code>/api/health</code> en esta misma URL: te dice si la API key y la
                clave de acceso quedaron configuradas en Vercel.</>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-deloitte-line p-3 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Pregúntale a AuditIA…"
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded border border-deloitte-line px-3 py-2 text-[14px] focus:outline-none focus:border-deloitte-green focus:ring-1 focus:ring-deloitte-green/20 disabled:bg-deloitte-paper disabled:text-deloitte-mute"
            style={{ minHeight: 38, maxHeight: 140 }}
          />
          {streaming ? (
            <button
              onClick={stop}
              className="px-3 py-2 bg-deloitte-ink text-white rounded text-[13px] font-semibold hover:bg-deloitte-slate"
            >
              Detener
            </button>
          ) : (
            <button
              onClick={() => submit()}
              disabled={!input.trim()}
              className="px-4 py-2 bg-deloitte-green text-deloitte-ink rounded text-[13px] font-semibold hover:bg-deloitte-greenDark disabled:bg-deloitte-line disabled:text-deloitte-mute"
            >
              Enviar
            </button>
          )}
        </div>
        <div className="text-[11.5px] text-deloitte-mute mt-1.5 px-1">
          Enter para enviar · Shift+Enter para nueva línea. AuditIA opera solo sobre el dataset cargado.
        </div>
      </div>
    </div>
  );
}
