// Gastos, Rendiciones y Traslados — cliente e industria según el pack activo
// Cliente e industria vienen del pack activo

import { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { BRANDING } from "../config/branding";
import {
  vehiculos, personas, viajes, cargasCombustible, viaticos,
  serviciosExternos, faenas, multas, detectarHallazgos,
} from "../data/flotaViajes";
import { CLP, num, fmtDate } from "../lib/format";

type Fuente = "vehiculos" | "personas" | "viajes" | "combustible" | "viaticos" | "servicios" | "faenas" | "multas";

const FUENTES: { id: Fuente; nombre: string; descripcion: string; tipo: string; filas: number; icono: string }[] = [
  { id: "vehiculos",   nombre: "Maestro_Flota_Vehiculos.xlsx",           descripcion: "80 vehículos de apoyo: camionetas, vans y buses de relevo",  tipo: "Excel · estructurado", filas: vehiculos.length, icono: "🚗" },
  { id: "personas",    nombre: "Personal_Operativo.xlsx",                descripcion: "Dotación, choferes y supervisores por base",              tipo: "Excel · estructurado", filas: personas.length, icono: "👥" },
  { id: "viajes",      nombre: "Viajes_GPS_FY26.xlsx",                   descripcion: "Distancia y tiempo declarado vs. GPS real",                 tipo: "API GPS · estructurado", filas: viajes.length, icono: "🛰️" },
  { id: "combustible", nombre: "Cargas_Combustible.xlsx",                descripcion: "Litros, monto, nivel de estanque antes/después",           tipo: "Excel · estructurado", filas: cargasCombustible.length, icono: "⛽" },
  { id: "viaticos",    nombre: "Rendiciones_Viaticos.pdf",               descripcion: "Alojamiento, alimentación, movilización, anticipos",       tipo: "PDF + Excel · mixto", filas: viaticos.length, icono: "🧾" },
  { id: "servicios",   nombre: "Uber_Cabify_Facturas.pdf",               descripcion: "Servicios externos de transporte (Uber, Cabify, taxi)",    tipo: "PDF · NO estructurado", filas: serviciosExternos.length, icono: "🚕" },
  { id: "faenas",  nombre: "Faenas_Asignadas.xlsx",           descripcion: "Faenas asignadas, cuadrilla, costo y cierre en bitácora",       tipo: "Excel · estructurado", filas: faenas.length, icono: "⚓" },
  { id: "multas",      nombre: "Multas_Transito.pdf",                    descripcion: "Multas de tránsito por vehículo y chofer",                  tipo: "PDF · NO estructurado", filas: multas.length, icono: "🚨" },
];

const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];
const personaById = new Map(personas.map((p) => [p.id, p]));
const vehiculoById = new Map(vehiculos.map((v) => [v.id, v]));

export function EspacioCinco() {
  const [fuente, setFuente] = useState<Fuente>("viajes");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const hallazgos = useMemo(() => detectarHallazgos(), []);

  const switchFuente = (id: Fuente) => { setFuente(id); setPage(0); };

  const totalFilas = useMemo(() => {
    return { vehiculos: vehiculos.length, personas: personas.length, viajes: viajes.length, combustible: cargasCombustible.length, viaticos: viaticos.length, servicios: serviciosExternos.length, faenas: faenas.length, multas: multas.length }[fuente];
  }, [fuente]);

  const totalPages = Math.max(1, Math.ceil(totalFilas / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const startIdx = safePage * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalFilas);

  const totalCriticos =
    hallazgos.velocidadesImposibles.cantidad +
    hallazgos.cargasExceso.cantidad +
    hallazgos.descargasSospechosas.cantidad +
    hallazgos.boletasDuplicadas.cantidad +
    hallazgos.viaticosSinViaje.cantidad +
    hallazgos.dobleEquipo.cantidad;

  const gastoTotalFlota =
    cargasCombustible.reduce((a, c) => a + c.montoTotal, 0) +
    viaticos.reduce((a, v) => a + v.monto, 0) +
    serviciosExternos.reduce((a, s) => a + s.monto, 0);

  return (
    <>
      <Header
        eyebrow="Espacio 04 · Gastos, Rendiciones y Traslados"
        title={BRANDING.firmName}
        subtitle="Auditoría continua del gasto operativo en traslados y rendiciones · flota de apoyo + viáticos de relevo + servicios externos, con cruce de GPS y bitácora de faenas"
        meta={[
          { label: "Bases operativas", value: `5 sedes` },
          { label: "Flota total", value: `${vehiculos.length} vehículos` },
          { label: "Personal operativo", value: `${personas.length}` },
          { label: "Viajes analizados", value: num(viajes.length) },
          { label: "Gasto período", value: CLP(gastoTotalFlota) },
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
              <div className="text-[15px] font-semibold mt-0.5 text-deloitte-ink">50 / {num(viajes.length)}</div>
              <div className="text-[11px] text-deloitte-mute">muestra vs <span className="font-semibold text-deloitte-green">100% cruzado</span></div>
            </div>
            <div>
              <div className="eyebrow">Fuentes cruzadas</div>
              <div className="text-[15px] font-semibold mt-0.5 tabular text-deloitte-ink">8</div>
              <div className="text-[11px] text-deloitte-mute">estructuradas + NO estructuradas</div>
            </div>
            <div>
              <div className="eyebrow">Hallazgos críticos</div>
              <div className="text-[15px] font-semibold mt-0.5 text-risk-high">{totalCriticos} casos</div>
              <div className="text-[11px] text-deloitte-mute">de fraude o desviación</div>
            </div>
            <div>
              <div className="eyebrow">Impacto detectado</div>
              <div className="text-[15px] font-semibold mt-0.5 tabular text-risk-high">
                {CLP(
                  hallazgos.cargasExceso.montoTotal +
                  hallazgos.descargasSospechosas.montoEstimado +
                  hallazgos.viaticosSinViaje.montoTotal +
                  hallazgos.boletasDuplicadas.montoTotal +
                  hallazgos.dobleEquipo.montoDuplicado +
                  hallazgos.faenasSinBitacora.montoTotal
                )}
              </div>
              <div className="text-[11px] text-deloitte-mute">recuperable o mitigable</div>
            </div>
            <div>
              <div className="eyebrow">Faenas</div>
              <div className="text-[15px] font-semibold mt-0.5 tabular text-deloitte-ink">{faenas.length}</div>
              <div className="text-[11px] text-deloitte-mute">{hallazgos.faenasSinBitacora.cantidad} sin bitácora</div>
            </div>
          </div>
        </div>

        {/* Selector de fuentes */}
        <div>
          <div className="eyebrow mb-2">Fuentes conectadas · datos estructurados + NO estructurados</div>
          <div className="grid grid-cols-4 gap-3">
            {FUENTES.map((a) => (
              <button
                key={a.id}
                onClick={() => switchFuente(a.id)}
                className={`text-left p-3 card card-hover transition-all ${
                  fuente === a.id ? "border-deloitte-green ring-1 ring-deloitte-green/30" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="text-[18px]">{a.icono}</div>
                  <div className={`text-[9px] font-semibold ${fuente === a.id ? "text-deloitte-green" : "text-deloitte-mute"}`}>
                    {fuente === a.id ? "● ACTIVA" : ""}
                  </div>
                </div>
                <div className="text-[12px] font-semibold mt-1 text-deloitte-ink leading-tight">
                  {a.nombre}
                </div>
                <div className="text-[10px] text-deloitte-mute mt-1 leading-tight">{a.descripcion}</div>
                <div className="mt-2 flex items-center gap-2 text-[9px] uppercase tracking-wider">
                  <span className="font-bold tabular text-deloitte-ink">{num(a.filas)}</span>
                  <span className="text-deloitte-mute">filas</span>
                </div>
                <div className="text-[9px] text-deloitte-greenDark mt-0.5 font-mono uppercase">{a.tipo}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview de la fuente activa */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-deloitte-line bg-deloitte-paper/60 flex items-center justify-between">
            <div>
              <div className="eyebrow">Vista previa · fuente activa</div>
              <div className="text-[13px] font-semibold mt-0.5">{FUENTES.find((a) => a.id === fuente)?.nombre}</div>
            </div>
            <div className="text-[10px] text-deloitte-mute italic">
              Pídele a AuditIA → cruces entre GPS, viáticos y faenas
            </div>
          </div>
          <div className="overflow-x-auto">
            {fuente === "vehiculos" && <TablaVehiculos slice={vehiculos.slice(startIdx, endIdx)} />}
            {fuente === "personas" && <TablaPersonas slice={personas.slice(startIdx, endIdx)} />}
            {fuente === "viajes" && <TablaViajes slice={viajes.slice(startIdx, endIdx)} />}
            {fuente === "combustible" && <TablaCombustible slice={cargasCombustible.slice(startIdx, endIdx)} />}
            {fuente === "viaticos" && <TablaViaticos slice={viaticos.slice(startIdx, endIdx)} />}
            {fuente === "servicios" && <TablaServicios slice={serviciosExternos.slice(startIdx, endIdx)} />}
            {fuente === "faenas" && <TablaFaenas slice={faenas.slice(startIdx, endIdx)} />}
            {fuente === "multas" && <TablaMultas slice={multas.slice(startIdx, endIdx)} />}
          </div>

          {/* Paginación */}
          <div className="px-4 py-3 border-t border-deloitte-line bg-deloitte-paper/40 flex items-center justify-between flex-wrap gap-3">
            <div className="text-[11px] text-deloitte-slate">
              Mostrando <span className="font-semibold tabular text-deloitte-ink">{num(startIdx + 1)}–{num(endIdx)}</span>
              {" "}de <span className="font-semibold tabular text-deloitte-ink">{num(totalFilas)}</span> registros
              <span className="text-deloitte-mute"> · AuditIA analiza el universo completo</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-wider text-deloitte-mute">Filas:</label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }} className="text-[11px] border border-deloitte-line rounded px-2 py-1 bg-white hover:border-deloitte-green focus:border-deloitte-green focus:outline-none tabular">
                {PAGE_SIZE_OPTIONS.map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => setPage(0)} disabled={safePage === 0} className="px-2 py-1 text-[12px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">«</button>
                <button onClick={() => setPage(Math.max(0, safePage - 1))} disabled={safePage === 0} className="px-2 py-1 text-[12px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">‹</button>
                <span className="text-[11px] tabular px-2 text-deloitte-slate">
                  Pág. <span className="font-semibold text-deloitte-ink">{safePage + 1}</span> / {num(totalPages)}
                </span>
                <button onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))} disabled={safePage >= totalPages - 1} className="px-2 py-1 text-[12px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">›</button>
                <button onClick={() => setPage(totalPages - 1)} disabled={safePage >= totalPages - 1} className="px-2 py-1 text-[12px] border border-deloitte-line rounded hover:border-deloitte-green hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">»</button>
              </div>
            </div>
          </div>
        </div>

        {/* Hallazgos */}
        <div>
          <div className="eyebrow mb-2">Hallazgos detectados · cruce automático sobre el 100% del universo</div>
          <div className="grid grid-cols-2 gap-3">
            <HallazgoCard
              severidad="critica"
              titulo="Velocidades imposibles en rendición de tiempo"
              cantidad={hallazgos.velocidadesImposibles.cantidad}
              unidad="viajes"
              descripcion={
                hallazgos.velocidadesImposibles.ejemplos[0]
                  ? `Ej: viaje San Antonio–${hallazgos.velocidadesImposibles.ejemplos[0].ruta.split(" → ")[1]}, chofer rindió ${hallazgos.velocidadesImposibles.ejemplos[0].tiempoDeclarado}h para ${hallazgos.velocidadesImposibles.ejemplos[0].distancia}km → ${hallazgos.velocidadesImposibles.ejemplos[0].velocidadCalculada} km/h promedio. Imposible. GPS registra ${hallazgos.velocidadesImposibles.ejemplos[0].tiempoGPS}h reales.`
                  : "Rendiciones donde el tiempo declarado no cierra con la distancia."
              }
              normativa="Rendición de viáticos por tiempo · fraude de terceros"
              recomendacion="Cruzar con GPS para todos los viajes >100km ANTES de aprobar la rendición. Bloquear pagos automáticos que superen el rango razonable. Auditar los 6 casos e identificar si el patrón se concentra en un unidad o base específica."
            />

            <HallazgoCard
              severidad="critica"
              titulo="Cargas de combustible sobre capacidad del estanque"
              cantidad={hallazgos.cargasExceso.cantidad}
              unidad="cargas"
              descripcion={`Cargas registradas que exceden 105-140% de la capacidad física del vehículo. Imposible físicamente. Fraude en boleta de combustible por CLP ${hallazgos.cargasExceso.montoTotal.toLocaleString()}.`}
              normativa="Rendición de combustible · fraude documental"
              recomendacion="Bloquear en el sistema toda carga que exceda la capacidad del estanque (dato del maestro de vehículos). Solicitar boletas originales de los 12 casos y validar con la estación. Establecer regla automática: monto/precio-litro debe dar litros ≤ capacidad."
            />

            <HallazgoCard
              severidad="critica"
              titulo="Descargas sospechosas de combustible (patrón de robo)"
              cantidad={hallazgos.descargasSospechosas.cantidad}
              unidad="casos"
              descripcion={`Patrón detectado: chofer carga tanque casi lleno pero el nivel post-carga no supera el 60%. La bencina cargada 'desaparece' antes de terminar la carga. Impacto estimado: CLP ${hallazgos.descargasSospechosas.montoEstimado.toLocaleString()}.`}
              normativa="Fraude interno · pérdida operacional"
              recomendacion="Investigar en terreno los 8 casos con sensor GPS. Instalar sensores de nivel de estanque en tiempo real para móviles de transmisión y camionetas. Cotejar los casos contra las estaciones específicas — podría ser complicidad con el estacionero."
            />

            <HallazgoCard
              severidad="alta"
              titulo="Excesos de velocidad > 150 km/h"
              cantidad={hallazgos.excesosVelocidad.cantidad}
              unidad="viajes"
              descripcion={`Vehículos de ${BRANDING.firmName} registrados por GPS a velocidades peligrosas. Máxima detectada: ${hallazgos.excesosVelocidad.max} km/h. Riesgo laboral, reputacional y de responsabilidad civil.`}
              normativa="Ley de Tránsito · Ley 20.393 (responsabilidad de la empresa)"
              recomendacion="Notificar a los 34 conductores individualmente. Implementar límite electrónico en la flota (governor). Reportar patrón agregado a Gerencia de Operaciones. Incluir cláusula de descuento por multa en política de flota."
            />

            <HallazgoCard
              severidad="critica"
              titulo="Viáticos rendidos sin viaje registrado"
              cantidad={hallazgos.viaticosSinViaje.cantidad}
              unidad="rendiciones"
              descripcion={`Alojamientos en ciudades distantes rendidos por personas cuyos vehículos NO salieron de su base ese día según GPS. Impacto CLP ${hallazgos.viaticosSinViaje.montoTotal.toLocaleString()}.`}
              normativa="Fraude en rendición · política interna de viáticos"
              recomendacion="Recuperar los montos rendidos indebidamente y aplicar procedimiento disciplinario. Modificar el sistema de rendición para exigir viaje GPS asociado como condición para aprobar viáticos > CLP 50k. Notificar a Gerencia de Recursos Humanos y Compliance."
            />

            <HallazgoCard
              severidad="critica"
              titulo="Boletas duplicadas en rendiciones"
              cantidad={hallazgos.boletasDuplicadas.cantidad}
              unidad="registros"
              descripcion={`Misma boleta ID rendida por 2 personas o por la misma persona en fechas distintas. Sobrepago detectado: CLP ${hallazgos.boletasDuplicadas.montoTotal.toLocaleString()}.`}
              normativa="Fraude documental · Código Penal Art. 468"
              recomendacion="Auditoría forense inmediata sobre los 7 pares. Reforzar sistema de rendición con validación única de N° de boleta. Considerar denuncia interna si patrón se repite en las mismas personas."
            />

            <HallazgoCard
              severidad="alta"
              titulo="Anticipos de viáticos no rendidos > 60 días"
              cantidad={hallazgos.anticiposViejos.cantidad}
              unidad="anticipos"
              descripcion={`Personas con anticipo pendiente de rendir hace más de 60 días. Deuda acumulada: CLP ${hallazgos.anticiposViejos.montoTotal.toLocaleString()}. Riesgo de irrecuperabilidad y de reclasificación tributaria.`}
              normativa="SII · gastos rechazados por falta de documentación"
              recomendacion="Descontar por planilla los anticipos con >90 días vencidos. Suspender nuevos anticipos para personas con pendientes previos. Reportar mensualmente a Gerencia de Administración y Finanzas."
            />

            <HallazgoCard
              severidad="alta"
              titulo="Doble equipo enviado al mismo evento"
              cantidad={hallazgos.dobleEquipo.cantidad}
              unidad="eventos"
              descripcion={`Faenas duplicadas por descoordinación entre unidades (Operaciones Valparaíso + Operaciones Mejillones fueron al mismo lugar mismo día). Costo duplicado: CLP ${hallazgos.dobleEquipo.montoDuplicado.toLocaleString()}.`}
              normativa="Ineficiencia operativa · sobrecosto evitable"
              recomendacion="Implementar calendario único de faenas visible por todas las unidades. Reglas de coordinación operativa obligatoria para eventos de alto costo. Reportar al Comité de Operaciones como riesgo operativo recurrente."
            />

            <HallazgoCard
              severidad="alta"
              titulo="Faenas sin confirmación en bitácora"
              cantidad={hallazgos.faenasSinBitacora.cantidad}
              unidad="faenas"
              descripcion={`Faenas con costo ejecutado > CLP 2M sin maniobra registrada en bitácora. Gasto de CLP ${hallazgos.faenasSinBitacora.montoTotal.toLocaleString()} sin respaldo operativo.`}
              normativa="Política de asignación de faenas · presupuesto operativo"
              recomendacion="Revisar el proceso de asignación y cierre de faena para costos > CLP 2M. Exigir cierre de bitácora firmado por el patrón antes de liquidar la faena. Reportar los 11 casos a Gerencia de Operaciones para análisis de causa."
            />

            <HallazgoCard
              severidad="media"
              titulo="Uso excesivo de servicios premium (Uber Black)"
              cantidad={hallazgos.usoPremiumExcesivo.cantidad}
              unidad="personas"
              descripcion={`Personas con ≥8 usos de Uber Black o Cabify Premium en 6 meses. Gasto total: CLP ${hallazgos.usoPremiumExcesivo.montoTotal.toLocaleString()}. Contraviene política de servicios estándar salvo excepción justificada.`}
              normativa="Política interna de servicios de transporte"
              recomendacion="Bloquear la categoría premium en la aplicación corporativa salvo autorización previa del supervisor. Notificar individualmente a las 4 personas identificadas. Publicar recordatorio de política."
            />

            <HallazgoCard
              severidad="media"
              titulo="Uso de vehículos fuera de horario laboral"
              cantidad={hallazgos.usoFinSemana.cantidad}
              unidad="viajes"
              descripcion="Vehículos de flota registrados por GPS activos en fin de semana sin faena programada asociada. Posible uso personal."
              normativa="Política de flota · uso personal como beneficio en especie tributable"
              recomendacion="Enviar reporte a los conductores solicitando justificación. Los usos no justificados quedan como rentas en especie según SII. Considerar geo-fencing durante fines de semana no operativos."
            />

            <HallazgoCard
              severidad="media"
              titulo="Multas de tránsito no reembolsadas por el chofer"
              cantidad={hallazgos.multasNoReembolsadas.cantidad}
              unidad="multas"
              descripcion={`Multas pagadas por ${BRANDING.firmName} que la política señala deberían ser reembolsadas por el chofer responsable. Total: ${hallazgos.multasNoReembolsadas.totalUTM.toFixed(1)} UTM.`}
              normativa="Política interna de flota"
              recomendacion="Descontar de próximo pago de sueldo. Modificar contrato para clarificar responsabilidad. Cruzar con conductores con más de 3 multas: podría ser criterio para retirar asignación de vehículo."
            />
          </div>
        </div>

        {/* Mensaje educativo */}
        <div className="border-l-2 border-deloitte-green pl-4 py-1">
          <div className="text-[12px] text-deloitte-slate leading-relaxed">
            <span className="font-semibold">El gancho narrativo:</span> este espacio NO es una auditoría anual —
            es <strong>monitoreo continuo</strong> que el propio Gerente de Flota puede consultar cada semana.
            La auditoría interna revisa las alertas escaladas, pero el negocio se hace cargo del control diario.
            AuditIA cruza 8 fuentes distintas (GPS, combustible, rendiciones, faenas, servicios externos)
            y encuentra patrones que ningún muestreo detectaría. <strong>El equipo de Camilo se libera
            de la carga operativa y puede enfocarse en riesgo estratégico.</strong>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tablas por fuente
// ─────────────────────────────────────────────────────────────────────

function TablaVehiculos({ slice }: { slice: typeof vehiculos }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","Patente","Tipo","Marca","Modelo","Año","Capacidad L","Rend km/L","Base","Estado","Asignado a"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((v) => (
          <tr key={v.id} className="row-striped border-b border-deloitte-line/50">
            <td className="px-2 py-1.5 font-mono text-[10px]">{v.id}</td>
            <td className="px-2 py-1.5 font-mono text-[10.5px] font-bold">{v.patente}</td>
            <td className="px-2 py-1.5">{v.tipo}</td>
            <td className="px-2 py-1.5">{v.marca}</td>
            <td className="px-2 py-1.5">{v.modelo}</td>
            <td className="px-2 py-1.5 text-center">{v.anio}</td>
            <td className="px-2 py-1.5 text-right">{v.capacidadEstanqueLitros}</td>
            <td className="px-2 py-1.5 text-right">{v.rendimientoKmPorLitro}</td>
            <td className="px-2 py-1.5">{v.base}</td>
            <td className="px-2 py-1.5">
              <span className={`pill ${v.estado === "Activo" ? "bg-green-100 text-risk-low" : v.estado === "Mantención" ? "bg-amber-100 text-risk-med" : "bg-red-100 text-risk-high"}`}>{v.estado}</span>
            </td>
            <td className="px-2 py-1.5 text-[10px]">{v.asignadoA ? personaById.get(v.asignadoA)?.nombre : <span className="text-deloitte-mute italic">Pool</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaPersonas({ slice }: { slice: typeof personas }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","RUT","Nombre","Cargo","Unidad","Base"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((p) => (
          <tr key={p.id} className="row-striped border-b border-deloitte-line/50">
            <td className="px-2 py-1.5 font-mono text-[10px]">{p.id}</td>
            <td className="px-2 py-1.5 text-[10.5px]">{p.rut}</td>
            <td className="px-2 py-1.5 font-medium">{p.nombre}</td>
            <td className="px-2 py-1.5">{p.cargo}</td>
            <td className="px-2 py-1.5 text-[10.5px]">{p.unidad}</td>
            <td className="px-2 py-1.5">{p.base}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaViajes({ slice }: { slice: typeof viajes }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","Vehículo","Chofer","Fecha","Ruta","km declarado","km GPS","h declaradas","h GPS","Vel. calc.","Vel. máx GPS","F.semana"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((v) => {
          const anomVeloc = v.velocidadPromedioCalculadaKmH > 200;
          const anomExceso = v.velocidadMaximaGPS > 150;
          return (
            <tr key={v.id} className={`row-striped border-b border-deloitte-line/50 ${anomVeloc || anomExceso ? "bg-red-50/50" : ""}`}>
              <td className="px-2 py-1.5 font-mono text-[10px]">{v.id}</td>
              <td className="px-2 py-1.5 font-mono text-[10px]">{vehiculoById.get(v.vehiculoId)?.patente}</td>
              <td className="px-2 py-1.5 text-[10.5px]">{personaById.get(v.choferId)?.nombre.split(" ")[0]} {personaById.get(v.choferId)?.nombre.split(" ")[1]}</td>
              <td className="px-2 py-1.5 text-[10px]">{v.fechaInicio.slice(0, 10)}</td>
              <td className="px-2 py-1.5 text-[10.5px]">{v.origen} → {v.destino}</td>
              <td className="px-2 py-1.5 text-right">{v.distanciaDeclaradaKm}</td>
              <td className="px-2 py-1.5 text-right text-deloitte-mute">{v.distanciaGPSKm}</td>
              <td className="px-2 py-1.5 text-right">{v.tiempoDeclaradoHoras}</td>
              <td className="px-2 py-1.5 text-right text-deloitte-mute">{v.tiempoGPSHoras}</td>
              <td className={`px-2 py-1.5 text-right ${anomVeloc ? "font-bold text-risk-high" : ""}`}>
                {v.velocidadPromedioCalculadaKmH}{anomVeloc && " ⚠"}
              </td>
              <td className={`px-2 py-1.5 text-right ${anomExceso ? "font-bold text-risk-high" : ""}`}>
                {v.velocidadMaximaGPS}{anomExceso && " ⚠"}
              </td>
              <td className="px-2 py-1.5 text-center">
                {v.fueraDeHorario ? <span className="pill bg-amber-100 text-risk-med">Sí</span> : <span className="text-deloitte-mute">—</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TablaCombustible({ slice }: { slice: typeof cargasCombustible }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","Vehículo","Fecha","Estación","Ciudad","Litros","Precio/L","Total","Nivel antes","Nivel después","Alerta"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((c) => {
          const v = vehiculoById.get(c.vehiculoId);
          const exceso = v ? c.litros > v.capacidadEstanqueLitros * 1.05 : false;
          const anomNivel = v && c.litros > v.capacidadEstanqueLitros * 0.75 && c.nivelEstanqueDespuesPct < 60;
          return (
            <tr key={c.id} className={`row-striped border-b border-deloitte-line/50 ${exceso || anomNivel ? "bg-red-50/50" : ""}`}>
              <td className="px-2 py-1.5 font-mono text-[10px]">{c.id}</td>
              <td className="px-2 py-1.5 font-mono text-[10px]">{v?.patente} <span className="text-deloitte-mute">({v?.capacidadEstanqueLitros}L)</span></td>
              <td className="px-2 py-1.5 text-[10px]">{c.fecha}</td>
              <td className="px-2 py-1.5">{c.estacion}</td>
              <td className="px-2 py-1.5 text-[10.5px]">{c.ciudad}</td>
              <td className={`px-2 py-1.5 text-right ${exceso ? "font-bold text-risk-high" : ""}`}>{c.litros}{exceso && " ⚠"}</td>
              <td className="px-2 py-1.5 text-right">{CLP(c.precioLitro)}</td>
              <td className="px-2 py-1.5 text-right font-semibold">{CLP(c.montoTotal)}</td>
              <td className="px-2 py-1.5 text-right">{c.nivelEstanqueAntesPct}%</td>
              <td className={`px-2 py-1.5 text-right ${anomNivel ? "font-bold text-risk-high" : ""}`}>
                {c.nivelEstanqueDespuesPct}%{anomNivel && " ⚠"}
              </td>
              <td className="px-2 py-1.5">
                {exceso && <span className="pill bg-red-100 text-risk-high text-[9px]">Exceso</span>}
                {anomNivel && <span className="pill bg-red-100 text-risk-high text-[9px]">Descarga</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TablaViaticos({ slice }: { slice: typeof viaticos }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","Persona","Fecha viaje","Ciudad","Concepto","Monto","Estado","Fecha rendición","Boleta"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((v) => {
          const NOW = new Date("2026-05-26T13:00:00");
          const dias = v.concepto === "Anticipo" && v.estado === "Anticipo pendiente"
            ? (NOW.getTime() - new Date(v.fechaViaje).getTime()) / 86400000 : 0;
          const anom = dias > 60;
          return (
            <tr key={v.id} className={`row-striped border-b border-deloitte-line/50 ${anom ? "bg-amber-50/60" : ""}`}>
              <td className="px-2 py-1.5 font-mono text-[10px]">{v.id}</td>
              <td className="px-2 py-1.5 text-[10.5px]">{personaById.get(v.personaId)?.nombre}</td>
              <td className="px-2 py-1.5 text-[10px]">{v.fechaViaje}</td>
              <td className="px-2 py-1.5">{v.ciudad}</td>
              <td className="px-2 py-1.5">{v.concepto}</td>
              <td className="px-2 py-1.5 text-right font-semibold">{CLP(v.monto)}</td>
              <td className="px-2 py-1.5">
                <span className={`pill ${v.estado === "Rendido" ? "bg-green-100 text-risk-low" : v.estado === "Anticipo pendiente" ? "bg-amber-100 text-risk-med" : "bg-red-100 text-risk-high"}`}>
                  {v.estado}{anom && " ⚠"}
                </span>
              </td>
              <td className="px-2 py-1.5 text-[10px]">{v.fechaRendicion || <span className="text-deloitte-mute italic">—</span>}</td>
              <td className="px-2 py-1.5 font-mono text-[10px]">{v.boletaId}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TablaServicios({ slice }: { slice: typeof serviciosExternos }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","Persona","Fecha","Proveedor","Categoría","Ciudad","Ruta","Monto"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((s) => (
          <tr key={s.id} className={`row-striped border-b border-deloitte-line/50 ${s.categoria === "Premium" ? "bg-amber-50/30" : ""}`}>
            <td className="px-2 py-1.5 font-mono text-[10px]">{s.id}</td>
            <td className="px-2 py-1.5 text-[10.5px]">{personaById.get(s.personaId)?.nombre}</td>
            <td className="px-2 py-1.5 text-[10px]">{s.fecha}</td>
            <td className="px-2 py-1.5 font-medium">{s.proveedor}</td>
            <td className="px-2 py-1.5">
              <span className={`pill ${s.categoria === "Premium" ? "bg-amber-100 text-risk-med" : "bg-gray-100 text-deloitte-mute"}`}>{s.categoria}</span>
            </td>
            <td className="px-2 py-1.5">{s.ciudad}</td>
            <td className="px-2 py-1.5 text-[10px]">{s.origen} → {s.destino}</td>
            <td className="px-2 py-1.5 text-right font-semibold">{CLP(s.monto)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablaFaenas({ slice }: { slice: typeof faenas }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","Fecha","Evento","Ubicación","Unidad","Equipo","Presupuesto","Ejecutado","En bitácora","Min. faena"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((c) => {
          const anomAire = !c.confirmadaEnBitacora && c.costoEjecutadoCLP > 2_000_000;
          const anomSobre = c.costoEjecutadoCLP > c.presupuestoCLP * 1.15;
          return (
            <tr key={c.id} className={`row-striped border-b border-deloitte-line/50 ${anomAire ? "bg-red-50/40" : ""}`}>
              <td className="px-2 py-1.5 font-mono text-[10px]">{c.id}</td>
              <td className="px-2 py-1.5 text-[10px]">{c.fecha}</td>
              <td className="px-2 py-1.5 text-[10.5px]">{c.evento}</td>
              <td className="px-2 py-1.5">{c.ubicacion}</td>
              <td className="px-2 py-1.5 text-[10.5px]">{c.unidad}</td>
              <td className="px-2 py-1.5 text-center">{c.equipoAsignado.length}</td>
              <td className="px-2 py-1.5 text-right">{CLP(c.presupuestoCLP)}</td>
              <td className={`px-2 py-1.5 text-right font-semibold ${anomSobre ? "text-risk-med" : ""}`}>{CLP(c.costoEjecutadoCLP)}</td>
              <td className="px-2 py-1.5">
                {c.confirmadaEnBitacora
                  ? <span className="pill bg-green-100 text-risk-low">Sí</span>
                  : <span className={`pill ${anomAire ? "bg-red-100 text-risk-high" : "bg-amber-100 text-risk-med"}`}>No{anomAire && " ⚠"}</span>}
              </td>
              <td className="px-2 py-1.5 text-right">{c.minutosEmitidos > 0 ? c.minutosEmitidos + " min" : "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function TablaMultas({ slice }: { slice: typeof multas }) {
  return (
    <table className="w-full text-[11.5px] tabular">
      <thead className="bg-deloitte-paper/40">
        <tr>{["ID","Vehículo","Chofer","Fecha","Ubicación","Causa","UTM","Reembolsada"].map((h) => (
          <th key={h} className="text-left px-2 py-2 font-semibold text-[10px] uppercase tracking-wider text-deloitte-mute border-b border-deloitte-line whitespace-nowrap">{h}</th>
        ))}</tr>
      </thead>
      <tbody>
        {slice.map((m) => (
          <tr key={m.id} className={`row-striped border-b border-deloitte-line/50 ${!m.reembolsadaPorChofer ? "bg-amber-50/30" : ""}`}>
            <td className="px-2 py-1.5 font-mono text-[10px]">{m.id}</td>
            <td className="px-2 py-1.5 font-mono text-[10px]">{vehiculoById.get(m.vehiculoId)?.patente}</td>
            <td className="px-2 py-1.5 text-[10.5px]">{personaById.get(m.choferId)?.nombre}</td>
            <td className="px-2 py-1.5 text-[10px]">{m.fecha}</td>
            <td className="px-2 py-1.5">{m.ubicacion}</td>
            <td className="px-2 py-1.5">{m.causa}</td>
            <td className="px-2 py-1.5 text-right font-semibold">{m.montoUTM.toFixed(1)}</td>
            <td className="px-2 py-1.5">
              {m.reembolsadaPorChofer
                ? <span className="pill bg-green-100 text-risk-low">Sí</span>
                : <span className="pill bg-amber-100 text-risk-med">Pendiente</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────
// HallazgoCard
// ─────────────────────────────────────────────────────────────────────
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
