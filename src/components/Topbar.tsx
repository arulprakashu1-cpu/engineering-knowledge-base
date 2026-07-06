import React from "react";
import { Search, Sun, Moon, Menu } from "lucide-react";
import type { Theme } from "../types";

export function Topbar({
  theme, setTheme, query, setQuery, onSearchSubmit, breadcrumb, onMenuClick,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
  query: string;
  setQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  breadcrumb: React.ReactNode;
  onMenuClick: () => void;
}) {
  return (
    <header className="topbar no-print">
      <button className="icon-btn menu-btn" aria-label="Open menu" onClick={onMenuClick}>
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
      <button
        className="icon-btn"
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
      </button>
    </header>
  );
}
