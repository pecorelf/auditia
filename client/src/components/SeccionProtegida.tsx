// Candado de sección.
//
// Envuelve la configuración para que nadie entre por accidente o por curiosidad
// en medio de una demo: cambiar de industria ahí regenera todos los datos.
// Se desbloquea una vez por pestaña del navegador.
//
// ALCANCE REAL: esto no es seguridad. La clave viaja en el código del frontend
// y es legible por quien abra las herramientas de desarrollo. Sirve contra el
// clic accidental, no contra alguien que quiera entrar. No usar acá una clave
// que se ocupe en otro lado.

import { useState, type ReactNode } from "react";
import { Icono } from "./Iconos";

/** Clave de la sección. Se puede sobreescribir con VITE_CLAVE_ADMIN en Vercel. */
const CLAVE = (import.meta as any).env?.VITE_CLAVE_ADMIN || "Paula-2026";

// sessionStorage, no localStorage: al cerrar la pestaña se vuelve a bloquear.
const marca = (id: string) => `auditia.desbloqueo.${id}`;

const estaDesbloqueado = (id: string) => {
  try { return sessionStorage.getItem(marca(id)) === "1"; } catch { return false; }
};

type Props = {
  id: string;
  titulo: string;
  descripcion: string;
  children: ReactNode;
};

export function SeccionProtegida({ id, titulo, descripcion, children }: Props) {
  const [abierta, setAbierta] = useState(() => estaDesbloqueado(id));
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  const intentar = () => {
    if (clave.trim() === CLAVE) {
      try { sessionStorage.setItem(marca(id), "1"); } catch { /* sin persistencia */ }
      setAbierta(true);
      setError(false);
      setClave("");
    } else {
      setError(true);
    }
  };

  const bloquear = () => {
    try { sessionStorage.removeItem(marca(id)); } catch { /* sin persistencia */ }
    setAbierta(false);
  };

  if (abierta) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-deloitte-greenTxt">
            <Icono nombre="candadoAbierto" size={13} />
            Configuración desbloqueada
          </span>
          <button
            onClick={bloquear}
            className="text-[12px] text-deloitte-mute hover:text-deloitte-ink underline underline-offset-2"
          >
            Volver a bloquear
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="card p-8 max-w-md">
      <div className="w-10 h-10 rounded-full bg-deloitte-paper flex items-center justify-center mb-4">
        <Icono nombre="candado" size={18} className="text-deloitte-slate" />
      </div>

      <h2 className="display-medium text-[20px] text-deloitte-ink">{titulo}</h2>
      <p className="text-[13px] text-deloitte-mute mt-1.5 leading-relaxed font-light">{descripcion}</p>

      <label htmlFor={`clave-${id}`} className="block text-[12px] font-medium text-deloitte-slate mt-5 mb-1.5">
        Clave
      </label>
      <input
        id={`clave-${id}`}
        type="password"
        value={clave}
        autoComplete="off"
        onChange={(e) => { setClave(e.target.value); setError(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") intentar(); }}
        className={`w-full text-[14px] border rounded-lg px-3 py-2.5 bg-white ${
          error ? "border-risk-high" : "border-deloitte-line"
        }`}
      />

      {error && (
        <div role="alert" className="text-[12.5px] text-risk-highTxt mt-2">
          La clave no es correcta.
        </div>
      )}

      <button
        onClick={intentar}
        disabled={!clave.trim()}
        className="mt-4 w-full text-[13px] font-medium px-5 py-2.5 rounded-lg bg-deloitte-ink text-white
          disabled:opacity-40 disabled:cursor-not-allowed hover:bg-deloitte-slate transition-colors"
      >
        Desbloquear
      </button>

      <p className="text-[11.5px] text-deloitte-mute mt-4 leading-relaxed">
        El desbloqueo dura mientras la pestaña esté abierta.
      </p>
    </div>
  );
}
