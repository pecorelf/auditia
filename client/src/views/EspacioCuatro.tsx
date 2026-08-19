// Espacio 4 — Coach de Auditor.
// Ayuda al auditor a preparar reuniones con stakeholders sobre puntos de auditoría.
//
// Dos modos:
//   A) Briefing: el coach prepara estrategia de cómo abordar la reunión
//   B) Roleplay: el coach interpreta al stakeholder para que el auditor practique
//
// Soporta voz (Web Speech API) en el modo Roleplay.
import { apiUrl, apiHeaders } from "../lib/api";

import { useState, useRef, useEffect } from "react";
import { Header } from "../components/Header";
import { Icono } from "../components/Iconos";


type Mode = "setup" | "briefing" | "roleplay";

type StakeholderProfile = {
  nombre: string;
  cargo: string;
  personalidad: "cooperativo" | "defensivo" | "esceptico" | "agresivo";
  contexto: string;
};

type FindingItem = {
  titulo: string;
  severidad: "Crítica" | "Alta" | "Media";
};

// ─────────────────────────────────────────────────────────────────────
// SYSTEM PROMPTS
// ─────────────────────────────────────────────────────────────────────

const SYS_BRIEFING = `Eres un coach experto en comunicación y manejo de conflictos para auditores internos.
Tu rol: ayudar a un auditor a prepararse para una reunión difícil con un stakeholder donde debe presentar hallazgos.

Genera un BRIEFING ejecutivo de preparación en español, con esta estructura exacta (markdown):

## Lectura del stakeholder
[2-3 oraciones sobre cómo probablemente reaccionará la persona basándote en su rol y personalidad. Qué le preocupa, qué le importa profesionalmente.]

## Apertura sugerida
[Frase concreta para abrir la reunión, construyendo rapport sin perder firmeza. Máximo 2-3 oraciones, lista para usar tal cual.]

## Cómo presentar los hallazgos
[3-4 viñetas con frases concretas. Reframe constructivo: el hallazgo como oportunidad, no como ataque. Evitar lenguaje acusatorio.]

## Objeciones que probablemente escuches
[3 objeciones típicas + respuesta corta a cada una en formato "Si dice... → respondes...".]

## Frases que SÍ funcionan
[3-4 frases concretas listas para usar, en estilo conversacional profesional.]

## Frases que evitar
[3 frases que aumentan defensividad — formato "❌ No digas...".]

## Cierre de la reunión
[Cómo cerrar para que el stakeholder se vaya con un compromiso concreto y no sintiéndose atacado.]

REGLAS:
- Español neutro profesional. Tono cálido pero directo.
- Concreto, no abstracto: dame frases que el auditor pueda usar tal cual.
- Si la personalidad es "agresivo" o "defensivo", enfatiza técnicas de desescalada.
- Si la personalidad es "cooperativo", enfatiza claridad y compromiso temporal.
- Máximo 400 palabras totales.`;

const SYS_ROLEPLAY = (profile: StakeholderProfile, findings: FindingItem[]) => `Estás interpretando un personaje en un roleplay de entrenamiento para auditores.

TU PERSONAJE:
- Nombre: ${profile.nombre || "[stakeholder]"}
- Cargo: ${profile.cargo}
- Personalidad: ${profile.personalidad}
- Contexto: ${profile.contexto || "Reunión con auditoría interna"}

HALLAZGOS QUE EL AUDITOR VA A PRESENTARTE:
${findings.map((f, i) => `${i + 1}. [${f.severidad}] ${f.titulo}`).join("\n")}

REGLAS DEL ROLEPLAY:
- Habla EN PRIMERA PERSONA como ${profile.nombre || "el stakeholder"}, no como un asistente.
- Responde de forma natural, conversacional, en español.
- Mantén la personalidad consistentemente:
  ${profile.personalidad === "agresivo" ? "  → Eres confrontacional, cuestionas la metodología, te molesta que cuestionen tu área." : ""}
  ${profile.personalidad === "defensivo" ? "  → Buscas explicar/justificar todo, minimizas los hallazgos, derivas responsabilidad." : ""}
  ${profile.personalidad === "esceptico" ? "  → Cuestionas los datos, pides evidencia, dudas de las conclusiones." : ""}
  ${profile.personalidad === "cooperativo" ? "  → Estás abierto al diálogo pero quieres entender el impacto y los plazos realistas." : ""}
- Cada respuesta tuya: 2-4 oraciones máximo. Conversacional, no monólogos.
- Si el auditor maneja bien la situación, suaviza tu postura gradualmente.
- Si el auditor es agresivo o poco preparado, endurece tu postura.
- NUNCA salgas del personaje. Si te preguntan algo fuera del contexto, responde como ${profile.nombre || "el stakeholder"} lo haría.

TU PRIMER MENSAJE: salúdalo brevemente, expresa tu actitud inicial basada en tu personalidad, y espera a que el auditor presente. Máximo 2 oraciones.`;

const SYS_COACH_HINTS = (profile: StakeholderProfile, findings: FindingItem[], objetivo: string) => `Eres un coach experto en comunicación y manejo de conversaciones difíciles para auditores internos.
Acabás de observar un turno del roleplay donde el auditor (la persona que estás entrenando) interactuó con el stakeholder.

CONTEXTO DEL ENTRENAMIENTO:
- Stakeholder simulado: ${profile.nombre || "[stakeholder]"} (${profile.cargo}, personalidad ${profile.personalidad})
- Objetivo del auditor: ${objetivo || "Comunicar hallazgos y obtener compromiso de remediación"}
- Hallazgos a presentar: ${findings.map((f) => `[${f.severidad}] ${f.titulo}`).join(" · ")}

TU TAREA:
Dale al auditor pistas concretas para mejorar el siguiente turno. NO comentes lo que ya pasó como crítica
post-mortem — guíalo hacia adelante con tácticas específicas y frases listas para usar.

REGLA ABSOLUTA: responde ÚNICAMENTE con un objeto JSON válido. Sin texto antes ni después. Sin markdown.
Empieza con { directamente.

JSON requerido:
{
  "lectura": "1 oración breve: qué está sintiendo o haciendo el stakeholder ahora",
  "siguiente_movimiento": "1-2 oraciones: qué táctica usar en tu próximo turno",
  "frase_sugerida": "1 frase concreta que el auditor puede decir tal cual (entre comillas)",
  "alerta": "OPCIONAL — máx 1 oración: qué evitar específicamente ahora"
}

REGLAS DE TONO:
- Hablás directamente al auditor (segunda persona: "vos / tú").
- Sé concreto, no abstracto. Frases ejecutables.
- Total de palabras en todos los campos combinados: máximo 80.
- Si el stakeholder está cooperativo, foco en cerrar compromiso temporal.
- Si está defensivo, foco en validar antes de avanzar.
- Si está escéptico, foco en mostrar evidencia.
- Si está agresivo, foco en desescalar sin retroceder en el hallazgo.`;

// ─────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────
export function EspacioCuatro() {
  const [mode, setMode] = useState<Mode>("setup");
  const [profile, setProfile] = useState<StakeholderProfile>({
    nombre: "",
    cargo: "",
    personalidad: "defensivo",
    contexto: "",
  });
  const [findings, setFindings] = useState<FindingItem[]>([
    { titulo: "", severidad: "Alta" },
  ]);
  const [objetivo, setObjetivo] = useState("");

  const cargos = [
    "CFO / Gerente Finanzas",
    "CTO / Gerente TI",
    "Gerente de Operaciones",
    "Gerente de Compras",
    "Gerente de RRHH",
    "Dueño de Proceso",
    "Subgerente / Jefe de área",
    "CEO / Gerente General",
    "Director / Miembro del Comité",
    "Otro",
  ];

  const addFinding = () => setFindings([...findings, { titulo: "", severidad: "Alta" }]);
  const removeFinding = (i: number) => setFindings(findings.filter((_, k) => k !== i));
  const updateFinding = (i: number, key: keyof FindingItem, value: string) => {
    setFindings(findings.map((f, k) => k === i ? { ...f, [key]: value } : f));
  };

  const canProceed = profile.cargo && findings.some((f) => f.titulo.trim());

  return (
    <>
      <Header
        eyebrow="Coach de Auditor"
        title="Preparación de reuniones con stakeholders"
        subtitle="Tu coach personal para abordar conversaciones difíciles sobre hallazgos de auditoría. Genera un briefing estratégico o practica con el stakeholder simulado."
        meta={[
          { label: "Modalidad activa", value: mode === "setup" ? "Configuración" : mode === "briefing" ? "Briefing" : "Roleplay" },
          { label: "Modos disponibles", value: "Briefing + Roleplay" },
          { label: "Voz", value: "Disponible en roleplay" },
        ]}
      />

      {mode === "setup" && (
        <SetupForm
          profile={profile}
          setProfile={setProfile}
          findings={findings}
          setFindings={setFindings}
          objetivo={objetivo}
          setObjetivo={setObjetivo}
          cargos={cargos}
          addFinding={addFinding}
          removeFinding={removeFinding}
          updateFinding={updateFinding}
          canProceed={!!canProceed}
          onGoBriefing={() => setMode("briefing")}
          onGoRoleplay={() => setMode("roleplay")}
        />
      )}

      {mode === "briefing" && (
        <BriefingView
          profile={profile}
          findings={findings.filter((f) => f.titulo.trim())}
          objetivo={objetivo}
          onBack={() => setMode("setup")}
          onGoRoleplay={() => setMode("roleplay")}
        />
      )}

      {mode === "roleplay" && (
        <RoleplayView
          profile={profile}
          findings={findings.filter((f) => f.titulo.trim())}
          objetivo={objetivo}
          onBack={() => setMode("setup")}
          onGoBriefing={() => setMode("briefing")}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SETUP FORM
// ─────────────────────────────────────────────────────────────────────
function SetupForm(props: any) {
  const { profile, setProfile, findings, objetivo, setObjetivo, cargos, addFinding, removeFinding, updateFinding, canProceed, onGoBriefing, onGoRoleplay } = props;

  return (
    <div className="px-8 py-6 max-w-4xl space-y-5">
      <div className="card p-3 bg-deloitte-paper/40 border-l-2 border-deloitte-green">
        <div className="text-[13px] text-deloitte-slate">
          Configura el contexto de la reunión. Cuanto más específico, mejor el briefing. Una vez listo, puedes <strong>generar un briefing estratégico</strong> o <strong>practicar con un stakeholder simulado</strong>.
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <div className="eyebrow mb-3">Perfil del stakeholder</div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre o referencia (opcional)">
              <input
                type="text"
                value={profile.nombre}
                onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                placeholder="Ej: Carlos Robles, o 'Gerente TI'"
                className="form-input"
              />
            </Field>
            <Field label="Cargo" required>
              <select
                value={profile.cargo}
                onChange={(e) => setProfile({ ...profile, cargo: e.target.value })}
                className="form-input"
              >
                <option value="">Selecciona…</option>
                {cargos.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Personalidad esperada">
              <select
                value={profile.personalidad}
                onChange={(e) => setProfile({ ...profile, personalidad: e.target.value })}
                className="form-input"
              >
                <option value="cooperativo">Cooperativo — abierto al diálogo</option>
                <option value="defensivo">Defensivo — justifica y minimiza</option>
                <option value="esceptico">Escéptico — cuestiona evidencia</option>
                <option value="agresivo">Agresivo — confrontacional</option>
              </select>
            </Field>
            <Field label="Tu objetivo en la reunión">
              <input
                type="text"
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                placeholder="Ej: Obtener compromiso de cierre en 60 días"
                className="form-input"
              />
            </Field>
            <div className="col-span-2">
              <Field label="Contexto adicional">
                <textarea
                  value={profile.contexto}
                  onChange={(e) => setProfile({ ...profile, contexto: e.target.value })}
                  rows={2}
                  placeholder="Ej: Carlos viene reportando atrasos hace 2 trimestres, su área está sobrecargada, viene de una reorganización…"
                  className="form-input resize-y"
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="border-t border-deloitte-line pt-4">
          <div className="flex items-baseline justify-between mb-3">
            <div className="eyebrow">Hallazgos a presentar</div>
            <button
              onClick={addFinding}
              className="text-[12px] text-deloitte-greenTxt font-semibold hover:underline"
            >+ agregar hallazgo</button>
          </div>
          <div className="space-y-2">
            {findings.map((f: FindingItem, i: number) => (
              <div key={i} className="flex gap-2 items-start">
                <select
                  value={f.severidad}
                  onChange={(e) => updateFinding(i, "severidad", e.target.value)}
                  className={`form-input w-32 flex-shrink-0 ${
                    f.severidad === "Crítica" ? "border-risk-high text-risk-highTxt" :
                    f.severidad === "Alta" ? "border-risk-med text-risk-medTxt" : "text-deloitte-slate"
                  }`}
                >
                  <option value="Crítica">Crítica</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                </select>
                <input
                  type="text"
                  value={f.titulo}
                  onChange={(e) => updateFinding(i, "titulo", e.target.value)}
                  placeholder={`Hallazgo ${i + 1}: descripción concisa`}
                  className="form-input flex-1"
                />
                {findings.length > 1 && (
                  <button
                    onClick={() => removeFinding(i)}
                    className="px-2 text-deloitte-mute hover:text-risk-highTxt"
                    title="Eliminar"
                  aria-label="Cerrar">×</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onGoBriefing}
          disabled={!canProceed}
          className="px-5 py-2.5 bg-deloitte-ink text-white text-[14px] font-semibold rounded hover:bg-deloitte-slate disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icono nombre="tramites" size={15} /> Generar briefing estratégico
        </button>
        <button
          onClick={onGoRoleplay}
          disabled={!canProceed}
          className="px-5 py-2.5 bg-deloitte-green text-white text-[14px] font-semibold rounded hover:bg-deloitte-greenDark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>🎭</span> Practicar conversación (roleplay)
        </button>
      </div>

      {!canProceed && (
        <div className="text-[12px] text-deloitte-mute italic">
          Completa el cargo del stakeholder y al menos un hallazgo para continuar.
        </div>
      )}
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

// ─────────────────────────────────────────────────────────────────────
// BRIEFING VIEW
// ─────────────────────────────────────────────────────────────────────
function BriefingView({ profile, findings, objetivo, onBack, onGoRoleplay }: any) {
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    const prompt = `Prepara el briefing para esta reunión:

STAKEHOLDER: ${profile.nombre ? profile.nombre + " — " : ""}${profile.cargo}
PERSONALIDAD: ${profile.personalidad}
CONTEXTO: ${profile.contexto || "No especificado"}
MI OBJETIVO: ${objetivo || "Comunicar hallazgos y obtener compromiso de remediación"}

HALLAZGOS A PRESENTAR:
${findings.map((f: FindingItem, i: number) => `${i + 1}. [${f.severidad}] ${f.titulo}`).join("\n")}

Genera el briefing en la estructura especificada.`;

    try {
      const resp = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system: SYS_BRIEFING,
          messages: [{ role: "user", content: prompt }],
          maxTokens: 1500,
        }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBriefing(data.text || "Sin respuesta.");
      }
    } catch (e: any) {
      setError(e?.message || "Error generando briefing");
    }
    setLoading(false);
  };

  return (
    <div className="px-8 py-6 max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Briefing estratégico · Reunión con {profile.nombre || profile.cargo}</div>
          <div className="text-[13px] text-deloitte-slate mt-0.5">
            Personalidad: <span className="font-semibold">{profile.personalidad}</span> · {findings.length} {findings.length === 1 ? "hallazgo" : "hallazgos"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-3 py-1.5 border border-deloitte-line text-[13px] rounded hover:border-deloitte-green">
            ← Configurar
          </button>
          <button
            onClick={onGoRoleplay}
            className="px-3 py-1.5 bg-deloitte-green text-white text-[13px] font-semibold rounded hover:bg-deloitte-greenDark flex items-center gap-1"
          >
            🎭 Practicar →
          </button>
        </div>
      </div>

      {loading && (
        <div className="card p-8 text-center text-deloitte-mute text-[14px] font-mono">
          <div className="inline-block w-4 h-4 border-2 border-deloitte-line border-t-deloitte-green rounded-full animate-spin mr-2 align-middle"></div>
          Preparando tu briefing estratégico...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border-l-2 border-risk-high text-[13px] text-risk-highTxt rounded">
          {error}
          <button onClick={generate} className="ml-3 underline font-semibold">Reintentar</button>
        </div>
      )}

      {briefing && !loading && (
        <div className="card p-6">
          <div
            className="text-[14px] leading-relaxed text-deloitte-slate prose-coach"
            dangerouslySetInnerHTML={{ __html: formatBriefing(briefing) }}
          />
          <div className="mt-5 pt-4 border-t border-deloitte-line text-[12px] text-deloitte-mute italic">
            Tip: cuando termines de leer, haz click en <strong>"Practicar"</strong> arriba para tener una conversación simulada con el stakeholder y ensayar antes de la reunión real.
          </div>
        </div>
      )}
    </div>
  );
}

function formatBriefing(text: string): string {
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/^## (.+)$/gm, '<h3 style="margin-top:18px;margin-bottom:8px;font-size:14px;font-weight:700;color:#0A0A0A;border-bottom:2px solid #86BC25;padding-bottom:4px;display:inline-block">$1</h3>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^- (.+)$/gm, '<div style="padding:3px 0 3px 16px;position:relative"><span style="position:absolute;left:0;color:#86BC25;font-weight:700">›</span>$1</div>');
  html = html.replace(/^❌ (.+)$/gm, '<div style="padding:3px 0 3px 22px;position:relative;color:#9b1c1c"><span style="position:absolute;left:0">❌</span>$1</div>');
  html = html.replace(/Si dice/g, '<strong>Si dice</strong>');
  html = html.replace(/→/g, '<span style="color:#86BC25;font-weight:700">→</span>');
  html = html.replace(/\n\n/g, '<div style="height:8px"></div>');
  html = html.replace(/\n/g, "<br>");
  return html;
}

// ─────────────────────────────────────────────────────────────────────
// ROLEPLAY VIEW — chat + voz
// ─────────────────────────────────────────────────────────────────────
type CoachHint = {
  lectura: string;
  siguiente_movimiento: string;
  frase_sugerida: string;
  alerta?: string;
};

type Turn = {
  role: "user" | "assistant";
  content: string;
  viaVoz?: boolean;
  coachHint?: CoachHint;
  coachLoading?: boolean;
  coachError?: string;
};

function RoleplayView({ profile, findings, objetivo, onBack, onGoBriefing }: any) {
  const [conversation, setConversation] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const inputViaVozRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !window.speechSynthesis) {
      setVoiceSupported(false);
    }
    // Iniciar el roleplay automáticamente con un primer mensaje del stakeholder
    if (!initializedRef.current) {
      initializedRef.current = true;
      sendInitial();
    }
    return () => {
      try { window.speechSynthesis?.cancel(); } catch {}
      try { recognitionRef.current?.abort(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    const clean = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\s+/g, " ").trim().slice(0, 800);
    if (!clean) return;
    try { window.speechSynthesis.cancel(); } catch {}
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "es-MX";
    utt.rate = 1.0;
    utt.pitch = profile.personalidad === "agresivo" ? 0.9 : profile.personalidad === "cooperativo" ? 1.05 : 1.0;
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

  const fetchCoachHint = async (userMsg: string, stakeholderResp: string, assistantIdx: number) => {
    // Marcamos esa respuesta como "cargando coach"
    setConversation((prev) => prev.map((t, i) => i === assistantIdx ? { ...t, coachLoading: true } : t));

    try {
      const prompt = `El auditor acaba de decir:
"${userMsg}"

El stakeholder ${profile.nombre || profile.cargo} respondió:
"${stakeholderResp}"

Genera las pistas para el auditor en el JSON especificado.`;

      const resp = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system: SYS_COACH_HINTS(profile, findings, objetivo),
          messages: [{ role: "user", content: prompt }],
          maxTokens: 400,
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);

      // Parsear JSON del coach
      let raw = (data.text || "").replace(/```json|```/g, "").trim();
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end <= start) throw new Error("Coach no devolvió JSON parseable");
      const hint: CoachHint = JSON.parse(raw.slice(start, end + 1));

      setConversation((prev) => prev.map((t, i) =>
        i === assistantIdx ? { ...t, coachHint: hint, coachLoading: false } : t
      ));
    } catch (e: any) {
      setConversation((prev) => prev.map((t, i) =>
        i === assistantIdx ? { ...t, coachError: e?.message || "Coach no disponible", coachLoading: false } : t
      ));
    }
  };

  const sendInitial = async () => {
    setLoading(true);
    try {
      const resp = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system: SYS_ROLEPLAY(profile, findings),
          messages: [{ role: "user", content: "Hola, gracias por hacer tiempo para esta reunión. ¿Cómo estás?" }],
          maxTokens: 300,
        }),
      });
      const data = await resp.json();
      if (!data.error) {
        const respText = data.text || "Sin respuesta.";
        const newConv: Turn[] = [
          { role: "user", content: "Hola, gracias por hacer tiempo para esta reunión. ¿Cómo estás?" },
          { role: "assistant", content: respText },
        ];
        setConversation(newConv);
        if (voiceEnabled) setTimeout(() => speak(respText), 300);
        // Coach observa el primer turno también
        if (hintsEnabled) {
          fetchCoachHint(newConv[0].content, respText, 1);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Error iniciando roleplay");
    }
    setLoading(false);
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setError(null);
    setInput("");
    const wasViaVoz = inputViaVozRef.current;
    inputViaVozRef.current = false;
    const newConv: Turn[] = [...conversation, { role: "user" as const, content: msg, viaVoz: wasViaVoz }];
    setConversation(newConv);
    setLoading(true);

    try {
      const resp = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          system: SYS_ROLEPLAY(profile, findings),
          messages: newConv.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          maxTokens: 400,
        }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(data.error);
      } else {
        const respText = data.text || "Sin respuesta.";
        const finalConv: Turn[] = [...newConv, { role: "assistant", content: respText }];
        setConversation(finalConv);
        if (voiceEnabled) {
          setTimeout(() => speak(respText), 250);
        }
        // Dispara la llamada al coach en paralelo (no bloquea la UI ni la voz)
        if (hintsEnabled) {
          fetchCoachHint(msg, respText, finalConv.length - 1);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Error de red");
    }
    setLoading(false);
  };

  const startListening = () => {
    if (!voiceSupported) return;
    stopSpeaking();
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = "es-MX";
    r.continuous = false;
    r.interimResults = true;
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
    r.onerror = () => {
      setIsRecording(false);
      setVoiceMessage("Error con el micrófono. Reintenta.");
      setTimeout(() => setVoiceMessage(null), 3000);
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
    } catch {
      setVoiceMessage("No se pudo iniciar el micrófono.");
      setTimeout(() => setVoiceMessage(null), 3000);
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsRecording(false);
  };

  return (
    <div className="px-8 py-6 max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Roleplay · estás conversando con {profile.nombre || profile.cargo}</div>
          <div className="text-[13px] text-deloitte-slate mt-0.5">
            Personalidad: <span className="font-semibold">{profile.personalidad}</span> · {profile.cargo}
            {voiceSupported && voiceEnabled && <span className="text-deloitte-greenTxt"> · 🔊 voz activada</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="px-3 py-1.5 border border-deloitte-line text-[13px] rounded hover:border-deloitte-green">
            ← Configurar
          </button>
          <button onClick={onGoBriefing} className="px-3 py-1.5 border border-deloitte-line text-[13px] rounded hover:border-deloitte-green">
            <Icono nombre="tramites" size={14} /> Ver briefing
          </button>
          {voiceSupported && (
            <button
              onClick={() => { if (isSpeaking) stopSpeaking(); setVoiceEnabled(!voiceEnabled); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11.5px] font-semibold uppercase tracking-wider transition-colors ${
                voiceEnabled
                  ? "bg-deloitte-green/10 text-deloitte-greenTxt border border-deloitte-green/30"
                  : "bg-deloitte-paper text-deloitte-mute border border-deloitte-line"
              }`}
              title={voiceEnabled ? "Voz activada · click para silenciar" : "Voz desactivada"}
            >
              <span>{voiceEnabled ? "🔊" : "🔇"}</span>
              <span>Voz {voiceEnabled ? "ON" : "OFF"}</span>
            </button>
          )}
          <button
            onClick={() => setHintsEnabled(!hintsEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11.5px] font-semibold uppercase tracking-wider transition-colors ${
              hintsEnabled
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-deloitte-paper text-deloitte-mute border border-deloitte-line"
            }`}
            title={hintsEnabled ? "Pistas del coach activas" : "Pistas del coach desactivadas"}
          >
            <span>💡</span>
            <span>Pistas {hintsEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Roleplay context card */}
      <div className="card p-3 bg-amber-50 border-l-2 border-amber-400">
        <div className="text-[13px] text-deloitte-slate leading-relaxed">
          <strong>🎭 Modo roleplay con coaching activo.</strong> El sistema interpreta a <strong>{profile.nombre || profile.cargo}</strong> con personalidad <em>{profile.personalidad}</em>. Después de cada respuesta del stakeholder, el coach te dará pistas sobre cómo manejar el siguiente turno. Podés desactivar las pistas con el botón 💡 arriba.
        </div>
      </div>

      {/* Chat */}
      <div className="space-y-3 min-h-[300px]">
        {conversation.map((m, i) => (
          <div key={i}>
            <div className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="w-9 h-9 rounded-full bg-deloitte-ink text-white flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-1">
                  {profile.nombre ? profile.nombre.split(" ").map((p: string) => p[0]).slice(0, 2).join("") : "ST"}
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-lg text-[14px] leading-relaxed ${
                m.role === "user"
                  ? "bg-deloitte-green text-white rounded-br-sm"
                  : "bg-white border border-deloitte-line text-deloitte-slate rounded-bl-sm"
              }`}>
                {m.role === "assistant" && isSpeaking && i === conversation.length - 1 && (
                  <div className="flex items-center gap-1 mb-1.5 h-3">
                    {[5, 12, 8, 14, 6, 10, 5].map((h, k) => (
                      <span key={k} className="w-0.5 bg-deloitte-greenDark rounded animate-pulse" style={{ height: `${h}px`, animationDelay: `${k * 0.08}s`, animationDuration: "0.6s" }} />
                    ))}
                    <button onClick={stopSpeaking} className="ml-2 text-[11.5px] text-deloitte-mute hover:text-risk-highTxt underline">silenciar</button>
                  </div>
                )}
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-9 h-9 rounded-full bg-deloitte-paper border border-deloitte-line text-deloitte-mute flex items-center justify-center text-[12px] flex-shrink-0 mt-1">Tú</div>
              )}
            </div>

            {/* PISTAS DEL COACH — solo bajo turnos del stakeholder */}
            {m.role === "assistant" && hintsEnabled && (
              <CoachHintCard
                hint={m.coachHint}
                loading={!!m.coachLoading}
                error={m.coachError}
                stakeholderName={profile.nombre || profile.cargo}
              />
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-deloitte-ink text-white flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-1">
              {profile.nombre ? profile.nombre.split(" ").map((p: string) => p[0]).slice(0, 2).join("") : "ST"}
            </div>
            <div className="bg-white border border-deloitte-line px-4 py-2.5 rounded-lg text-[13px] text-deloitte-mute font-mono">
              {profile.nombre || "El stakeholder"} está pensando…
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border-l-2 border-risk-high text-[13px] text-risk-highTxt rounded">{error}</div>
      )}

      {voiceMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-deloitte-ink text-white px-4 py-2 rounded-lg shadow-lg text-[13px] font-mono z-50">
          {voiceMessage}
        </div>
      )}

      {/* Input + mic */}
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
          placeholder={isRecording ? "Escuchando... habla ahora" : "Tu turno: ¿qué le dices?"}
          rows={2}
          disabled={loading || isRecording}
          className="flex-1 px-3 py-2 text-[14px] border-none focus:outline-none resize-none bg-transparent"
        />
        {voiceSupported && (
          <button
            onClick={isRecording ? stopListening : startListening}
            disabled={loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isRecording
                ? "bg-red-500 text-white animate-pulse shadow-lg"
                : "bg-deloitte-paper border border-deloitte-line text-deloitte-slate hover:bg-deloitte-line hover:text-deloitte-ink"
            } disabled:opacity-50`}
            title={isRecording ? "Detener grabación" : "Hablar"}
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
          className="px-4 py-2 bg-deloitte-ink text-white text-[13px] font-semibold rounded hover:bg-deloitte-slate disabled:opacity-50"
        >
          {loading ? "..." : "Decir"}
        </button>
      </div>

      <div className="text-[11.5px] text-deloitte-mute font-mono px-1">
        {isRecording
          ? "🔴 Grabando... pausa cuando termines de hablar."
          : voiceSupported
            ? "Enter · enviar | Shift+Enter · nueva línea | 🎤 · hablar con el stakeholder"
            : "Tu navegador no soporta voz. Usa Chrome o Edge para una experiencia completa."}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CoachHintCard — panel ámbar diferenciado debajo de cada respuesta del stakeholder
// ─────────────────────────────────────────────────────────────────────
function CoachHintCard({ hint, loading, error, stakeholderName }: {
  hint?: CoachHint;
  loading: boolean;
  error?: string;
  stakeholderName: string;
}) {
  // Si no hay nada que mostrar (ni loading, ni hint, ni error), no renderizar
  if (!loading && !hint && !error) return null;

  return (
    <div className="ml-12 mt-2 max-w-[75%]">
      <div className="relative bg-amber-50/70 border border-amber-200 rounded-lg overflow-hidden">
        {/* Indicador lateral */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />

        <div className="pl-4 pr-4 py-3">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[15px]">💡</span>
            <span className="text-[11.5px] font-semibold text-amber-800 uppercase tracking-wider">
              Coach · pistas para tu próximo turno
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-[13px] text-amber-700 font-mono py-1">
              <div className="w-3 h-3 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
              <span>Coach analizando cómo respondió {stakeholderName}…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-[12.5px] text-amber-900/70 italic">
              No se pudo generar la pista para este turno ({error}).
            </div>
          )}

          {/* Hint content */}
          {hint && !loading && (
            <div className="space-y-2 text-[13.5px] leading-relaxed">
              {hint.lectura && (
                <div>
                  <div className="text-[11.5px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Lectura</div>
                  <div className="text-deloitte-slate">{hint.lectura}</div>
                </div>
              )}

              {hint.siguiente_movimiento && (
                <div>
                  <div className="text-[11.5px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Siguiente movimiento</div>
                  <div className="text-deloitte-slate">{hint.siguiente_movimiento}</div>
                </div>
              )}

              {hint.frase_sugerida && (
                <div className="bg-white/60 border border-amber-200 rounded px-2.5 py-1.5">
                  <div className="text-[11.5px] font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Frase sugerida</div>
                  <div className="text-deloitte-ink italic">"{hint.frase_sugerida.replace(/^["']|["']$/g, "")}"</div>
                </div>
              )}

              {hint.alerta && (
                <div className="flex items-start gap-1.5 pt-1 border-t border-amber-200/60">
                  <span className="text-[13px] flex-shrink-0">⚠️</span>
                  <div>
                    <div className="text-[11.5px] font-semibold text-risk-highTxt uppercase tracking-wider">Cuidado</div>
                    <div className="text-[13px] text-risk-highTxt/90">{hint.alerta}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
