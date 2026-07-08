import { Clock, Network, Eye, ChevronRight, Boxes, LayoutDashboard, FilePlus2 } from "lucide-react";
import type { Entry } from "../types";
import { TYPE_COLOR } from "../data";
import { fmtDate, TraceDivider, EmptyState } from "../lib";

export interface InterfaceStat {
  name: string;
  total: number;
  lessons: number;
  checklists: number;
  requirements: number;
}

export function Dashboard({
  entries, recentlyViewed, goToEntry, goToInterface, goToAdd,
}: {
  entries: Entry[];
  recentlyViewed: string[];
  goToEntry: (id: string) => void;
  goToInterface: (name: string) => void;
  goToAdd: () => void;
}) {
  const totalEntries = entries.length;
  const totalInterfaces = new Set(entries.map((e) => e.interface)).size;
  const totalICs = new Set(entries.map((e) => e.ic).filter(Boolean)).size;
  const recent = [...entries].sort((a, b) => b.createdDate.localeCompare(a.createdDate)).slice(0, 5);

  // Dynamic: only interfaces that actually appear in this user's entries,
  // ordered by how many entries each has.
  const interfaceNames = Array.from(new Set(entries.map((e) => e.interface).filter(Boolean)));
  const perInterface: InterfaceStat[] = interfaceNames
    .map((name) => {
      const list = entries.filter((e) => e.interface === name);
      return {
        name,
        total: list.length,
        lessons: list.filter((e) => e.types.includes("Lesson Learned")).length,
        checklists: list.filter((e) => e.types.includes("Checklist")).length,
        requirements: list.filter((e) => e.types.includes("Requirement")).length,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title"><span className="page-title-icon"><LayoutDashboard size={19} /></span><h1>Dashboard</h1></div>
        <p className="page-sub">Your personal knowledge base — searchable, in one place.</p>
      </div>
      <TraceDivider />

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Total Knowledge Entries</div>
          <div className="stat-value">{totalEntries}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Interfaces</div>
          <div className="stat-value">{totalInterfaces}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total ICs</div>
          <div className="stat-value">{totalICs}</div>
        </div>
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head"><Clock size={14} /><h2>Recent Entries</h2></div>
          {recent.length === 0 ? (
            <div className="dash-empty">
              <EmptyState
                icon={<FilePlus2 size={22} strokeWidth={1.5} />}
                title="Your knowledge base is empty"
                note="Add your first entry — a requirement, checklist, or lesson learned — and it will appear here."
              />
              <button className="btn-primary" onClick={goToAdd}><FilePlus2 size={15} /> Add your first entry</button>
            </div>
          ) : (
            <div className="row-list">
              {recent.map((e) => (
                <button className="row-item" key={e.id} onClick={() => goToEntry(e.id)}>
                  <div className="row-item-main">
                    <span className="row-item-title">{e.title}</span>
                    <span className="row-item-sub">{e.interface}{e.ic ? ` · ${e.ic}` : ""}</span>
                  </div>
                  <span className="row-item-date">{fmtDate(e.createdDate)}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-head"><Eye size={14} /><h2>Recently Viewed</h2></div>
          {recentlyViewed.length === 0 ? (
            <EmptyState icon={<Eye size={22} strokeWidth={1.5} />} title="Nothing viewed yet" note="Open an entry from search or a dashboard card and it'll show up here." />
          ) : (
            <div className="row-list">
              {recentlyViewed.map((id) => {
                const e = entries.find((x) => x.id === id);
                if (!e) return null;
                return (
                  <button className="row-item" key={e.id} onClick={() => goToEntry(e.id)}>
                    <div className="row-item-main">
                      <span className="row-item-title">{e.title}</span>
                      <span className="row-item-sub">{e.interface}{e.ic ? ` · ${e.ic}` : ""}</span>
                    </div>
                    <ChevronRight size={14} className="row-item-chevron" />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="panel-head standalone"><Boxes size={14} /><h2>Interfaces</h2></div>
      {perInterface.length === 0 ? (
        <div className="panel"><EmptyState icon={<Boxes size={22} strokeWidth={1.5} />} title="No interfaces yet" note="Add an entry and choose (or type) its interface — a card for it will appear here automatically." /></div>
      ) : (
      <div className="interface-grid">
        {perInterface.map((it) => (
          <button className="ic-card" key={it.name} onClick={() => goToInterface(it.name)}>
            <div className="ic-card-body">
              <div className="ic-card-title">
                <Network size={14} />
                <span>{it.name}</span>
              </div>
              <div className="ic-card-total">{it.total} <span>entries</span></div>
              <div className="ic-card-breakdown">
                <span><i style={{ background: TYPE_COLOR["Requirement"] }} />{it.requirements} Req</span>
                <span><i style={{ background: TYPE_COLOR["Checklist"] }} />{it.checklists} Chk</span>
                <span><i style={{ background: TYPE_COLOR["Lesson Learned"] }} />{it.lessons} LL</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      )}
    </div>
  );
}
