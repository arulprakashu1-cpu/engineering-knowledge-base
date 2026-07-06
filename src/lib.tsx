import React from "react";
import {
  FileText, FileSpreadsheet, FileArchive, FileImage, File as FileGeneric,
  Check, X,
} from "lucide-react";
import { TYPE_COLOR } from "./data";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function fmtDate(d: string): string {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function fileIcon(type: string): React.ReactNode {
  if (type === "pdf") return <FileText size={14} />;
  if (type === "xlsx" || type === "csv") return <FileSpreadsheet size={14} />;
  if (type === "zip") return <FileArchive size={14} />;
  if (type === "png" || type === "jpg" || type === "jpeg") return <FileImage size={14} />;
  return <FileGeneric size={14} />;
}

/* ------------------------------------------------------------------ */
/*  Tiny markdown-ish renderer for the content editor preview          */
/* ------------------------------------------------------------------ */

export function renderContent(md: string): React.ReactNode {
  if (!md) return null;
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let listBuf: React.ReactNode[] = [];
  let inCode = false;
  let codeBuf: string[] = [];

  const flushList = () => {
    if (listBuf.length) {
      blocks.push(
        <ul key={"ul" + blocks.length} className="km-list">
          {listBuf.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );
      listBuf = [];
    }
  };

  // Inline formatting: images, links, bold, and `code` — in that precedence.
  const inline = (text: string): React.ReactNode => {
    const nodes: React.ReactNode[] = [];
    const re = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
    let last = 0;
    let k = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) nodes.push(<React.Fragment key={k++}>{text.slice(last, m.index)}</React.Fragment>);
      if (m[2] !== undefined) {
        nodes.push(<img key={k++} className="km-img-inline" src={m[2]} alt={m[1] || ""} />);
      } else if (m[3] !== undefined) {
        nodes.push(<a key={k++} className="km-link" href={m[4]} target="_blank" rel="noopener noreferrer">{m[3]}</a>);
      } else if (m[5] !== undefined) {
        nodes.push(<strong key={k++}>{m[5]}</strong>);
      } else if (m[6] !== undefined) {
        nodes.push(<code key={k++} className="km-code-inline">{m[6]}</code>);
      }
      last = re.lastIndex;
    }
    if (last < text.length) nodes.push(<React.Fragment key={k++}>{text.slice(last)}</React.Fragment>);
    return nodes;
  };

  // Table helpers — GitHub-style pipe tables.
  const parseRow = (line: string): string[] => {
    let s = line.trim();
    if (s.startsWith("|")) s = s.slice(1);
    if (s.endsWith("|")) s = s.slice(0, -1);
    return s.split("|").map((c) => c.trim());
  };
  const isSeparator = (line: string): boolean => {
    const cells = parseRow(line);
    return cells.length > 0 && cells.every((c) => /^:?-{2,}:?$/.test(c));
  };

  const IMG_ONLY = /^!\[([^\]]*)\]\(([^)]+)\)$/;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (!inCode) { inCode = true; codeBuf = []; }
      else {
        flushList();
        blocks.push(<pre key={"code" + blocks.length} className="km-code">{codeBuf.join("\n")}</pre>);
        inCode = false;
      }
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }

    // Table: a "|" row immediately followed by a "| --- | --- |" separator.
    if (line.trim().startsWith("|") && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      flushList();
      const header = parseRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && !isSeparator(lines[i])) {
        rows.push(parseRow(lines[i]));
        i++;
      }
      blocks.push(
        <div className="km-table-wrap" key={"tbl" + blocks.length}>
          <table className="km-table">
            <thead><tr>{header.map((c, idx) => <th key={idx}>{inline(c)}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>{header.map((_, ci) => <td key={ci}>{inline(r[ci] ?? "")}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Standalone image on its own line → figure with optional caption.
    const imgMatch = line.trim().match(IMG_ONLY);
    if (imgMatch) {
      flushList();
      blocks.push(
        <figure className="km-figure" key={"fig" + blocks.length}>
          <img className="km-img" src={imgMatch[2]} alt={imgMatch[1] || ""} />
          {imgMatch[1] && <figcaption className="km-figcaption">{imgMatch[1]}</figcaption>}
        </figure>
      );
      i++; continue;
    }

    if (line.startsWith("## ")) { flushList(); blocks.push(<h3 key={"h" + blocks.length} className="km-h3">{inline(line.slice(3))}</h3>); i++; continue; }
    if (line.startsWith("# ")) { flushList(); blocks.push(<h2 key={"h" + blocks.length} className="km-h2">{inline(line.slice(2))}</h2>); i++; continue; }

    const checkMatch = line.match(/^- \[( |x)\] (.*)/);
    if (checkMatch) {
      listBuf.push(
        <span className="km-check">
          <span className={"km-checkbox" + (checkMatch[1] === "x" ? " checked" : "")}>
            {checkMatch[1] === "x" && <Check size={11} strokeWidth={3} />}
          </span>
          {inline(checkMatch[2])}
        </span>
      );
      i++; continue;
    }
    if (line.startsWith("- ")) { listBuf.push(inline(line.slice(2))); i++; continue; }

    if (line.trim() === "") { flushList(); i++; continue; }

    flushList();
    blocks.push(<p key={"p" + blocks.length} className="km-p">{inline(line)}</p>);
    i++;
  }
  flushList();
  return blocks;
}

/**
 * Read an image file and return a downscaled data-URI so it embeds inline
 * without bloating the payload. Keeps PNG/GIF transparency; others → JPEG.
 */
export function fileToImageDataUrl(file: File, maxDim = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't a valid image."));
      img.onload = () => {
        let { width, height } = img;
        const longest = Math.max(width, height);
        if (longest > maxDim) {
          const scale = maxDim / longest;
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(reader.result as string); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const keepAlpha = file.type === "image/png" || file.type === "image/gif";
        resolve(canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Small shared UI atoms                                              */
/* ------------------------------------------------------------------ */

export function TraceDivider() {
  return (
    <svg width="100%" height="10" viewBox="0 0 400 10" preserveAspectRatio="none" className="trace-divider">
      <line x1="0" y1="5" x2="400" y2="5" stroke="var(--border)" strokeWidth="1" />
      {[20, 100, 180, 260, 340].map((x) => (
        <rect key={x} x={x - 2.5} y="1.5" width="5" height="7" fill="var(--bg)" stroke="var(--border)" strokeWidth="1" />
      ))}
    </svg>
  );
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className="badge" style={{ ["--dot" as string]: TYPE_COLOR[type] || "var(--text-secondary)" } as React.CSSProperties}>
      <span className="badge-dot" />{type}
    </span>
  );
}

export function TagChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="tag-chip">
      {label}
      {onRemove && <button onClick={onRemove} aria-label={`Remove ${label}`}><X size={11} /></button>}
    </span>
  );
}

export function EmptyState({ icon, title, note }: { icon: React.ReactNode; title: string; note?: string }) {
  return (
    <div className="empty-state">
      {icon}
      <div className="empty-title">{title}</div>
      {note && <div className="empty-note">{note}</div>}
    </div>
  );
}
