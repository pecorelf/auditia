import { BRANDING } from "../config/branding";

export function Logo({ className = "" }: { className?: string; invert?: boolean }) {
  // Se dibuja siempre sobre fondo blanco — la franja la pone quien lo usa.
  // Los logos corporativos vienen con fondo blanco y sobre oscuro quedaban
  // con un recorte sucio.
  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ color: BRANDING.colors.ink }}
    >
      {/* Si el logo del pack no existe, cae al wordmark de texto */}
      <img
        src={BRANDING.logoPath}
        alt={BRANDING.firmName}
        className="h-9 w-auto max-w-[200px] object-contain"
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = "none";
          const fallback = img.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = "inline-block";
        }}
      />
      <span
        style={{ display: "none" }}
        className="display-medium text-[20px]"
      >
        {BRANDING.firmName}
      </span>
    </div>
  );
}

export function WordmarkAuditIA({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="text-[17px] font-medium tracking-[-0.01em]">AuditIA</span>
      <span className="inline-block w-1 h-1 rounded-full bg-deloitte-green" />
    </div>
  );
}
