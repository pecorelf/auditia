// Modo presentación.
//
// Por qué existe: esta app se usa proyectada en salas de reunión, con el cliente
// a tres metros de la pantalla. Los tamaños que funcionan en un notebook a 50 cm
// no se leen a esa distancia, y en una demo el costo de que no se lea una cifra
// es que se pierde el argumento.
//
// Escala toda la interfaz desde la raíz en vez de duplicar estilos, así que no
// hay dos diseños que mantener. La preferencia queda guardada en el navegador.

import { useEffect, useState } from "react";

const KEY = "auditia.escala";
const NIVELES = [
  { id: "normal", etiqueta: "Normal", escala: 1, nota: "Trabajo en pantalla propia" },
  { id: "sala", etiqueta: "Sala", escala: 1.15, nota: "Reunión con notebook compartido" },
  { id: "proyector", etiqueta: "Proyector", escala: 1.3, nota: "Sala grande o pantalla lejana" },
] as const;

export type NivelEscala = (typeof NIVELES)[number]["id"];

export const getEscala = (): NivelEscala => {
  try {
    const v = localStorage.getItem(KEY) as NivelEscala | null;
    return v && NIVELES.some((n) => n.id === v) ? v : "normal";
  } catch {
    return "normal";
  }
};

export const aplicarEscala = (nivel: NivelEscala) => {
  const cfg = NIVELES.find((n) => n.id === nivel) || NIVELES[0];
  // Se escala el tamaño de fuente raíz. Todo lo que esté en px absolutos no
  // reacciona, así que además se aplica un zoom suave al contenedor principal.
  document.documentElement.style.setProperty("--auditia-escala", String(cfg.escala));
  try { localStorage.setItem(KEY, nivel); } catch { /* sin persistencia */ }
};

export function SelectorEscala({ oscuro = false }: { oscuro?: boolean }) {
  const [nivel, setNivel] = useState<NivelEscala>(getEscala);

  useEffect(() => { aplicarEscala(nivel); }, [nivel]);

  return (
    <div>
      <div className={`text-[11px] uppercase tracking-[0.14em] font-semibold mb-1.5 ${oscuro ? "text-white/45" : "text-deloitte-mute"}`}>
        Tamaño de pantalla
      </div>
      <div
        role="radiogroup"
        aria-label="Tamaño de la interfaz"
        className={`flex rounded overflow-hidden border ${oscuro ? "border-white/15" : "border-deloitte-line"}`}
      >
        {NIVELES.map((n) => {
          const activo = nivel === n.id;
          return (
            <button
              key={n.id}
              role="radio"
              aria-checked={activo}
              title={n.nota}
              onClick={() => setNivel(n.id)}
              className={`flex-1 text-[11.5px] font-semibold py-1.5 transition-colors ${
                activo
                  ? oscuro ? "bg-deloitte-green text-black" : "bg-deloitte-ink text-white"
                  : oscuro ? "text-white/60 hover:bg-white/10" : "text-deloitte-mute hover:bg-deloitte-paper"
              }`}
            >
              {n.etiqueta}
            </button>
          );
        })}
      </div>
    </div>
  );
}
