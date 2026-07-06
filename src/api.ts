import type { Entry } from "./types";

const TOKEN_KEY = "ekb_token";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }

  if (!res.ok) {
    const msg = (body && typeof body === "object" && "error" in body)
      ? String((body as { error: unknown }).error)
      : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return body as T;
}

/* ---------------- Auth ---------------- */

export function apiRegister(
  username: string, email: string, password: string, name: string, role?: string,
) {
  return request<{ token: string; user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password, name, role }),
  });
}

export function apiLogin(username: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function apiMe() {
  return request<{ user: AuthUser }>("/auth/me");
}

/* ---------------- Entries ---------------- */

export async function apiGetEntries(): Promise<Entry[]> {
  const { entries } = await request<{ entries: Entry[] }>("/entries");
  return entries;
}

export async function apiCreateEntry(entry: Partial<Entry>): Promise<Entry> {
  const { entry: created } = await request<{ entry: Entry }>("/entries", {
    method: "POST",
    body: JSON.stringify(entry),
  });
  return created;
}

export async function apiUpdateEntry(id: string, patch: Partial<Entry>): Promise<Entry> {
  const { entry } = await request<{ entry: Entry }>(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return entry;
}

export function apiDeleteEntry(id: string) {
  return request<{ ok: true }>(`/entries/${id}`, { method: "DELETE" });
}

export { ApiError };
