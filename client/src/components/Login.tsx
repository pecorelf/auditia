import { useState } from "react";
import { useStore } from "../store/useStore";
import { esDesarrollo, getPassword, setPassword } from "../lib/api";
import { Logo, WordmarkAuditIA } from "./Logo";

export function Login() {
  const users = useStore((s) => s.users);
  const login = useStore((s) => s.login);
  const [clave, setClave] = useState(getPassword());

  // En Vercel la demo está detrás de una clave compartida; en local no hace falta.
  const pideClave = !esDesarrollo();

  const entrar = (id: string) => {
    if (pideClave) setPassword(clave.trim());
    login(id);
  };

  return (
    <div className="min-h-screen login-bg flex">
      {/* Lado izquierdo: branding y mensaje */}
      <div className="hidden md:flex flex-col justify-between p-10 w-[42%] text-white">
        <Logo invert />

        <div className="space-y-6">
          <div>
            <div className="eyebrow text-white/50">Demo interna · Mayo 2026</div>
            <h1 className="font-serif text-5xl font-semibold tracking-tight mt-2 leading-[1.05]">
              El estado del arte de la IA<br />en Auditoría Interna.
            </h1>
            <p className="text-white/60 mt-5 text-[15px] leading-relaxed max-w-md">
              Tres espacios. Un solo asistente. Del análisis de datos puntual a la
              planificación estratégica del plan anual.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { n: "01", t: "Engagement" },
              { n: "02", t: "Audit Hub" },
              { n: "03", t: "Marcos" },
            ].map((s) => (
              <div key={s.n} className="border-l-2 border-deloitte-green pl-3">
                <div className="text-white/40 font-mono text-[11px]">{s.n}</div>
                <div className="text-white text-[13px] font-semibold mt-0.5">{s.t}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/40">
          <WordmarkAuditIA className="text-white/70" />
          <div>© 2026 Deloitte · Uso interno</div>
        </div>
      </div>

      {/* Lado derecho: selector */}
      <div className="flex-1 flex items-center justify-center p-8 bg-deloitte-paper">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8">
            <Logo />
          </div>
          <div className="eyebrow">Ingresa a la demo</div>
          <h2 className="font-serif text-[26px] font-semibold mt-1 mb-1.5 text-deloitte-ink leading-tight">
            Selecciona tu perfil
          </h2>
          <p className="text-[13px] text-deloitte-mute mb-6">
            Cada perfil entra al mismo portal — los datos son los mismos pero la conversación con
            AuditIA se adapta al rol.
          </p>

          {pideClave && (
            <div className="mb-5">
              <label className="text-[11px] font-semibold text-deloitte-slate block mb-1.5">
                Clave de acceso
              </label>
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Clave compartida del equipo"
                className="w-full text-[13px] border border-deloitte-line rounded px-3 py-2 bg-white"
              />
            </div>
          )}

          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => entrar(u.id)}
                className="w-full text-left p-4 bg-white border border-deloitte-line rounded-md hover:border-deloitte-green hover:shadow-card transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-deloitte-ink text-white flex items-center justify-center font-semibold text-[13px] group-hover:bg-deloitte-green group-hover:text-deloitte-ink transition-colors">
                  {u.avatar}
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-semibold text-deloitte-ink">{u.name}</div>
                  <div className="text-[12px] text-deloitte-mute">{u.role}</div>
                </div>
                <div className="text-deloitte-mute group-hover:text-deloitte-green text-lg">→</div>
              </button>
            ))}
          </div>

          <div className="mt-6 text-[11px] text-deloitte-mute leading-relaxed border-t border-deloitte-line pt-4">
            Para la demo en vivo el moderador puede elegir cualquier perfil — esto solo afecta el
            badge en pantalla, no los datos. Los datos son los mismos para los tres espacios y han
            sido sintetizados para esta demo.
          </div>
        </div>
      </div>
    </div>
  );
}
