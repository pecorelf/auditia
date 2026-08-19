import { useState } from "react";
import { generarDesdeAlerta, guardarCompromiso } from "../data/compromisos";

type Severity = "high" | "med" | "low";

const STYLES: Record<Severity, { bar: string; text: string; bg: string; label: string }> = {
  high: { bar: "bg-risk-high", text: "text-risk-highTxt", bg: "bg-red-50", label: "Severidad alta" },
  med:  { bar: "bg-risk-med",  text: "text-risk-medTxt",  bg: "bg-amber-50", label: "Severidad media" },
  low:  { bar: "bg-risk-low",  text: "text-risk-lowTxt",  bg: "bg-green-50", label: "Severidad baja" },
};

const SEV_MAP: Record<Severity, "Crítica" | "Alta" | "Media"> = {
  high: "Crítica",
  med: "Alta",
  low: "Media",
};

type Props = {
  severity: Severity;
  title: string;
  description: string;
  metric?: string;
  action?: string;
};

export function AlertCard({ severity, title, description, metric, action }: Props) {
  const s = STYLES[severity];
  const [feedback, setFeedback] = useState<{ id: string } | null>(null);

  const onGenerar = () => {
    const c = generarDesdeAlerta({
      titulo: title,
      descripcion: description,
      severidad: SEV_MAP[severity],
      metrica: metric,
      accion: action,
    });
    guardarCompromiso(c);
    setFeedback({ id: c.id });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className={`relative border border-deloitte-line rounded-md overflow-hidden ${s.bg}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
      <div className="pl-4 pr-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className={`text-[11.5px] uppercase tracking-wider font-medium ${s.text}`}>{s.label}</div>
            <div className="text-[15px] font-semibold mt-0.5 text-deloitte-ink">{title}</div>
            <p className="text-[13px] text-deloitte-slate mt-1 leading-snug">{description}</p>
            {action && (
              <div className="text-[12px] text-deloitte-mute italic mt-1.5">
                <span className="font-semibold not-italic text-deloitte-slate">Procedimiento sugerido:</span> {action}
              </div>
            )}
          </div>
          {metric && (
            <div className="text-right">
              <div className={`text-[20px] font-semibold tabular ${s.text}`}>{metric}</div>
            </div>
          )}
        </div>
        <div className="mt-3 pt-2 border-t border-deloitte-line/60 flex items-center justify-between gap-2">
          {feedback ? (
            <div className="flex items-center gap-2 text-[12px]">
              <span className="inline-block w-2 h-2 rounded-full bg-risk-low" />
              <span className="text-deloitte-slate">
                Compromiso <span className="font-mono font-semibold text-deloitte-ink">{feedback.id}</span> creado y guardado en el plan
              </span>
            </div>
          ) : (
            <div className="text-[11.5px] text-deloitte-mute uppercase tracking-wider">Acción</div>
          )}
          <button
            onClick={onGenerar}
            disabled={!!feedback}
            className="px-3 py-1 text-[12px] font-semibold rounded border border-deloitte-ink bg-deloitte-ink text-white hover:bg-deloitte-slate disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {feedback ? "✓ Generado" : "+ Generar compromiso"}
          </button>
        </div>
      </div>
    </div>
  );
}
