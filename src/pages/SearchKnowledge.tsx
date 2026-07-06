import { useState, useEffect, useMemo } from "react";
import { Search, X, Tag as TagIcon } from "lucide-react";
import type { Entry } from "../types";
import { KNOWLEDGE_TYPES } from "../data";
import { fmtDate, TypeBadge, EmptyState } from "../lib";

export function SearchKnowledge({
  entries, initialQuery, initialInterface, goToEntry,
}: {
  entries: Entry[];
  initialQuery: string;
  initialInterface: string;
  goToEntry: (id: string) => void;
}) {
  const [q, setQ] = useState(initialQuery || "");
  const [fInterface, setFInterface] = useState(initialInterface || "");
  const [fIc, setFIc] = useState("");
  const [fProject, setFProject] = useState("");
  const [fType, setFType] = useState("");
  const [fTag, setFTag] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => { setQ(initialQuery || ""); }, [initialQuery]);
  useEffect(() => { setFInterface(initialInterface || ""); }, [initialInterface]);

  const interfaces = useMemo(() => Array.from(new Set(entries.map((e) => e.interface).filter(Boolean))).sort(), [entries]);
  const projects = useMemo(() => Array.from(new Set(entries.map((e) => e.project).filter(Boolean))).sort(), [entries]);
  const ics = useMemo(() => Array.from(new Set(entries.map((e) => e.ic).filter(Boolean))).sort(), [entries]);
  const tags = useMemo(() => Array.from(new Set(entries.flatMap((e) => e.tags))).sort(), [entries]);

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (ql) {
        const hay = [e.title, e.content, e.ic, e.interface, ...e.tags].join(" ").toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      if (fInterface && e.interface !== fInterface) return false;
      if (fIc && e.ic !== fIc) return false;
      if (fProject && e.project !== fProject) return false;
      if (fType && !e.types.includes(fType as Entry["types"][number])) return false;
      if (fTag && !e.tags.includes(fTag)) return false;
      if (fromDate && e.createdDate < fromDate) return false;
      if (toDate && e.createdDate > toDate) return false;
      return true;
    }).sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }, [entries, q, fInterface, fIc, fProject, fType, fTag, fromDate, toDate]);

  const clearFilters = () => { setFInterface(""); setFIc(""); setFProject(""); setFType(""); setFTag(""); setFromDate(""); setToDate(""); };
  const anyFilter = fInterface || fIc || fProject || fType || fTag || fromDate || toDate;

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title"><span className="page-title-icon"><Search size={19} /></span><h1>Search Knowledge</h1></div>
        <p className="page-sub">{results.length} result{results.length !== 1 ? "s" : ""} across {entries.length} entries</p>
      </div>

      <div className="search-box-lg">
        <Search size={17} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search knowledge, IC, interface, issue, lesson learned…" />
        {q && <button onClick={() => setQ("")} aria-label="Clear search"><X size={14} /></button>}
      </div>

      <div className="filter-row">
        <select value={fInterface} onChange={(e) => setFInterface(e.target.value)}>
          <option value="">All interfaces</option>
          {interfaces.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={fIc} onChange={(e) => setFIc(e.target.value)}>
          <option value="">All ICs</option>
          {ics.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={fProject} onChange={(e) => setFProject(e.target.value)}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={fType} onChange={(e) => setFType(e.target.value)}>
          <option value="">All types</option>
          {KNOWLEDGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={fTag} onChange={(e) => setFTag(e.target.value)}>
          <option value="">All tags</option>
          {tags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="date-range">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span>→</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        {anyFilter && <button className="btn-ghost" onClick={clearFilters}>Clear filters</button>}
      </div>

      {results.length === 0 ? (
        <EmptyState icon={<Search size={22} strokeWidth={1.5} />} title="No entries match" note="Try a broader search term or fewer filters." />
      ) : (
        <div className="result-grid">
          {results.map((e) => (
            <button className="result-card" key={e.id} onClick={() => goToEntry(e.id)}>
              <div className="result-card-top">
                <span className="pill">{e.interface}</span>
                {e.ic && <span className="pill mono">{e.ic}</span>}
              </div>
              <div className="result-card-title">{e.title}</div>
              <div className="result-card-summary">{e.content.replace(/[#*`-]/g, "").slice(0, 110)}…</div>
              <div className="result-card-types">{e.types.map((t) => <TypeBadge key={t} type={t} />)}</div>
              <div className="result-card-bottom">
                <div className="result-card-tags">
                  {e.tags.slice(0, 3).map((t) => <span key={t} className="tag-chip static"><TagIcon size={10} />{t}</span>)}
                </div>
                <span className="result-card-date">{fmtDate(e.createdDate)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
