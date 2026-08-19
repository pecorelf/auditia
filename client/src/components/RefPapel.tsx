// Código de referencia de papel de trabajo.
//
// En una auditoría real cada hallazgo vive con una referencia — P2P-04, REM-07 —
// y todo el equipo la usa para cruzar evidencia. Es el vocabulario del oficio,
// no un adorno, y cumple una función concreta en la demo: permite decir
// "vamos al AFP-03" en vez de "el tercero de la izquierda".
//
// Se escribe en monoespaciada, que es donde los códigos se leen mejor y de paso
// separa visualmente el dato del texto narrativo.

export function RefPapel({ codigo, className = "" }: { codigo: string; className?: string }) {
  return (
    <span
      className={`font-mono text-[11.5px] font-semibold tracking-tight text-deloitte-mute
        border border-deloitte-line rounded-sm px-1.5 py-0.5 bg-white ${className}`}
      title="Referencia de papel de trabajo"
    >
      {codigo}
    </span>
  );
}
