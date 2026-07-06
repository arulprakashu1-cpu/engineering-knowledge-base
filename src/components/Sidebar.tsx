import {
  LayoutGrid, FilePlus2, Search, ClipboardList, Settings as SettingsIcon,
  CircuitBoard, Boxes, X, LogOut, UserRound,
} from "lucide-react";
import type { Page } from "../types";
import type { AuthUser } from "../api";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const NAV_ITEMS: { key: Page; label: string; icon: typeof LayoutGrid }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "explore", label: "3D Explorer", icon: Boxes },
  { key: "add", label: "Add Knowledge", icon: FilePlus2 },
  { key: "search", label: "Search Knowledge", icon: Search },
  { key: "review", label: "Review Package", icon: ClipboardList },
  { key: "profile", label: "My Profile", icon: UserRound },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar({
  page, setPage, open, onClose, user, onLogout,
}: {
  page: Page;
  setPage: (p: Page) => void;
  open: boolean;
  onClose: () => void;
  user: AuthUser;
  onLogout: () => void;
}) {
  return (
    <>
      {open && <div className="sidebar-overlay no-print" onClick={onClose} />}
      <aside className={"sidebar no-print" + (open ? " open" : "")}>
        <div className="brand">
          <div className="brand-mark"><CircuitBoard size={18} /></div>
          <div className="brand-text">
            <div className="brand-title">Engineering<br />Knowledge Base</div>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu"><X size={16} /></button>
        </div>
        <nav className="nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={"nav-item" + (page === key ? " active" : "")}
              onClick={() => { setPage(key); onClose(); }}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <button className="user-chip-main" onClick={() => { setPage("profile"); onClose(); }} title="View your profile">
              <div className="avatar">{initials(user.name)}</div>
              <div className="user-meta">
                <div className="user-name">{user.name}</div>
                <div className="user-role">@{user.username}</div>
              </div>
            </button>
            <button className="logout-btn" onClick={onLogout} aria-label="Sign out" title="Sign out"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
