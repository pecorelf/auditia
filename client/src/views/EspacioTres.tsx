// Espacio 3 — Audit Expert: tres tabs.
//   A) Consulta — chat con Fábrica de Pensamiento del IAI España (web_search)
//   B) Generar plan — formulario que pide a la IA un plan estructurado con papeles de trabajo
//   C) Evaluar plan — formulario que evalúa un plan existente vs mejores prácticas
import { apiUrl, apiHeaders } from "../lib/api";

import { useState, useRef, useEffect } from "react";
import { Header } from "../components/Header";


type Tab = "consulta" | "generar";

// ─────────────────────────────────────────────────────────────────────
// SYSTEM PROMPTS (resumidos — la base de conocimiento está en la web)
// ─────────────────────────────────────────────────────────────────────

const SYS_CONSULTA = `Eres AuditIA, agente de conocimiento de Auditoría Interna de Deloitte.
Tu base de conocimiento principal es la Fábrica de Pensamiento del IAI España:
https://auditoresinternos.es/centro-de-conocimiento/fabrica-de-pensamiento/
Cubres Normas Globales de Auditoría Interna (NGAI), COSO, gestión de riesgos, fraude, ESG,
tecnología, ciberseguridad, IA en auditoría, cumplimiento normativo.
También conoces la normativa chilena: NCG 461/385/269/309/454, Ley 20.393, Ley 21.595, Ley 21.719.

REGLAS:
- Usa web_search "site:auditoresinternos.es [tema]" antes de responder cuando aplique.
- Cita documentos con formato: 📄 [Título del documento]
- Responde en español profesional, conciso, ejecutivo.
- Estructura: respuesta directa al inicio + soporte después.
- Cuando el usuario pregunte sobre normativa chilena, complementa con marco IAI España.`;

const SYS_GENERAR_PLAN = `Eres AuditIA, generador de planes de auditoría interna de Deloitte.
REGLA ABSOLUTA: responde ÚNICAMENTE con un objeto JSON válido. Sin texto previo ni posterior.
Sin markdown ni backticks. Empieza con { directamente.

Consulta internamente buenas prácticas del IAI España (auditoresinternos.es), Normas Globales
de Auditoría Interna (NGAI), y normativa chilena aplicable.

Estructura del JSON (sé conciso — máx 1-2 oraciones por string, máx 4 items por array):
{
  "titulo": "",
  "resumen_ejecutivo": "",
  "objetivos": [{"numero": 1, "titulo": "", "descripcion": ""}],
  "alcance": {"incluye": [], "excluye": []},
  "riesgos_clave": [{"riesgo": "", "nivel": "Alto|Medio|Bajo", "enfoque": ""}],
  "metodologia": "",
  "fases": [{"fase": "", "actividades": [], "duracion": ""}],
  "recursos": {"equipo": [], "herramientas": [], "estimacion_horas": ""},
  "criterios_evaluacion": [],
  "entregables": [],
  "papeles_de_trabajo": [{"codigo": "PT-01", "titulo": "", "descripcion": "", "evidencia_esperada": ""}],
  "fuentes_iai": []
}
LÍMITES: máx 4 objetivos, 4 riesgos, 4 fases, 3 actividades/fase, 4 entregables, 5 papeles de trabajo.`;

const SYS_EVALUAR_PLAN = `Eres AuditIA, evaluador de planes de auditoría interna de Deloitte.
REGLA ABSOLUTA: responde ÚNICAMENTE con JSON válido. Sin texto previo ni posterior.

Usa buenas prácticas del IAI España y Normas Globales de Auditoría Interna como criterio.

JSON requerido:
{
  "score_global": 0,
  "nivel": "Excelente|Avanzado|En desarrollo|Inicial",
  "resumen": "",
  "dimensiones": [{"nombre": "", "score": 0, "comentario": ""}],
  "hallazgos": [{"titulo": "", "severidad": "alta|media|baja", "descripcion": "", "recomendacion": ""}],
  "recomendaciones": [{"titulo": "", "detalle": ""}],
  "fuentes_iai": []
}
Dimensiones exactas (las 6): "Evaluación de riesgos", "Cobertura del universo", "Recursos y competencias",
"Tecnología y analítica", "Gobierno y reporte", "Seguimiento y calidad".`;

// ─────────────────────────────────────────────────────────────────────
// HELPER: extraer JSON de respuesta posiblemente envuelta en markdown
// ─────────────────────────────────────────────────────────────────────
function extractJSON(raw: string): any {
  raw = raw.replace(/```json|```/g, "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1) throw new Error("No se encontró JSON en la respuesta");
  if (end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  }
  // Intento de reparación
  let partial = raw.slice(start);
  let opens = 0, arrOpens = 0;
  for (const ch of partial) {
    if (ch === "{") opens++;
    else if (ch === "}") opens--;
    else if (ch === "[") arrOpens++;
    else if (ch === "]") arrOpens--;
  }
  partial = partial.replace(/,\s*$/, "").replace(/:\s*$/, ":null");
  for (let i = 0; i < arrOpens; i++) partial += "]";
  for (let i = 0; i < opens; i++) partial += "}";
  try { return JSON.parse(partial); } catch (e: any) {
    throw new Error("JSON no parseable: " + e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
export function EspacioTres() {
  const [tab, setTab] = useState<Tab>("consulta");

  return (
    <>
      <Header
        eyebrow="Audit Expert"
        title="Mejores prácticas y regulaciones"
        subtitle="Asistente experto con acceso a la Fábrica de Pensamiento del IAI España, NGAI y normativa chilena. Genera y evalúa planes de auditoría."
        meta={[
          { label: "Fuente principal", value: "IAI España" },
          { label: "Marcos integrados", value: "NGAI · COSO · CMF" },
          { label: "Normativa Chile", value: "20.393 · 21.595 · 21.719" },
          { label: "Estado", value: "● Conectado en línea" },
        ]}
      />

      <div className="px-8 py-4 border-b border-deloitte-line bg-deloitte-paper/30 flex items-center gap-1">
        <TabButton active={tab === "consulta"} onClick={() => setTab("consulta")}>
          💬 Consulta experta
        </TabButton>
        <TabButton active={tab === "generar"} onClick={() => setTab("generar")}>
          ✨ Generar plan de auditoría
        </TabButton>
      </div>

      {tab === "consulta" && <TabConsulta />}
      {tab === "generar" && <TabGenerar />}
    </>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[13.5px] font-semibold border-b-2 transition-all ${
        active
          ? "border-deloitte-green text-deloitte-ink"
          : "border-transparent text-deloitte-mute hover:text-deloitte-ink"
      }`}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// TAB A — CONSULTA con web_search + VOZ (Web Speech API)
// ─────────────────────────────────────────────────────────────────────
function TabConsulta() {
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<{ role: "user" | "assistant"; content: string; viaVoz?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Estado de voz ──
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const inputViaVozRef = useRef(false); // marca si la entrada vino por voz (para responder por voz)

  // Detección inicial de soporte de Web Speech API
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !window.speechSynthesis) {
      setVoiceSupported(false);
    }
    return () => {
      try { window.speechSynthesis?.cancel(); } catch {}
      try { recognitionRef.current?.abort(); } catch {}
    };
  }, []);

  const ejemplos = [
    "¿Cómo auditar IA según el IAI España?",
    "¿Cuáles son las Normas Globales de Auditoría Interna (NGAI)?",
    "¿Cómo gestionar el riesgo de fraude desde auditoría interna?",
    "¿Qué guías existen para auditar ESG y sostenibilidad?",
    "¿Cómo aplicar Ley 21.595 (Delitos Económicos) en el plan anual?",
    "¿Mejores prácticas para auditar terceros y cadena de suministro?",
  ];

  // ── TTS: hablar la respuesta del experto ──
  const speak = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    // Limpiar texto para TTS: remover markdown, emojis, chips
    const clean = text
      .replace(/📄[^\n]*/g, "")
      .replace(/\*\*/g, "").replace(/\*/g, "")
      .replace(/#{1,3}\s/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/<<<SPEC>>>[\s\S]*?<<<END_SPEC>>>/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .replace(/[›●→]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1200); // cap a ~1200 chars

    if (!clean) return;

    try { window.speechSynthesis.cancel(); } catch {}
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "es-MX";
    utt.rate = 1.05;
    utt.pitch = 1;

    // Selección de voz con preferencia latinoamericana:
    // 1) chileno → 2) mexicano → 3) cualquier latino (no es-ES) → 4) cualquier español
    const voices = window.speechSynthesis.getVoices();
    const esCL = voices.find((v) => v.lang === "es-CL");
    const esMX = voices.find((v) => v.lang === "es-MX");
    const esLatino = voices.find((v) => v.lang.startsWith("es") && v.lang !== "es-ES");
    const esCualquiera = voices.find((v) => v.lang.startsWith("es"));
    const elegida = esCL || esMX || esLatino || esCualquiera;
    if (elegida) utt.voice = elegida;

    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const stopSpeaking = () => {
    try { window.speechSynthesis.cancel(); } catch {}
    setIsSpeaking(false);
  };

  // ── STT: escuchar al usuario ──
  const startListening = () => {
    if (!voiceSupported) {
      setVoiceMessage("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      setTimeout(() => setVoiceMessage(null), 4000);
      return;
    }

    stopSpeaking(); // si está hablando, detener

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = "es-MX";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    let finalText = "";

    r.onstart = () => {
      setIsRecording(true);
      setVoiceMessage("Escuchando…");
    };

    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setInput(finalText || interim);
    };

    r.onerror = (e: any) => {
      setIsRecording(false);
      const errMap: Record<string, string> = {
        "no-speech": "No se detectó voz. Reintenta.",
        "audio-capture": "No se pudo acceder al micrófono.",
        "not-allowed": "Permiso de micrófono denegado.",
        "network": "Error de red en reconocimiento de voz.",
      };
      setVoiceMessage(errMap[e.error] || "Error: " + e.error);
      setTimeout(() => setVoiceMessage(null), 4000);
    };

    r.onend = () => {
      setIsRecording(false);
      const txt = (finalText || input).trim();
      if (txt) {
        inputViaVozRef.current = true;
        send(txt);
        setVoiceMessage(null);
      }
    };

    try {
      recognitionRef.current = r;
      r.start();
    } catch (err) {
      setVoiceMessage("No se pudo iniciar el micrófono.");
      setTimeout(() => setVoiceMessage(null), 4000);
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsRecording(false);
  };

  const toggleVoiceOutput = () => {
    if (isSpeaking) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setError(null);
    setInput("");
    const wasViaVoz = inputViaVozRef.current;
    inputViaVozRef.current = false;
    const newConv = [...conversation, { role: "user" as const, content: msg, viaVoz: wasViaVoz }];
    setConversation(newConv);
    setLoading(true);

    try {
      // System prompt ajustado: si vino por voz, respuesta MÁS breve para no aburrir hablando
      const systemPrompt = wasViaVoz
        ? SYS_CONSULTA + "\n\nIMPORTANTE: el usuario está hablando por voz. Responde de forma MUY breve (máximo 4 oraciones), conversacional, sin listas ni markdown — texto plano que se lea bien al ser hablado."
        : SYS_CONSULTA;

      const resp = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system: systemPrompt,
          messages: newConv.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          maxTokens: wasViaVoz ? 600 : 1200,
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
        }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(data.error);
      } else {
        const respText = data.text || "Sin respuesta.";
        setConversation([...newConv, { role: "assistant", content: respText, viaVoz: wasViaVoz }]);
        // Si el input vino por voz, responder hablando
        if (wasViaVoz && voiceEnabled) {
          setTimeout(() => speak(respText), 250);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Error de red");
    }
    setLoading(false);
  };

  return (
    <div className="px-8 py-6 space-y-4 max-w-5xl">
      <div className="card p-3 bg-deloitte-paper/40 border-l-2 border-deloitte-green flex items-start justify-between gap-4">
        <div className="text-[12px] text-deloitte-slate flex-1">
          <span className="font-semibold">Fuente activa:</span> Fábrica de Pensamiento · auditoresinternos.es
          <span className="text-deloitte-mute"> · AuditIA consulta los documentos públicos del IAI España y normativa chilena para responder.</span>
        </div>
        {/* Toggle voz */}
        {voiceSupported && (
          <button
            onClick={toggleVoiceOutput}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded text-[11.5px] font-semibold uppercase tracking-wider transition-colors ${
              voiceEnabled
                ? "bg-deloitte-green/10 text-deloitte-greenTxt border border-deloitte-green/30"
                : "bg-deloitte-paper text-deloitte-mute border border-deloitte-line"
            }`}
            title={voiceEnabled ? "Voz activada · click para silenciar" : "Voz desactivada · click para activar"}
          >
            <span>{voiceEnabled ? "🔊" : "🔇"}</span>
            <span>Voz {voiceEnabled ? "ON" : "OFF"}</span>
          </button>
        )}
      </div>

      {conversation.length === 0 && (
        <div>
          <div className="eyebrow mb-2">Preguntas frecuentes</div>
          <div className="grid grid-cols-2 gap-2.5">
            {ejemplos.map((e, i) => (
              <button
                key={i}
                onClick={() => send(e)}
                className="text-left p-3 bg-white border border-deloitte-line rounded hover:border-deloitte-green hover:bg-deloitte-paper transition-all text-[13.5px] text-deloitte-slate"
              >
                <span className="text-deloitte-green mr-1">→</span> {e}
              </button>
            ))}
          </div>
          {voiceSupported && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-[13px] text-blue-900">
              <strong>💡 Tip:</strong> Puedes hacer tu consulta hablando. Pulsa el botón del micrófono abajo, formula tu pregunta, y AuditIA te responderá por voz.
            </div>
          )}
        </div>
      )}

      {/* Conversación */}
      <div className="space-y-3">
        {conversation.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded bg-deloitte-ink text-deloitte-green flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-1 font-mono">AI</div>
            )}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-lg text-[14px] leading-relaxed ${
              m.role === "user"
                ? "bg-deloitte-ink text-white rounded-br-sm"
                : m.viaVoz
                  ? "bg-blue-50 border-l-2 border-blue-400 text-deloitte-slate rounded-bl-sm"
                  : "bg-deloitte-paper border-l-2 border-deloitte-green text-deloitte-slate rounded-bl-sm"
            }`}>
              {m.viaVoz && m.role === "assistant" && (
                <div className="flex items-center gap-1.5 text-[11.5px] text-blue-700 font-mono mb-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                  respuesta por voz
                  {isSpeaking && i === conversation.length - 1 && (
                    <button
                      onClick={stopSpeaking}
                      className="ml-2 text-blue-700 hover:text-blue-900 underline"
                    >detener</button>
                  )}
                </div>
              )}
              {m.viaVoz && m.role === "user" && (
                <div className="flex items-center gap-1.5 text-[11.5px] text-white/60 font-mono mb-1 justify-end">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                  vía voz
                </div>
              )}
              <div dangerouslySetInnerHTML={{ __html: formatMessage(m.content) }} />
              {m.viaVoz && m.role === "assistant" && isSpeaking && i === conversation.length - 1 && (
                <div className="flex items-center gap-1 mt-2 h-4">
                  {[6, 14, 10, 18, 8, 12, 6].map((h, k) => (
                    <span key={k} className="w-0.5 bg-blue-500 rounded animate-pulse" style={{ height: `${h}px`, animationDelay: `${k * 0.08}s`, animationDuration: "0.6s" }} />
                  ))}
                </div>
              )}
            </div>
            {m.role === "user" && (
              <div className="w-7 h-7 rounded bg-deloitte-paper border border-deloitte-line text-deloitte-mute flex items-center justify-center text-[12px] flex-shrink-0 mt-1">👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded bg-deloitte-ink text-deloitte-green flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-1 font-mono">AI</div>
            <div className="bg-deloitte-paper border-l-2 border-deloitte-green px-4 py-2.5 rounded-lg text-[13px] text-deloitte-mute font-mono">
              Consultando Fábrica de Pensamiento...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-l-2 border-risk-high text-[13px] text-risk-highTxt rounded">
          {error}
        </div>
      )}

      {voiceMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-deloitte-ink text-white px-4 py-2 rounded-lg shadow-lg text-[13px] font-mono z-50">
          {voiceMessage}
        </div>
      )}

      {/* Input con micrófono */}
      <div className={`card p-2 flex gap-2 items-end transition-colors ${isRecording ? "border-red-400 bg-red-50/30" : ""}`}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={isRecording ? "Escuchando... habla ahora" : "Pregunta al experto en auditoría interna, o usa el micrófono"}
          rows={2}
          disabled={loading || isRecording}
          className="flex-1 px-3 py-2 text-[14px] border-none focus:outline-none resize-none bg-transparent"
        />

        {/* Botón micrófono */}
        {voiceSupported && (
          <button
            onClick={isRecording ? stopListening : startListening}
            disabled={loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isRecording
                ? "bg-red-500 text-white animate-pulse shadow-lg"
                : "bg-deloitte-paper border border-deloitte-line text-deloitte-slate hover:bg-deloitte-line hover:text-deloitte-ink"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? "Detener grabación" : "Hablar con el experto"}
          >
            {isRecording ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        )}

        <button
          onClick={() => send()}
          disabled={loading || !input.trim() || isRecording}
          className="px-4 py-2 bg-deloitte-green text-white text-[13px] font-semibold rounded hover:bg-deloitte-greenDark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Consultar"}
        </button>
      </div>

      {voiceSupported && (
        <div className="text-[11.5px] text-deloitte-mute font-mono px-1">
          {isRecording
            ? "🔴 Grabando... el reconocimiento se detiene al hacer pausa o al pulsar de nuevo el micrófono."
            : "Enter · enviar  |  Shift+Enter · nueva línea  |  🎤 · hablar con el experto"}
        </div>
      )}
    </div>
  );
}

// Formato muy simple de markdown a HTML
function formatMessage(text: string): string {
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/📄 ([^\n]+)/g, '<span style="display:inline-block;background:#f0f7e0;border:1px solid #c8e48a;color:#5a8a0a;padding:2px 8px;border-radius:3px;font-size:11px;margin:2px 2px 2px 0;font-family:monospace">📄 $1</span>');
  html = html.replace(/^- (.+)$/gm, '<div style="padding:2px 0 2px 14px;position:relative"><span style="position:absolute;left:0;color:#86BC25;font-weight:bold">›</span>$1</div>');
  html = html.replace(/^\d+\.\s(.+)$/gm, '<div style="padding:2px 0 2px 14px;position:relative"><span style="position:absolute;left:0;color:#86BC25">●</span>$1</div>');
  html = html.replace(/\n\n/g, "<div style=\"height:6px\"></div>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

// ─────────────────────────────────────────────────────────────────────
// TAB B — GENERAR PLAN
// ─────────────────────────────────────────────────────────────────────
function TabGenerar() {
  const [form, setForm] = useState({
    organizacion: "",
    sector: "",
    tipoAuditoria: "",
    periodo: "",
    briefing: "",
    contexto: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sectores = [
    "Servicios financieros / Banca", "Seguros", "Retail y consumo", "Energía y utilities",
    "Medios y comunicaciones", "Telecomunicaciones", "Salud y farma", "Sector público", "Manufactura",
    "Real estate", "Tecnología", "Minería", "Educación", "Otro",
  ];
  const tipos = [
    "Auditoría operativa", "Auditoría financiera", "Auditoría de TI / Ciberseguridad",
    "Auditoría de cumplimiento / Compliance", "Auditoría de fraude", "Auditoría ESG / Sostenibilidad",
    "Auditoría de terceros / Proveedores", "Auditoría integral / Anual", "Auditoría de procesos específicos",
  ];

  const run = async () => {
    if (!form.organizacion || !form.sector || !form.tipoAuditoria || !form.briefing) {
      setError("Completa los campos requeridos: Organización, Sector, Tipo y Briefing.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    const prompt = `Genera un plan de auditoría interna con base en mejores prácticas del IAI España y NGAI.

ORGANIZACIÓN: ${form.organizacion}
SECTOR: ${form.sector}
TIPO: ${form.tipoAuditoria}
PERÍODO: ${form.periodo || "No especificado"}
CONTEXTO ADICIONAL: ${form.contexto || "Ninguno"}

BRIEFING:
${form.briefing}

Responde solo con el JSON estructurado especificado.`;

    try {
      const resp = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system: SYS_GENERAR_PLAN,
          messages: [{ role: "user", content: prompt }],
          maxTokens: 4000,
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }],
        }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(data.error);
      } else {
        const json = extractJSON(data.text);
        setResult(json);
      }
    } catch (e: any) {
      setError(e?.message || "Error generando el plan");
    }
    setLoading(false);
  };

  const reset = () => { setResult(null); setError(null); };

  return (
    <div className="px-8 py-6 max-w-5xl">
      {!result && (
        <>
          <div className="card p-3 bg-deloitte-paper/40 border-l-2 border-deloitte-green mb-5">
            <div className="text-[13px] text-deloitte-slate">
              Describe el engagement. AuditIA consultará buenas prácticas del IAI España y generará un plan estructurado con <strong>objetivos, alcance, riesgos, metodología, fases, recursos, papeles de trabajo y entregables</strong>.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Organización" required>
              <input type="text" value={form.organizacion} onChange={(e) => setForm({ ...form, organizacion: e.target.value })} placeholder="Ej: Banco Santander Chile" className="form-input" />
            </Field>
            <Field label="Sector" required>
              <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="form-input">
                <option value="">Selecciona…</option>
                {sectores.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Tipo de auditoría" required>
              <select value={form.tipoAuditoria} onChange={(e) => setForm({ ...form, tipoAuditoria: e.target.value })} className="form-input">
                <option value="">Selecciona…</option>
                {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Período / Alcance">
              <input type="text" value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} placeholder="Ej: FY26, Q3-Q4 2026" className="form-input" />
            </Field>
            <div className="col-span-2">
              <Field label="Briefing del engagement" required>
                <textarea value={form.briefing} onChange={(e) => setForm({ ...form, briefing: e.target.value })} rows={5} placeholder="Describe qué se va a auditar, contexto, procesos clave, riesgos conocidos, observaciones previas…" className="form-input resize-y" />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Contexto adicional">
                <input type="text" value={form.contexto} onChange={(e) => setForm({ ...form, contexto: e.target.value })} placeholder="Tamaño del equipo, hallazgos previos, normativa específica…" className="form-input" />
              </Field>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-2 border-risk-high text-[13px] text-risk-highTxt rounded">
              {error}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={run}
              disabled={loading}
              className="px-6 py-2.5 bg-deloitte-green text-white text-[14px] font-semibold rounded hover:bg-deloitte-greenDark disabled:opacity-50"
            >
              {loading ? "⏳ Consultando IAI España y generando..." : "✨ Generar plan con IA"}
            </button>
            <button onClick={() => setForm({ organizacion: "", sector: "", tipoAuditoria: "", periodo: "", briefing: "", contexto: "" })} className="px-4 py-2.5 border border-deloitte-line text-[14px] rounded hover:border-deloitte-mute">
              Limpiar
            </button>
          </div>
        </>
      )}

      {result && <PlanResult plan={result} org={form.organizacion} sector={form.sector} onReset={reset} />}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 mb-1">
      <label className="text-[12px] font-semibold text-deloitte-slate uppercase tracking-wider">
        {label} {required && <span className="text-risk-highTxt">*</span>}
      </label>
      {children}
    </div>
  );
}

function PlanResult({ plan, org, sector, onReset }: { plan: any; org: string; sector: string; onReset: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="eyebrow">Plan generado · {org} · {sector}</div>
          <h2 className="text-[18px] font-serif font-semibold text-deloitte-ink mt-1">{plan.titulo || "Plan de Auditoría"}</h2>
        </div>
        <button onClick={onReset} className="px-3 py-1.5 border border-deloitte-line text-[13px] rounded hover:border-deloitte-green">
          ← Nuevo plan
        </button>
      </div>

      <div className="card overflow-hidden">
        <Section title="Resumen ejecutivo">
          <p className="text-[14px] leading-relaxed text-deloitte-slate">{plan.resumen_ejecutivo}</p>
        </Section>

        {plan.objetivos?.length > 0 && (
          <Section title="Objetivos">
            <div className="space-y-2">
              {plan.objetivos.map((o: any, i: number) => (
                <div key={i} className="flex gap-3 p-2.5 bg-deloitte-paper/40 rounded border border-deloitte-line">
                  <div className="w-6 h-6 rounded-full bg-deloitte-ink text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">{o.numero || i + 1}</div>
                  <div className="text-[13.5px]">
                    <div className="font-semibold text-deloitte-ink">{o.titulo}</div>
                    <div className="text-deloitte-slate mt-0.5">{o.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {plan.alcance && (
          <Section title="Alcance">
            <div className="grid grid-cols-2 gap-4 text-[13.5px]">
              <div>
                <div className="text-[11.5px] font-bold text-deloitte-green uppercase tracking-wider mb-2">Incluye</div>
                {(plan.alcance.incluye || []).map((i: string, k: number) => (
                  <div key={k} className="py-1 pl-4 relative text-deloitte-slate">
                    <span className="absolute left-0 text-deloitte-green font-bold">✓</span>{i}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11.5px] font-bold text-risk-highTxt uppercase tracking-wider mb-2">Excluye</div>
                {(plan.alcance.excluye || []).map((i: string, k: number) => (
                  <div key={k} className="py-1 pl-4 relative text-deloitte-mute">
                    <span className="absolute left-0 text-risk-highTxt">✗</span>{i}
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {plan.riesgos_clave?.length > 0 && (
          <Section title="Riesgos clave">
            <div className="space-y-1.5">
              {plan.riesgos_clave.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 border border-deloitte-line rounded bg-white">
                  <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    r.nivel === "Alto" ? "bg-red-100 text-risk-highTxt" : r.nivel === "Medio" ? "bg-amber-100 text-risk-medTxt" : "bg-green-100 text-risk-lowTxt"
                  }`}>{r.nivel}</span>
                  <div className="text-[13.5px] text-deloitte-slate flex-1">
                    <strong className="text-deloitte-ink">{r.riesgo}</strong> — {r.enfoque}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {plan.metodologia && (
          <Section title="Metodología">
            <p className="text-[14px] leading-relaxed text-deloitte-slate">{plan.metodologia}</p>
          </Section>
        )}

        {plan.fases?.length > 0 && (
          <Section title="Fases y cronograma">
            <div className="space-y-2">
              {plan.fases.map((f: any, i: number) => (
                <div key={i} className="flex gap-3 p-2.5 border border-deloitte-line rounded bg-deloitte-paper/40">
                  <div className="w-20 flex-shrink-0 text-[12px] font-bold text-deloitte-green uppercase tracking-wider font-mono">{f.fase}</div>
                  <div className="flex-1 text-[13.5px] text-deloitte-slate">
                    {(f.actividades || []).map((a: string, k: number) => (
                      <div key={k} className="py-0.5">› {a}</div>
                    ))}
                  </div>
                  <div className="text-[12px] text-deloitte-mute font-mono">{f.duracion}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {plan.recursos && (
          <Section title="Recursos">
            <div className="space-y-2 text-[13.5px]">
              {plan.recursos.equipo?.length > 0 && (
                <div>
                  <div className="text-[11.5px] uppercase tracking-wider text-deloitte-mute mb-1">Equipo</div>
                  <div className="flex flex-wrap gap-1">
                    {plan.recursos.equipo.map((e: string, k: number) => (
                      <span key={k} className="px-2 py-1 bg-deloitte-paper border border-deloitte-line rounded text-[12px]">{e}</span>
                    ))}
                  </div>
                </div>
              )}
              {plan.recursos.herramientas?.length > 0 && (
                <div>
                  <div className="text-[11.5px] uppercase tracking-wider text-deloitte-mute mb-1">Herramientas</div>
                  <div className="flex flex-wrap gap-1">
                    {plan.recursos.herramientas.map((h: string, k: number) => (
                      <span key={k} className="px-2 py-1 bg-green-50 border border-green-200 text-deloitte-greenTxt rounded text-[12px]">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {plan.recursos.estimacion_horas && (
                <div className="pt-1 text-deloitte-slate">⏱ <strong>Estimación:</strong> {plan.recursos.estimacion_horas}</div>
              )}
            </div>
          </Section>
        )}

        {plan.papeles_de_trabajo?.length > 0 && (
          <Section title="Papeles de trabajo sugeridos">
            <div className="space-y-2">
              {plan.papeles_de_trabajo.map((p: any, i: number) => (
                <div key={i} className="p-3 border border-deloitte-line rounded bg-white">
                  <div className="flex items-start gap-3">
                    <span className="text-[11.5px] font-mono font-bold text-deloitte-green bg-green-50 border border-green-200 px-2 py-0.5 rounded uppercase tracking-wider">{p.codigo || `PT-${i+1}`}</span>
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold text-deloitte-ink">{p.titulo}</div>
                      <div className="text-[13px] text-deloitte-slate mt-1">{p.descripcion}</div>
                      {p.evidencia_esperada && (
                        <div className="text-[12px] text-deloitte-greenTxt mt-1.5 italic">
                          → Evidencia esperada: {p.evidencia_esperada}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {plan.criterios_evaluacion?.length > 0 && (
          <Section title="Criterios de evaluación">
            {plan.criterios_evaluacion.map((c: string, i: number) => (
              <div key={i} className="py-1 pl-4 relative text-[13.5px] text-deloitte-slate">
                <span className="absolute left-0 text-deloitte-green">›</span>{c}
              </div>
            ))}
          </Section>
        )}

        {plan.entregables?.length > 0 && (
          <Section title="Entregables">
            {plan.entregables.map((e: string, i: number) => (
              <div key={i} className="py-1 pl-4 relative text-[13.5px] text-deloitte-slate">
                <span className="absolute left-0 text-deloitte-green font-bold">›</span>{e}
              </div>
            ))}
          </Section>
        )}

        {plan.fuentes_iai?.length > 0 && (
          <Section title="Fuentes IAI consultadas">
            <div className="flex flex-wrap gap-1.5">
              {plan.fuentes_iai.map((s: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-green-50 border border-green-200 text-deloitte-greenTxt rounded text-[12px] font-mono">📄 {s}</span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-deloitte-line last:border-b-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-1 h-3.5 bg-deloitte-green rounded"></span>
        <div className="text-[11.5px] font-bold text-deloitte-greenTxt uppercase tracking-widest font-mono">{title}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// TAB C — EVALUAR PLAN
// ─────────────────────────────────────────────────────────────────────
function TabEvaluar() {
  const [form, setForm] = useState({
    organizacion: "",
    sector: "",
    equipo: "",
    madurez: "",
    plan: "",
    areas: "",
    elementos: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sectores = [
    "Servicios financieros / Banca", "Seguros", "Retail y consumo", "Energía y utilities",
    "Medios y comunicaciones", "Telecomunicaciones", "Salud y farma", "Sector público", "Manufactura",
    "Tecnología", "Minería", "Otro",
  ];
  const elementosOpciones = [
    { key: "riesgos", title: "Evaluación de riesgos formal", desc: "Metodología documentada para priorizar el universo" },
    { key: "estrategia", title: "Alineación con objetivos estratégicos", desc: "El plan refleja riesgos ligados a la estrategia" },
    { key: "recursos", title: "Plan de recursos y competencias", desc: "Dotación, presupuesto y habilidades" },
    { key: "compliance", title: "Cobertura de cumplimiento normativo", desc: "Compliance y regulación aplicable" },
    { key: "ti", title: "Auditoría de TI / Ciberseguridad", desc: "Controles tecnológicos y riesgos cibernéticos" },
    { key: "lineas", title: "Coordinación con líneas de defensa", desc: "Articulación con risk, compliance, control interno" },
    { key: "qa", title: "Programa de calidad (QA)", desc: "Aseguramiento interno/externo" },
    { key: "seguimiento", title: "Seguimiento de hallazgos", desc: "Proceso formal de seguimiento" },
    { key: "reporte", title: "Reporte al Comité / Directorio", desc: "Comunicación periódica al gobierno" },
    { key: "analytics", title: "Analítica de datos / tecnología", desc: "Data analytics, CAATs o automatización" },
  ];

  const toggleElemento = (key: string) => {
    setForm({
      ...form,
      elementos: form.elementos.includes(key) ? form.elementos.filter((e) => e !== key) : [...form.elementos, key],
    });
  };

  const run = async () => {
    if (!form.organizacion || !form.sector || !form.plan) {
      setError("Completa los campos requeridos: Organización, Sector y descripción del plan.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    const elementosTexto = form.elementos.length > 0
      ? elementosOpciones.filter((e) => form.elementos.includes(e.key)).map((e) => "✓ " + e.title).join("\n")
      : "No marcados";

    const prompt = `Evalúa este plan de auditoría interna contra mejores prácticas del IAI España y NGAI.

ORGANIZACIÓN: ${form.organizacion}
SECTOR: ${form.sector}
MADUREZ: ${form.madurez || "No especificada"}
EQUIPO: ${form.equipo || "No especificado"}
ÁREAS: ${form.areas || "No especificadas"}

PLAN A EVALUAR:
${form.plan}

ELEMENTOS PRESENTES:
${elementosTexto}

Responde solo con el JSON estructurado.`;

    try {
      const resp = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system: SYS_EVALUAR_PLAN,
          messages: [{ role: "user", content: prompt }],
          maxTokens: 3500,
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }],
        }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(extractJSON(data.text));
      }
    } catch (e: any) {
      setError(e?.message || "Error evaluando el plan");
    }
    setLoading(false);
  };

  const reset = () => { setResult(null); setError(null); };

  return (
    <div className="px-8 py-6 max-w-5xl">
      {!result && (
        <>
          <div className="card p-3 bg-deloitte-paper/40 border-l-2 border-deloitte-green mb-5">
            <div className="text-[13px] text-deloitte-slate">
              Compara tu plan con las buenas prácticas del IAI España y las Normas Globales. Recibirás un <strong>score por dimensiones, hallazgos clasificados por severidad y recomendaciones priorizadas</strong>.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Organización" required>
              <input type="text" value={form.organizacion} onChange={(e) => setForm({ ...form, organizacion: e.target.value })} className="form-input" />
            </Field>
            <Field label="Sector" required>
              <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="form-input">
                <option value="">Selecciona…</option>
                {sectores.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Equipo">
              <select value={form.equipo} onChange={(e) => setForm({ ...form, equipo: e.target.value })} className="form-input">
                <option value="">Selecciona…</option>
                <option>1–3 personas</option>
                <option>4–10 personas</option>
                <option>11–25 personas</option>
                <option>Más de 25</option>
              </select>
            </Field>
            <Field label="Madurez del departamento">
              <select value={form.madurez} onChange={(e) => setForm({ ...form, madurez: e.target.value })} className="form-input">
                <option value="">Selecciona…</option>
                <option>Inicial (0–2 años)</option>
                <option>En desarrollo (2–5 años)</option>
                <option>Establecido (5–10 años)</option>
                <option>Maduro (+10 años)</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label="Descripción del plan" required>
                <textarea value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} rows={5} placeholder="Objetivos, alcance, universo de auditoría, metodología, frecuencia, recursos…" className="form-input resize-y" />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Áreas incluidas">
                <input type="text" value={form.areas} onChange={(e) => setForm({ ...form, areas: e.target.value })} placeholder="Ej: Financiero, Operaciones, TI, Cumplimiento…" className="form-input" />
              </Field>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[12px] font-semibold text-deloitte-slate uppercase tracking-wider mb-2">Elementos del plan presentes (marca los que apliquen)</div>
            <div className="grid grid-cols-2 gap-2">
              {elementosOpciones.map((e) => {
                const on = form.elementos.includes(e.key);
                return (
                  <button
                    key={e.key}
                    onClick={() => toggleElemento(e.key)}
                    className={`text-left flex items-start gap-2 p-2.5 border rounded transition-all ${
                      on ? "border-deloitte-green bg-green-50" : "border-deloitte-line bg-white hover:border-deloitte-mute"
                    }`}
                  >
                    <div className={`w-4 h-4 border-2 rounded mt-0.5 flex-shrink-0 flex items-center justify-center text-[11.5px] text-white ${
                      on ? "bg-deloitte-green border-deloitte-green" : "border-deloitte-line"
                    }`}>{on && "✓"}</div>
                    <div className="text-[12.5px] leading-tight">
                      <div className="font-semibold text-deloitte-ink">{e.title}</div>
                      <div className="text-deloitte-mute mt-0.5">{e.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border-l-2 border-risk-high text-[13px] text-risk-highTxt rounded">{error}</div>
          )}

          <div className="mt-5 flex gap-3">
            <button onClick={run} disabled={loading} className="px-6 py-2.5 bg-deloitte-green text-white text-[14px] font-semibold rounded hover:bg-deloitte-greenDark disabled:opacity-50">
              {loading ? "⏳ Analizando contra mejores prácticas..." : "⚡ Evaluar con IA"}
            </button>
            <button onClick={() => setForm({ organizacion: "", sector: "", equipo: "", madurez: "", plan: "", areas: "", elementos: [] })} className="px-4 py-2.5 border border-deloitte-line text-[14px] rounded hover:border-deloitte-mute">
              Limpiar
            </button>
          </div>
        </>
      )}

      {result && <EvalResult evaluation={result} org={form.organizacion} sector={form.sector} onReset={reset} />}
    </div>
  );
}

function EvalResult({ evaluation, org, sector, onReset }: { evaluation: any; org: string; sector: string; onReset: () => void }) {
  const scoreClass = evaluation.score_global >= 70 ? "text-risk-lowTxt border-risk-low bg-green-50"
    : evaluation.score_global >= 40 ? "text-risk-medTxt border-risk-med bg-amber-50"
    : "text-risk-highTxt border-risk-high bg-red-50";

  const sevMap: any = { alta: "text-risk-highTxt", media: "text-risk-medTxt", baja: "text-risk-lowTxt" };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="eyebrow">Evaluación · {org} · {sector}</div>
        </div>
        <button onClick={onReset} className="px-3 py-1.5 border border-deloitte-line text-[13px] rounded hover:border-deloitte-green">
          ← Nueva evaluación
        </button>
      </div>

      <div className={`card p-5 mb-4 flex items-center gap-6 border-l-4 ${scoreClass}`}>
        <div className="text-center">
          <div className="text-[42px] font-bold tabular leading-none">{evaluation.score_global}</div>
          <div className="text-[11.5px] text-deloitte-mute uppercase tracking-wider">/100</div>
        </div>
        <div className="flex-1">
          <div className="text-[17px] font-semibold text-deloitte-ink">{evaluation.nivel}</div>
          <div className="text-[13.5px] text-deloitte-slate mt-1">{evaluation.resumen}</div>
        </div>
      </div>

      {evaluation.dimensiones?.length > 0 && (
        <div>
          <div className="text-[11.5px] font-bold text-deloitte-slate uppercase tracking-wider mb-2 border-b-2 border-deloitte-green inline-block pb-0.5">Dimensiones evaluadas</div>
          <div className="grid grid-cols-2 gap-2.5 mt-2 mb-5">
            {evaluation.dimensiones.map((d: any, i: number) => {
              const color = d.score >= 70 ? "#16A34A" : d.score >= 40 ? "#F59E0B" : "#DC2626";
              return (
                <div key={i} className="card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[12.5px] font-semibold text-deloitte-ink">{d.nombre}</div>
                    <div className="text-[13px] font-bold tabular" style={{ color }}>{d.score}/100</div>
                  </div>
                  <div className="h-1 bg-deloitte-paper rounded overflow-hidden mb-2">
                    <div className="h-full" style={{ width: `${d.score}%`, background: color }} />
                  </div>
                  <div className="text-[12px] text-deloitte-slate leading-snug">{d.comentario}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {evaluation.hallazgos?.length > 0 && (
        <div className="mb-5">
          <div className="text-[11.5px] font-bold text-deloitte-slate uppercase tracking-wider mb-2 border-b-2 border-deloitte-green inline-block pb-0.5">Hallazgos</div>
          <div className="space-y-2 mt-2">
            {evaluation.hallazgos.map((h: any, i: number) => (
              <div key={i} className="card p-3 flex gap-3">
                <div className={`w-1 flex-shrink-0 rounded ${
                  h.severidad === "alta" ? "bg-risk-high" : h.severidad === "media" ? "bg-risk-med" : "bg-risk-low"
                }`} />
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-deloitte-ink">{h.titulo}</div>
                  <div className="text-[13px] text-deloitte-slate mt-1">{h.descripcion}</div>
                  <div className={`text-[12.5px] mt-1.5 italic ${sevMap[h.severidad] || ""}`}>
                    → {h.recomendacion}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.recomendaciones?.length > 0 && (
        <div className="mb-5">
          <div className="text-[11.5px] font-bold text-deloitte-slate uppercase tracking-wider mb-2 border-b-2 border-deloitte-green inline-block pb-0.5">Recomendaciones priorizadas</div>
          <div className="space-y-2 mt-2">
            {evaluation.recomendaciones.map((r: any, i: number) => (
              <div key={i} className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded">
                <div className="w-6 h-6 rounded-full bg-deloitte-green text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                <div className="text-[13.5px]">
                  <div className="font-semibold text-deloitte-ink">{r.titulo}</div>
                  <div className="text-deloitte-slate mt-0.5">{r.detalle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {evaluation.fuentes_iai?.length > 0 && (
        <div>
          <div className="text-[11.5px] uppercase tracking-wider text-deloitte-mute mb-1.5 font-mono">Fuentes IAI</div>
          <div className="flex flex-wrap gap-1.5">
            {evaluation.fuentes_iai.map((s: string, i: number) => (
              <span key={i} className="px-2 py-1 bg-green-50 border border-green-200 text-deloitte-greenTxt rounded text-[12px] font-mono">📄 {s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
