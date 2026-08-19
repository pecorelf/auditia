// Leyenda de severidad.
//
// Los hallazgos se ordenan por color, pero el código de color no se explicaba
// en ninguna parte: quien mira la pantalla por primera vez tiene que adivinar.
// Además el color solo no basta como canal de información — quien no distingue
// rojo de ámbar se queda sin la señal —, así que cada nivel lleva su etiqueta.

export function LeyendaSeveridad({ className = "" }: { className?: string }) {
  const niveles = [
    { color: "bg-risk-high", texto: "text-risk-highTxt", label: "Crítica", desc: "Requiere acción inmediata" },
    { color: "bg-risk-med", texto: "text-risk-medTxt", label: "Alta", desc: "Plan de acción con plazo" },
    { color: "bg-deloitte-green", texto: "text-deloitte-greenTxt", label: "Media", desc: "Revisión dirigida" },
  ];
  return (
    <div className={`flex items-center gap-5 ${className}`}>
      <span className="eyebrow">Severidad</span>
      {niveles.map((n) => (
        <span key={n.label} className="flex items-center gap-1.5" title={n.desc}>
          <span className={`w-2.5 h-2.5 rounded-sm ${n.color}`} aria-hidden="true" />
          <span className={`text-[12px] font-semibold ${n.texto}`}>{n.label}</span>
          <span className="text-[11.5px] text-deloitte-mute">· {n.desc}</span>
        </span>
      ))}
    </div>
  );
}
