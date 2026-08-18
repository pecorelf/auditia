import { BRANDING } from "../config/branding";

export function Logo({ className = "", invert = false }: { className?: string; invert?: boolean }) {
  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ color: invert ? "#FFFFFF" : BRANDING.colors.ink }}
    >
      {/* Si aún no se cargó client/public/logo-saam.png, cae al wordmark de texto */}
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
        className="font-serif text-[19px] font-semibold tracking-tight"
      >
        {BRANDING.firmName}
      </span>
    </div>
  );
}

export function WordmarkAuditIA({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="font-serif italic text-[15px] tracking-tight">AuditIA</span>
      <span className="inline-block w-1 h-1 rounded-full bg-deloitte-green" />
    </div>
  );
}
