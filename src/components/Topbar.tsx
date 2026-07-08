import React from "react";
import { Search, Menu } from "lucide-react";

export function Topbar({
  query, setQuery, onSearchSubmit, breadcrumb, onMenuClick,
}: {
  query: string;
  setQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  breadcrumb: React.ReactNode;
  onMenuClick: () => void;
}) {
  return (
    <header className="topbar no-print">
      <button className="icon-btn menu-btn" aria-label="Toggle menu" title="Toggle menu" onClick={onMenuClick}>
        <Menu size={17} />
      </button>
      <div className="breadcrumb">{breadcrumb}</div>
      <form
        className="topbar-search"
        onSubmit={(e) => { e.preventDefault(); onSearchSubmit(query); }}
      >
        <Search size={15} className="topbar-search-icon" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search knowledge, IC, interface, issue, lesson learned…"
        />
      </form>
    </header>
  );
}
