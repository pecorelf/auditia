// Markdown light — solo lo que AuditIA suele devolver.
// Soporta: párrafos, ## headings, **bold**, *italic*, `code`, listas (- y 1.),
// tablas simples (| col | col |), bloques de código, líneas vacías.

import React from "react";

// Inline parsing: bold, italic, code, links
function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    // Bold: **...**
    const bold = rest.match(/^\*\*([^*]+)\*\*/);
    if (bold) {
      nodes.push(<strong key={key++}>{parseInline(bold[1])}</strong>);
      rest = rest.slice(bold[0].length);
      continue;
    }
    // Italic: *...*  (not **)
    const it = rest.match(/^\*([^*]+)\*/);
    if (it) {
      nodes.push(<em key={key++}>{parseInline(it[1])}</em>);
      rest = rest.slice(it[0].length);
      continue;
    }
    // Inline code: `...`
    const code = rest.match(/^`([^`]+)`/);
    if (code) {
      nodes.push(<code key={key++}>{code[1]}</code>);
      rest = rest.slice(code[0].length);
      continue;
    }
    // Link: [text](url)
    const link = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (link) {
      nodes.push(
        <a key={key++} href={link[2]} target="_blank" rel="noreferrer" className="text-deloitte-green underline">
          {link[1]}
        </a>
      );
      rest = rest.slice(link[0].length);
      continue;
    }
    // Plain char
    nodes.push(rest[0]);
    rest = rest.slice(1);
  }

  // Collapse consecutive strings
  const collapsed: React.ReactNode[] = [];
  let buf = "";
  for (const n of nodes) {
    if (typeof n === "string") buf += n;
    else {
      if (buf) { collapsed.push(buf); buf = ""; }
      collapsed.push(n);
    }
  }
  if (buf) collapsed.push(buf);
  return collapsed;
}

function parseTable(lines: string[], startIdx: number): { node: React.ReactNode; nextIdx: number } | null {
  const header = lines[startIdx];
  const sep = lines[startIdx + 1];
  if (!header || !sep) return null;
  if (!/^\|.+\|$/.test(header.trim()) || !/^\|[\s\-:|]+\|$/.test(sep.trim())) return null;

  const headers = header.split("|").map((s) => s.trim()).filter(Boolean);
  const rows: string[][] = [];
  let i = startIdx + 2;
  while (i < lines.length && /^\|.+\|$/.test(lines[i].trim())) {
    rows.push(lines[i].split("|").map((s) => s.trim()).filter(Boolean));
    i++;
  }
  const node = (
    <table>
      <thead>
        <tr>{headers.map((h, k) => <th key={k}>{parseInline(h)}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, k) => (
          <tr key={k}>{r.map((c, j) => <td key={j}>{parseInline(c)}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
  return { node, nextIdx: i };
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (!line.trim()) { i++; continue; }

    // Code block ```
    if (line.trim().startsWith("```")) {
      const collected: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        collected.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(
        <pre key={key++} className="bg-deloitte-paper border border-deloitte-line rounded p-3 my-2 overflow-x-auto text-[12px] font-mono">
          {collected.join("\n")}
        </pre>
      );
      continue;
    }

    // Heading ## or ###
    const h3 = line.match(/^###\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2 || h3) {
      blocks.push(
        h2
          ? <h3 key={key++} className="text-base font-semibold mt-3 mb-1">{parseInline(h2[1])}</h3>
          : <h4 key={key++} className="text-sm font-semibold mt-2 mb-1">{parseInline(h3![1])}</h4>
      );
      i++;
      continue;
    }

    // Table
    const tbl = parseTable(lines, i);
    if (tbl) {
      blocks.push(<div key={key++}>{tbl.node}</div>);
      i = tbl.nextIdx;
      continue;
    }

    // Bulleted list
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((it, k) => <li key={k}>{parseInline(it)}</li>)}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((it, k) => <li key={k}>{parseInline(it)}</li>)}
        </ol>
      );
      continue;
    }

    // Paragraph
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(##|###|[-*]\s|\d+\.\s|```)/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(<p key={key++} className="leading-relaxed">{parseInline(para.join(" "))}</p>);
  }

  return <div className="md-content">{blocks}</div>;
}
