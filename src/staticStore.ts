/**
 * Browser-only data layer for the static GitHub Pages demo (no backend).
 * Mirrors the server's API shape but persists to localStorage, so the whole
 * app works offline. Auth here is NOT secure — it's a showcase, not production.
 */
import type { Entry } from "./types";
import type { AuthUser } from "./api";
import { SAMPLE_ENTRIES } from "./data";
import { ApiError } from "./apiError";

interface StoredUser extends AuthUser {
  password: string;
}

const USERS_KEY = "ekb_static_users";
const ENTRIES_KEY = "ekb_static_entries";
const SEEDED_KEY = "ekb_static_seeded";
const TOKEN_KEY = "ekb_token";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Accounts available in the demo. Auth here is a showcase, not secure — these
// credentials intentionally live in the (public) source, same as `demo`.
const SEED_USERS: StoredUser[] = [
  {
    id: 1, username: "demo", email: "demo@ekb.local", name: "Ramu S.",
    role: "Hardware Design Engineer", createdAt: new Date().toISOString(), password: "demo1234",
  },
  {
    id: 2, username: "satheesh", email: "satheesh@ekb.local", name: "Satheesh",
    role: "Hardware Design Engineer", createdAt: new Date().toISOString(), password: "Satheesh@007",
  },
];

/** A per-owner copy of the sample entries (ids suffixed to stay unique). */
function entriesFor(ownerId: number): Entry[] {
  return SAMPLE_ENTRIES.map((e) => ({ ...e, id: `${e.id}-u${ownerId}`, ownerId }));
}

function ensureSeed() {
  let users = read<StoredUser[]>(USERS_KEY, []);
  if (users.length === 0) {
    write(USERS_KEY, SEED_USERS);
    write(ENTRIES_KEY, SEED_USERS.flatMap((u) => entriesFor(u.id)));
    return;
  }
  // Self-heal browsers seeded before a new account existed: add any missing
  // seed user (e.g. satheesh) and its starter entries without touching the rest.
  const entries = read<Entry[]>(ENTRIES_KEY, []);
  let changed = false;
  for (const seed of SEED_USERS) {
    if (users.some((u) => u.username === seed.username)) continue;
    users = [...users, seed];
    if (!entries.some((e) => e.ownerId === seed.id)) entries.push(...entriesFor(seed.id));
    changed = true;
  }
  if (changed) { write(USERS_KEY, users); write(ENTRIES_KEY, entries); }
}

/** Called once at startup: seed data and auto-sign-in as demo on the first visit. */
export function staticInit() {
  ensureSeed();
  if (!localStorage.getItem(SEEDED_KEY)) {
    localStorage.setItem(TOKEN_KEY, "1"); // land straight in the populated app
    localStorage.setItem(SEEDED_KEY, "1");
  }
}

function publicUser(u: StoredUser): AuthUser {
  return { id: u.id, username: u.username, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt };
}
function currentUser(): StoredUser | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  return read<StoredUser[]>(USERS_KEY, []).find((u) => String(u.id) === token) || null;
}
function requireUser(): StoredUser {
  const u = currentUser();
  if (!u) throw new ApiError("Not authenticated", 401);
  return u;
}
const uid = () => Math.random().toString(36).slice(2, 10);

export async function login(username: string, password: string) {
  ensureSeed();
  const id = username.trim().toLowerCase();
  const users = read<StoredUser[]>(USERS_KEY, []);
  const user = users.find((u) => u.username === id || u.email === id);
  if (!user || user.password !== password) {
    throw new ApiError("Incorrect username or password.", 401);
  }
  localStorage.setItem(TOKEN_KEY, String(user.id));
  return { token: String(user.id), user: publicUser(user) };
}

export async function register(username: string, email: string, password: string, name: string, role?: string) {
  ensureSeed();
  const u = username.trim().toLowerCase();
  const mail = email.trim().toLowerCase();
  if (!USERNAME_RE.test(u)) throw new ApiError("Username must be 3–30 characters: letters, numbers, or underscore.", 400);
  if (!EMAIL_RE.test(mail)) throw new ApiError("A valid email is required.", 400);
  if (!name.trim()) throw new ApiError("Name is required.", 400);
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ApiError("Password must be at least 8 characters and include a letter and a number.", 400);
  }
  const users = read<StoredUser[]>(USERS_KEY, []);
  if (users.some((x) => x.username === u)) throw new ApiError("That username is already taken.", 409);
  if (users.some((x) => x.email === mail)) throw new ApiError("An account with that email already exists.", 409);

  const user: StoredUser = {
    id: (users.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1,
    username: u, email: mail, name: name.trim(), role: role?.trim() || "Engineer",
    createdAt: new Date().toISOString(), password,
  };
  write(USERS_KEY, [...users, user]);
  localStorage.setItem(TOKEN_KEY, String(user.id));
  return { token: String(user.id), user: publicUser(user) };
}

export async function me() {
  return { user: publicUser(requireUser()) };
}

export async function getEntries(): Promise<Entry[]> {
  const user = requireUser();
  return read<Entry[]>(ENTRIES_KEY, []).filter((e) => e.ownerId === user.id);
}

export async function createEntry(entry: Partial<Entry>): Promise<Entry> {
  const user = requireUser();
  const today = new Date().toISOString().slice(0, 10);
  const created: Entry = {
    id: entry.id || uid(),
    ownerId: user.id,
    title: (entry.title || "").trim(),
    interface: entry.interface || "",
    ic: (entry.ic || "").trim(),
    project: (entry.project || "").trim(),
    types: entry.types?.length ? entry.types : ["Reference"],
    tags: entry.tags || [],
    content: entry.content || "",
    attachments: entry.attachments || [],
    createdDate: entry.createdDate || today,
    modifiedDate: today,
    createdBy: user.name,
  };
  write(ENTRIES_KEY, [created, ...read<Entry[]>(ENTRIES_KEY, [])]);
  return created;
}

export async function updateEntry(id: string, patch: Partial<Entry>): Promise<Entry> {
  const user = requireUser();
  const all = read<Entry[]>(ENTRIES_KEY, []);
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) throw new ApiError("Entry not found.", 404);
  if (all[idx].ownerId !== user.id) throw new ApiError("You can only edit entries you created.", 403);
  const merged: Entry = { ...all[idx], ...patch, id, ownerId: all[idx].ownerId, modifiedDate: new Date().toISOString().slice(0, 10) };
  all[idx] = merged;
  write(ENTRIES_KEY, all);
  return merged;
}

export async function deleteEntry(id: string) {
  const user = requireUser();
  const all = read<Entry[]>(ENTRIES_KEY, []);
  const target = all.find((e) => e.id === id);
  if (!target) throw new ApiError("Entry not found.", 404);
  if (target.ownerId !== user.id) throw new ApiError("You can only delete entries you created.", 403);
  write(ENTRIES_KEY, all.filter((e) => e.id !== id));
  return { ok: true as const };
}
