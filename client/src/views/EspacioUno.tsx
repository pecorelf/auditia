// Espacio 1 — Vista de archivos del cliente (cliente según pack activo)
// Muestra los 4 archivos cargados con previewable summary y un panel de hallazgos
// que el agente puede confirmar.

import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { BRANDING } from "../config/branding";
import { empleados, proveedores, ordenesCompra, facturas, buildPagosContext } from "../data/pagosProveedores";
import { CLP, num, fmtRUT, fmtDate } from "../lib/format";

type Archivo = "prov" | "oc" | "fact" | "emp";

const ARCHIVOS: { id: Archivo; nombre: string; descripcion: string; filas: number; periodo: string }[] = [
  { id: "prov", nombre: "01_Maestro_Proveedores.xlsx", descripcion: "Universo de proveedores activos e históricos", filas: proveedores.length, periodo: "Vigente al 26-may-2026" },
  { id: "oc",   nombre: "02_Ordenes_Compra_FY26.xlsx", descripcion: "OCs emitidas en el período", filas: ordenesCompra.length, periodo: "Ene 2025 – May 2026" },
  { id: "fact", nombre: "03_Facturas_Pagos_FY26.xlsx", descripcion: "Facturas registradas + pagos asociados", filas: facturas.length, periodo: "Ene 2025 – May 2026" },
  { id: "emp",  nombre: "04_Maestro_Empleados.xlsx", descripcion: "Maestro de personal con datos bancarios para nómina", filas: empleados.length, periodo: "Vigente al 26-may-2026" },
];

const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];

export function EspacioUno() {
  const [archivo, setArchivo] = useState<Archivo>("prov");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const ctx = buildPagosContext();

  // Cuando cambia el archivo activo, reset paginación
  const switchArchivo = (id: Archivo) => {
    setArchivo(id);
    setPage(0);
  };

  // Total de registros según archivo activo
  const totalFilas = useMemo(() => {
    if (archivo === "prov") return proveedores.length;
    if (archivo === "oc") return ordenesCompra.length;
    if (archivo === "fact") return facturas.length;
    return empleados.length;
  }, [archivo]);

  const totalPages = Math.max(1, Math.ceil(totalFilas / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const startIdx = safePage * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalFilas);

  // Slices paginados (memoizados para no recalcular en cada render)
  const sliceProv = useMemo(() => proveedores.slice(startIdx, endIdx), [startIdx, endIdx]);
  const sliceOC   = useMemo(() => ordenesCompra.slice(startIdx, endIdx), [startIdx, endIdx]);
  const sliceFact = useMemo(() => facturas.slice(startIdx, endIdx), [startIdx, endIdx]);
  const sliceEmp  = useMemo(() => empleados.slice(startIdx, endIdx), [startIdx, endIdx]);

  return (
    <>
      <Header
        eyebrow="Pagos a proveedores · engagement"
        title={BRANDING.firmName}
        subtitle={`Engagement Procure-to-Pay cruzado con Nómina · FY 2025-26 · ${BRANDING.sector}`}
        meta={[
          { label: "Sector", value: BRANDING.sector },
          { label: "Trabajadores", value: "2.500" },
          { label: "Sedes", value: "5 (Stgo · Val · Con · Anto · Tem)" },
          { label: "Proveedores activos", value: "1.200" },
          { label: "Archivos cargados", value: "4 / 4" },
        ]}
        cta={
          <div className="text-right">
            <div className="eyebrow">Período audit.</div>
            <div className="text-[15px] font-semibold tabular text-deloitte-ink">Ene 2025 – May 2026</div>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-6">
        {/* Estado del engagement */}
        <div className="card p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="eyebrow">Fase actual</div>
              <div className="text-[16px] font-semibold mt-0.5 text-deloitte-ink">Pruebas analíticas</div>
              <div className="text-[12px] text-deloitte-mute">Semana 3 de 6</div>
            </div>
            <div>
              <div className="eyebrow">Universo bajo análisis</div>
              <div className="text-[16px] font-semibold mt-0.5 tabular text-deloitte-ink">
                {CLP(facturas.reduce((a, f) => a + f.monto, 0))}
              </div>
              <div className="text-[12px] text-deloitte-mute">{num(facturas.length)} facturas</div>
            </div>
            <div>
              <div className="eyebrow">Hallazgos preliminares</div>
              <div className="text-[16px] font-semibold mt-0.5 text-risk-highTxt">
                {Object.values(ctx.hallazgos).filter((h: any) => h.severidad === "Crítica").reduce((a: number, h: any) => a + h.cantidad, 0)} críticos
              </div>
              <div className="text-[12px] text-deloitte-mute">Pendiente investigación</div>
            </div>
            <div>
              <div className="eyebrow">Estado data</div>
              <div className="text-[16px] font-semibold mt-0.5 text-deloitte-ink flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-risk-low" />
                AuditIA conectado
              </div>
              <div className="text-[12px] text-deloitte-mute">Los 4 archivos indexados</div>
            </div>
          </div>
        </div>

        {/* Selector de archivos */}
        <div>
          <div className="eyebrow mb-2">Archivos cargados</div>
          <div className="grid grid-cols-4 gap-3">
            {ARCHIVOS.map((a) => (
              <button
                key={a.id}
                onClick={() => switchArchivo(a.id)}
                className={`text-left p-4 card card-hover transition-all ${
                  archivo === a.id ? "border-deloitte-green ring-1 ring-deloitte-green/30" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-mono text-[11.5px] text-deloitte-mute uppercase tracking-wide">
                    .xlsx
                  </div>
                  <div className={`text-[11.5px] font-semibold ${archivo === a.id ? "text-deloitte-green" : "text-deloitte-mute"}`}>
                    {archivo === a.id ? "● ACTIVO" : ""}
                  </div>
                </div>
                <div className="text-[14px] font-semibold mt-2 text-deloitte-ink leading-tight">
                  {a.nombre}
                </div>
                <div className="text-[12px] text-deloitte-mute mt-1">{a.descripcion}</div>
                <div className="flex items-center gap-3 mt-3 text-[11.5px] uppercase tracking-wider">
                  <span className="text-deloitte-mute">
                    <span className="font-semibold tabular text-deloitte-ink">{num(a.filas)}</span> filas
                  </span>
                  <span className="text-deloitte-mute">{a.periodo}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview de archivo */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-deloitte-line bg-deloitte-paper/60 flex items-center justify-between">
            <div>
              <div className="eyebrow">Vista previa · primeras filas</div>
              <div className="text-[14px] font-semibold mt-0.5">{ARCHIVOS.find((a) => a.id === archivo)?.nombre}</div>
            </div>
            <div className="text-[11.5px] text-deloitte-mute italic">
              Pídele a AuditIA → análisis sobre el dataset completo
            </div>
          </div>
          <div className="overflow-x-auto tabla-scroll">
            {archivo === "prov" && (
              <table className="w-full text-[13px] tabular">
                <thead className="bg-deloitte-paper/40">
                  <tr>
                    {["ID","RUT","Razón Social","Categoría","Banco","Cuenta","Estado","Fecha alta"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-[11.5px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sliceProv.map((p) => (
                    <tr key={p.id} className="row-striped border-b border-deloitte-line/50">
                      <td className="px-3 py-1.5 font-mono text-[12px]">{p.id}</td>
                      <td className="px-3 py-1.5">{fmtRUT(p.rut)}</td>
                      <td className="px-3 py-1.5">{p.razonSocial}</td>
                      <td className="px-3 py-1.5">{p.categoria}</td>
                      <td className="px-3 py-1.5">{p.banco}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{p.cuentaBanco}</td>
                      <td className="px-3 py-1.5">
                        <span className={`pill ${p.estado === "Activo" ? "bg-green-100 text-risk-lowTxt" : p.estado === "Bloqueado" ? "bg-red-100 text-risk-highTxt" : "bg-gray-100 text-deloitte-mute"}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">{fmtDate(p.fechaAlta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {archivo === "oc" && (
              <table className="w-full text-[13px] tabular">
                <thead className="bg-deloitte-paper/40">
                  <tr>
                    {["ID OC","Fecha","Proveedor","Área","Monto","Aprobador","Estado"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-[11.5px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sliceOC.map((oc) => (
                    <tr key={oc.id} className="row-striped border-b border-deloitte-line/50">
                      <td className="px-3 py-1.5 font-mono text-[12px]">{oc.id}</td>
                      <td className="px-3 py-1.5">{fmtDate(oc.fecha)}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{oc.proveedorId}</td>
                      <td className="px-3 py-1.5">{oc.area}</td>
                      <td className="px-3 py-1.5 text-right">{CLP(oc.monto)}</td>
                      <td className="px-3 py-1.5">{oc.aprobador}</td>
                      <td className="px-3 py-1.5">
                        <span className={`pill ${oc.estado === "Aprobada" ? "bg-green-100 text-risk-lowTxt" : "bg-gray-100 text-deloitte-mute"}`}>
                          {oc.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {archivo === "fact" && (
              <table className="w-full text-[13px] tabular">
                <thead className="bg-deloitte-paper/40">
                  <tr>
                    {["ID Factura","Fecha","Proveedor","OC asociada","Monto","Estado","Fecha pago"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-[11.5px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sliceFact.map((f) => (
                    <tr key={f.id} className="row-striped border-b border-deloitte-line/50">
                      <td className="px-3 py-1.5 font-mono text-[12px]">{f.id}</td>
                      <td className="px-3 py-1.5">{fmtDate(f.fecha)}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{f.proveedorId}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">
                        {f.ocId || <span className="text-risk-highTxt italic">(sin OC)</span>}
                      </td>
                      <td className="px-3 py-1.5 text-right">{CLP(f.monto)}</td>
                      <td className="px-3 py-1.5">
                        <span className={`pill ${f.estado === "Pagada" ? "bg-green-100 text-risk-lowTxt" : f.estado === "Vencida" ? "bg-red-100 text-risk-highTxt" : "bg-amber-100 text-risk-medTxt"}`}>
                          {f.estado}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">{f.fechaPago ? fmtDate(f.fechaPago) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {archivo === "emp" && (
              <table className="w-full text-[13px] tabular">
                <thead className="bg-deloitte-paper/40">
                  <tr>
                    {["ID","RUT","Nombre","Área","Cargo","Banco","Cuenta","Ingreso"].map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-[11.5px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sliceEmp.map((e) => (
                    <tr key={e.id} className="row-striped border-b border-deloitte-line/50">
                      <td className="px-3 py-1.5 font-mono text-[12px]">{e.id}</td>
                      <td className="px-3 py-1.5">{fmtRUT(e.rut)}</td>
                      <td className="px-3 py-1.5">{e.nombre}</td>
                      <td className="px-3 py-1.5">{e.area}</td>
                      <td className="px-3 py-1.5">{e.cargo}</td>
                      <td className="px-3 py-1.5">{e.banco}</td>
                      <td className="px-3 py-1.5 font-mono text-[12px]">{e.cuentaBanco}</td>
                      <td className="px-3 py-1.5">{fmtDate(e.fechaIngreso)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-4 py-3 border-t border-deloitte-line bg-deloitte-paper/40 flex items-center justify-between flex-wrap gap-3">
            <div className="text-[12px] text-deloitte-slate">
              Mostrando <span className="font-semibold tabular text-deloitte-ink">{num(startIdx + 1)}–{num(endIdx)}</span>
              {" "}de <span className="font-semibold tabular text-deloitte-ink">{num(totalFilas)}</span> registros
              <span className="text-deloitte-mute"> · AuditIA analiza el dataset completo, no solo lo visible</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11.5px] uppercase tracking-wider text-deloitte-mute">Filas:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="text-[12px] border border-deloitte-line rounded px-2 py-1 bg-white hover:border-deloitte-green focus:border-deloitte-green focus:outline-none tabular"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={safePage === 0}
                  className="px-2 py-1 text-[13px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed hit-target" aria-label="Primera página"
                  title="Primera página"
                >«</button>
                <button
                  onClick={() => setPage(Math.max(0, safePage - 1))}
                  disabled={safePage === 0}
                  className="px-2 py-1 text-[13px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed hit-target" aria-label="Página anterior"
                  title="Anterior"
                >‹</button>
                <span className="text-[12px] tabular px-2 text-deloitte-slate">
                  Pág. <span className="font-semibold text-deloitte-ink">{safePage + 1}</span> / {num(totalPages)}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="px-2 py-1 text-[13px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed hit-target" aria-label="Página siguiente"
                  title="Siguiente"
                >›</button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={safePage >= totalPages - 1}
                  className="px-2 py-1 text-[13px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed hit-target" aria-label="Última página"
                  title="Última página"
                >»</button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de orientación */}
        <div className="border-l-2 border-deloitte-green pl-4 py-1">
          <div className="text-[13px] text-deloitte-slate leading-relaxed">
            <span className="font-semibold">El flujo del auditor:</span> en lugar de exportar a Excel y armar
            tablas dinámicas durante 3 días, pregúntale a AuditIA directamente. AuditIA tiene los 4 archivos
            indexados y puede correr cruces, agregaciones y detecciones de patrones al vuelo.
          </div>
        </div>
      </div>
    </>
  );
}
