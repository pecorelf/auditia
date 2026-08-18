import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatPanel } from "./Veritas/ChatPanel";
import { useStore } from "../store/useStore";

type Props = {
  children: React.ReactNode;
};

const KILLERS: Record<string, string[]> = {
  uno: [
    "¿Hay proveedores que compartan datos bancarios con empleados?",
    "Encuéntrame OCs con backdating: facturas emitidas antes de la fecha de su orden de compra",
    "¿Algún aprobador concentra el gasto a un proveedor específico de forma anómala?",
    "Muéstrame proveedores creados en los últimos 90 días que ya hayan facturado más de CLP 10M",
    "¿Hay empleados que compartan cuenta bancaria entre sí o sueldos atípicos para su cargo?",
    "Dame los hallazgos prioritarios de control sobre este universo",
  ],
  dos: [
    "¿Qué hallazgos de mi proceso se están reiterando año a año sin cerrarse?",
    "¿Qué gerencias tienen peor cumplimiento de compromisos? Dame el ranking",
    "Muéstrame los hallazgos críticos abiertos hace más de 180 días",
    "¿Cómo evolucionó la severidad de los hallazgos en los últimos 4 años?",
    "¿Hay algún responsable con sobrecarga de compromisos abiertos?",
    "Si la rotación de personal del área de Abastecimiento sube 20%, ¿qué pasa con el riesgo operacional?",
    "Dame los 3 focos que el dueño de proceso debería priorizar el próximo trimestre",
  ],
  tres: [
    "¿Cómo auditar IA en una empresa financiera según mejores prácticas del IAI España?",
    "¿Qué debo testear para evaluar el modelo de prevención del delito bajo Ley 20.393 y Ley 21.595?",
    "Compárame los requisitos de gobierno de datos entre NCG 461 y los principios COSO",
    "¿Cuáles son las Normas Globales de Auditoría Interna (NGAI) y cómo se aplican en Chile?",
    "¿Qué cambios regulatorios de los últimos 12 meses en Chile impactan al rol de auditoría interna?",
  ],
  cinco: [
    "¿Hay viajes rendidos con tiempos imposibles para la distancia? Ejemplo San Antonio–Mejillones.",
    "¿Hay cargas de combustible que exceden la capacidad física del estanque del vehículo?",
    "Detecta el patrón de robo de combustible: carga alta seguida de nivel bajo",
    "¿Hay viáticos de alojamiento sin viaje GPS asociado ese día?",
    "¿Se rindieron boletas duplicadas por dos personas o dos veces la misma persona?",
    "¿Hay faenas con costo > CLP 2M sin registro en la bitácora de maniobras?",
    "¿Se enviaron dos equipos al mismo evento? Doble cobertura, doble gasto.",
    "¿Quién usa excesivamente Uber Black o Cabify Premium sin justificación?",
    "Dame los hallazgos prioritarios con impacto en CLP y recomendaciones para el Gerente de Flota",
  ],
  seis: [
    "¿Hay horas extra pagadas que no tienen respaldo en la bitácora de turnos?",
    "¿Qué liquidaciones se pagaron sin ningún turno registrado en el período?",
    "¿Se pagó bono de embarque dos veces en el mismo período? Dame los casos y el monto",
    "¿Hay pagos posteriores a la fecha de finiquito?",
    "¿Cuántas liquidaciones superan el tope legal de horas extra del Art. 31?",
    "¿Se pagó bono de dotación completa en faenas que operaron bajo dotación mínima?",
    "¿Qué bonos se están pagando fuera del convenio colectivo vigente?",
    "Dame los hallazgos prioritarios con impacto en CLP para el Gerente de Personas",
  ],
};

export function Layout({ children }: Props) {
  const espacio = useStore((s) => s.espacio);
  const [chatOpen, setChatOpen] = useState(true);

  // Los Espacios 3 (Audit Expert) y 4 (Coach) tienen su propio chat interno;
  // no mostramos el panel lateral en esos espacios para evitar confusión visual.
  const showSideChat = espacio === "uno" || espacio === "dos" || espacio === "cinco" || espacio === "seis";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto bg-deloitte-paper">
        {children}
      </main>

      {/* Chat panel — colapsable, sólo para Espacios 1 y 2 */}
      {showSideChat && (
        <div
          className={`flex-shrink-0 transition-all duration-300 ${
            chatOpen ? "w-[420px]" : "w-[42px]"
          }`}
        >
          {chatOpen ? (
            <div className="h-full relative">
              <button
                onClick={() => setChatOpen(false)}
                className="absolute -left-3 top-4 z-10 w-6 h-6 rounded-full bg-white border border-deloitte-line text-deloitte-mute hover:text-deloitte-ink shadow-card flex items-center justify-center text-[11px]"
                title="Ocultar AuditIA"
              >
                ›
              </button>
              <ChatPanel killerQuestions={KILLERS[espacio] || []} />
            </div>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              className="h-full w-full bg-deloitte-ink text-white hover:bg-deloitte-slate flex flex-col items-center justify-center gap-3 group"
              title="Abrir AuditIA"
            >
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center relative">
                <div className="w-1.5 h-1.5 rounded-full bg-deloitte-green absolute bottom-0.5 right-0.5" />
                <span className="text-white font-serif italic text-[11px]">A</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80" style={{ writingMode: "vertical-rl" }}>
                AuditIA
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
