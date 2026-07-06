import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { SEED_ENTRIES } from "./seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// DB_PATH lets a host point the SQLite file at a mounted persistent volume.
const DB_PATH = process.env.DB_PATH || join(__dirname, "data.db");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE,
    email         TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'Engineer',
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id            TEXT PRIMARY KEY,
    title         TEXT NOT NULL,
    interface     TEXT NOT NULL,
    ic            TEXT NOT NULL DEFAULT '',
    project       TEXT NOT NULL DEFAULT '',
    types         TEXT NOT NULL DEFAULT '[]',
    tags          TEXT NOT NULL DEFAULT '[]',
    content       TEXT NOT NULL DEFAULT '',
    attachments   TEXT NOT NULL DEFAULT '[]',
    created_date  TEXT NOT NULL,
    modified_date TEXT NOT NULL,
    created_by    TEXT NOT NULL DEFAULT '',
    owner_id      INTEGER,
    created_at    TEXT NOT NULL
  );
`);

/* Migration: older databases were created before the `username` column existed.
   Add it, backfill from the email local-part, and enforce uniqueness. */
function ensureUsernameColumn() {
  const cols = db.prepare("PRAGMA table_info(users)").all();
  if (!cols.some((c) => c.name === "username")) {
    db.exec("ALTER TABLE users ADD COLUMN username TEXT");
  }
  // Backfill any users still missing a username (unique-safe local-part of email).
  const orphans = db.prepare("SELECT id, email FROM users WHERE username IS NULL OR username = ''").all();
  for (const u of orphans) {
    const base = String(u.email).split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || `user${u.id}`;
    let candidate = base;
    let n = 1;
    while (db.prepare("SELECT id FROM users WHERE username = ? AND id != ?").get(candidate, u.id)) {
      candidate = `${base}${n++}`;
    }
    db.prepare("UPDATE users SET username = ? WHERE id = ?").run(candidate, u.id);
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)");
}
ensureUsernameColumn();

/** Convert a DB row into the API entry shape (parse JSON columns). */
export function rowToEntry(row) {
  return {
    id: row.id,
    ownerId: row.owner_id ?? null,
    title: row.title,
    interface: row.interface,
    ic: row.ic,
    project: row.project,
    types: JSON.parse(row.types),
    tags: JSON.parse(row.tags),
    content: row.content,
    attachments: JSON.parse(row.attachments),
    createdDate: row.created_date,
    modifiedDate: row.modified_date,
    createdBy: row.created_by,
  };
}

const insertEntry = db.prepare(`
  INSERT INTO entries (id, title, interface, ic, project, types, tags, content, attachments, created_date, modified_date, created_by, owner_id, created_at)
  VALUES (@id, @title, @interface, @ic, @project, @types, @tags, @content, @attachments, @created_date, @modified_date, @created_by, @owner_id, @created_at)
`);

export function entryToRow(e, ownerId) {
  return {
    id: e.id,
    title: e.title,
    interface: e.interface,
    ic: e.ic || "",
    project: e.project || "",
    types: JSON.stringify(e.types || []),
    tags: JSON.stringify(e.tags || []),
    content: e.content || "",
    attachments: JSON.stringify(e.attachments || []),
    created_date: e.createdDate,
    modified_date: e.modifiedDate,
    created_by: e.createdBy || "",
    owner_id: ownerId ?? null,
    created_at: new Date().toISOString(),
  };
}

/**
 * One-time seed: a demo user + the sample knowledge entries.
 * Runs only on an empty database. Set SEED_DEMO=false to deploy a blank
 * production instance with no demo account or sample data.
 */
function seed() {
  if (process.env.SEED_DEMO === "false") {
    console.log("[seed] SEED_DEMO=false — skipping demo user + sample entries");
    return;
  }
  const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (userCount === 0) {
    const hash = bcrypt.hashSync("demo1234", 10);
    db.prepare(
      "INSERT INTO users (username, email, name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run("demo", "demo@ekb.local", "Ramu S.", "Hardware Design Engineer", hash, new Date().toISOString());
    console.log("[seed] created demo user  →  demo / demo1234");
  }

  const entryCount = db.prepare("SELECT COUNT(*) AS n FROM entries").get().n;
  if (entryCount === 0) {
    const demo = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@ekb.local");
    const ownerId = demo ? demo.id : null;
    const insertMany = db.transaction((entries) => {
      for (const e of entries) insertEntry.run(entryToRow(e, ownerId));
    });
    insertMany(SEED_ENTRIES);
    console.log(`[seed] inserted ${SEED_ENTRIES.length} sample entries`);
  }
}

seed();
