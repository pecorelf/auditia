import { useEffect } from "react";

type Row = { label: string; value: string | number; sub?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fuente: string;
  metrica?: { label: string; value: string };
  description?: string;
  rows?: Row[];
  table?: { headers: string[]; rows: (string | number)[][] };
  notas?: string[];
};

export function DrillDown({ open, onClose, title, subtitle, fuente, metrica, description, rows, table, notas }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-deloitte-line bg-deloitte-paper/40 flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow">Drill-down · detalle</div>
            <h2 className="text-[18px] font-serif font-semibold text-deloitte-ink mt-0.5">{title}</h2>
            {subtitle && <div className="text-[13px] text-deloitte-slate mt-0.5">{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            className="text-[24px] leading-none text-deloitte-mute hover:text-deloitte-ink px-2"
            title="Cerrar (Esc)"
          aria-label="Cerrar">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
          {/* Métrica destacada */}
          {metrica && (
            <div className="flex items-center gap-4 p-4 bg-deloitte-paper rounded border border-deloitte-line">
              <div className="text-[28px] font-bold tabular text-deloitte-ink">{metrica.value}</div>
              <div className="text-[13px] text-deloitte-slate">{metrica.label}</div>
            </div>
          )}

          {/* Descripción */}
          {description && (
            <div className="text-[14px] text-deloitte-slate leading-relaxed">{description}</div>
          )}

          {/* Rows clave-valor */}
          {rows && rows.length > 0 && (
            <div className="border border-deloitte-line rounded overflow-hidden">
              {rows.map((r, i) => (
                <div key={i} className={`flex items-start justify-between gap-4 px-4 py-2.5 text-[13.5px] ${i % 2 === 0 ? "bg-white" : "bg-deloitte-paper/40"}`}>
                  <div className="text-deloitte-slate">
                    <div className="font-semibold text-deloitte-ink">{r.label}</div>
                    {r.sub && <div className="text-[12px] text-deloitte-mute mt-0.5">{r.sub}</div>}
                  </div>
                  <div className="font-semibold tabular text-deloitte-ink text-right">{r.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabla */}
          {table && table.rows.length > 0 && (
            <div className="overflow-hidden border border-deloitte-line rounded">
              <table className="w-full text-[13px]">
                <thead className="bg-deloitte-paper">
                  <tr className="text-left">
                    {table.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-[11.5px] uppercase tracking-wider font-bold text-deloitte-mute">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-deloitte-line">
                  {table.rows.map((row, ri) => (
                    <tr key={ri} className="hover:bg-deloitte-paper/40">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-deloitte-slate">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notas adicionales */}
          {notas && notas.length > 0 && (
            <div className="border-l-2 border-deloitte-green pl-3 py-1 space-y-1">
              {notas.map((n, i) => (
                <div key={i} className="text-[12.5px] text-deloitte-slate leading-relaxed">• {n}</div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con fuente */}
        <div className="px-6 py-3 border-t border-deloitte-line bg-deloitte-paper/40 flex items-center justify-between text-[12px]">
          <div className="text-deloitte-mute">
            <span className="font-semibold">Fuente:</span> {fuente}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-deloitte-ink text-white rounded text-[12px] font-semibold hover:bg-deloitte-slate"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
