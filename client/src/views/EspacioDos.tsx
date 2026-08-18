// Espacio 2 — Audit Hub. KPIs continuos + planilla de seguimiento + visualizaciones + simulador.

import { useState, useEffect } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart,
} from "recharts";
import { Header } from "../components/Header";
import { BRANDING } from "../config/branding";
import { KPICard } from "../components/KPICard";
import { AlertCard } from "../components/AlertCard";
import {
  kpisHero, excepcionesMes, hallazgosCategoria,
  concentracionProv, coberturaAreas,
  simVariables, computeRiskScore,
} from "../data/auditHub";
import { computeMetricasSeguimiento } from "../data/seguimiento";
import { listarCompromisos, eliminarCompromiso, type Compromiso } from "../data/compromisos";
import { hallazgos } from "../data/seguimiento";
import { DrillDown } from "../components/DrillDown";
import { C } from "../lib/colors";

type DrillKey = null | "abiertos" | "vencidos" | "criticos" | "reiterados" | "cumplimiento";

export function EspacioDos() {
  const [drill, setDrill] = useState<DrillKey>(null);
  const [simVals, setSimVals] = useState<Record<string, number>>(
    Object.fromEntries(simVariables.map((v) => [v.id, v.default]))
  );
  const riskScore = computeRiskScore(simVals);
  const baselineScore = computeRiskScore(
    Object.fromEntries(simVariables.map((v) => [v.id, v.default]))
  );
  const delta = riskScore - baselineScore;

  // Compromisos generados desde Hallazgos Activos (persistidos en localStorage)
  const [compromisos, setCompromisos] = useState<Compromiso[]>([]);
  useEffect(() => {
    setCompromisos(listarCompromisos());
    // Refrescar cuando se vuelva a la pestaña (por si se generan desde el chat)
    const onFocus = () => setCompromisos(listarCompromisos());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  const refreshCompromisos = () => setCompromisos(listarCompromisos());
  const onEliminarCompromiso = (id: string) => {
    eliminarCompromiso(id);
    refreshCompromisos();
  };

  // Métricas de la planilla de seguimiento
  const seg = computeMetricasSeguimiento();
  // Tendencia anual de severidad para el line chart
  const tendenciaSeveridad = Object.entries(seg.porAnio).map(([year, v]) => ({
    year, criticos: v.criticos, altos: v.altos, medios: v.medios,
  }));
  // Cumplimiento por área (ordenado por peor)
  const cumplimientoAreas = Object.entries(seg.porArea)
    .map(([area, v]) => ({ area: area.replace("Gerencia de ", "").replace("Gerencia ", ""), pct: v.cumplimientoPct, vencidos: v.vencidos, total: v.total }))
    .sort((a, b) => a.pct - b.pct);

  return (
    <>
      <Header
        eyebrow="Espacio 02 · Monitoreo Continuo"
        title="Tablero de seguimiento y control"
        subtitle={`Monitoreo continuo del proceso Procure-to-Pay de ${BRANDING.firmName}. Vista permanente para el dueño de proceso — Auditoría Interna solo interviene en casos escalados.`}
        meta={[
          { label: "Empresa", value: BRANDING.firmName },
          { label: "Período", value: "FY 2023-26 (al 26-May-2026)" },
          { label: "Hallazgos totales", value: `${seg.resumen.total}` },
          { label: "Última actualización", value: "Hoy 06:00" },
        ]}
        cta={
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-deloitte-line rounded text-[12px] hover:border-deloitte-green hover:bg-deloitte-paper">
              Exportar PDF
            </button>
            <button className="px-3 py-1.5 bg-deloitte-ink text-white rounded text-[12px] font-semibold hover:bg-deloitte-slate">
              + Reporte personalizado
            </button>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MIS COMPROMISOS — generados desde Hallazgos Activos              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {compromisos.length > 0 && (
          <div className="card p-4 border-l-4" style={{ borderLeftColor: C.brand }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="eyebrow">Mi plan de auditoría · compromisos generados</div>
                <h3 className="text-[15px] font-semibold mt-0.5">
                  {compromisos.length} {compromisos.length === 1 ? "compromiso pendiente de asignación" : "compromisos pendientes de asignación"}
                </h3>
              </div>
              <div className="text-[11px] text-deloitte-mute">
                Generados desde Hallazgos Activos · sincronizado con localStorage
              </div>
            </div>
            <div className="space-y-2">
              {compromisos.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-start gap-3 p-2.5 bg-deloitte-paper rounded border border-deloitte-line text-[11.5px]">
                  <div className="flex-shrink-0 font-mono text-[10px] text-deloitte-mute pt-0.5">{c.id}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-deloitte-ink leading-tight">{c.titulo}</div>
                    <div className="text-deloitte-slate text-[11px] mt-0.5">
                      <span className="font-semibold">{c.proceso}</span> · {c.responsableSugerido} · plazo {c.fechaCompromiso}
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    c.severidad === "Crítica" ? "bg-red-100 text-risk-high" : c.severidad === "Alta" ? "bg-amber-100 text-risk-med" : "bg-gray-100 text-deloitte-mute"
                  }`}>{c.severidad}</span>
                  <button
                    onClick={() => onEliminarCompromiso(c.id)}
                    className="text-[10px] text-deloitte-mute hover:text-risk-high px-1"
                    title="Eliminar"
                  >×</button>
                </div>
              ))}
              {compromisos.length > 5 && (
                <div className="text-[11px] text-deloitte-mute pl-2">
                  + {compromisos.length - 5} compromisos más en el plan
                </div>
              )}
            </div>
          </div>
        )}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PLANILLA DE SEGUIMIENTO — el "corazón" de auditoría interna     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="eyebrow">Planilla de seguimiento de hallazgos · FY23 — FY26</div>
              <h2 className="text-[18px] font-serif font-semibold text-deloitte-ink mt-0.5">
                Estado actual de compromisos del plan de auditoría
              </h2>
            </div>
            <div className="text-[11px] text-deloitte-mute">
              {seg.resumen.total} hallazgos · 4 años · 8 procesos
            </div>
          </div>

          {/* KPIs del tablero de seguimiento — clickeables para drill-down */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <button onClick={() => setDrill("abiertos")} className="card p-3 text-left hover:border-deloitte-green hover:shadow-md transition-all cursor-pointer">
              <div className="eyebrow">Abiertos totales</div>
              <div className="text-[22px] font-bold tabular text-deloitte-ink mt-1">{seg.resumen.abiertos}</div>
              <div className="text-[10px] text-deloitte-mute mt-0.5">de {seg.resumen.total} históricos · ver detalle →</div>
            </button>
            <button onClick={() => setDrill("vencidos")} className="card p-3 text-left hover:border-deloitte-green hover:shadow-md transition-all cursor-pointer">
              <div className="eyebrow">Vencidos</div>
              <div className="text-[22px] font-bold tabular text-risk-high mt-1">{seg.resumen.vencidos}</div>
              <div className="text-[10px] text-deloitte-mute mt-0.5">{seg.resumen.pctVencidos}% de los abiertos · ver →</div>
            </button>
            <button onClick={() => setDrill("criticos")} className="card p-3 text-left hover:border-deloitte-green hover:shadow-md transition-all cursor-pointer">
              <div className="eyebrow">Críticos abiertos</div>
              <div className="text-[22px] font-bold tabular text-risk-high mt-1">{seg.resumen.criticosAbiertos}</div>
              <div className="text-[10px] text-deloitte-mute mt-0.5">requieren escalamiento · ver →</div>
            </button>
            <button onClick={() => setDrill("reiterados")} className="card p-3 text-left hover:border-deloitte-green hover:shadow-md transition-all cursor-pointer">
              <div className="eyebrow">Reiterados</div>
              <div className="text-[22px] font-bold tabular text-risk-med mt-1">{seg.resumen.reiterados}</div>
              <div className="text-[10px] text-deloitte-mute mt-0.5">repetidos año a año · ver →</div>
            </button>
            <button onClick={() => setDrill("cumplimiento")} className="card p-3 text-left hover:border-deloitte-green hover:shadow-md transition-all cursor-pointer">
              <div className="eyebrow">Cumplimiento global</div>
              <div className="text-[22px] font-bold tabular text-deloitte-ink mt-1">
                {Math.round((seg.resumen.cerrados / seg.resumen.total) * 100)}%
              </div>
              <div className="text-[10px] text-deloitte-mute mt-0.5">{seg.resumen.cerrados} cerrados · ver →</div>
            </button>
          </div>

          {/* Charts: tendencia + cumplimiento por área */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4">
              <div className="eyebrow">Severidad detectada por año</div>
              <h3 className="text-[14px] font-semibold mt-0.5 mb-2">Críticos en aumento sostenido</h3>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={tendenciaSeveridad} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke="#E5E5E5" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.mute }} axisLine={{ stroke: C.line }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.mute }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12 }} />
                    <Line type="monotone" dataKey="criticos" stroke={C.riskHigh} strokeWidth={2.5} dot={{ r: 4 }} name="Críticos" />
                    <Line type="monotone" dataKey="altos" stroke={C.riskMed} strokeWidth={2} dot={{ r: 3 }} name="Altos" />
                    <Line type="monotone" dataKey="medios" stroke={C.chart[3]} strokeWidth={2} dot={{ r: 3 }} name="Medios" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-deloitte-mute mt-2">
                FY26 muestra dato parcial (al 26-may). Proyección sugiere ≥10 críticos al cierre del año.
              </div>
            </div>

            <div className="card p-4">
              <div className="eyebrow">Cumplimiento de compromisos por área</div>
              <h3 className="text-[14px] font-semibold mt-0.5 mb-2">Tecnología y Legal con peor cumplimiento</h3>
              <div className="space-y-2 mt-3">
                {cumplimientoAreas.map((a) => (
                  <div key={a.area}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-deloitte-slate">{a.area}</span>
                      <span className="tabular text-deloitte-mute">
                        {a.pct}% <span className="text-risk-high">· {a.vencidos} vencidos</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-deloitte-paper rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          width: `${a.pct}%`,
                          background: a.pct < 60 ? C.riskHigh : a.pct < 75 ? C.riskMed : C.riskLow,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hallazgos críticos antiguos + responsables sobrecargados */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="card p-4 col-span-2">
              <div className="eyebrow">Hallazgos críticos con más de 180 días sin cerrar</div>
              <h3 className="text-[14px] font-semibold mt-0.5 mb-3">
                {seg.criticosAntiguos.length} casos requieren escalamiento al Comité de Auditoría
              </h3>
              <div className="overflow-hidden border border-deloitte-line rounded">
                <table className="w-full text-[11px]">
                  <thead className="bg-deloitte-paper">
                    <tr className="text-left text-deloitte-mute uppercase tracking-wide text-[10px]">
                      <th className="px-3 py-2 font-semibold">ID</th>
                      <th className="px-3 py-2 font-semibold">Hallazgo</th>
                      <th className="px-3 py-2 font-semibold">Responsable</th>
                      <th className="px-3 py-2 font-semibold text-right">Días abierto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-deloitte-line">
                    {seg.criticosAntiguos.slice(0, 6).map((h) => (
                      <tr key={h.id} className="hover:bg-deloitte-paper">
                        <td className="px-3 py-2 font-mono text-[10px] text-deloitte-mute">{h.id}</td>
                        <td className="px-3 py-2 text-deloitte-slate">
                          {h.descripcion.length > 80 ? h.descripcion.slice(0, 80) + "…" : h.descripcion}
                        </td>
                        <td className="px-3 py-2 text-deloitte-slate">{h.responsable}</td>
                        <td className="px-3 py-2 text-right tabular font-semibold text-risk-high">
                          {h.diasAbierto}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-4">
              <div className="eyebrow">Responsables sobrecargados</div>
              <h3 className="text-[14px] font-semibold mt-0.5 mb-3">Carga de compromisos abiertos</h3>
              <div className="space-y-3">
                {seg.responsablesSobrecargados.slice(0, 5).map((r) => (
                  <div key={r.nombre} className="flex items-center justify-between text-[12px]">
                    <div>
                      <div className="font-semibold text-deloitte-slate">{r.nombre}</div>
                      <div className="text-[10px] text-deloitte-mute">{r.compromisosAbiertos} compromisos</div>
                    </div>
                    <div className="text-[11px] font-semibold text-risk-high tabular">
                      {r.compromisosAbiertos >= 8 ? "Sobrecarga" : "Atención"}
                    </div>
                  </div>
                ))}
                {seg.responsablesSobrecargados.length === 0 && (
                  <div className="text-[11px] text-deloitte-mute">
                    No hay responsables con sobrecarga detectada.
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-deloitte-line text-[10px] text-deloitte-mute">
                AuditIA detecta responsables con &gt;7 compromisos abiertos y recomienda redistribución.
              </div>
            </div>
          </div>

          {/* Hallazgos reiterados */}
          {seg.reiteradosDetalle.length > 0 && (
            <div className="card p-4 mt-4 border-l-4" style={{ borderLeftColor: C.riskMed }}>
              <div className="eyebrow">Hallazgos reiterados · alerta de control crónico</div>
              <h3 className="text-[14px] font-semibold mt-0.5 mb-2">
                {seg.reiteradosDetalle.length} hallazgos se vienen repitiendo año a año sin cerrarse
              </h3>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {seg.reiteradosDetalle.slice(0, 4).map((h) => (
                  <div key={h.id} className="p-3 bg-deloitte-paper rounded border border-deloitte-line">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono text-[10px] text-deloitte-mute">{h.id}</span>
                      <span className={`text-[9px] font-semibold uppercase tracking-wide ${
                        h.severidad === "Crítica" ? "text-risk-high" : "text-risk-med"
                      }`}>
                        {h.severidad} · {h.proceso}
                      </span>
                    </div>
                    <div className="text-[11px] text-deloitte-slate leading-tight">
                      {h.descripcion.replace(" (REITERADO de HAL-2023-005)", "").replace(" (REITERADO de HAL-2024-018)", "").replace(" (REITERADO de HAL-2023-014)", "").replace(" (REITERADO de HAL-2024-035)", "")}
                    </div>
                    <div className="text-[10px] text-deloitte-mute mt-2">
                      ↳ Reiterado de <span className="font-mono">{h.hallazgoOrigenId}</span> · Estado: <span className="font-semibold">{h.estado}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Separador visual entre los dos universos del Hub */}
        <div className="flex items-center gap-4 pt-2">
          <div className="h-px bg-deloitte-line flex-1" />
          <div className="text-[10px] uppercase tracking-widest text-deloitte-mute font-semibold">
            Indicadores P2P de control continuo
          </div>
          <div className="h-px bg-deloitte-line flex-1" />
        </div>

        {/* KPIs hero (originales del Audit Hub) */}
        <div>
          <div className="eyebrow mb-2">Indicadores clave · vs mes anterior</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {kpisHero.map((k) => (
              <KPICard
                key={k.id}
                label={k.label}
                value={k.value}
                delta={k.delta}
                positive={k.deltaIsPositive}
                detail={k.detail}
              />
            ))}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 col-span-2">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="eyebrow">Excepciones P2P · últimos 6 meses</div>
                <h3 className="text-[15px] font-semibold mt-0.5">Tendencia descendente, foco en críticas</h3>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.riskHigh }} />
                  Críticas
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.riskMed }} />
                  Altas
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.chart[3] }} />
                  Medias
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: C.chart[4] }} />
                  Bajas
                </div>
              </div>
            </div>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={excepcionesMes} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="#E5E5E5" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.mute }} axisLine={{ stroke: C.line }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.mute }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="criticas" stackId="a" fill={C.riskHigh} />
                  <Bar dataKey="altas" stackId="a" fill={C.riskMed} />
                  <Bar dataKey="medias" stackId="a" fill={C.chart[3]} />
                  <Bar dataKey="bajas" stackId="a" fill={C.chart[4]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4">
            <div className="eyebrow">Hallazgos por categoría</div>
            <h3 className="text-[15px] font-semibold mt-0.5 mb-2">Top categorías</h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={hallazgosCategoria}
                    dataKey="valor"
                    nameKey="categoria"
                    outerRadius={75}
                    innerRadius={38}
                    paddingAngle={2}
                  >
                    {hallazgosCategoria.map((h, i) => (
                      <Cell key={i} fill={h.severidad === "high" ? C.riskHigh : h.severidad === "med" ? C.riskMed : C.riskLow} fillOpacity={0.85 - i * 0.06} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {hallazgosCategoria.slice(0, 4).map((h, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ background: h.severidad === "high" ? C.riskHigh : h.severidad === "med" ? C.riskMed : C.riskLow }}
                    />
                    <span className="text-deloitte-slate">{h.categoria}</span>
                  </span>
                  <span className="font-semibold tabular">{h.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2: concentración proveedores + cobertura áreas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="eyebrow">Concentración de gasto · top proveedores</div>
            <h3 className="text-[15px] font-semibold mt-0.5 mb-3">Concentración top-10: 38,7%</h3>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart layout="vertical" data={concentracionProv} margin={{ top: 0, right: 24, left: 4, bottom: 0 }}>
                  <CartesianGrid stroke="#E5E5E5" strokeDasharray="2 4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: C.mute }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="proveedor" tick={{ fontSize: 10, fill: C.mute }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => `${v.toFixed(1)}%`} contentStyle={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="participacion" radius={[0, 2, 2, 0]}>
                    {concentracionProv.map((p, i) => (
                      <Cell key={i} fill={i === concentracionProv.length - 1 ? C.line : C.brand} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-4">
            <div className="eyebrow">Cobertura del plan anual · por área</div>
            <h3 className="text-[15px] font-semibold mt-0.5 mb-3">Áreas con cobertura insuficiente</h3>
            <div className="space-y-2.5 mt-3">
              {coberturaAreas.map((a) => (
                <div key={a.area}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-semibold text-deloitte-slate">{a.area}</span>
                    <span className="tabular text-deloitte-mute">{a.cobertura}%</span>
                  </div>
                  <div className="h-1.5 bg-deloitte-paper rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${a.cobertura}%`,
                        background: a.riesgo === "high" ? C.riskHigh : a.riesgo === "med" ? C.riskMed : C.riskLow,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulador */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="eyebrow">Simulador de sensibilidad</div>
              <h3 className="text-[16px] font-serif font-semibold mt-0.5 text-deloitte-ink">
                ¿Qué pasaría con el riesgo operacional si cambian estas variables?
              </h3>
              <p className="text-[12px] text-deloitte-mute mt-1 max-w-xl">
                Mueve los sliders para ver cómo cambia el índice sintético de riesgo. AuditIA puede contestar
                preguntas de "qué pasa si…" directamente en el chat.
              </p>
            </div>
            <div className="text-right">
              <div className="eyebrow">Índice de riesgo</div>
              <div className={`text-[36px] font-bold tabular leading-none mt-0.5 ${
                riskScore < 30 ? "text-risk-low" : riskScore < 60 ? "text-risk-med" : "text-risk-high"
              }`}>
                {riskScore.toFixed(1)}
              </div>
              <div className="text-[11px] text-deloitte-mute mt-0.5 tabular">
                {delta > 0 ? "▲" : delta < 0 ? "▼" : ""} {Math.abs(delta).toFixed(1)} vs baseline
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {simVariables.map((v) => (
              <div key={v.id}>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="font-semibold text-deloitte-slate">{v.label}</span>
                  <span className="tabular text-deloitte-ink font-semibold">
                    {v.unit === "CLP"
                      ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(simVals[v.id])
                      : `${simVals[v.id]} ${v.unit}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={v.min}
                  max={v.max}
                  step={v.step}
                  value={simVals[v.id]}
                  onChange={(e) =>
                    setSimVals((p) => ({ ...p, [v.id]: Number(e.target.value) }))
                  }
                  className="w-full accent-deloitte-green"
                />
                <div className="flex justify-between text-[10px] text-deloitte-mute mt-0.5 tabular">
                  <span>{v.unit === "CLP" ? `CLP ${(v.min / 1_000_000).toFixed(0)}M` : `${v.min}`}</span>
                  <span>{v.unit === "CLP" ? `CLP ${(v.max / 1_000_000).toFixed(0)}M` : `${v.max}`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hallazgos prioritarios — los plantados de Espacio 1 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="eyebrow">Hallazgos activos</div>
              <h3 className="text-[15px] font-semibold mt-0.5">Detectados por el monitoreo continuo sobre el 100% del universo</h3>
            </div>
            <button className="text-[11px] text-deloitte-green font-semibold hover:underline">
              Ver todos (14) →
            </button>
          </div>
          <div className="space-y-2.5">
            <AlertCard
              severity="high"
              title="Colisión empleado–proveedor detectada"
              description="3 proveedores activos comparten cuenta bancaria con empleados en áreas sensibles (Compras, Logística, Finanzas). Patrón consistente con conflicto de interés no declarado."
              metric="3"
              action="Confirmación con tercero independiente + revisión del proceso de alta de proveedores."
            />
            <AlertCard
              severity="high"
              title="Proveedores creados con facturación inmediata"
              description="2 proveedores creados hace menos de 90 días ya acumulan más de CLP 18M en pagos. Patrón consistente con 'proveedores fantasma'."
              metric="CLP 42,7M"
              action="Vouching documental completo + verificación in-situ + revisión de cadena de aprobación."
            />
            <AlertCard
              severity="high"
              title="Backdating de órdenes de compra"
              description="4 facturas con fecha de emisión anterior a la fecha de su OC asociada. La compra existió antes que la autorización — la OC se generó para regularizar."
              metric="4 OCs"
              action="Identificar el aprobador, evaluar incentivo y verificar si responde a un patrón sistemático."
            />
            <AlertCard
              severity="high"
              title="Pagos antes de la fecha de factura"
              description="3 facturas con fecha de pago anterior a la fecha de emisión. Operativamente imposible — apunta a error de carga o fabricación de comprobantes."
              metric="3 pagos"
              action="Cotejo con extracto bancario + entrevista con el aprobador del pago."
            />
            <AlertCard
              severity="med"
              title="Posible split de aprobación"
              description="12 OCs en rango CLP 4,5M–4,99M, mismo proveedor (TI), misma área, mismo aprobador. Justo bajo umbral de aprobación gerencial CLP 5M."
              metric="12 OCs"
              action="Recálculo de límites + entrevista con aprobador + revisión política de delegación."
            />
            <AlertCard
              severity="med"
              title="Concentración de aprobador en proveedor único"
              description="Un proveedor (CLP 116M anuales) recibe 94% de su valor de OC aprobado por un solo usuario. Violación de segregación de funciones."
              metric="94% / 1 aprobador"
              action="Reasignar aprobadores + agregar segundo revisor obligatorio para este proveedor."
            />
            <AlertCard
              severity="high"
              title="Empleados con cuenta bancaria compartida"
              description="2 empleados del área Operaciones tienen idéntica cuenta bancaria. Patrón consistente con empleado fantasma o error grave del maestro."
              metric="2 empleados"
              action="Confirmación física + revisión de procesos de alta de personal + verificación con RRHH."
            />
            <AlertCard
              severity="med"
              title="Facturas pagadas sin OC previa"
              description="23 facturas pagadas en el período sin orden de compra asociada. Excede el límite tolerable de la matriz de control (10 por trimestre)."
              metric="23"
              action="Validación de excepción por gerencia + análisis de causa raíz."
            />
          </div>
        </div>
      </div>

      {/* ─────────── DRILL-DOWN MODALS ─────────── */}
      <DrillDown
        open={drill === "abiertos"}
        onClose={() => setDrill(null)}
        title="Hallazgos abiertos · vista detallada"
        subtitle="Compromisos no cerrados al 26-may-2026"
        fuente={`Planilla de seguimiento FY23-FY26 · ${BRANDING.firmName} · sistema interno de auditoría`}
        metrica={{ label: "hallazgos abiertos en total", value: String(seg.resumen.abiertos) }}
        description="Distribución por proceso de los compromisos que aún no están en estado Cerrado. Incluye Abiertos, En proceso y No iniciados."
        table={{
          headers: ["Proceso", "Total histórico", "Abiertos", "Vencidos"],
          rows: Object.entries(seg.porProceso)
            .sort((a, b) => b[1].abiertos - a[1].abiertos)
            .map(([p, v]) => [p, v.total, v.abiertos, v.vencidos]),
        }}
        notas={[
          "TI concentra el 38% de los compromisos abiertos — área prioritaria para escalamiento.",
          "El proceso de Compras tiene 100% de sus abiertos en estado vencido — riesgo de control significativo.",
          "Veritas recomienda revisar el balance de carga del Gerente de TI antes de fin de mes.",
        ]}
      />

      <DrillDown
        open={drill === "vencidos"}
        onClose={() => setDrill(null)}
        title="Compromisos vencidos · análisis de incumplimiento"
        subtitle={`${seg.resumen.vencidos} de ${seg.resumen.abiertos} abiertos están vencidos (${seg.resumen.pctVencidos}%)`}
        fuente="Planilla de seguimiento de hallazgos · cruce fechas de compromiso vs fecha actual (26-may-2026)"
        metrica={{ label: "% de incumplimiento sobre abiertos", value: `${seg.resumen.pctVencidos}%` }}
        description="Un compromiso vencido es aquel cuya fecha de remediación pactada ya pasó sin que el responsable lo haya cerrado. Es la métrica que más mira el directorio."
        rows={[
          { label: "Críticos vencidos", value: hallazgos.filter((h: any) => h.severidad === "Crítica" && h.estado !== "Cerrado" && new Date(h.fechaCompromiso) < new Date("2026-05-27")).length, sub: "Requieren escalamiento al Comité de Auditoría" },
          { label: "Altos vencidos", value: hallazgos.filter((h: any) => h.severidad === "Alta" && h.estado !== "Cerrado" && new Date(h.fechaCompromiso) < new Date("2026-05-27")).length, sub: "Revisión con dueño de proceso requerida" },
          { label: "Medios vencidos", value: hallazgos.filter((h: any) => h.severidad === "Media" && h.estado !== "Cerrado" && new Date(h.fechaCompromiso) < new Date("2026-05-27")).length, sub: "Plan de remediación con plazo extendido" },
          { label: "Hallazgo más antiguo abierto", value: `${seg.criticosAntiguos[0]?.diasAbierto || 0} días`, sub: seg.criticosAntiguos[0]?.id || "" },
        ]}
        notas={[
          `Estándar IIA: idealmente <15% de los hallazgos abiertos en estado vencido. ${BRANDING.firmName} está muy por encima del umbral.`,
          "Recomendación: presentar plan trimestral de cierre al Comité de Auditoría en la próxima reunión.",
        ]}
      />

      <DrillDown
        open={drill === "criticos"}
        onClose={() => setDrill(null)}
        title="Hallazgos críticos abiertos"
        subtitle="Riesgo material para la organización · requieren atención inmediata"
        fuente="Hallazgos clasificados con severidad Crítica según matriz de impacto-probabilidad del IIA"
        metrica={{ label: "hallazgos críticos sin cerrar", value: String(seg.resumen.criticosAbiertos) }}
        description="Los hallazgos críticos son aquellos donde se identifica una debilidad de control con potencial impacto material sobre los estados financieros, cumplimiento normativo o continuidad operativa."
        table={{
          headers: ["ID", "Hallazgo", "Responsable", "Días abierto"],
          rows: seg.criticosAntiguos.slice(0, 8).map((h: any) => [
            h.id,
            h.descripcion.length > 60 ? h.descripcion.slice(0, 60) + "…" : h.descripcion,
            h.responsable,
            `${h.diasAbierto}d`,
          ]),
        }}
        notas={[
          "El hallazgo HAL-2024-007 (plan de continuidad TI) acumula más de 2 años sin remediación.",
          "Patrón observado: 60% de los críticos abiertos pertenecen al área de Tecnología.",
          "Sugerencia: incluir estos hallazgos en la agenda del próximo Comité de Auditoría como riesgos materiales.",
        ]}
      />

      <DrillDown
        open={drill === "reiterados"}
        onClose={() => setDrill(null)}
        title="Hallazgos reiterados año a año"
        subtitle="Controles que reaparecen en auditorías sucesivas sin lograr remediación efectiva"
        fuente="Cross-match histórico FY23-FY26 sobre descripción y proceso del hallazgo"
        metrica={{ label: "patrones recurrentes detectados", value: String(seg.resumen.reiterados) }}
        description="Cuando un mismo hallazgo aparece en dos o más años consecutivos, indica que la remediación fue insuficiente o que el control de fondo no se implementó. Es uno de los KPIs más sensibles que reporta auditoría interna al directorio."
        table={{
          headers: ["ID actual", "Proceso", "Severidad", "Reitera de"],
          rows: seg.reiteradosDetalle.map((h: any) => [
            h.id,
            h.proceso,
            h.severidad,
            h.hallazgoOrigenId,
          ]),
        }}
        notas={[
          "La cadena HAL-2023-005 → HAL-2024-018 → HAL-2025-022 (cuentas de ex-empleados activas) es el caso más grave: 3 años de reiteración sobre un control crítico de TI.",
          "Auditoría debe escalar a Gerencia General el patrón crónico de TI en próxima reunión de Comité.",
          "Best practice IIA: ningún hallazgo crítico debe reiterar más de 1 vez sin escalamiento al CEO.",
        ]}
      />

      <DrillDown
        open={drill === "cumplimiento"}
        onClose={() => setDrill(null)}
        title="Cumplimiento global del plan de acción"
        subtitle="% de hallazgos efectivamente cerrados sobre el universo histórico total"
        fuente="Cálculo automático sobre la planilla de seguimiento · FY23-FY26"
        metrica={{ label: "tasa de cierre acumulada", value: `${Math.round((seg.resumen.cerrados / seg.resumen.total) * 100)}%` }}
        description="Es el KPI principal con que el directorio mide al gerente de auditoría interna. Refleja la efectividad del proceso de remediación que sigue al ciclo de auditoría."
        rows={Object.entries(seg.porArea).sort((a: any, b: any) => a[1].cumplimientoPct - b[1].cumplimientoPct).map(([area, v]: any) => ({
          label: area,
          value: `${v.cumplimientoPct}%`,
          sub: `${v.cerrados} cerrados de ${v.total} totales · ${v.vencidos} vencidos`,
        }))}
        notas={[
          `Estándar IIA: objetivo >85% de cumplimiento global anual. ${BRANDING.firmName} está por debajo del umbral.`,
          "Gerencia Legal y Tecnología son las áreas con peor desempeño — concentrar la atención del Comité.",
          "Veritas detecta una correlación entre el % de vencidos y la sobrecarga del responsable: redistribuir compromisos podría mejorar la tasa.",
        ]}
      />
    </>
  );
}
