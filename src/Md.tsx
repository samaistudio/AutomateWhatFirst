import * as React from "react";

/** A small Markdown renderer for the on-screen preview only (headings, lists, tables, quotes, bold, code).
 *  The downloaded file is the plain text itself; nothing here changes it. */

function inline(s: string): React.ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g).filter(Boolean).map((t, i) =>
    t.startsWith("**") && t.endsWith("**") ? <strong key={i}>{t.slice(2, -2)}</strong>
      : t.startsWith("`") && t.endsWith("`") ? <code key={i}>{t.slice(1, -1)}</code>
        : t.length > 2 && t.startsWith("*") && t.endsWith("*") ? <em key={i}>{t.slice(1, -1)}</em>
          : t);
}

type Item = { text: string; kids: Item[] };
const LIST = /^(\s*)([-*]|\d+\.)\s+(.*)$/;

function List({ items, ordered, rows }: { items: Item[]; ordered: boolean; rows?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={"md-list" + (rows ? " md-list--rows" : "")}>
      {items.map((it, i) => {
        const m = rows ? it.text.match(/^([^:]{2,80}?):\s(.*)$/) : null;
        return (
          <li key={i}>
            {m ? <><span className="md-k">{m[1]}</span><span className="md-v">{inline(m[2])}</span></> : inline(it.text)}
            {it.kids.length > 0 && <List items={it.kids} ordered={false} />}
          </li>
        );
      })}
    </Tag>
  );
}

export function Md({ text, rows }: { text: string; rows?: boolean }) {
  const L = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  const isBlock = (l: string) => /^#{1,4}\s/.test(l) || /^---+\s*$/.test(l) || l.startsWith(">") || l.startsWith("|") || LIST.test(l);
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    const h = l.match(/^(#{1,4})\s+(.*)$/);
    if (h) { const Tag = (["h3", "h4", "h5", "h6"] as const)[h[1].length - 1]; out.push(<Tag key={i} className={`md-h md-h${h[1].length}`}>{inline(h[2])}</Tag>); i++; continue; }
    if (/^---+\s*$/.test(l)) { out.push(<hr key={i} className="md-hr" />); i++; continue; }
    if (l.startsWith(">")) {
      const q: string[] = []; const k = i;
      while (i < L.length && L[i].startsWith(">")) q.push(L[i++].replace(/^>\s?/, ""));
      out.push(<blockquote key={k} className="md-quote">{inline(q.join(" "))}</blockquote>); continue;
    }
    if (l.startsWith("|")) {
      const r: string[][] = []; const k = i;
      while (i < L.length && L[i].startsWith("|")) { if (!/^\|[\s|:-]+\|?\s*$/.test(L[i])) r.push(L[i].replace(/^\||\|\s*$/g, "").split("|").map(c => c.trim())); i++; }
      out.push(<div key={k} className="md-table"><table><thead><tr>{r[0].map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
        <tbody>{r.slice(1).map((row, x) => <tr key={x}>{row.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }
    const lm = l.match(LIST);
    if (lm) {
      const items: Item[] = []; const k = i; const ordered = /\d/.test(lm[2]);
      while (i < L.length) {
        const m = L[i].match(LIST);
        if (m) { if (m[1].length >= 2 && items.length) items[items.length - 1].kids.push({ text: m[3], kids: [] }); else items.push({ text: m[3], kids: [] }); i++; continue; }
        if (L[i].trim() && /^\s{2,}/.test(L[i]) && items.length) { items[items.length - 1].text += " " + L[i].trim(); i++; continue; }
        break;
      }
      out.push(<List key={k} items={items} ordered={ordered} rows={rows} />); continue;
    }
    const p: string[] = []; const k = i;
    while (i < L.length && L[i].trim() && !(p.length && isBlock(L[i]))) p.push(L[i++]);
    out.push(<p key={k} className="md-p">{inline(p.join(" "))}</p>);
  }
  return <div className="md">{out}</div>;
}
