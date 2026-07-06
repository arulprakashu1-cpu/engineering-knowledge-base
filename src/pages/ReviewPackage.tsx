import { useState, useMemo } from "react";
import { ClipboardList, Download } from "lucide-react";
import type { Entry } from "../types";
import { KNOWLEDGE_TYPES } from "../data";
import { fmtDate, renderContent, TypeBadge, EmptyState } from "../lib";

export function ReviewPackage({ entries }: { entries: Entry[] }) {
  const [iface, setIface] = useState("");
  const [ic, setIc] = useState("");
  const [generated, setGenerated] = useState(false);

  const ifaces = useMemo(
    () => Array.from(new Set(entries.map((e) => e.interface).filter(Boolean))).sort(),
    [entries]
  );
  const ics = useMemo(
    () => Array.from(new Set(entries.filter((e) => !iface || e.interface === iface).map((e) => e.ic).filter(Boolean))).sort(),
    [entries, iface]
  );

  const matched = useMemo(() => {
    if (!generated) return [];
    return entries.filter((e) => e.interface === iface && (!ic || e.ic === ic));
  }, [entries, iface, ic, generated]);

  const sections = KNOWLEDGE_TYPES.map((t) => ({ type: t, list: matched.filter((e) => e.types.includes(t)) }));

  return (
    <div className="page">
      <div className="page-head no-print">
        <div className="page-title"><span className="page-title-icon"><ClipboardList size={19} /></span><h1>Review Package</h1></div>
        <p className="page-sub">Pull every requirement, checklist, lesson learned, and reference for a review in one place.</p>
      </div>

      <div className="review-controls no-print">
        <div className="field">
          <label>Interface</label>
          <select value={iface} onChange={(e) => { setIface(e.target.value); setIc(""); setGenerated(false); }}>
            <option value="">Select interface…</option>
            {ifaces.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="field">
          <label>IC</label>
          <select value={ic} onChange={(e) => { setIc(e.target.value); setGenerated(false); }} disabled={!iface}>
            <option value="">All ICs for this interface</option>
            {ics.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <button className="btn-primary" disabled={!iface} onClick={() => setGenerated(true)}>Generate review package</button>
        {generated && matched.length > 0 && (
          <button className="btn-ghost" onClick={() => window.print()}><Download size={14} /> Export to PDF</button>
        )}
      </div>

      {!generated && (
        <EmptyState icon={<ClipboardList size={22} strokeWidth={1.5} />} title="No package generated yet" note="Choose an interface, optionally an IC, then generate." />
      )}

      {generated && matched.length === 0 && (
        <EmptyState icon={<ClipboardList size={22} strokeWidth={1.5} />} title="No matching entries" note="Try clearing the IC filter or choosing a different interface." />
      )}

      {generated && matched.length > 0 && (
        <div className="print-area">
          <div className="print-only print-header">
            <h1>Review Package — {iface}{ic ? ` · ${ic}` : ""}</h1>
            <p>Generated {fmtDate(new Date().toISOString().slice(0, 10))}</p>
          </div>
          {sections.map(({ type, list }) => (
            <section className="review-section" key={type}>
              <div className="review-section-head">
                <TypeBadge type={type} />
                <h2>{type === "Lesson Learned" ? "Lessons Learned" : `${type}s`}</h2>
                <span className="review-count">{list.length}</span>
              </div>
              {list.length === 0 ? (
                <div className="panel-empty">None found</div>
              ) : (
                <div className="review-list">
                  {list.map((e) => (
                    <div className="review-item" key={e.id}>
                      <div className="review-item-title">{e.title} {e.ic && <span className="mono muted">· {e.ic}</span>}</div>
                      <div className="review-item-body">{renderContent(e.content)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
