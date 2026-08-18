// Remuneraciones y Dotación — etiquetas según el pack activo
// Cliente e industria vienen del pack activo

import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { BRANDING } from "../config/branding";
import {
  trabajadores, turnos, liquidaciones, finiquitos, detectarHallazgos, BONOS_CONVENIO, ETIQUETAS,
} from "../data/remuneraciones";
import { CLP, num, fmtDate } from "../lib/format";
import { AnalisisEnVivo } from "../components/AnalisisEnVivo";

type Fuente = "trabajadores" | "turnos" | "liquidaciones" | "finiquitos" | "convenio";

const FUENTES: { id: Fuente; nombre: string; descripcion: string; tipo: string; filas: number; icono: string }[] = [
  { id: "trabajadores",  nombre: "Maestro_Trabajadores.xlsx",     descripcion: "Contrato, cargo, sede, convenio y datos bancarios", tipo: "Excel · estructurado",   filas: trabajadores.length, icono: "👥" },
  { id: "turnos",        nombre: "Bitacora_Turnos.xlsx", descripcion: `Guardias y turnos por ${ETIQUETAS.activo.toLowerCase()}, con dotación`,    tipo: "Bitácora · estructurado", filas: turnos.length,       icono: "⚓" },
  { id: "liquidaciones", nombre: "Liquidaciones_Sueldo.pdf",      descripcion: "Base, horas extra, bonos y descuentos por período", tipo: "PDF + Excel · mixto",     filas: liquidaciones.length, icono: "🧾" },
  { id: "finiquitos",    nombre: "Finiquitos_Periodo.pdf",        descripcion: "Causal, indemnización y vacaciones proporcionales", tipo: "PDF · NO estructurado",   filas: finiquitos.length,   icono: "📄" },
  { id: "convenio",      nombre: "Convenio_Colectivo.pdf",   descripcion: "Bonos autorizados y topes vigentes",                tipo: "PDF · NO estructurado",   filas: BONOS_CONVENIO.length, icono: "📘" },
];

const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];
const trabById = new Map(trabajadores.map((t) => [t.id, t]));

export function EspacioSeis() {
  const [fuente, setFuente] = useState<Fuente>("liquidaciones");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const hallazgos = useMemo(() => detectarHallazgos(), []);
  const switchFuente = (id: Fuente) => { setFuente(id); setPage(0); };

  const totalFilas = {
    trabajadores: trabajadores.length,
    turnos: turnos.length,
    liquidaciones: liquidaciones.length,
    finiquitos: finiquitos.length,
    convenio: BONOS_CONVENIO.length,
  }[fuente];

  const totalPages = Math.max(1, Math.ceil(totalFilas / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const startIdx = safePage * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalFilas);

  const masaSalarial = useMemo(() => liquidaciones.reduce((a, l) => a + l.liquidoCLP, 0), []);

  const totalCriticos =
    hallazgos.heImposibles.cantidad +
    hallazgos.bonoDuplicado.cantidad +
    hallazgos.sinTurnos.cantidad +
    hallazgos.postFiniquito.cantidad;

  const impactoCLP =
    hallazgos.heImposibles.montoTotal +
    hallazgos.bonoDuplicado.montoTotal +
    hallazgos.sinTurnos.montoTotal +
    hallazgos.postFiniquito.montoTotal +
    hallazgos.bonoDotacionIndebido.montoTotal +
    hallazgos.fueraConvenio.montoTotal;

  return (
    <>
      <Header
        eyebrow="Remuneraciones y Dotación"
        title={BRANDING.firmName}
        subtitle={`Auditoría continua de la nómina: cada hora extra pagada contra la bitácora de turnos por ${ETIQUETAS.activo.toLowerCase()}, cada bono contra el convenio colectivo, cada liquidación contra la vigencia del contrato`}
        meta={[
          { label: "Trabajadores", value: num(trabajadores.length) },
          { label: ETIQUETAS.dotacion, value: num(trabajadores.filter((t) => t.embarcado).length) },
          { label: "Turnos registrados", value: num(turnos.length) },
          { label: "Liquidaciones", value: num(liquidaciones.length) },
          { label: "Masa salarial", value: CLP(masaSalarial) },
        ]}
        cta={
          <div className="text-right">
            <div className="eyebrow">Período</div>
            <div className="text-[14px] font-semibold tabular text-deloitte-ink">Oct 2025 – Mar 2026</div>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* KPIs superiores */}
        <div className="card p-4">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <div className="eyebrow">Tradicional vs AuditIA</div>
              <div className="text-[15px] font-semibold mt-0.5 text-deloitte-ink">40 / {num(liquidaciones.length)}</div>
              <div className="text-[11px] text-deloitte-mute">muestra vs <span className="font-semibold text-deloitte-green">100% cruzado</span></div>
            </div>
            <div>
              <div className="eyebrow">Fuentes cruzadas</div>
              <div className="text-[15px] font-semibold mt-0.5 tabular text-deloitte-ink">5</div>
              <div className="text-[11px] text-deloitte-mute">estructuradas + NO estructuradas</div>
            </div>
            <div>
              <div className="eyebrow">Hallazgos críticos</div>
              <div className="text-[15px] font-semibold mt-0.5 text-risk-high">{totalCriticos} casos</div>
              <div className="text-[11px] text-deloitte-mute">pago sin respaldo operativo</div>
            </div>
            <div>
              <div className="eyebrow">Impacto detectado</div>
              <div className="text-[15px] font-semibold mt-0.5 tabular text-risk-high">{CLP(impactoCLP)}</div>
              <div className="text-[11px] text-deloitte-mute">en 6 meses</div>
            </div>
            <div>
              <div className="eyebrow">Riesgo laboral</div>
              <div className="text-[15px] font-semibold mt-0.5 text-risk-med">{hallazgos.guardiasLargas.cantidad} guardias</div>
              <div className="text-[11px] text-deloitte-mute">&gt; 16 h continuas</div>
            </div>
          </div>
        </div>

        {/* Análisis en vivo */}
        <AnalisisEnVivo
          universo={liquidaciones.length + turnos.length}
          muestraTradicional={40}
          fuentes={FUENTES.map((f) => ({ nombre: f.nombre, filas: f.filas, icono: f.icono }))}
          hallazgos={[
            { titulo: "Horas extra sin respaldo en la bitácora de turnos", severidad: "critica", cantidad: hallazgos.heImposibles.cantidad, montoCLP: hallazgos.heImposibles.montoTotal },
            { titulo: `${ETIQUETAS.bonoPrincipal} pagado dos veces en el mismo período`, severidad: "critica", cantidad: hallazgos.bonoDuplicado.cantidad, montoCLP: hallazgos.bonoDuplicado.montoTotal },
            { titulo: "Liquidaciones sin ningún turno registrado", severidad: "critica", cantidad: hallazgos.sinTurnos.cantidad, montoCLP: hallazgos.sinTurnos.montoTotal },
            { titulo: "Pagos posteriores a la fecha de finiquito", severidad: "critica", cantidad: hallazgos.postFiniquito.cantidad, montoCLP: hallazgos.postFiniquito.montoTotal },
            { titulo: `${ETIQUETAS.bonoDotacion} en turnos bajo dotación mínima`, severidad: "alta", cantidad: hallazgos.bonoDotacionIndebido.cantidad, montoCLP: hallazgos.bonoDotacionIndebido.montoTotal },
            { titulo: "Horas extra sobre el tope legal mensual", severidad: "alta", cantidad: hallazgos.sobreTope.cantidad, montoCLP: hallazgos.sobreTope.montoTotal },
            { titulo: "Guardias sobre 16 horas continuas", severidad: "alta", cantidad: hallazgos.guardiasLargas.cantidad },
            { titulo: "Trabajadores que comparten cuenta bancaria", severidad: "alta", cantidad: hallazgos.cuentasCompartidas.cantidad },
            { titulo: "Bonos fuera del convenio colectivo vigente", severidad: "media", cantidad: hallazgos.fueraConvenio.cantidad, montoCLP: hallazgos.fueraConvenio.montoTotal },
          ]}
        />

        {/* Hallazgos */}
        <div>
          <div className="eyebrow mb-2">Hallazgos detectados por AuditIA</div>
          <div className="grid grid-cols-2 gap-3">
            <HallazgoCard
              severidad="critica"
              titulo="Horas extra pagadas sin respaldo en la bitácora de turnos"
              cantidad={hallazgos.heImposibles.cantidad}
              unidad="liquidaciones"
              descripcion={`Liquidaciones con horas extra que exceden las horas efectivamente registradas en la bitácora de turnos. Monto pagado sin respaldo: ${CLP(hallazgos.heImposibles.montoTotal)}.`}
              normativa="Art. 32 y 33 Código del Trabajo · registro de asistencia obligatorio"
              recomendacion="Bloquear el pago de horas extra que no tengan turno registrado en bitácora. Exigir validación del supervisor responsable antes del cierre de nómina y auditar los casos detectados con foco en quién autorizó."
            />
            <HallazgoCard
              severidad="critica"
              titulo={`${ETIQUETAS.bonoPrincipal} pagado dos veces en el mismo período`}
              cantidad={hallazgos.bonoDuplicado.cantidad}
              unidad="casos"
              descripcion={`Un mismo bono aparece duplicado dentro de la misma liquidación. Sobrepago acumulado: ${CLP(hallazgos.bonoDuplicado.montoTotal)}.`}
              normativa={`${ETIQUETAS.convenioOperativo} · un ${ETIQUETAS.bonoPrincipal.toLowerCase()} por período`}
              recomendacion="Regla de unicidad por tipo de bono y período en el motor de nómina. Revisar si el duplicado viene de carga manual o de doble interfaz entre operaciones y remuneraciones."
            />
            <HallazgoCard
              severidad="critica"
              titulo="Liquidaciones sin ningún turno registrado en el período"
              cantidad={hallazgos.sinTurnos.cantidad}
              unidad="liquidaciones"
              descripcion={`Trabajadores que recibieron remuneración completa sin actividad registrada en la bitácora durante todo el mes. Monto: ${CLP(hallazgos.sinTurnos.montoTotal)}.`}
              normativa="Control de nómina · existencia y ocurrencia"
              recomendacion="Cruce mensual obligatorio de nómina contra bitácora antes de liberar el pago. Los casos sin turno deben requerir justificación documentada (licencia, permiso, vacaciones) para procesarse."
            />
            <HallazgoCard
              severidad="critica"
              titulo="Pagos posteriores a la fecha de finiquito"
              cantidad={hallazgos.postFiniquito.cantidad}
              unidad="liquidaciones"
              descripcion={`Liquidaciones emitidas para trabajadores ya finiquitados. Monto: ${CLP(hallazgos.postFiniquito.montoTotal)}.`}
              normativa="Art. 177 Código del Trabajo · término de la relación laboral"
              recomendacion="Baja automática en nómina al registrar el finiquito. Conciliar mensualmente finiquitos firmados contra trabajadores con liquidación emitida."
            />
            <HallazgoCard
              severidad="alta"
              titulo={`${ETIQUETAS.bonoDotacion} en turnos bajo dotación mínima`}
              cantidad={hallazgos.bonoDotacionIndebido.cantidad}
              unidad="casos"
              descripcion={`Se pagó ${ETIQUETAS.bonoDotacion.toLowerCase()} en períodos donde el turno operó por debajo de la dotación mínima definida. Monto: ${CLP(hallazgos.bonoDotacionIndebido.montoTotal)}. Además del sobrepago, es un riesgo operacional.`}
              normativa="Dotación mínima definida por la operación"
              recomendacion="Condicionar el bono a la dotación efectiva registrada en la faena. Escalar a Operaciones los turnos bajo mínimo: el hallazgo económico es menor que el riesgo de seguridad que revela."
            />
            <HallazgoCard
              severidad="alta"
              titulo="Horas extra sobre el tope legal mensual"
              cantidad={hallazgos.sobreTope.cantidad}
              unidad="liquidaciones"
              descripcion={`Liquidaciones con horas extra sobre el máximo legal. Exposición a multa administrativa y a reclamos ante la Dirección del Trabajo. Monto involucrado: ${CLP(hallazgos.sobreTope.montoTotal)}.`}
              normativa="Art. 31 Código del Trabajo · máximo 2 horas extraordinarias diarias"
              recomendacion="Alerta automática al superar el tope en el mes en curso, no al cierre. Analizar si el exceso se concentra en bases con déficit de dotación: es un problema de planificación, no de nómina."
            />
            <HallazgoCard
              severidad="alta"
              titulo="Guardias superiores a 16 horas continuas"
              cantidad={hallazgos.guardiasLargas.cantidad}
              unidad="turnos"
              descripcion="Turnos con más de 16 horas continuas sin descanso registrado. Riesgo de fatiga operacional."
              normativa="Descanso mínimo entre turnos · convenio vigente"
              recomendacion="Bloqueo en la planificación de turnos que superen el límite y reporte semanal al Gerente de Operaciones. Correlacionar estos turnos con incidentes del mismo período."
            />
            <HallazgoCard
              severidad="alta"
              titulo="Trabajadores que comparten cuenta bancaria"
              cantidad={hallazgos.cuentasCompartidas.cantidad}
              unidad="cuentas"
              descripcion="Cuentas de abono repetidas entre trabajadores distintos. Puede ser legítimo (familiares), pero es el patrón clásico de trabajador ficticio."
              normativa="Control de maestro de personal · integridad de datos de pago"
              recomendacion="Validar los casos con Personas. Establecer control preventivo de unicidad de cuenta en el alta de trabajador y revisión trimestral del maestro."
            />
            <HallazgoCard
              severidad="media"
              titulo="Bonos pagados fuera del convenio colectivo vigente"
              cantidad={hallazgos.fueraConvenio.cantidad}
              unidad="bonos"
              descripcion={`Conceptos que no figuran entre los bonos autorizados en el convenio. Monto: ${CLP(hallazgos.fueraConvenio.montoTotal)}.`}
              normativa="Convenio colectivo vigente · conceptos remuneracionales autorizados"
              recomendacion="Catálogo cerrado de conceptos en el motor de nómina, con excepciones que requieran aprobación documentada de Personas y Finanzas."
            />
            <HallazgoCard
              severidad="media"
              titulo="Líquidos muy por sobre la media del cargo"
              cantidad={hallazgos.saltosLiquido.cantidad}
              unidad="liquidaciones"
              descripcion="Liquidaciones con líquido más de 40% sobre la media del mismo cargo, sin cambio de cargo asociado. No es fraude por sí solo: es la lista de casos a explicar."
              normativa="Equidad interna · política de compensaciones"
              recomendacion="Revisión dirigida sobre esta lista en vez de muestreo aleatorio. Documentar la causa de cada excepción (turnos extraordinarios, reemplazos, retroactivos)."
            />
          </div>
        </div>

        {/* Fuentes */}
        <div>
          <div className="eyebrow mb-2">Fuentes de datos cruzadas</div>
          <div className="grid grid-cols-5 gap-3">
            {FUENTES.map((f) => (
              <button
                key={f.id}
                onClick={() => switchFuente(f.id)}
                className={`card p-3 text-left transition-all ${fuente === f.id ? "ring-2 ring-deloitte-green" : "hover:shadow-card"}`}
              >
                <div className="text-[16px]">{f.icono}</div>
                <div className="text-[11.5px] font-semibold mt-1 text-deloitte-ink leading-tight">{f.nombre}</div>
                <div className="text-[10px] text-deloitte-mute mt-1 leading-snug">{f.descripcion}</div>
                <div className="text-[10px] text-deloitte-mute mt-1.5 tabular">{num(f.filas)} filas · {f.tipo}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-deloitte-line">
            <div className="text-[12px] font-semibold text-deloitte-ink">
              {FUENTES.find((f) => f.id === fuente)!.nombre}
              <span className="text-deloitte-mute font-normal ml-2 tabular">
                {num(startIdx + 1)}–{num(endIdx)} de {num(totalFilas)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="text-[11px] border border-deloitte-line rounded px-2 py-1 bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} filas</option>)}
              </select>
              <div className="flex items-center gap-1 text-[11px]">
                <button onClick={() => setPage(0)} disabled={safePage === 0} className="px-1.5 py-0.5 disabled:opacity-30">«</button>
                <button onClick={() => setPage(safePage - 1)} disabled={safePage === 0} className="px-1.5 py-0.5 disabled:opacity-30">‹</button>
                <span className="tabular px-1">Pág {safePage + 1}/{totalPages}</span>
                <button onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages - 1} className="px-1.5 py-0.5 disabled:opacity-30">›</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={safePage >= totalPages - 1} className="px-1.5 py-0.5 disabled:opacity-30">»</button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              {fuente === "trabajadores" && (
                <>
                  <thead className="bg-deloitte-paper text-deloitte-mute">
                    <tr>{["ID","RUT","Nombre","Cargo","Base","Contrato","Convenio","Sueldo base","Estado"].map((h) => (
                      <th key={h} className="text-left font-semibold px-3 py-2 border-b border-deloitte-line">{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {trabajadores.slice(startIdx, endIdx).map((t) => (
                      <tr key={t.id} className="row-striped border-b border-deloitte-line/50">
                        <td className="px-3 py-1.5 tabular">{t.id}</td>
                        <td className="px-3 py-1.5 tabular">{t.rut}</td>
                        <td className="px-3 py-1.5">{t.nombre}</td>
                        <td className="px-3 py-1.5">{t.cargo}</td>
                        <td className="px-3 py-1.5">{t.base}</td>
                        <td className="px-3 py-1.5">{t.tipoContrato}</td>
                        <td className="px-3 py-1.5">{t.convenio}</td>
                        <td className="px-3 py-1.5 tabular text-right">{CLP(t.sueldoBaseCLP)}</td>
                        <td className="px-3 py-1.5">
                          <span className={`pill ${t.estado === "Activo" ? "bg-deloitte-paper text-deloitte-slate" : "bg-amber-100 text-risk-med"}`}>{t.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}

              {fuente === "turnos" && (
                <>
                  <thead className="bg-deloitte-paper text-deloitte-mute">
                    <tr>{["ID","Fecha","Trabajador",ETIQUETAS.activo,"Sede","Tipo","Inicio","Fin","Horas","Dotación"].map((h) => (
                      <th key={h} className="text-left font-semibold px-3 py-2 border-b border-deloitte-line">{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {turnos.slice(startIdx, endIdx).map((t) => {
                      const larga = t.horas > 16;
                      const bajaDot = t.tipo === "Faena" && t.dotacionFaena < t.dotacionMinima;
                      return (
                        <tr key={t.id} className={`row-striped border-b border-deloitte-line/50 ${larga || bajaDot ? "bg-red-50/40" : ""}`}>
                          <td className="px-3 py-1.5 tabular">{t.id}</td>
                          <td className="px-3 py-1.5 tabular">{fmtDate(t.fecha)}</td>
                          <td className="px-3 py-1.5">{trabById.get(t.trabajadorId)?.nombre}</td>
                          <td className="px-3 py-1.5">{t.activo}</td>
                          <td className="px-3 py-1.5">{t.base}</td>
                          <td className="px-3 py-1.5">{t.tipo}</td>
                          <td className="px-3 py-1.5 tabular">{t.horaInicio}</td>
                          <td className="px-3 py-1.5 tabular">{t.horaFin}</td>
                          <td className={`px-3 py-1.5 tabular text-right ${larga ? "font-bold text-risk-high" : ""}`}>{t.horas}{larga && " ⚠"}</td>
                          <td className={`px-3 py-1.5 tabular text-right ${bajaDot ? "font-bold text-risk-high" : ""}`}>{t.dotacionFaena}/{t.dotacionMinima}{bajaDot && " ⚠"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

              {fuente === "liquidaciones" && (
                <>
                  <thead className="bg-deloitte-paper text-deloitte-mute">
                    <tr>{["ID","Período","Trabajador","Cargo","Base","HH.EE.","Monto HH.EE.","Bonos","Líquido"].map((h) => (
                      <th key={h} className="text-left font-semibold px-3 py-2 border-b border-deloitte-line">{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {liquidaciones.slice(startIdx, endIdx).map((l) => {
                      const t = trabById.get(l.trabajadorId);
                      const anomHE = l.horasExtraPagadas > 45;
                      const bonosFuera = l.bonos.some((b) => !BONOS_CONVENIO.includes(b.tipo));
                      return (
                        <tr key={l.id} className={`row-striped border-b border-deloitte-line/50 ${anomHE || bonosFuera ? "bg-red-50/40" : ""}`}>
                          <td className="px-3 py-1.5 tabular">{l.id}</td>
                          <td className="px-3 py-1.5 tabular">{l.periodo}</td>
                          <td className="px-3 py-1.5">{t?.nombre}</td>
                          <td className="px-3 py-1.5">{t?.cargo}</td>
                          <td className="px-3 py-1.5">{t?.base}</td>
                          <td className={`px-3 py-1.5 tabular text-right ${anomHE ? "font-bold text-risk-high" : ""}`}>{l.horasExtraPagadas}{anomHE && " ⚠"}</td>
                          <td className="px-3 py-1.5 tabular text-right">{CLP(l.montoHorasExtraCLP)}</td>
                          <td className="px-3 py-1.5">
                            {l.bonos.length === 0 ? "—" : l.bonos.map((b, i) => (
                              <span key={i} className={`pill mr-1 ${BONOS_CONVENIO.includes(b.tipo) ? "bg-deloitte-paper text-deloitte-slate" : "bg-red-100 text-risk-high"}`}>{b.tipo}</span>
                            ))}
                          </td>
                          <td className="px-3 py-1.5 tabular text-right font-semibold">{CLP(l.liquidoCLP)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

              {fuente === "finiquitos" && (
                <>
                  <thead className="bg-deloitte-paper text-deloitte-mute">
                    <tr>{["ID","Fecha","Trabajador","Cargo","Causal","Indemnización","Vacaciones","Total"].map((h) => (
                      <th key={h} className="text-left font-semibold px-3 py-2 border-b border-deloitte-line">{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {finiquitos.slice(startIdx, endIdx).map((f) => {
                      const t = trabById.get(f.trabajadorId);
                      return (
                        <tr key={f.id} className="row-striped border-b border-deloitte-line/50">
                          <td className="px-3 py-1.5 tabular">{f.id}</td>
                          <td className="px-3 py-1.5 tabular">{fmtDate(f.fecha)}</td>
                          <td className="px-3 py-1.5">{t?.nombre}</td>
                          <td className="px-3 py-1.5">{t?.cargo}</td>
                          <td className="px-3 py-1.5">{f.causal}</td>
                          <td className="px-3 py-1.5 tabular text-right">{CLP(f.indemnizacionCLP)}</td>
                          <td className="px-3 py-1.5 tabular text-right">{CLP(f.vacacionesProporcionalesCLP)}</td>
                          <td className="px-3 py-1.5 tabular text-right font-semibold">{CLP(f.totalCLP)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

              {fuente === "convenio" && (
                <>
                  <thead className="bg-deloitte-paper text-deloitte-mute">
                    <tr>{["Concepto autorizado","Ámbito"].map((h) => (
                      <th key={h} className="text-left font-semibold px-3 py-2 border-b border-deloitte-line">{h}</th>))}</tr>
                  </thead>
                  <tbody>
                    {BONOS_CONVENIO.map((b) => (
                      <tr key={b} className="row-striped border-b border-deloitte-line/50">
                        <td className="px-3 py-1.5">{b}</td>
                        <td className="px-3 py-1.5 text-deloitte-mute">{ETIQUETAS.convenioOperativo}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function HallazgoCard({ severidad, titulo, cantidad, unidad, descripcion, normativa, recomendacion }: {
  severidad: "critica" | "alta" | "media";
  titulo: string;
  cantidad: number | null;
  unidad: string;
  descripcion: string;
  normativa: string;
  recomendacion: string;
}) {
  const styles = {
    critica: { bar: "bg-risk-high", bg: "bg-red-50", text: "text-risk-high", label: "Crítica" },
    alta:    { bar: "bg-risk-med", bg: "bg-amber-50", text: "text-risk-med", label: "Alta" },
    media:   { bar: "bg-deloitte-green", bg: "bg-deloitte-paper", text: "text-deloitte-greenDark", label: "Media" },
  };
  const s = styles[severidad];
  return (
    <div className={`relative border border-deloitte-line rounded-md overflow-hidden ${s.bg}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
      <div className="pl-4 pr-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className={`text-[10px] uppercase tracking-wider font-bold ${s.text}`}>{s.label}</div>
            <div className="text-[13px] font-semibold mt-0.5 text-deloitte-ink leading-tight">{titulo}</div>
            <p className="text-[11.5px] text-deloitte-slate mt-1 leading-snug">{descripcion}</p>
            <div className="text-[10px] text-deloitte-mute italic mt-1.5">
              <span className="font-semibold not-italic text-deloitte-slate">Referencia:</span> {normativa}
            </div>
            {recomendacion && (
              <div className="mt-2 pt-2 border-t border-deloitte-line/60">
                <div className="flex items-start gap-1.5">
                  <span className="text-[11px] flex-shrink-0 mt-0.5">💡</span>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider font-bold text-deloitte-greenDark">Recomendación de AuditIA</div>
                    <p className="text-[11px] text-deloitte-slate leading-snug mt-0.5">{recomendacion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {cantidad !== null && (
            <div className="text-right">
              <div className={`text-[24px] font-bold tabular ${s.text} leading-none`}>{cantidad}</div>
              <div className="text-[9px] text-deloitte-mute uppercase tracking-wider">{unidad}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
