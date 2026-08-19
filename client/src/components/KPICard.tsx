type Props = {
  label: string;
  value: string;
  delta?: number; // % cambio
  positive?: boolean; // si el cambio es bueno
  detail?: string;
};

export function KPICard({ label, value, delta, positive, detail }: Props) {
  const hasDelta = delta !== undefined && delta !== 0;
  return (
    <div className="card card-hover p-4">
      <div className="eyebrow">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <div className="text-[26px] font-semibold tabular text-deloitte-ink leading-none">{value}</div>
        {hasDelta && (
          <div
            className={`text-[12px] font-semibold tabular ${
              positive ? "text-risk-lowTxt" : "text-risk-highTxt"
            }`}
          >
            {delta! > 0 ? "▲" : "▼"} {Math.abs(delta!).toFixed(1)}%
          </div>
        )}
      </div>
      {detail && (
        <div className="text-[12px] text-deloitte-mute mt-1.5 leading-snug">{detail}</div>
      )}
    </div>
  );
}
