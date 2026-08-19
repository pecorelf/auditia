// Procesos AFP — los tres que el cliente declaró representativos.
// El eje de la vista es la CADENA: contacto → cuenta → giro, que solo aparece
// al cruzar los tres procesos.

import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { LeyendaSeveridad } from "../components/LeyendaSeveridad";
import { BRANDING } from "../config/branding";
import { AnalisisEnVivo } from "../components/AnalisisEnVivo";
import {
  afiliados, ejecutivos, solicitudes, pagos, tramites, cambiosContacto, detectarHallazgos,
} from "../data/procesosAFP";
import { CLP, num, fmtDate } from "../lib/format";
import { Icono, MarcaAnomalia } from "../components/Iconos";
import { RefPapel } from "../components/RefPapel";

type Proceso = "pagos" | "pension" | "contacto";

const PROCESOS: { id: Proceso; nombre: string; descripcion: string; icono: string }[] = [
  { id: "pagos",    nombre: "Pagos a clientes",       descripcion: "Duplicidad, movimientos inusuales, cambios de cuenta, pagos vs. solicitudes y autorización de giros", icono: "pagos" },
  { id: "pension",  nombre: "Trámites de pensión",     descripcion: "Cumplimiento de plazos, completitud de requisitos y cumplimiento normativo",                          icono: "tramites" },
  { id: "contacto", nombre: "Datos de contacto",       descripcion: "Datos compartidos, respaldo de autorización y origen de la modificación",                             icono: "cambiosDatos" },
];

export function EspacioAFP() {
  const [proceso, setProceso] = useState<Proceso>("pagos");
  const h = useMemo(() => detectarHallazgos(), []);

  const montoPagado = useMemo(() => pagos.reduce((a, p) => a + p.montoCLP, 0), []);
  const impactoCritico =
    h.duplicados.montoTotal + h.sinSolicitud.montoTotal + h.sinSegregacion.montoTotal + h.cadena.montoTotal;

  return (
    <>
      <Header
        eyebrow="Procesos críticos"
        title={BRANDING.firmName}
        subtitle="Los tres procesos que el cliente declaró representativos de su plan de auditoría, cruzados entre sí"
        meta={[
          { label: "Afiliados", value: num(afiliados.length) },
          { label: "Pagos", value: num(pagos.length) },
          { label: "Trámites", value: num(tramites.length) },
          { label: "Cambios de datos", value: num(cambiosContacto.length) },
          { label: "Monto pagado", value: CLP(montoPagado) },
        ]}
      />

      <div className="px-8 py-6 space-y-6">

        {/* ── LA CADENA — el hallazgo que justifica cruzar los tres ── */}
        <div className="border border-risk-high/40 rounded-xl overflow-hidden shadow-card">
          <div className="bg-risk-high text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11.5px] uppercase tracking-wider font-semibold opacity-80">
                  Hallazgo que ningún proceso detecta por separado
                </div>
                <div className="display-medium text-[19px] mt-1">
                  Cadena contacto → cuenta bancaria → giro, ejecutada por el mismo ejecutivo
                </div>
              </div>
              <div className="text-right">
                <div className="text-[26px] font-semibold tabular leading-none">{h.cadena.cantidad}</div>
                <div className="text-[11px] uppercase tracking-wider opacity-80">casos</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50/70 px-6 py-5">
            <p className="text-[13.5px] text-deloitte-slate leading-snug mb-4">
              Cada paso, por sí solo, es una transacción legítima que pasa todos los controles de su
              proceso. El patrón solo existe al cruzar los tres. Total involucrado:{" "}
              <strong className="text-risk-highTxt">{CLP(h.cadena.montoTotal)}</strong>.
            </p>

            {h.cadena.casos.slice(0, 2).map((c: any, i: number) => (
              <div key={i} className="bg-white border border-red-200 rounded p-3 mb-2">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-[13px]">
                    <span className="text-deloitte-mute">Afiliado:</span>{" "}
                    <strong className="text-deloitte-ink">{c.afiliado}</strong>
                    <span className="text-deloitte-mute"> · ejecutivo:</span>{" "}
                    <strong className="text-risk-highTxt">{c.ejecutivo}</strong>
                  </div>
                  <div className="text-[14px] font-semibold tabular text-risk-highTxt">{CLP(c.montoCLP)}</div>
                </div>

                <div className="flex items-stretch gap-1.5">
                  <PasoCadena n={1} titulo={c.paso1.que} fecha={c.paso1.fecha} nota={c.paso1.conRespaldo ? "con respaldo" : "sin respaldo de autorización"} alerta={!c.paso1.conRespaldo} />
                  <Flecha dias={c.paso2.diasDespues} />
                  <PasoCadena n={2} titulo={c.paso2.que} fecha={c.paso2.fecha} nota={c.paso2.conRespaldo ? "con respaldo" : "sin respaldo de autorización"} alerta={!c.paso2.conRespaldo} />
                  <Flecha dias={c.paso3.diasDespues} />
                  <PasoCadena n={3} titulo={c.paso3.que} fecha={c.paso3.fecha} nota={`autorizado por ${c.paso3.autorizadoPor}`} alerta />
                </div>
              </div>
            ))}

            {h.cadena.casos.length > 2 && (
              <div className="text-[12px] text-deloitte-mute mt-1">
                y {h.cadena.casos.length - 2} casos más con el mismo patrón — pregúntale a AuditIA por el detalle.
              </div>
            )}
          </div>
        </div>

        {/* Análisis en vivo */}
        <AnalisisEnVivo
          universo={pagos.length + tramites.length + cambiosContacto.length}
          muestraTradicional={60}
          fuentes={[
            { nombre: "Solicitudes_Giro.xlsx", filas: solicitudes.length, icono: "solicitudes" },
            { nombre: "Pagos_Ejecutados.xlsx", filas: pagos.length, icono: "pagos" },
            { nombre: "Tramites_Pension.pdf", filas: tramites.length, icono: "tramites" },
            { nombre: "Log_Cambios_Datos.xlsx", filas: cambiosContacto.length, icono: "cambiosDatos" },
            { nombre: "Maestro_Afiliados.xlsx", filas: afiliados.length, icono: "trabajadores" },
          ]}
          hallazgos={[
            { titulo: "Cadena contacto → cuenta → giro, mismo ejecutivo", severidad: "critica", cantidad: h.cadena.cantidad, montoCLP: h.cadena.montoTotal },
            { titulo: "Giro autorizado por quien cambió la cuenta bancaria", severidad: "critica", cantidad: h.sinSegregacion.cantidad, montoCLP: h.sinSegregacion.montoTotal },
            { titulo: "Pagos ejecutados sin solicitud registrada", severidad: "critica", cantidad: h.sinSolicitud.cantidad, montoCLP: h.sinSolicitud.montoTotal },
            { titulo: "Pagos duplicados al mismo afiliado", severidad: "critica", cantidad: h.duplicados.cantidad, montoCLP: h.duplicados.montoTotal },
            { titulo: "Expedientes de pensión resueltos sin documento obligatorio", severidad: "critica", cantidad: h.sinDocumento.cantidad },
            { titulo: "Cambio de cuenta bancaria días antes de un giro alto", severidad: "alta", cantidad: h.cuentaAntesDeGiro.cantidad, montoCLP: h.cuentaAntesDeGiro.montoTotal },
            { titulo: "Giros a colaboradores de la AFP", severidad: "alta", cantidad: h.aColaboradores.cantidad, montoCLP: h.aColaboradores.montoTotal },
            { titulo: "Trámites resueltos fuera del plazo normativo", severidad: "alta", cantidad: h.fueraPlazo.cantidad },
            { titulo: "Modificaciones de datos sin respaldo de autorización", severidad: "alta", cantidad: h.sinRespaldo.cantidad },
            { titulo: "Teléfono o email compartido entre afiliados", severidad: "alta", cantidad: h.contactoCompartido.cantidad },
            { titulo: "Concentración de modificaciones en un ejecutivo", severidad: "media", cantidad: h.concentracion.cantidad },
            { titulo: "Trámites reprocesados tres o más veces", severidad: "media", cantidad: h.reprocesados.cantidad },
            { titulo: "Montos muy sobre la mediana del tipo de giro", severidad: "media", cantidad: h.montosAtipicos.cantidad },
          ]}
        />

        {/* Selector de proceso */}
        <div>
          <div className="eyebrow mb-2">Hallazgos por proceso</div>
          <LeyendaSeveridad className="mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {PROCESOS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProceso(p.id)}
                className={`card p-3 text-left transition-all ${proceso === p.id ? "ring-2 ring-deloitte-green" : "hover:shadow-card"}`}
              >
                <Icono nombre={p.icono} size={20} className="text-deloitte-slate" />
                <div className="text-[13.5px] font-semibold mt-1 text-deloitte-ink">{p.nombre}</div>
                <div className="text-[12px] text-deloitte-mute mt-1 leading-snug">{p.descripcion}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hallazgos del proceso seleccionado */}
        <div className="grid grid-cols-2 gap-3">
          {proceso === "pagos" && (
            <>
              <Hallazgo codigo="PAG-01" sev="critica" titulo="Pagos duplicados al mismo afiliado" cantidad={h.duplicados.cantidad} unidad="pagos"
                desc={`Mismo afiliado, mismo tipo y mismo monto dentro de una semana. Total: ${CLP(h.duplicados.montoTotal)}.`}
                norma="Control de unicidad de pago por solicitud"
                reco="Bloqueo automático de un segundo pago con la misma firma dentro de 7 días, con liberación solo por excepción documentada. Recuperar los montos ya girados." />
              <Hallazgo codigo="PAG-02" sev="critica" titulo="Pagos ejecutados sin solicitud registrada" cantidad={h.sinSolicitud.cantidad} unidad="pagos"
                desc={`Giros sin ninguna solicitud asociada en el sistema. Total: ${CLP(h.sinSolicitud.montoTotal)}.`}
                norma="Trazabilidad solicitud–pago"
                reco="Ningún pago debería poder liquidarse sin solicitud vinculada. Revisar si son cargas manuales o un camino alternativo en el sistema, y quién tiene acceso a él." />
              <Hallazgo codigo="PAG-03" sev="critica" titulo="Quien cambió la cuenta autorizó el giro" cantidad={h.sinSegregacion.cantidad} unidad="casos"
                desc={`El mismo usuario registró el cambio de cuenta bancaria y autorizó el giro a esa cuenta. Total: ${CLP(h.sinSegregacion.montoTotal)}.`}
                norma="Segregación de funciones · mecanismo de autorización de giros"
                reco="Incompatibilidad dura en el sistema: quien modifica datos bancarios no puede autorizar pagos al mismo afiliado. Es el control que corta la cadena completa." />
              <Hallazgo codigo="PAG-04" sev="alta" titulo="Cambio de cuenta días antes de un giro alto" cantidad={h.cuentaAntesDeGiro.cantidad} unidad="casos"
                desc={`Cuenta bancaria modificada dentro de los 10 días previos a un giro sobre CLP 5M. Total: ${CLP(h.cuentaAntesDeGiro.montoTotal)}. No todos son fraude, pero todos deben explicarse.`}
                norma="Control de cambio de datos bancarios"
                reco="Período de enfriamiento entre el cambio de cuenta y un giro alto, más confirmación por un canal distinto al que originó el cambio." />
              <Hallazgo codigo="PAG-05" sev="alta" titulo="Giros a colaboradores de la AFP" cantidad={h.aColaboradores.cantidad} unidad="pagos"
                desc={`Pagos a afiliados que además son trabajadores de la administradora. Total: ${CLP(h.aColaboradores.montoTotal)}. Legítimos en principio, pero exigen control reforzado.`}
                norma="Política de conflicto de interés"
                reco="Marcar la condición de colaborador en el maestro y enrutar estos giros a una autorización independiente del área comercial." />
              <Hallazgo codigo="PAG-06" sev="media" titulo="Montos muy sobre la mediana del tipo de giro" cantidad={h.montosAtipicos.cantidad} unidad="pagos"
                desc="Giros que superan cinco veces la mediana de su propio tipo. No es irregularidad por sí sola: es la lista corta que conviene explicar."
                norma="Monitoreo de movimientos inusuales"
                reco="Umbral por tipo de beneficio con revisión de segunda línea sobre los casos que lo superen, en vez de muestreo aleatorio." />
            </>
          )}

          {proceso === "pension" && (
            <>
              <Hallazgo codigo="PEN-01" sev="critica" titulo="Expedientes resueltos sin documento obligatorio" cantidad={h.sinDocumento.cantidad} unidad="trámites"
                desc="Trámites aprobados con documentación incompleta según su propio tipo. Incluye dictámenes médicos y certificados de defunción faltantes."
                norma="Completitud de requisitos · normativa previsional"
                reco="Cierre de expediente bloqueado hasta que estén todos los documentos del tipo. Revisar los casos resueltos para regularizar antes de una fiscalización." />
              <Hallazgo codigo="PEN-02" sev="alta" titulo="Trámites fuera del plazo normativo" cantidad={h.fueraPlazo.cantidad} unidad="trámites"
                desc="Trámites resueltos superando el plazo definido para su tipo. Exposición directa ante la Superintendencia y fuente habitual de reclamos."
                norma="Cumplimiento de plazos · normativa previsional"
                reco="Alerta al 70% del plazo consumido, no al vencerlo. Analizar si el exceso se concentra en un tipo de trámite o en una sucursal: eso cambia la solución." />
              <Hallazgo codigo="PEN-03" sev="media" titulo="Trámites reprocesados tres o más veces" cantidad={h.reprocesados.cantidad} unidad="trámites"
                desc="Expedientes devueltos y reingresados repetidamente. Cada reproceso consume plazo y deteriora la experiencia del afiliado."
                norma="Eficiencia operacional del proceso"
                reco="Analizar la causa raíz del reproceso — suele ser un requisito mal solicitado en la primera atención, no un problema del afiliado." />
            </>
          )}

          {proceso === "contacto" && (
            <>
              <Hallazgo codigo="DAT-01" sev="alta" titulo="Teléfono o email compartido entre afiliados" cantidad={h.contactoCompartido.cantidad} unidad="datos"
                desc="Un mismo dato de contacto asociado a varios afiliados sin relación aparente ni misma sucursal. Puede ser familiar directo, o el punto de control de un tercero."
                norma="Integridad del maestro de afiliados"
                reco="Validar caso a caso. Control preventivo de unicidad con excepción documentada, y alerta cuando un dato nuevo ya existe en otro afiliado." />
              <Hallazgo codigo="DAT-02" sev="alta" titulo="Modificaciones sin respaldo de autorización" cantidad={h.sinRespaldo.cantidad} unidad="cambios"
                desc="Cambios de datos ejecutados sin respaldo del consentimiento del afiliado. Es el control que habilita el resto de la cadena."
                norma="Respaldo de autorización para modificaciones"
                reco="Ningún cambio debería persistir sin respaldo adjunto. Priorizar los que afectan cuenta bancaria: ahí el riesgo es económico inmediato." />
              <Hallazgo codigo="DAT-03" sev="media" titulo="Concentración de modificaciones en un ejecutivo" cantidad={h.concentracion.cantidad} unidad="ejecutivos"
                desc="Un ejecutivo con un volumen de modificaciones muy sobre la media del equipo. Puede ser carga de trabajo real o acceso mal dimensionado."
                norma="Identificación del origen de la modificación"
                reco="Revisar el perfil de acceso y contrastar contra la carga real de atención. El origen de cada cambio debe quedar trazado por usuario, canal y respaldo." />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function PasoCadena({ n, titulo, fecha, nota, alerta }: {
  n: number; titulo: string; fecha: string; nota: string; alerta?: boolean;
}) {
  return (
    <div className={`flex-1 border rounded px-2.5 py-2 ${alerta ? "border-red-300 bg-red-50/60" : "border-deloitte-line bg-white"}`}>
      <div className="flex items-center gap-1.5">
        <span className={`w-4 h-4 rounded-full text-[11px] font-semibold flex items-center justify-center ${alerta ? "bg-risk-high text-white" : "bg-deloitte-paper text-deloitte-slate"}`}>{n}</span>
        <span className="text-[11.5px] tabular text-deloitte-mute">{fmtDate(fecha)}</span>
      </div>
      <div className="text-[12.5px] font-semibold text-deloitte-ink mt-1 leading-tight">{titulo}</div>
      <div className={`text-[11.5px] mt-0.5 leading-tight ${alerta ? "text-risk-highTxt font-medium" : "text-deloitte-mute"}`}>{nota}</div>
    </div>
  );
}

function Flecha({ dias }: { dias: number }) {
  return (
    <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
      <div className="text-[15px] text-deloitte-mute leading-none">→</div>
      <div className="text-[11px] text-deloitte-mute tabular mt-0.5 whitespace-nowrap">
        {dias === 1 ? "1 día" : `${dias} días`}
      </div>
    </div>
  );
}

function Hallazgo({ codigo: refCodigo, sev, titulo, cantidad, unidad, desc, norma, reco }: {
  codigo: string;
  sev: "critica" | "alta" | "media";
  titulo: string; cantidad: number; unidad: string; desc: string; norma: string; reco: string;
}) {
  const st = {
    critica: { bar: "bg-risk-high", bg: "bg-red-50", text: "text-risk-highTxt", label: "Crítica" },
    alta: { bar: "bg-risk-med", bg: "bg-amber-50", text: "text-risk-medTxt", label: "Alta" },
    media: { bar: "bg-deloitte-green", bg: "bg-deloitte-paper", text: "text-deloitte-greenTxt", label: "Media" },
  }[sev];

  return (
    <div className={`relative border border-deloitte-line rounded-xl overflow-hidden ${st.bg}`}>
      <div className={`acento-severidad ${st.bar}`} />
      <div className="pl-4 pr-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <RefPapel codigo={refCodigo} />
              <span className={`text-[11.5px] uppercase tracking-wider font-medium ${st.text}`}>{st.label}</span>
            </div>
            <div className="text-[14px] font-semibold mt-0.5 text-deloitte-ink leading-tight">{titulo}</div>
            <p className="text-[12.5px] text-deloitte-slate mt-1 leading-snug">{desc}</p>
            <div className="text-[11.5px] text-deloitte-mute italic mt-1.5">
              <span className="font-semibold not-italic text-deloitte-slate">Referencia:</span> {norma}
            </div>
            <div className="mt-2 pt-2 border-t border-deloitte-line/60 flex items-start gap-1.5">
              <Icono nombre="recomendacion" size={14} className="text-deloitte-greenTxt flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-deloitte-greenTxt">Recomendación de AuditIA</div>
                <p className="text-[12px] text-deloitte-slate leading-snug mt-0.5">{reco}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`cifra text-[26px] font-medium ${st.text} leading-none`}>{cantidad}</div>
            <div className="text-[11px] text-deloitte-mute uppercase tracking-wider">{unidad}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
