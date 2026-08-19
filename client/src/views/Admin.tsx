// Admin — configuración de la demo.
//
// Cambia el pack de industria, el nombre del cliente y el logo. Como los datasets
// se generan al cargar los módulos, aplicar la configuración recarga la app.

import { useState } from "react";
import { Header } from "../components/Header";
import { PACKS, getPackId, setPackId, getOverrides, setOverrides } from "../packs";
import { SeccionProtegida } from "../components/SeccionProtegida";

export function Admin() {
  const [packId, setPack] = useState(getPackId());
  const ovr = getOverrides();
  const [cliente, setCliente] = useState(ovr.cliente || "");
  const [logo, setLogo] = useState<string | undefined>(ovr.logoDataUrl);
  const [error, setError] = useState<string | null>(null);

  const packSel = PACKS.find((p) => p.id === packId) || PACKS[0];
  const sucio =
    packId !== getPackId() ||
    (cliente || "") !== (ovr.cliente || "") ||
    logo !== ovr.logoDataUrl;

  const onLogo = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (PNG, JPG o SVG).");
      return;
    }
    if (file.size > 400_000) {
      setError("La imagen pesa más de 400 KB. Usa una versión más liviana.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.onerror = () => setError("No se pudo leer el archivo.");
    reader.readAsDataURL(file);
  };

  const aplicar = () => {
    setPackId(packId);
    setOverrides({ cliente: cliente.trim() || undefined, logoDataUrl: logo });
    window.location.reload();
  };

  const restaurar = () => {
    setCliente("");
    setLogo(undefined);
    setError(null);
  };

  return (
    <>
      <Header
        eyebrow="Configuración"
        title="Admin"
        subtitle="Selecciona la industria y ajusta la marca del cliente. Los datos de los cinco espacios se regeneran con el vocabulario del pack elegido."
        meta={[
          { label: "Packs disponibles", value: String(PACKS.length) },
          { label: "Pack activo", value: getPackId() },
        ]}
      />

      <div className="px-8 py-6 max-w-4xl">
        <SeccionProtegida
          id="admin"
          titulo="Configuración protegida"
          descripcion="Acá se cambia la industria, el nombre del cliente y el logo. Un cambio en medio de una demo regenera todos los datos, así que requiere clave."
        >
        <div className="space-y-6">
        {/* Industria */}
        <div className="card p-5">
          <div className="eyebrow">Industria</div>
          <p className="text-[13px] text-deloitte-mute mt-1 mb-3">
            Define el vocabulario completo de la demo: cargos, proveedores, categorías de gasto y los
            casos plantados. El motor de detección es el mismo para todas.
          </p>
          <div className="space-y-2">
            {PACKS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPack(p.id)}
                className={`w-full text-left border rounded-md px-4 py-3 transition-all ${
                  packId === p.id
                    ? "border-deloitte-green ring-1 ring-deloitte-green bg-deloitte-paper"
                    : "border-deloitte-line hover:border-deloitte-green/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-semibold text-deloitte-ink">{p.industria}</div>
                    <div className="text-[12px] text-deloitte-mute mt-0.5">
                      Cliente de referencia: {p.cliente}
                    </div>
                  </div>
                  {packId === p.id && (
                    <span className="pill bg-deloitte-green/15 text-deloitte-greenTxt">Seleccionado</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Marca */}
        <div className="card p-5">
          <div className="eyebrow">Marca del cliente</div>
          <p className="text-[13px] text-deloitte-mute mt-1 mb-4">
            Opcional. Permite mostrar el pack de {packSel.industria.split(" · ")[0].toLowerCase()} con
            el nombre y el logo del prospecto, sin crear un pack nuevo.
          </p>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[12px] font-semibold text-deloitte-slate block mb-1.5">
                Nombre del cliente
              </label>
              <input
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder={packSel.cliente}
                className="w-full text-[14px] border border-deloitte-line rounded px-3 py-2 bg-white"
              />
              <div className="text-[12px] text-deloitte-mute mt-1.5">
                Vacío = usa {packSel.cliente}
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-deloitte-slate block mb-1.5">
                Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-24 h-12 border border-deloitte-line rounded bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logo ? (
                    <img src={logo} alt="Logo" className="max-h-10 max-w-[88px] object-contain" />
                  ) : (
                    <span className="text-[11.5px] text-deloitte-mute">sin logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onLogo(e.target.files?.[0])}
                    className="block w-full text-[12px] file:mr-2 file:py-1.5 file:px-3 file:rounded file:border file:border-deloitte-line file:bg-white file:text-[12px] file:cursor-pointer"
                  />
                  {logo && (
                    <button
                      onClick={() => setLogo(undefined)}
                      className="text-[12px] text-deloitte-mute hover:text-risk-highTxt mt-1"
                    >
                      Quitar logo
                    </button>
                  )}
                </div>
              </div>
              <div className="text-[12px] text-deloitte-mute mt-1.5">PNG o SVG, hasta 400 KB</div>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-[12.5px] text-risk-highTxt bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <button
            onClick={aplicar}
            disabled={!sucio}
            className="text-[13.5px] font-semibold px-5 py-2.5 rounded bg-deloitte-green text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-deloitte-greenDark transition-colors"
          >
            Aplicar y recargar
          </button>
          <button
            onClick={restaurar}
            className="text-[13.5px] px-4 py-2.5 rounded border border-deloitte-line text-deloitte-slate hover:border-deloitte-mute"
          >
            Restaurar marca del pack
          </button>
          {sucio && (
            <span className="text-[12.5px] text-risk-medTxt">Hay cambios sin aplicar</span>
          )}
        </div>

        <div className="text-[12px] text-deloitte-mute leading-relaxed border-t border-deloitte-line pt-4">
          La configuración se guarda en este navegador. Al aplicar, la app se recarga para regenerar
          los datasets con el vocabulario del pack elegido.
        </div>
        </div>
        </SeccionProtegida>
      </div>
    </>
  );
}
