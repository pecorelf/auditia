// DynamicRenderer — extrae bloques <<<SPEC>>>...<<<END_SPEC>>> y renderiza
// gráficos Recharts vía React.createElement. NUNCA usa eval ni new Function.

import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart,
} from "recharts";
import { C as COLORS } from "../../lib/colors";
import { Markdown } from "./Markdown";

// Acepta texto que puede mezclar prosa + uno o más bloques de SPEC
// SPEC schema:
// {
//   "kind": "table" | "bar" | "line" | "pie" | "area" | "kpi",
//   "title"?: string,
//   "data": [...],
//   "xKey"?: string,
//   "yKey"?: string | string[],
//   "value"?: string,    // para pie
//   "name"?: string,     // para pie
//   "format"?: "money" | "percent" | "number",
//   "note"?: string
// }

function fmt(v: any, kind?: string) {
  if (typeof v !== "number") return v;
  if (kind === "money") return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);
  if (kind === "percent") return `${(v).toFixed(1)}%`;
  return new Intl.NumberFormat("es-CL").format(v);
}

function SpecBlock({ spec }: { spec: any }) {
  const palette = COLORS.chart;
  const title = spec.title ? <div className="text-[14px] font-semibold mb-2 text-deloitte-ink">{spec.title}</div> : null;
  const note = spec.note ? <div className="text-[12px] text-deloitte-mute mt-2 italic">{spec.note}</div> : null;

  // Table
  if (spec.kind === "table" && Array.isArray(spec.data) && spec.data.length > 0) {
    const cols = Object.keys(spec.data[0]);
    return (
      <div className="my-3 border border-deloitte-line rounded-md bg-white overflow-hidden">
        {title && <div className="px-3 py-2 border-b border-deloitte-line bg-deloitte-paper">{title}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] tabular">
            <thead>
              <tr className="bg-deloitte-paper">
                {cols.map((c) => (
                  <th key={c} className="text-left px-3 py-2 font-semibold uppercase tracking-wide text-[11.5px] text-deloitte-mute">
                    {c.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spec.data.map((row: any, i: number) => (
                <tr key={i} className="border-t border-deloitte-line hover:bg-deloitte-paper/50">
                  {cols.map((c) => (
                    <td key={c} className="px-3 py-2">
                      {fmt(row[c], spec.format)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {note && <div className="px-3 pb-2">{note}</div>}
      </div>
    );
  }

  if (spec.kind === "kpi" && Array.isArray(spec.data)) {
    return (
      <div className="my-3">
        {title}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {spec.data.map((k: any, i: number) => (
            <div key={i} className="card p-3">
              <div className="eyebrow">{k.label}</div>
              <div className="text-xl font-bold mt-1 tabular text-deloitte-ink">{fmt(k.value, spec.format)}</div>
              {k.detail && <div className="text-[12px] text-deloitte-mute mt-0.5">{k.detail}</div>}
            </div>
          ))}
        </div>
        {note}
      </div>
    );
  }

  if ((spec.kind === "bar" || spec.kind === "line" || spec.kind === "area") && Array.isArray(spec.data)) {
    const yKeys = Array.isArray(spec.yKey) ? spec.yKey : [spec.yKey || "value"];
    const Chart = spec.kind === "bar" ? BarChart : spec.kind === "area" ? AreaChart : LineChart;
    return (
      <div className="my-3 card p-3">
        {title}
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <Chart data={spec.data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#E5E5E5" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey={spec.xKey || "name"} tick={{ fontSize: 11, fill: COLORS.mute }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.mute }} axisLine={false} tickLine={false} tickFormatter={(v) => (spec.format === "money" ? new Intl.NumberFormat("es-CL", { notation: "compact" }).format(v) : v)} />
              <Tooltip
                contentStyle={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 6, fontSize: 12 }}
                formatter={(v: any) => fmt(v, spec.format)}
              />
              {yKeys.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
              {yKeys.map((k: string, i: number) =>
                spec.kind === "bar" ? (
                  <Bar key={k} dataKey={k} fill={palette[i % palette.length]} radius={[2, 2, 0, 0]} />
                ) : spec.kind === "area" ? (
                  <Area key={k} type="monotone" dataKey={k} stroke={palette[i % palette.length]} fill={palette[i % palette.length]} fillOpacity={0.25} strokeWidth={2} />
                ) : (
                  <Line key={k} type="monotone" dataKey={k} stroke={palette[i % palette.length]} strokeWidth={2} dot={{ r: 3 }} />
                )
              )}
            </Chart>
          </ResponsiveContainer>
        </div>
        {note}
      </div>
    );
  }

  if (spec.kind === "pie" && Array.isArray(spec.data)) {
    return (
      <div className="my-3 card p-3">
        {title}
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={spec.data}
                dataKey={spec.value || "value"}
                nameKey={spec.name || "name"}
                outerRadius={88}
                innerRadius={48}
                paddingAngle={2}
                label={(e: any) => `${e[spec.name || "name"]}: ${fmt(e[spec.value || "value"], spec.format)}`}
              >
                {spec.data.map((_: any, i: number) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => fmt(v, spec.format)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {note}
      </div>
    );
  }

  return (
    <div className="my-3 p-3 bg-amber-50 border border-amber-200 rounded text-[13px] text-amber-900">
      Visualización no reconocida (kind: {String(spec.kind)})
    </div>
  );
}

import { memo, useMemo } from "react";

function DynamicRendererInner({ text, streamingMode = false }: { text: string; streamingMode?: boolean }) {
  const parts = useMemo(() => {
    // Durante streaming: no parsear SPECs (causa renders pesados a cada chunk).
    // Mostramos sólo lo que está antes del primer <<<SPEC>>>, o todo si no hay ninguno.
    if (streamingMode) {
      const i = text.indexOf("<<<SPEC>>>");
      const preview = i >= 0 ? text.slice(0, i) : text;
      return [{ type: "text" as const, content: preview }];
    }

    const re = /<<<SPEC>>>([\s\S]*?)<<<END_SPEC>>>/g;
    const out: Array<{ type: "text" | "spec"; content: string }> = [];
    let last = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      if (match.index > last) {
        out.push({ type: "text", content: text.slice(last, match.index) });
      }
      out.push({ type: "spec", content: match[1] });
      last = match.index + match[0].length;
    }
    if (last < text.length) {
      out.push({ type: "text", content: text.slice(last) });
    }
    if (out.length === 0) {
      out.push({ type: "text", content: text });
    }
    return out;
  }, [text, streamingMode]);

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === "text") {
          if (!p.content.trim()) return null;
          return <Markdown key={i} text={p.content.trim()} />;
        }
        try {
          const spec = JSON.parse(p.content.trim());
          // Truncar tablas a 50 filas máx para evitar colapsos de navegador
          if (spec.kind === "table" && Array.isArray(spec.data) && spec.data.length > 50) {
            spec.data = spec.data.slice(0, 50);
            spec.note = (spec.note ? spec.note + " · " : "") + `Mostrando primeras 50 filas de ${spec.data.length || "muchos"} registros.`;
          }
          return <SpecBlock key={i} spec={spec} />;
        } catch (e) {
          return null;
        }
      })}
    </>
  );
}

// Memo: sólo re-render cuando cambia el texto o streamingMode
export const DynamicRenderer = memo(
  DynamicRendererInner,
  (prev, next) => prev.text === next.text && prev.streamingMode === next.streamingMode
);
