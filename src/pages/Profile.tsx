import { useMemo } from "react";
import {
  UserRound, FilePlus2, PencilLine, Trash2, ChevronRight, Mail, Shield, CalendarClock, FileText,
} from "lucide-react";
import type { Entry } from "../types";
import type { AuthUser } from "../api";
import { fmtDate, TraceDivider, TypeBadge, EmptyState } from "../lib";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtDateTime(iso?: string): string {
  if (!iso) return "—";
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function Profile({
  user, entries, goToEntry, onEdit, onDelete, goToAdd,
}: {
  user: AuthUser;
  entries: Entry[];
  goToEntry: (id: string) => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  goToAdd: () => void;
}) {
  const mine = useMemo(
    () => entries.filter((e) => e.ownerId === user.id),
    [entries, user.id],
  );
  const interfaceCount = useMemo(
    () => new Set(mine.map((e) => e.interface)).size,
    [mine],
  );
  const lastUpdated = useMemo(() => {
    if (mine.length === 0) return "—";
    return fmtDate([...mine].sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate))[0].modifiedDate);
  }, [mine]);

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-title"><span className="page-title-icon"><UserRound size={19} /></span><h1>My Profile</h1></div>
        <p className="page-sub">Your account details and the knowledge you've contributed to the team.</p>
      </div>
      <TraceDivider />

      {/* Identity card */}
      <section className="panel profile-card">
        <div className="profile-avatar">{initials(user.name)}</div>
        <div className="profile-identity">
          <h2 className="profile-name">{user.name}</h2>
          <div className="profile-username">@{user.username}</div>
          <div className="profile-facts">
            <span><Shield size={13} /> {user.role}</span>
            <span><Mail size={13} /> {user.email}</span>
            <span><CalendarClock size={13} /> Member since {fmtDateTime(user.createdAt)}</span>
          </div>
        </div>
      </section>

      {/* Personalized stats */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">My Contributions</div>
          <div className="stat-value">{mine.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Interfaces Covered</div>
          <div className="stat-value">{interfaceCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Updated</div>
          <div className="stat-value profile-stat-date">{lastUpdated}</div>
        </div>
      </div>

      {/* My contributions */}
      <section className="panel">
        <div className="panel-head standalone" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}><FileText size={14} /><h2>My Contributions</h2></div>
          <button className="btn-ghost" onClick={goToAdd}><FilePlus2 size={14} /> Add entry</button>
        </div>

        {mine.length === 0 ? (
          <EmptyState
            icon={<FileText size={26} />}
            title="You haven't added any knowledge yet"
            note="Capture your first requirement, checklist, or lesson learned — it will appear here."
          />
        ) : (
          <div className="profile-list">
            {mine.map((e) => (
              <div className="profile-row" key={e.id}>
                <button className="profile-row-main" onClick={() => goToEntry(e.id)}>
                  <span className="profile-row-title">{e.title}</span>
                  <span className="profile-row-sub">
                    {e.interface}{e.ic ? ` · ${e.ic}` : ""} · Updated {fmtDate(e.modifiedDate)}
                  </span>
                </button>
                <div className="profile-row-badges">
                  {e.types.slice(0, 2).map((t) => <TypeBadge key={t} type={t} />)}
                </div>
                <div className="profile-row-actions">
                  <button className="icon-action" onClick={() => onEdit(e)} aria-label={`Edit ${e.title}`} title="Edit"><PencilLine size={15} /></button>
                  <button className="icon-action danger" onClick={() => onDelete(e)} aria-label={`Delete ${e.title}`} title="Delete"><Trash2 size={15} /></button>
                  <button className="icon-action" onClick={() => goToEntry(e.id)} aria-label={`Open ${e.title}`} title="Open"><ChevronRight size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
