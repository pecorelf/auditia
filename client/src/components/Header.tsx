type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  cta?: React.ReactNode;
};

export function Header({ eyebrow, title, subtitle, meta, cta }: Props) {
  return (
    <header className="px-8 pt-9 pb-6 border-b border-deloitte-line/70 bg-white">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="display text-[32px] mt-1.5 text-deloitte-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] text-deloitte-mute mt-2.5 max-w-2xl leading-relaxed font-light">{subtitle}</p>
          )}
        </div>
        {cta}
      </div>
      {meta && meta.length > 0 && (
        <div className="flex items-center gap-8 mt-6">
          {meta.map((m, i) => (
            <div key={i}>
              <div className="text-[11.5px] uppercase tracking-wider text-deloitte-mute font-semibold">
                {m.label}
              </div>
              <div className="cifra text-[15px] font-medium text-deloitte-ink mt-1">{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
