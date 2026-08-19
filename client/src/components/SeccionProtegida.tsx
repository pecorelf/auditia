// Candado de sección.
//
// Envuelve cualquier sección que solo deba abrirse con la clave de administrador.
// Se desbloquea una vez por pestaña del navegador: al cerrarla vuelve a pedirla.
//
// ADVERTENCIA HONESTA SOBRE EL ALCANCE:
// Esto NO es seguridad. La clave viaja en el código del frontend y cualquiera
// que abra las herramientas de desarrollo del navegador puede leerla. Sirve para
// lo que sirve: evitar que alguien entre por accidente o por curiosidad a una
// sección sensible mientras se está presentando. Si en algún momento hay algo
// que de verdad haya que proteger, tiene que vivir detrás del backend.

import { useState, type ReactNode } from "react";
import { Icono } from "./Iconos";

/** Clave de administrador. Se puede sobreescribir por variable de entorno. */
const CLAVE = (import.meta as any).env?.VITE_CLAVE_ADMIN || "lady-focaccia";

// sessionStorage, no localStorage: al cerrar la pestaña se vuelve a bloquear.
const marcaDesbloqueo = (id: string) => `auditia.desbloqueo.${id}`;

const estaDesbloqueado = (id: string) => {
  try { return sessionStorage.getItem(marcaDesbloqueo(id)) === "1"; } catch { return false; }
};

type Props = {
  /** Identificador de la sección. Cada una se desbloquea por separado. */
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
      try { sessionStorage.setItem(marcaDesbloqueo(id), "1"); } catch { /* sin persistencia */ }
      setAbierta(true);
      setError(false);
      setClave("");
    } else {
      setError(true);
    }
  };

  const bloquear = () => {
    try { sessionStorage.removeItem(marcaDesbloqueo(id)); } catch { /* sin persistencia */ }
    setAbierta(false);
  };

  if (abierta) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] text-deloitte-greenTxt">
            <Icono nombre="ok" size={13} strokeWidth={2.5} />
            Sección desbloqueada
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
        Clave de administrador
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
