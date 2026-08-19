import { getPackActivo } from "../packs";
import { useStore, type Espacio } from "../store/useStore";
import { Logo, WordmarkAuditIA } from "./Logo";
import { BRANDING } from "../config/branding";

type Item = {
  id: Espacio;
  number: string;
  title: string;
  subtitle: string;
};

const ITEMS: Item[] = [
  {
    id: "procesos",
    number: "00",
    title: "Procesos Críticos",
    subtitle: "Pagos, pensiones y datos de afiliados",
  },
  {
    id: "uno",
    number: "01",
    title: "Pagos a Proveedores",
    subtitle: "Proveedores, órdenes de compra y facturas",
  },
  {
    id: "dos",
    number: "02",
    title: "Monitoreo Continuo",
    subtitle: "Indicadores y seguimiento de hallazgos",
  },
  {
    id: "tres",
    number: "03",
    title: "Audit Expert",
    subtitle: "Marcos, normativa y mejores prácticas",
  },
  {
    id: "cinco",
    number: "04",
    title: "Gastos y Rendiciones",
    subtitle: "Traslados, viáticos y servicios externos",
  },
  {
    id: "seis",
    number: "05",
    title: "Remuneraciones y Dotación",
    subtitle: "Nómina cruzada con bitácora de turnos",
  },
  {
    id: "cuatro",
    number: "06",
    title: "Coach de Auditor",
    subtitle: "Preparación de reuniones con stakeholders",
  },
];

// Sólo los espacios que el pack activo declara, renumerados para que no
// queden saltos en la numeración visible.
const VISIBLES = ITEMS
  .filter((i) => getPackActivo().espaciosDisponibles.includes(i.id))
  .map((i, k) => ({ ...i, number: String(k + 1).padStart(2, "0") }));

export function Sidebar() {
  const espacio = useStore((s) => s.espacio);
  const setEspacio = useStore((s) => s.setEspacio);
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);

  return (
    <aside className="w-[260px] flex-shrink-0 bg-deloitte-ink text-white flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <Logo invert />
        <div className="mt-3">
          <WordmarkAuditIA className="text-white" />
          <div className="text-[10px] text-white/50 mt-0.5">
            {BRANDING.practice} · IA
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-2 mb-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-semibold">
            {`Demo · ${VISIBLES.length} espacios`}
          </div>
        </div>
        {ITEMS.map((it) => {
          const active = espacio === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setEspacio(it.id)}
              className={`w-full text-left px-3 py-2.5 rounded transition-colors group ${
                active
                  ? "bg-white/10 border border-white/15"
                  : "border border-transparent hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`font-mono text-[11px] mt-0.5 ${
                    active ? "text-deloitte-green" : "text-white/40 group-hover:text-white/60"
                  }`}
                >
                  {it.number}
                </div>
                <div className="flex-1">
                  <div className={`text-[13px] font-semibold ${active ? "text-white" : "text-white/85"}`}>
                    {it.title}
                  </div>
                  <div className="text-[10px] text-white/45 mt-0.5">{it.subtitle}</div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Admin — separado de los espacios */}
        <div className="pt-2 mt-2 border-t border-white/10">
          <button
            onClick={() => setEspacio("admin")}
            className={`w-full text-left px-3 py-2.5 rounded transition-colors group ${
              espacio === "admin"
                ? "bg-white/10 border border-white/15"
                : "border border-transparent hover:bg-white/5"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`text-[11px] mt-0.5 ${espacio === "admin" ? "text-deloitte-green" : "text-white/40 group-hover:text-white/60"}`}>
                ⚙
              </div>
              <div className="flex-1">
                <div className={`text-[13px] font-semibold ${espacio === "admin" ? "text-white" : "text-white/85"}`}>
                  Admin
                </div>
                <div className="text-[10px] text-white/45 mt-0.5">Industria, cliente y logo</div>
              </div>
            </div>
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded">
            <div className="w-8 h-8 rounded-full bg-deloitte-green text-deloitte-ink flex items-center justify-center font-semibold text-[11px]">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-white/50 truncate">{user.role}</div>
            </div>
            <button
              onClick={logout}
              className="text-white/40 hover:text-white text-[10px]"
              title="Salir"
            >
              ↗
            </button>
          </div>
        )}
        <div className="px-2 mt-2 text-[9px] text-white/30 uppercase tracking-wider">
          {BRANDING.copyright}
        </div>
      </div>
    </aside>
  );
}
