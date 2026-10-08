// Riesgos transversales de Tesorería.
//
// Dos bloques de naturaleza distinta, y la diferencia se dice en pantalla:
//   · Seguridad de plataformas de pago → hallazgos sobre eventos de seguridad
//   · Liquidez operativa → proyección de caja, NO hallazgos
//
// Lo que une a los dos: la recaudación se concentra en pocos días al mes. Un
// ataque que deje la plataforma de pago fuera durante esa ventana es
// exactamente lo que produce el evento de liquidez. Por eso van juntos.

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import { RefPapel } from "./RefPapel";
import { Icono } from "./Iconos";
import {
  detectarSeguridad, proyeccion, cruceDelPiso, PISO_OPERATIVO_CLP,
  diasDeCobertura, SUPUESTO_ADVERSO,
} from "../data/seguridadLiquidezTGR";
import { CLP, num } from "../lib/format";

// Par validado contra las seis verificaciones de contraste y daltonismo.
const AZUL = "#2563EB";   // proyección base
const AMBAR = "#B45309";  // escenario adverso

const milesDeMillones = (n: number) => `${Math.round(n / 1_000_000_000)}`;

export function RiesgosTransversales() {
  const s = detectarSeguridad();
  const cruce = s.accesosFueraDeHorario.coincidenConLaCadena;

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow">Riesgos transversales</div>
        <p className="text-[12.5px] text-deloitte-mute mt-1 max-w-3xl leading-relaxed font-light">
          Los otros dos riesgos del mapa. No se detectan cruzando transacciones, así que van
          en módulos propios: seguridad sí entrega hallazgos, sobre eventos de plataforma;
          liquidez es una proyección, no un hallazgo, y se presenta como tal.
        </p>
      </div>

      {/* ── A. SEGURIDAD DE PLATAFORMAS DE PAGO ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icono nombre="riesgo" size={16} className="text-deloitte-slate" />
          <h3 className="text-[14px] font-semibold text-deloitte-ink">Ciberataques a plataformas de pago</h3>
        </div>

        {/* El cruce con la cadena — lo que justifica que el módulo exista */}
        {cruce.funcionario && cruce.cantidad > 0 && (
          <div className="border border-risk-high/40 rounded-xl bg-red-50/70 px-5 py-4 mb-3">
            <div className="flex items-start gap-3">
              <Icono nombre="alerta" size={17} className="text-risk-highTxt flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-[11px] uppercase tracking-wider font-medium text-risk-highTxt">
                  Cruce con la cadena del espacio principal
                </div>
                <div className="text-[13.5px] font-semibold text-deloitte-ink mt-1 leading-snug">
                  {cruce.funcionario} accedió al Sistema de Recaudación de madrugada, desde fuera
                  de la red institucional, en las mismas fechas de la cadena
                </div>
                <p className="text-[12.5px] text-deloitte-slate mt-1.5 leading-snug">
                  {cruce.cantidad} accesos entre la 01:00 y las 05:00 desde conexiones residenciales,
                  coincidiendo con los días en que registró los pagos y alzó los embargos. Por
                  separado, el registro de accesos es ruido; junto a la cadena deja de serlo.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {cruce.casos.slice(0, 5).map((e: any) => (
                    <span key={e.id} className="cifra text-[11.5px] bg-white border border-red-200 rounded px-2 py-1 text-deloitte-slate">
                      {e.fecha} · {e.hora}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <HallazgoSeg
            codigo="SEG-01" sev="critica"
            titulo="Ráfagas de autenticación fallida contra el portal de pagos"
            cantidad={s.rafagas.cantidad} unidad="ráfagas"
            desc={`${num(s.rafagas.intentosTotal)} intentos fallidos en ventanas de minutos, desde cientos de orígenes externos. ${s.rafagas.sinBloquear} de las ${s.rafagas.cantidad} no fueron bloqueadas por el control de intentos. Es el patrón de enumeración de cuentas de contribuyentes.`}
            norma="Protección de plataformas expuestas · control de intentos"
            reco="Límite de intentos por cuenta y por origen, con bloqueo progresivo, y alerta al área de seguridad en tiempo real. Verificar si alguna ráfaga terminó en acceso exitoso."
          />
          <HallazgoSeg
            codigo="SEG-02" sev="critica"
            titulo="Sesiones simultáneas desde ubicaciones incompatibles"
            cantidad={s.sesionesConcurrentes.cantidad} unidad="casos"
            desc="Un mismo usuario con sesiones abiertas en Chile y en el extranjero con minutos de diferencia. No hay viaje que lo explique: o la credencial está compartida, o está comprometida."
            norma="Control de sesión · detección de viaje imposible"
            reco="Regla de viaje imposible que cierre ambas sesiones y fuerce reautenticación. Revisar qué operaciones se ejecutaron en esas sesiones antes de reponer el acceso."
          />
          <HallazgoSeg
            codigo="SEG-03" sev="alta"
            titulo="Cambios de configuración fuera de ventana autorizada"
            cantidad={s.cambiosConfig.cantidad} unidad="cambios"
            desc={`Modificaciones a la pasarela de pago y sus controles, ejecutadas de noche fuera de la ventana de cambios. ${s.cambiosConfig.sinTicket} sin ticket asociado. Entre ellas, desactivar el límite de intentos y ampliar la lista de IP exceptuadas.`}
            norma="Gestión de cambios sobre componentes críticos"
            reco="Ningún cambio sobre la pasarela sin ticket aprobado y ventana. Revisar si los cambios que debilitaron controles coinciden en fecha con las ráfagas de SEG-01."
          />
          <HallazgoSeg
            codigo="SEG-04" sev="alta"
            titulo="Accesos fuera de horario desde fuera de la red institucional"
            cantidad={s.accesosFueraDeHorario.cantidad} unidad="accesos"
            desc="Sesiones en sistemas de recaudación, cobranza y tesorería entre medianoche y las 06:00, desde conexiones ajenas a la red. Algunas corresponden a turnos legítimos; otras no."
            norma="Control de acceso lógico · horario y origen"
            reco="Exigir doble factor para acceso fuera de la red y fuera de horario, y revisar nominalmente los casos sin turno que los justifique."
          />
        </div>
      </div>

      {/* ── B. LIQUIDEZ OPERATIVA ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icono nombre="tesoro" size={16} className="text-deloitte-slate" />
          <h3 className="text-[14px] font-semibold text-deloitte-ink">Pérdida de liquidez operativa</h3>
          <span className="pill bg-deloitte-paper text-deloitte-slate border border-deloitte-line">Proyección, no hallazgo</span>
        </div>
        <p className="text-[12.5px] text-deloitte-mute mb-3 max-w-3xl leading-relaxed font-light">
          Este riesgo no se detecta buscando anomalías: se proyecta. El escenario adverso no lo
          mueven los montos de los hallazgos — suman millones frente a una caja de cientos de miles
          de millones. Lo mueve el supuesto de arriba: {SUPUESTO_ADVERSO.toLowerCase()}.
        </p>

        <div className="card p-5">
          <div className="grid grid-cols-3 gap-6 mb-5">
            <div>
              <div className="eyebrow">Días de cobertura</div>
              <div className="display text-[28px] text-deloitte-ink mt-1">{diasDeCobertura}</div>
              <div className="text-[12px] text-deloitte-mute mt-0.5">saldo actual sin ingresos nuevos</div>
            </div>
            <div>
              <div className="eyebrow">Piso operativo</div>
              <div className="display text-[28px] text-deloitte-ink mt-1">{milesDeMillones(PISO_OPERATIVO_CLP)}<span className="text-[15px] text-deloitte-mute ml-1">mil M</span></div>
              <div className="text-[12px] text-deloitte-mute mt-0.5">compromisos del mes</div>
            </div>
            <div>
              <div className="eyebrow">Escenario adverso</div>
              {cruceDelPiso ? (
                <>
                  <div className="display text-[28px] text-risk-medTxt mt-1">{cruceDelPiso.etiqueta}</div>
                  <div className="text-[12px] text-risk-medTxt mt-0.5">perfora el piso al día {cruceDelPiso.dia}</div>
                </>
              ) : (
                <>
                  <div className="display text-[28px] text-deloitte-greenTxt mt-1">Sin cruce</div>
                  <div className="text-[12px] text-deloitte-mute mt-0.5">no perfora el piso en 90 días</div>
                </>
              )}
            </div>
          </div>

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={proyeccion} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
                <CartesianGrid stroke="#E5E5E5" strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="etiqueta" tick={{ fontSize: 11, fill: "#666666" }}
                  axisLine={{ stroke: "#E5E5E5" }} tickLine={false} interval={1}
                />
                <YAxis
                  tickFormatter={milesDeMillones} tick={{ fontSize: 11, fill: "#666666" }}
                  axisLine={false} tickLine={false} width={46}
                  label={{ value: "CLP mil millones", angle: -90, position: "insideLeft",
                           style: { fontSize: 11, fill: "#666666", textAnchor: "middle" } }}
                />
                <Tooltip
                  formatter={(v: any, n: any) => [CLP(Number(v)), n]}
                  labelFormatter={(l: any) => `Día ${proyeccion.find((p) => p.etiqueta === l)?.dia ?? ""} · ${l}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E5E5" }}
                />
                <ReferenceLine
                  y={PISO_OPERATIVO_CLP} stroke="#B91C1C" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: "Piso operativo", position: "insideTopRight",
                           style: { fontSize: 11, fill: "#B91C1C" } }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="plainline" />
                <Line type="monotone" dataKey="saldoBaseCLP" name="Proyección base"
                      stroke={AZUL} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="saldoAdversoCLP" name="Escenario adverso"
                      stroke={AMBAR} strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-deloitte-line/60 flex items-start gap-1.5">
            <Icono nombre="recomendacion" size={14} className="text-deloitte-greenTxt flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-deloitte-greenTxt">Lectura</div>
              <p className="text-[12.5px] text-deloitte-slate leading-snug mt-0.5 max-w-3xl">
                La caja aguanta en el escenario base. Lo que la quiebra no es el gasto: es que el
                ingreso no entre en su ventana. Por eso la disponibilidad de la plataforma de pago
                durante los días de recaudación es un control de liquidez, no solo de tecnología —
                y debería medirse como tal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HallazgoSeg({ codigo, sev, titulo, cantidad, unidad, desc, norma, reco }: {
  codigo: string; sev: "critica" | "alta" | "media";
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
