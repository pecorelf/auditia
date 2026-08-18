// Animación de análisis en vivo — reutilizable en cualquier espacio.
//
// Muestra el barrido sobre las fuentes y la aparición de hallazgos uno a uno,
// con contador de transacciones. Es el momento que separa "una tabla con datos"
// de "la máquina está trabajando delante del cliente".
//
// Sólo CSS y React. No hace llamadas: la detección ya corrió, esto la escenifica.

import { useEffect, useRef, useState } from "react";
import { num, CLP } from "../lib/format";

export type FuenteAnim = { nombre: string; filas: number; icono: string };
export type HallazgoAnim = {
  titulo: string;
  severidad: "critica" | "alta" | "media";
  cantidad: number;
  montoCLP?: number;
};

type Props = {
  fuentes: FuenteAnim[];
  hallazgos: HallazgoAnim[];
  /** Transacciones totales cruzadas — el número grande del contador. */
  universo: number;
  /** Tamaño de la muestra de una auditoría tradicional, para el contraste. */
  muestraTradicional: number;
  onTerminar?: () => void;
};

const COLOR = {
  critica: { txt: "text-risk-high", bg: "bg-red-50", brd: "border-red-200", punto: "bg-risk-high" },
  alta: { txt: "text-risk-med", bg: "bg-amber-50", brd: "border-amber-200", punto: "bg-risk-med" },
  media: { txt: "text-deloitte-greenDark", bg: "bg-deloitte-paper", brd: "border-deloitte-line", punto: "bg-deloitte-green" },
};

export function AnalisisEnVivo({ fuentes, hallazgos, universo, muestraTradicional, onTerminar }: Props) {
  const [fase, setFase] = useState<"idle" | "barriendo" | "detectando" | "listo">("idle");
  const [fuenteActiva, setFuenteActiva] = useState(-1);
  const [contador, setContador] = useState(0);
  const [visibles, setVisibles] = useState(0);
  const timers = useRef<number[]>([]);

  const limpiar = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => limpiar, []);

  const arrancar = () => {
    limpiar();
    setFase("barriendo");
    setFuenteActiva(0);
    setContador(0);
    setVisibles(0);

    const MS_POR_FUENTE = 620;

    // Barrido: una fuente a la vez
    fuentes.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setFuenteActiva(i), i * MS_POR_FUENTE) as unknown as number,
      );
    });

    // Contador de transacciones — sube durante todo el barrido
    const finBarrido = fuentes.length * MS_POR_FUENTE;
    const PASOS = 42;
    for (let k = 1; k <= PASOS; k++) {
      timers.current.push(
        window.setTimeout(() => {
          // curva desacelerada: avanza rápido y frena al final
          const t = k / PASOS;
          setContador(Math.round(universo * (1 - Math.pow(1 - t, 2.4))));
        }, (finBarrido / PASOS) * k) as unknown as number,
      );
    }

    // Hallazgos: aparecen uno a uno después del barrido
    timers.current.push(
      window.setTimeout(() => {
        setFase("detectando");
        setFuenteActiva(fuentes.length);
        hallazgos.forEach((_, i) => {
          timers.current.push(
            window.setTimeout(() => {
              setVisibles(i + 1);
              if (i === hallazgos.length - 1) {
                setFase("listo");
                onTerminar?.();
              }
            }, i * 380) as unknown as number,
          );
        });
      }, finBarrido + 300) as unknown as number,
    );
  };

  const corriendo = fase === "barriendo" || fase === "detectando";
  const totalCasos = hallazgos.slice(0, visibles).reduce((a, h) => a + h.cantidad, 0);
  const totalMonto = hallazgos.slice(0, visibles).reduce((a, h) => a + (h.montoCLP || 0), 0);

  return (
    <div className="card overflow-hidden">
      <style>{`
        @keyframes barrido {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes entrada-hallazgo {
          0%   { opacity: 0; transform: translateY(6px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes latido {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(0.82); }
        }
        .anim-barrido::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(134,188,37,0.28), transparent);
          animation: barrido 900ms ease-in-out infinite;
        }
        .anim-entrada { animation: entrada-hallazgo 320ms cubic-bezier(0.2, 0.8, 0.3, 1) both; }
        .anim-latido  { animation: latido 900ms ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .anim-barrido::after, .anim-entrada, .anim-latido { animation: none !important; }
        }
      `}</style>

      {/* Cabecera */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-deloitte-line">
        <div>
          <div className="eyebrow">Análisis con AuditIA</div>
          <div className="text-[13px] text-deloitte-mute mt-0.5">
            {fase === "idle" && `${num(fuentes.length)} fuentes · ${num(universo)} transacciones por cruzar`}
            {fase === "barriendo" && "Recorriendo las fuentes…"}
            {fase === "detectando" && "Detectando patrones…"}
            {fase === "listo" && `${num(totalCasos)} hallazgos sobre el 100% del universo`}
          </div>
        </div>
        <button
          onClick={arrancar}
          disabled={corriendo}
          className="text-[12.5px] font-semibold px-4 py-2 rounded bg-deloitte-ink text-white disabled:opacity-40 hover:bg-deloitte-slate transition-colors"
        >
          {fase === "idle" ? "Ejecutar análisis" : corriendo ? "Analizando…" : "Ejecutar de nuevo"}
        </button>
      </div>

      {/* Contador */}
      <div className="px-5 py-4 bg-deloitte-ink text-white">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="eyebrow text-white/45">Transacciones cruzadas</div>
            <div className="font-mono text-[34px] font-bold leading-none mt-1 tabular">
              {num(contador)}
              {corriendo && <span className="anim-latido inline-block ml-2 w-2 h-2 rounded-full bg-deloitte-green align-middle" />}
            </div>
          </div>
          <div className="text-right">
            <div className="eyebrow text-white/45">Auditoría tradicional</div>
            <div className="font-mono text-[20px] font-semibold leading-none mt-1 tabular text-white/50">
              {num(muestraTradicional)}
            </div>
            <div className="text-[10.5px] text-white/40 mt-1">
              {contador > 0 ? `${num(Math.round(contador / muestraTradicional))}× más cobertura` : "de muestra"}
            </div>
          </div>
        </div>
      </div>

      {/* Fuentes */}
      <div className="px-5 py-4 border-b border-deloitte-line">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(fuentes.length, 5)}, minmax(0, 1fr))` }}>
          {fuentes.map((f, i) => {
            const activa = fuenteActiva === i && fase === "barriendo";
            const hecha = fuenteActiva > i || fase === "detectando" || fase === "listo";
            return (
              <div
                key={f.nombre}
                className={`relative overflow-hidden border rounded px-3 py-2.5 transition-colors duration-300 ${
                  activa ? "border-deloitte-green bg-deloitte-paper anim-barrido"
                  : hecha ? "border-deloitte-green/40 bg-white"
                  : "border-deloitte-line bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">{f.icono}</span>
                  {hecha && <span className="text-deloitte-green text-[12px] font-bold">✓</span>}
                </div>
                <div className="text-[10.5px] font-semibold text-deloitte-ink mt-1 leading-tight truncate">
                  {f.nombre}
                </div>
                <div className="text-[10px] text-deloitte-mute tabular mt-0.5">{num(f.filas)} filas</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hallazgos */}
      <div className="px-5 py-4 min-h-[120px]">
        {fase === "idle" ? (
          <div className="text-[12px] text-deloitte-mute py-6 text-center">
            Los hallazgos aparecen a medida que se cruzan las fuentes.
          </div>
        ) : (
          <div className="space-y-1.5">
            {hallazgos.slice(0, visibles).map((h, i) => {
              const c = COLOR[h.severidad];
              return (
                <div
                  key={h.titulo}
                  className={`anim-entrada flex items-center gap-3 border rounded px-3 py-2 ${c.bg} ${c.brd}`}
                  style={{ animationDelay: `${Math.min(i, 3) * 20}ms` }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.punto}`} />
                  <div className="flex-1 text-[12px] text-deloitte-ink leading-tight">{h.titulo}</div>
                  {h.montoCLP ? (
                    <div className="text-[11px] tabular text-deloitte-mute">{CLP(h.montoCLP)}</div>
                  ) : null}
                  <div className={`text-[15px] font-bold tabular ${c.txt} w-8 text-right`}>{h.cantidad}</div>
                </div>
              );
            })}

            {fase === "listo" && totalMonto > 0 && (
              <div className="anim-entrada flex items-center justify-between border-t border-deloitte-line pt-3 mt-3">
                <div className="text-[12px] font-semibold text-deloitte-ink">Impacto económico detectado</div>
                <div className="text-[16px] font-bold tabular text-risk-high">{CLP(totalMonto)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
