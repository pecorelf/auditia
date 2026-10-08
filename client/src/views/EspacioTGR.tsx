// Procesos Críticos de Tesorería — los tres de criticidad muy alta.
//
// Dos ejes visuales, en este orden:
//   1. La CADENA — el hallazgo que ningún proceso detecta por separado
//   2. La PRESCRIPCIÓN — el de mayor impacto financiero individual, y el único
//      con una parte todavía recuperable. Por eso lleva reloj propio.

import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { BRANDING } from "../config/branding";
import { AnalisisEnVivo } from "../components/AnalisisEnVivo";
import { LeyendaSeveridad } from "../components/LeyendaSeveridad";
import { RefPapel } from "../components/RefPapel";
import { Icono } from "../components/Iconos";
import {
  contribuyentes, funcionarios, pagos, lotes, deudas, movimientos,
  detectarHallazgos, PERIODO,
} from "../data/procesosTGR";
import { CLP, num, fmtDate } from "../lib/format";

type Proceso = "recaudacion" | "cobranza" | "custodia";

const PROCESOS: { id: Proceso; nombre: string; descripcion: string; icono: string }[] = [
  { id: "recaudacion", nombre: "Recaudación de ingresos fiscales", descripcion: "Conciliación bancaria, recaudaciones no registradas e integración con bancos recaudadores", icono: "recaudacion" },
  { id: "cobranza",    nombre: "Cobranza administrativa y judicial", descripcion: "Prescripción, condonaciones, embargos y cobros improcedentes", icono: "cobranza" },
  { id: "custodia",    nombre: "Custodia de fondos del Tesoro",      descripcion: "Facultades de egreso, segregación de funciones y control de accesos", icono: "custodia" },
];

export function EspacioTGR() {
  const [proceso, setProceso] = useState<Proceso>("recaudacion");
  const h = useMemo(() => detectarHallazgos(), []);

  const recaudado = useMemo(
    () => pagos.filter((p) => p.registradoEnSistema).reduce((a, p) => a + p.montoCLP, 0), []);
  const carteraMorosa = useMemo(
    () => deudas.filter((d) => d.etapa === "Cobranza administrativa" || d.etapa === "Cobranza judicial")
      .reduce((a, d) => a + d.montoOriginalCLP + d.interesesCLP + d.multasCLP, 0), []);

  return (
    <>
      <Header
        eyebrow="Procesos críticos de Tesorería"
        title={BRANDING.firmName}
        subtitle="Los tres procesos de criticidad muy alta del mapa institucional, auditados en conjunto en vez de por separado"
        meta={[
          { label: "Contribuyentes", value: num(contribuyentes.length) },
          { label: "Pagos recaudados", value: num(pagos.length) },
          { label: "Cartera en cobranza", value: CLP(carteraMorosa) },
          { label: "Movimientos del Tesoro", value: num(movimientos.length) },
          { label: "Período", value: PERIODO.split(" a ")[1] },
        ]}
      />

      <div className="px-8 py-6 space-y-6">

        {/* Aviso de naturaleza de los datos — va primero, antes que cualquier cifra */}
        <div className="flex items-start gap-2.5 border border-deloitte-line rounded-lg bg-deloitte-paper px-4 py-3">
          <Icono nombre="alerta" size={15} className="text-deloitte-mute flex-shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-deloitte-slate leading-relaxed">
            Todos los datos de esta pantalla son <strong>sintéticos</strong>. Ningún RUT, nombre o folio
            corresponde a una persona o expediente real. Lo que es real son los procesos y los patrones
            de riesgo asociados a cada uno.
          </p>
        </div>

        {/* ── LA CADENA ── */}
        <div className="border border-risk-high/40 rounded-xl overflow-hidden shadow-card">
          <div className="bg-risk-high text-white px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-medium opacity-80">
                  Hallazgo que ningún proceso detecta por separado
                </div>
                <div className="display-medium text-[19px] mt-1">
                  Recaudado en banco, nunca ingresado al Tesoro, y la cobranza cerrada igual
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="cifra text-[30px] font-medium leading-none">{h.cadena.cantidad}</div>
                <div className="text-[11px] uppercase tracking-wider opacity-80">casos</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50/70 px-6 py-5">
            <p className="text-[12.5px] text-deloitte-slate leading-snug mb-4">
              El pago entra por caja bancaria y queda registrado. La conciliación nunca cuadra y el
              monto no llega a la Cuenta Única Fiscal. Días después se cierra la cobranza y se alza el
              embargo — lo hace el mismo funcionario que registró el pago. Cada paso, aislado, es una
              transacción legítima que pasa el control de su propio proceso. Total:{" "}
              <strong className="text-risk-highTxt">{CLP(h.cadena.montoTotal)}</strong>.
            </p>

            {h.cadena.casos.slice(0, 2).map((c: any, i: number) => (
              <div key={i} className="bg-white border border-red-200 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="text-[12.5px]">
                    <span className="text-deloitte-mute">Contribuyente:</span>{" "}
                    <strong className="text-deloitte-ink">{c.contribuyente}</strong>
                    <span className="cifra text-[11.5px] text-deloitte-mute ml-1.5">{c.rut}</span>
                    <span className="text-deloitte-mute"> · funcionario:</span>{" "}
                    <strong className="text-risk-highTxt">{c.funcionario}</strong>
                    <span className="text-deloitte-mute"> ({c.cargo}, {c.tesoreria})</span>
                  </div>
                  <div className="cifra text-[14px] font-medium text-risk-highTxt flex-shrink-0">{CLP(c.montoCLP)}</div>
                </div>

                <div className="flex items-stretch gap-1.5">
                  <Paso n={1} titulo={c.paso1.que} fecha={c.paso1.fecha} nota={c.paso1.detalle} alerta={false} />
                  <Flecha dias={c.paso2.diasDespues} />
                  <Paso n={2} titulo={c.paso2.que} fecha={c.paso2.fecha} nota={c.paso2.detalle} alerta />
                  <Flecha dias={c.paso3.diasDespues} />
                  <Paso n={3} titulo={c.paso3.que} fecha={c.paso3.fecha} nota={c.paso3.detalle} alerta />
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

        {/* ── PRESCRIPCIÓN — el reloj ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Ya perdido por inacción</div>
                <div className="display text-[30px] text-risk-highTxt mt-1.5">{CLP(h.prescritas.montoTotal)}</div>
                <div className="text-[12.5px] text-deloitte-slate mt-1.5 leading-snug">
                  {h.prescritas.cantidad} deudas prescritas sin ninguna gestión registrada. Ya no son
                  recuperables: el plazo legal se cumplió.
                </div>
              </div>
              <Icono nombre="prescripcion" size={22} className="text-risk-highTxt flex-shrink-0 mt-1" />
            </div>
          </div>

          <div className="card p-5 border-risk-med/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Todavía se puede salvar</div>
                <div className="display text-[30px] text-risk-medTxt mt-1.5">{CLP(h.porPrescribir.montoTotal)}</div>
                <div className="text-[12.5px] text-deloitte-slate mt-1.5 leading-snug">
                  {h.porPrescribir.cantidad} deudas prescriben dentro de 90 días y no tienen gestión.
                  {h.porPrescribir.casos[0] && (
                    <> La más urgente vence en <strong>{h.porPrescribir.casos[0].diasRestantes} días</strong>.</>
                  )}
                </div>
              </div>
              <Icono nombre="prescripcion" size={22} className="text-risk-medTxt flex-shrink-0 mt-1" />
            </div>
          </div>
        </div>

        {/* Análisis en vivo */}
        <AnalisisEnVivo
          universo={pagos.length + deudas.length + movimientos.length}
          muestraTradicional={80}
          fuentes={[
            { nombre: "Lotes_Bancarios.xlsx", filas: lotes.length, icono: "recaudacion" },
            { nombre: "Pagos_Recaudados.xlsx", filas: pagos.length, icono: "pagos" },
            { nombre: "Cartera_Cobranza.xlsx", filas: deudas.length, icono: "cobranza" },
            { nombre: "Movimientos_Tesoro.xlsx", filas: movimientos.length, icono: "custodia" },
            { nombre: "Accesos_Sistemas.csv", filas: funcionarios.length, icono: "accesos" },
          ]}
          hallazgos={[
            { titulo: "Cadena recaudación → Tesoro → cobranza, mismo funcionario", severidad: "critica", cantidad: h.cadena.cantidad, montoCLP: h.cadena.montoTotal },
            { titulo: "Deudas prescritas sin gestión registrada", severidad: "critica", cantidad: h.prescritas.cantidad, montoCLP: h.prescritas.montoTotal },
            { titulo: "Pagos recaudados sin registro en el sistema", severidad: "critica", cantidad: h.sinRegistro.cantidad, montoCLP: h.sinRegistro.montoTotal },
            { titulo: "Condonaciones sobre la facultad del funcionario", severidad: "critica", cantidad: h.condonacionesSobreFacultad.cantidad, montoCLP: h.condonacionesSobreFacultad.montoTotal },
            { titulo: "Embargos alzados sin pago íntegro", severidad: "critica", cantidad: h.alzadosSinPago.cantidad, montoCLP: h.alzadosSinPago.montoTotal },
            { titulo: "Egresos sobre la facultad de quien los autorizó", severidad: "critica", cantidad: h.egresosSobreFacultad.cantidad, montoCLP: h.egresosSobreFacultad.montoTotal },
            { titulo: "Traspasos sobre el umbral sin segunda firma", severidad: "critica", cantidad: h.sinSegundaFirma.cantidad, montoCLP: h.sinSegundaFirma.montoTotal },
            { titulo: "Deudas que prescriben dentro de 90 días", severidad: "alta", cantidad: h.porPrescribir.cantidad, montoCLP: h.porPrescribir.montoTotal },
            { titulo: "Diferencias de conciliación sin resolver", severidad: "alta", cantidad: h.conciliacionAbierta.cantidad, montoCLP: h.conciliacionAbierta.montoTotal },
            { titulo: "Lotes bancarios que nunca ingresaron", severidad: "alta", cantidad: h.lotesNoIngresados.cantidad, montoCLP: h.lotesNoIngresados.montoTotal },
            { titulo: "Reversas de pago sin respaldo", severidad: "alta", cantidad: h.reversasSinRespaldo.cantidad, montoCLP: h.reversasSinRespaldo.montoTotal },
            { titulo: "Cobros a contribuyentes con deuda extinguida", severidad: "alta", cantidad: h.cobrosImprocedentes.cantidad, montoCLP: h.cobrosImprocedentes.montoTotal },
            { titulo: "Accesos vigentes de funcionarios desvinculados", severidad: "alta", cantidad: h.accesosVigentesDesvinculados.cantidad },
            { titulo: "Descuadres entre saldo contable y bancario", severidad: "alta", cantidad: h.descuadres.cantidad, montoCLP: h.descuadres.montoTotal },
            { titulo: "Juicios con plazo procesal vencido", severidad: "media", cantidad: h.plazoVencido.cantidad, montoCLP: h.plazoVencido.montoTotal },
            { titulo: "Devoluciones duplicadas al mismo contribuyente", severidad: "media", cantidad: h.devolucionesDuplicadas.cantidad, montoCLP: h.devolucionesDuplicadas.montoTotal },
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
                className={`card p-3 text-left transition-all ${proceso === p.id ? "ring-2 ring-deloitte-green" : "hover:shadow-cardHover"}`}
              >
                <Icono nombre={p.icono} size={20} className="text-deloitte-slate" />
                <div className="text-[13px] font-medium mt-1 text-deloitte-ink leading-tight">{p.nombre}</div>
                <div className="text-[11.5px] text-deloitte-mute mt-1 leading-snug">{p.descripcion}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hallazgos del proceso */}
        <div className="grid grid-cols-2 gap-3">
          {proceso === "recaudacion" && (
            <>
              <Hallazgo codigo="REC-01" sev="critica" titulo="Pagos recaudados en banco sin registro en el sistema" cantidad={h.sinRegistro.cantidad} unidad="pagos"
                desc={`El banco informó el pago, el contribuyente tiene su comprobante, y en el sistema de ingresos no existe. Total: ${CLP(h.sinRegistro.montoTotal)}.`}
                norma="Integridad de la recaudación · conciliación diaria"
                reco="Cruce automático diario de la cartola bancaria contra el sistema de ingresos, con alerta el mismo día en vez de al cierre de mes. Cada caso detectado debe tener responsable asignado y plazo." />
              <Hallazgo codigo="REC-02" sev="alta" titulo="Diferencias de conciliación sin resolver más de 30 días" cantidad={h.conciliacionAbierta.cantidad} unidad="lotes"
                desc={`Lotes bancarios cuya diferencia sigue abierta pasados 30 días. Diferencia acumulada: ${CLP(h.conciliacionAbierta.montoTotal)}.`}
                norma="Conciliación bancaria · control de ingresos fiscales"
                reco="Plazo máximo de resolución con escalamiento automático al Tesorero Regional. Una diferencia que lleva meses abierta dejó de ser un error de registro." />
              <Hallazgo codigo="REC-03" sev="alta" titulo="Lotes informados por el banco que nunca ingresaron" cantidad={h.lotesNoIngresados.cantidad} unidad="lotes"
                desc={`Lotes completos que el banco recaudador informó y que no tienen contrapartida de ingreso. Total: ${CLP(h.lotesNoIngresados.montoTotal)}.`}
                norma="Integración con bancos y organismos recaudadores"
                reco="Acuse de recepción por lote y alerta cuando un lote informado no tenga ingreso dentro de 48 horas. Revisar con el banco si es falla de integración o de transferencia." />
              <Hallazgo codigo="REC-04" sev="alta" titulo="Reversas de pago sin respaldo documentado" cantidad={h.reversasSinRespaldo.cantidad} unidad="reversas"
                desc={`Anulaciones de pago sin documento de respaldo asociado. Total: ${CLP(h.reversasSinRespaldo.montoTotal)}. Una reversa sin respaldo es indistinguible de una apropiación.`}
                norma="Control de anulaciones y reversas"
                reco="Bloquear la reversa sin respaldo adjunto y exigir autorización de un segundo funcionario sobre un umbral. Revisar las ya ejecutadas con foco en quién las registró." />
              <Hallazgo codigo="REC-05" sev="media" titulo="Devoluciones duplicadas al mismo contribuyente" cantidad={h.devolucionesDuplicadas.cantidad} unidad="casos"
                desc={`Mismo contribuyente, mismo monto, dentro de pocos días. Total: ${CLP(h.devolucionesDuplicadas.montoTotal)}.`}
                norma="Unicidad de la devolución por folio"
                reco="Regla de unicidad por contribuyente, monto y ventana de días en el motor de devoluciones, con liberación solo por excepción documentada." />
            </>
          )}

          {proceso === "cobranza" && (
            <>
              <Hallazgo codigo="COB-01" sev="critica" titulo="Deudas prescritas sin gestión registrada" cantidad={h.prescritas.cantidad} unidad="deudas"
                desc={`Deudas cuyo plazo legal se cumplió sin ninguna gestión de cobro en el expediente. ${CLP(h.prescritas.montoTotal)} que el Fisco ya no puede recuperar.`}
                norma="Prescripción de la acción de cobro"
                reco="Este es un hallazgo de responsabilidad, no de proceso: hay que determinar por qué quedaron sin gestión. Hacia adelante, el control está en el hallazgo siguiente." />
              <Hallazgo codigo="COB-02" sev="alta" titulo="Deudas que prescriben dentro de 90 días sin gestión" cantidad={h.porPrescribir.cantidad} unidad="deudas"
                desc={`${CLP(h.porPrescribir.montoTotal)} todavía recuperables si se actúa ahora. Es el único hallazgo de esta pantalla donde la acción cambia el resultado.`}
                norma="Gestión oportuna de la cartera morosa"
                reco="Alerta a los 180 días antes del vencimiento, no a los 90, con asignación nominativa y seguimiento semanal. Priorizar por monto y por días restantes." />
              <Hallazgo codigo="COB-03" sev="critica" titulo="Condonaciones sobre la facultad del funcionario" cantidad={h.condonacionesSobreFacultad.cantidad} unidad="casos"
                desc={`Condonaciones de intereses y multas autorizadas por encima del tope de quien las firmó. Exceso sobre facultad: ${CLP(h.condonacionesSobreFacultad.montoTotal)}.`}
                norma="Matriz de facultades de condonación"
                reco="Validación dura del tope en el sistema al momento de registrar, no en revisión posterior. Revisar los casos ya otorgados y su fundamento." />
              <Hallazgo codigo="COB-04" sev="critica" titulo="Embargos alzados sin pago íntegro registrado" cantidad={h.alzadosSinPago.cantidad} unidad="casos"
                desc={`Medidas cautelares levantadas con saldo pendiente. Saldo liberado sin cobrar: ${CLP(h.alzadosSinPago.montoTotal)}.`}
                norma="Alzamiento de medidas cautelares"
                reco="Condicionar el alzamiento a la verificación del pago íntegro en el sistema de ingresos, no a la constancia manual del funcionario." />
              <Hallazgo codigo="COB-05" sev="alta" titulo="Cobros a contribuyentes con deuda extinguida" cantidad={h.cobrosImprocedentes.cantidad} unidad="casos"
                desc={`Gestiones de cobro sobre folios ya extinguidos. ${CLP(h.cobrosImprocedentes.montoTotal)} cobrados indebidamente. Es la vía directa a una demanda contra el Fisco.`}
                norma="Procedencia del cobro · debido proceso"
                reco="Validación del estado del folio antes de emitir cualquier gestión de cobro. Contactar a los contribuyentes afectados antes de que lo hagan ellos." />
              <Hallazgo codigo="COB-06" sev="media" titulo="Juicios con plazo procesal vencido" cantidad={h.plazoVencido.cantidad} unidad="causas"
                desc={`Causas en cobranza judicial con el plazo procesal cumplido. Monto involucrado: ${CLP(h.plazoVencido.montoTotal)}.`}
                norma="Seguimiento de plazos procesales"
                reco="Tablero de plazos por abogado con alerta anticipada. Analizar si la concentración está en una tesorería o en un abogado: eso cambia la solución." />
            </>
          )}

          {proceso === "custodia" && (
            <>
              <Hallazgo codigo="CUS-01" sev="critica" titulo="Egresos sobre la facultad de quien los autorizó" cantidad={h.egresosSobreFacultad.cantidad} unidad="egresos"
                desc={`Salidas de fondos del Tesoro autorizadas por encima del tope del funcionario. Total: ${CLP(h.egresosSobreFacultad.montoTotal)}.`}
                norma="Matriz de facultades de egreso"
                reco="Bloqueo en el sistema al superar el tope, con escalamiento obligatorio. Revisar cada caso ejecutado: un egreso fuera de facultad es un pago sin autorización válida." />
              <Hallazgo codigo="CUS-02" sev="critica" titulo="Traspasos sobre el umbral sin segunda firma" cantidad={h.sinSegundaFirma.cantidad} unidad="movimientos"
                desc={`Movimientos entre cuentas fiscales sobre el umbral de doble autorización, ejecutados con una sola firma. Total: ${CLP(h.sinSegundaFirma.montoTotal)}.`}
                norma="Segregación de funciones · doble autorización"
                reco="Incompatibilidad dura: ningún movimiento sobre el umbral se ejecuta sin la segunda firma registrada. Es el control de segregación más barato y el que más se salta." />
              <Hallazgo codigo="CUS-03" sev="alta" titulo="Accesos vigentes de funcionarios desvinculados" cantidad={h.accesosVigentesDesvinculados.cantidad} unidad="accesos"
                desc="Credenciales activas en sistemas de recaudación, cobranza y tesorería de personas que ya no trabajan en la institución. Algunas registran uso posterior a la desvinculación."
                norma="Control de accesos lógicos"
                reco="Revocación automática gatillada por la baja en la nómina, no por aviso manual. Revisar los accesos con uso posterior a la fecha de salida: ese es el caso grave." />
              <Hallazgo codigo="CUS-04" sev="alta" titulo="Descuadres entre saldo contable y bancario" cantidad={h.descuadres.cantidad} unidad="cuentas"
                desc={`Cuentas donde el saldo contable y el saldo bancario no coinciden. Diferencia acumulada: ${CLP(h.descuadres.montoTotal)}.`}
                norma="Integridad del registro contable fiscal"
                reco="Conciliación diaria por cuenta con umbral de tolerancia cero y responsable nominado. Un descuadre que persiste deja de ser un error de registro." />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Paso({ n, titulo, fecha, nota, alerta }: {
  n: number; titulo: string; fecha: string; nota: string; alerta?: boolean;
}) {
  return (
    <div className={`flex-1 border rounded-lg px-2.5 py-2 ${alerta ? "border-red-300 bg-red-50/60" : "border-deloitte-line bg-white"}`}>
      <div className="flex items-center gap-1.5">
        <span className={`w-4 h-4 rounded-full text-[11px] font-semibold flex items-center justify-center ${alerta ? "bg-risk-high text-white" : "bg-deloitte-paper text-deloitte-slate"}`}>{n}</span>
        <span className="cifra text-[11px] text-deloitte-mute">{fmtDate(fecha)}</span>
      </div>
      <div className="text-[12px] font-medium text-deloitte-ink mt-1 leading-tight">{titulo}</div>
      <div className={`text-[11px] mt-0.5 leading-tight ${alerta ? "text-risk-highTxt" : "text-deloitte-mute"}`}>{nota}</div>
    </div>
  );
}

function Flecha({ dias }: { dias: number }) {
  return (
    <div className="flex flex-col items-center justify-center px-1 flex-shrink-0">
      <div className="text-[15px] text-deloitte-mute leading-none">→</div>
      <div className="cifra text-[11px] text-deloitte-mute mt-0.5 whitespace-nowrap">
        {dias === 1 ? "1 día" : `${dias} días`}
      </div>
    </div>
  );
}

function Hallazgo({ codigo, sev, titulo, cantidad, unidad, desc, norma, reco }: {
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
              <RefPapel codigo={codigo} />
              <span className={`text-[11.5px] uppercase tracking-wider font-medium ${st.text}`}>{st.label}</span>
            </div>
            <div className="text-[13px] font-semibold mt-0.5 text-deloitte-ink leading-tight">{titulo}</div>
            <p className="text-[12.5px] text-deloitte-slate mt-1 leading-snug">{desc}</p>
            <div className="text-[11px] text-deloitte-mute italic mt-1.5">
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
