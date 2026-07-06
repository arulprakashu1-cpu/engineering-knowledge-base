# Engineering Knowledge Base (3D, full-stack)

A searchable knowledge base for PCB / hardware-design engineers — requirements,
checklists, lessons learned, and references organized by interface and IC, with a
teal/copper PCB-trace visual theme and **3D throughout**. Now a full-stack app with a
real API, a SQLite database, and JWT authentication.

## Tech stack

**Frontend**
- **Vite 8** + **React 19** + **TypeScript** (strict)
- **three.js** + **@react-three/fiber** + **@react-three/drei** for WebGL 3D
- **lucide-react** for icons — every 3D scene is procedural (no external assets)

**Backend**
- **Express 5** REST API
- **better-sqlite3** for storage (a `server/data.db` file, created on first run)
- **JWT** auth (`jsonwebtoken`) with **bcrypt** password hashing

## Run

```bash
npm install
npm run dev      # runs BOTH: API on :4000 and web on :5173 (Vite proxies /api → :4000)
```

Then open the printed web URL. On first run the DB is seeded with a demo user and the
20 sample entries.

**Demo login** — username `demo` / password `demo1234` (the demo user's email
also works in the username field) — or register a new account.

Other scripts:

```bash
npm run server   # API only (node server/index.js)
npm run client   # web only (vite)
npm run build    # typecheck (tsc -b) + production build of the frontend
npm start        # production: serve built dist/ + API from ONE process (port 4000)
```

## Deploy (production)

In production the Express server serves the built `dist/` **and** the API from a single
process/port. Set `JWT_SECRET` (strong random) and, if the host has a persistent disk,
point `DB_PATH` at it so the SQLite data survives restarts.

```bash
npm run build && NODE_ENV=production JWT_SECRET=$(openssl rand -hex 32) npm start
```

### Fly.io (configured — see `fly.toml` + `Dockerfile`)

```bash
# 1. Install flyctl and sign in
#    Windows: iwr https://fly.io/install.ps1 -useb | iex
#    macOS/Linux: curl -L https://fly.io/install.sh | sh
fly auth login

# 2. Pick a unique app name and set it as `app` in fly.toml, then create the app
fly apps create YOUR-APP-NAME

# 3. Create the persistent volume for the SQLite DB (same region as fly.toml)
fly volumes create ekb_data --size 1 --region iad --app YOUR-APP-NAME

# 4. Set a strong JWT secret
fly secrets set JWT_SECRET=$(openssl rand -hex 32) --app YOUR-APP-NAME

# 5. Deploy (Fly builds the Dockerfile remotely — no local Docker needed)
fly deploy --app YOUR-APP-NAME

# 6. Open the live URL → https://YOUR-APP-NAME.fly.dev
fly open --app YOUR-APP-NAME
```

Keep it to a single machine (SQLite is single-writer): `fly scale count 1`.
Other hosts: the included `Dockerfile` runs anywhere, and `render.yaml` is a Render blueprint.

## API

All `/api/entries` routes require a `Authorization: Bearer <token>` header.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account → `{ token, user }` |
| POST | `/api/auth/login` | Sign in → `{ token, user }` |
| GET  | `/api/auth/me` | Current user from token |
| GET  | `/api/entries` | List all entries |
| POST | `/api/entries` | Create an entry (server stamps `createdBy`) |
| PUT  | `/api/entries/:id` | Update an entry |
| DELETE | `/api/entries/:id` | Delete an entry |

## 3D pieces

| Component | Where | Tech |
| --- | --- | --- |
| `HeroScene` | Dashboard hero + login visual | R3F / WebGL — animated procedural PCB |
| `ICChip3D` | Each interface card | Pure **CSS 3D** (no WebGL) — safe to render ~11 at once |
| `InterfaceGalaxy` | 3D Explorer page | R3F / WebGL — orbitable node constellation |

Only one WebGL context is ever live at a time. Scenes respect `prefers-reduced-motion`
and both light/dark themes.

## Structure

```
server/
  index.js             Express app: auth + entries routes, JWT middleware
  db.js                SQLite schema, row<->entry mapping, one-time seed
  seed.js              sample knowledge entries
  data.db              SQLite file (git-ignored, created on first run)
src/
  App.tsx              app shell: auth gate, theme, routing, entry loading
  api.ts               fetch client (token handling, typed calls)
  auth/AuthContext.tsx React context: user, login, register, logout, session restore
  types.ts             shared TypeScript types
  data.ts              interface/IC/tag constants
  lib.tsx              utils, markdown renderer, shared UI atoms
  GlobalStyle.tsx      design-token CSS (light/dark) + motion layer
  components/          Sidebar (user + logout), Topbar
  pages/               Login, Dashboard, Explore, AddKnowledge, SearchKnowledge,
                       KnowledgeDetail, ReviewPackage, Settings
  three/               ThreeStyle, HeroScene, ICChip3D, InterfaceGalaxy
```

## Notes / possible follow-ups

- Auth token is stored in `localStorage`; sessions restore on refresh via `/api/auth/me`.
- Entries are **user-specific**: `GET /api/entries` returns only the signed-in user's own
  entries (`owner_id`), and edit/delete are owner-only. New accounts start with an empty
  knowledge base and populate it via **Add Knowledge**. The demo user owns the 20 seed entries.
- The production JS bundle is ~1.3 MB (three.js). Code-split the Explorer with
  `React.lazy` for a lighter initial load.
- For production, set a real `JWT_SECRET` env var (defaults to a dev value) and serve
  the built `dist/` behind the API.
