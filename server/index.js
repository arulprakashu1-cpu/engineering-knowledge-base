import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import { db, rowToEntry, entryToRow } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;
const IS_PROD = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me-in-prod";
const TOKEN_TTL = "7d";

if (IS_PROD && JWT_SECRET === "dev-secret-change-me-in-prod") {
  console.warn("[server] WARNING: JWT_SECRET is unset — set a strong JWT_SECRET env var in production.");
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "12mb" }));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
    if (!user) return res.status(401).json({ error: "User no longer exists" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

/* ------------------------------------------------------------------ */
/*  Auth routes                                                       */
/* ------------------------------------------------------------------ */

app.post("/api/auth/register", (req, res) => {
  const username = String(req.body.username || "").trim().toLowerCase();
  const email = String(req.body.email || "").trim().toLowerCase();
  const name = String(req.body.name || "").trim();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "Engineer").trim() || "Engineer";

  if (!USERNAME_RE.test(username)) {
    return res.status(400).json({ error: "Username must be 3–30 characters: letters, numbers, or underscore." });
  }
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "A valid email is required." });
  if (!name) return res.status(400).json({ error: "Name is required." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: "Password must include at least one letter and one number." });
  }

  if (db.prepare("SELECT id FROM users WHERE username = ?").get(username)) {
    return res.status(409).json({ error: "That username is already taken." });
  }
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare(
    "INSERT INTO users (username, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(username, email, name, role, hash, new Date().toISOString());

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  // Accept a username (preferred) or an email address in the same field.
  const identifier = String(req.body.username ?? req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!identifier || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(identifier, identifier);
  // Always run a hash comparison to keep the response time uniform (avoid user enumeration).
  const ok = user
    ? bcrypt.compareSync(password, user.password_hash)
    : bcrypt.compareSync(password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!user || !ok) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
});

app.get("/api/auth/me", authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

/* ------------------------------------------------------------------ */
/*  Entries routes (all require auth)                                 */
/* ------------------------------------------------------------------ */

app.get("/api/entries", authRequired, (req, res) => {
  // User-specific: each account only sees the entries it owns.
  const rows = db.prepare(
    "SELECT * FROM entries WHERE owner_id = ? ORDER BY created_date DESC, created_at DESC"
  ).all(req.user.id);
  res.json({ entries: rows.map(rowToEntry) });
});

app.post("/api/entries", authRequired, (req, res) => {
  const b = req.body || {};
  if (!b.title || !b.title.trim()) return res.status(400).json({ error: "Title is required." });
  if (!b.interface) return res.status(400).json({ error: "Interface is required." });

  const today = new Date().toISOString().slice(0, 10);
  const entry = {
    id: b.id || Math.random().toString(36).slice(2, 10),
    ownerId: req.user.id,
    title: b.title.trim(),
    interface: b.interface,
    ic: (b.ic || "").trim(),
    project: (b.project || "").trim(),
    types: Array.isArray(b.types) && b.types.length ? b.types : ["Reference"],
    tags: Array.isArray(b.tags) ? b.tags : [],
    content: b.content || "",
    attachments: Array.isArray(b.attachments) ? b.attachments : [],
    createdDate: b.createdDate || today,
    modifiedDate: today,
    createdBy: req.user.name,
  };
  db.prepare(`
    INSERT INTO entries (id, title, interface, ic, project, types, tags, content, attachments, created_date, modified_date, created_by, owner_id, created_at)
    VALUES (@id, @title, @interface, @ic, @project, @types, @tags, @content, @attachments, @created_date, @modified_date, @created_by, @owner_id, @created_at)
  `).run(entryToRow(entry, req.user.id));

  res.status(201).json({ entry });
});

app.put("/api/entries/:id", authRequired, (req, res) => {
  const existing = db.prepare("SELECT * FROM entries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Entry not found." });
  if (existing.owner_id != null && existing.owner_id !== req.user.id) {
    return res.status(403).json({ error: "You can only edit entries you created." });
  }

  const cur = rowToEntry(existing);
  const b = req.body || {};
  const merged = {
    ...cur,
    title: b.title != null ? String(b.title).trim() : cur.title,
    interface: b.interface != null ? b.interface : cur.interface,
    ic: b.ic != null ? String(b.ic).trim() : cur.ic,
    project: b.project != null ? String(b.project).trim() : cur.project,
    types: Array.isArray(b.types) ? b.types : cur.types,
    tags: Array.isArray(b.tags) ? b.tags : cur.tags,
    content: b.content != null ? b.content : cur.content,
    attachments: Array.isArray(b.attachments) ? b.attachments : cur.attachments,
    modifiedDate: new Date().toISOString().slice(0, 10),
  };
  db.prepare(`
    UPDATE entries SET title=@title, interface=@interface, ic=@ic, project=@project,
      types=@types, tags=@tags, content=@content, attachments=@attachments, modified_date=@modified_date
    WHERE id=@id
  `).run({
    id: merged.id,
    title: merged.title,
    interface: merged.interface,
    ic: merged.ic,
    project: merged.project,
    types: JSON.stringify(merged.types),
    tags: JSON.stringify(merged.tags),
    content: merged.content,
    attachments: JSON.stringify(merged.attachments),
    modified_date: merged.modifiedDate,
  });
  res.json({ entry: merged });
});

app.delete("/api/entries/:id", authRequired, (req, res) => {
  const existing = db.prepare("SELECT owner_id FROM entries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Entry not found." });
  if (existing.owner_id != null && existing.owner_id !== req.user.id) {
    return res.status(403).json({ error: "You can only delete entries you created." });
  }
  db.prepare("DELETE FROM entries WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ------------------------------------------------------------------ */
/*  Static frontend (production): serve the built Vite bundle          */
/* ------------------------------------------------------------------ */

const DIST_DIR = join(__dirname, "..", "dist");
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA fallback: any non-API route returns index.html.
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(join(DIST_DIR, "index.html")));
  console.log("[server] serving built frontend from /dist");
} else {
  console.log("[server] no /dist build found — run `npm run build` (API-only mode)");
}

app.listen(PORT, () => {
  console.log(`[server] Knowledge Base running on http://localhost:${PORT}`);
});
