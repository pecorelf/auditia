type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
  cta?: React.ReactNode;
};

export function Header({ eyebrow, title, subtitle, meta, cta }: Props) {
  return (
    <header className="px-8 pt-7 pb-5 border-b border-deloitte-line bg-white">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="font-serif text-[28px] font-semibold tracking-tight mt-1 text-deloitte-ink leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] text-deloitte-mute mt-1.5 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {cta}
      </div>
      {meta && meta.length > 0 && (
        <div className="flex items-center gap-6 mt-5">
          {meta.map((m, i) => (
            <div key={i}>
              <div className="text-[11.5px] uppercase tracking-wider text-deloitte-mute font-semibold">
                {m.label}
              </div>
              <div className="text-[14px] font-semibold text-deloitte-ink mt-0.5 tabular">{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
