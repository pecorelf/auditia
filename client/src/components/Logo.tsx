import { BRANDING } from "../config/branding";

export function Logo({ className = "", invert = false }: { className?: string; invert?: boolean }) {
  // Los logos de cliente vienen casi siempre con fondo blanco. Sobre la barra
  // oscura eso deja un recorte sucio, así que se les da una placa blanca propia:
  // el logo se lee como está diseñado y el recorte pasa a ser una decisión.
  if (invert) {
    return (
      <div className={`inline-flex ${className}`}>
        <div className="bg-white rounded-md px-3 py-2 inline-flex items-center shadow-sm">
          <img
            src={BRANDING.logoPath}
            alt={BRANDING.firmName}
            className="h-7 w-auto max-w-[180px] object-contain"
            onError={(e) => {
              const img = e.currentTarget;
              img.style.display = "none";
              const fb = img.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "inline-block";
            }}
          />
          <span
            style={{ display: "none", color: BRANDING.colors.ink }}
            className="display-medium text-[21px]"
          >
            {BRANDING.firmName}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ color: BRANDING.colors.ink }}
    >
      {/* Si el logo del pack no existe, cae al wordmark de texto */}
      <img
        src={BRANDING.logoPath}
        alt={BRANDING.firmName}
        className="h-7 w-auto"
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
