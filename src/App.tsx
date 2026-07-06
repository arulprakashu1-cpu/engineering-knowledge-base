import { useState, useEffect, useCallback } from "react";
import { CircuitBoard, Loader2, AlertTriangle } from "lucide-react";
import type { Entry, Theme, Page } from "./types";
import { GlobalStyle } from "./GlobalStyle";
import { ThreeStyle } from "./three/ThreeStyle";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Dashboard } from "./pages/Dashboard";
import { Explore } from "./pages/Explore";
import { AddKnowledge } from "./pages/AddKnowledge";
import { SearchKnowledge } from "./pages/SearchKnowledge";
import { KnowledgeDetail } from "./pages/KnowledgeDetail";
import { ReviewPackage } from "./pages/ReviewPackage";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useAuth } from "./auth/AuthContext";
import { apiGetEntries, apiCreateEntry, apiUpdateEntry, apiDeleteEntry } from "./api";

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [theme, setTheme] = useState<Theme>("dark");
  const [page, setPage] = useState<Page>("dashboard");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [topQuery, setTopQuery] = useState("");
  const [searchSeed, setSearchSeed] = useState<{ q: string; iface: string }>({ q: "", iface: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    setEntriesError("");
    try {
      setEntries(await apiGetEntries());
    } catch (err) {
      setEntriesError(err instanceof Error ? err.message : "Failed to load knowledge entries.");
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  // Load entries once the user is authenticated; clear them on logout.
  useEffect(() => {
    if (user) { loadEntries(); }
    else {
      setEntries([]); setPage("dashboard"); setSelectedId(null); setEditingId(null);
      setDeleteTarget(null); setRecentlyViewed([]);
    }
  }, [user, loadEntries]);

  // Navigate via the sidebar; starting a fresh "Add" always clears any edit in progress.
  const navigate = (p: Page) => {
    if (p === "add") setEditingId(null);
    setPage(p);
  };

  const goToEntry = (id: string) => {
    setSelectedId(id);
    setRecentlyViewed((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 6));
    setPage("detail");
  };
  const goToInterface = (name: string) => {
    setSearchSeed({ q: "", iface: name });
    setPage("search");
  };
  const handleTopSearch = (q: string) => {
    setSearchSeed({ q, iface: "" });
    setPage("search");
  };
  const addEntry = async (entry: Entry) => {
    const created = await apiCreateEntry(entry);
    setEntries((prev) => [created, ...prev]);
  };

  const updateEntry = async (entry: Entry) => {
    const saved = await apiUpdateEntry(entry.id, entry);
    setEntries((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
    setEditingId(null);
    goToEntry(saved.id);
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setPage("add");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await apiDeleteEntry(deleteTarget.id);
      const deletedId = deleteTarget.id;
      setEntries((prev) => prev.filter((e) => e.id !== deletedId));
      setRecentlyViewed((prev) => prev.filter((x) => x !== deletedId));
      setDeleteTarget(null);
      // If we were viewing/editing the entry that just vanished, step away.
      if (selectedId === deletedId && page === "detail") setPage("search");
      if (editingId === deletedId) { setEditingId(null); setPage("search"); }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete entry.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const editingEntry = editingId ? entries.find((e) => e.id === editingId) || null : null;
  const selectedEntry = entries.find((e) => e.id === selectedId) || null;
  const existingICs = Array.from(new Set(entries.map((e) => e.ic).filter(Boolean)));
  const existingInterfaces = Array.from(new Set(entries.map((e) => e.interface).filter(Boolean)));

  const breadcrumbLabel: Record<Page, string> = {
    dashboard: "Dashboard", explore: "3D Explorer",
    add: editingEntry ? "Edit Knowledge" : "Add Knowledge",
    search: "Search Knowledge", review: "Review Package", settings: "Settings",
    profile: "My Profile",
    detail: selectedEntry ? selectedEntry.title : "Entry",
  };

  return (
    <div data-theme={theme} className="ekb-root">
      <GlobalStyle />
      <ThreeStyle />

      {authLoading ? (
        <div className="app-splash"><CircuitBoard size={30} /><Loader2 size={18} className="app-splash-spin" /><span>Loading…</span></div>
      ) : !user ? (
        <Login theme={theme} setTheme={setTheme} />
      ) : (
        <>
          <Sidebar page={page} setPage={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={logout} />
          <div className="main-col">
            <Topbar
              theme={theme} setTheme={setTheme} query={topQuery} setQuery={setTopQuery} onSearchSubmit={handleTopSearch}
              breadcrumb={<><CircuitBoard size={13} /><span>{breadcrumbLabel[page]}</span></>}
              onMenuClick={() => setSidebarOpen(true)}
            />
            <main className="content">
              {entriesLoading ? (
                <div className="page-loading"><Loader2 size={20} className="app-splash-spin" /> Loading knowledge base…</div>
              ) : entriesError ? (
                <div className="page-error">
                  <AlertTriangle size={22} />
                  <div className="empty-title">Couldn't load entries</div>
                  <div className="empty-note">{entriesError}</div>
                  <button className="btn-primary" onClick={loadEntries}>Retry</button>
                </div>
              ) : (
                <>
                  {page === "dashboard" && <Dashboard entries={entries} recentlyViewed={recentlyViewed} goToEntry={goToEntry} goToInterface={goToInterface} goToAdd={() => navigate("add")} theme={theme} />}
                  {page === "explore" && <Explore entries={entries} goToInterface={goToInterface} theme={theme} />}
                  {page === "add" && (
                    <AddKnowledge
                      key={editingId ?? "new"}
                      onSave={editingEntry ? updateEntry : addEntry}
                      existingICs={existingICs}
                      existingInterfaces={existingInterfaces}
                      initial={editingEntry}
                      onCancel={() => { setEditingId(null); if (editingEntry) goToEntry(editingEntry.id); else setPage("dashboard"); }}
                    />
                  )}
                  {page === "search" && <SearchKnowledge entries={entries} initialQuery={searchSeed.q} initialInterface={searchSeed.iface} goToEntry={goToEntry} />}
                  {page === "detail" && <KnowledgeDetail entry={selectedEntry} entries={entries} goBack={() => setPage("search")} goToEntry={goToEntry} currentUserId={user.id} onEdit={startEdit} onDelete={setDeleteTarget} />}
                  {page === "review" && <ReviewPackage entries={entries} />}
                  {page === "profile" && <Profile user={user} entries={entries} goToEntry={goToEntry} onEdit={startEdit} onDelete={setDeleteTarget} goToAdd={() => navigate("add")} />}
                  {page === "settings" && <Settings theme={theme} setTheme={setTheme} user={user} />}
                </>
              )}
            </main>
          </div>
          <ConfirmDialog
            open={!!deleteTarget}
            title="Delete this entry?"
            message={
              <>
                <strong>{deleteTarget?.title}</strong> will be permanently removed from the
                knowledge base. This action cannot be undone.
                {deleteError && <div className="modal-error">{deleteError}</div>}
              </>
            }
            confirmLabel={deleteBusy ? "Deleting…" : "Delete entry"}
            busy={deleteBusy}
            onConfirm={confirmDelete}
            onCancel={() => { if (!deleteBusy) { setDeleteTarget(null); setDeleteError(""); } }}
          />
        </>
      )}
    </div>
  );
}
