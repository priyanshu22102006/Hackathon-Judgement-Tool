# Hackathon Monitor

> Real-time integrity monitoring for hackathons — verify that commits happen during the official time window and from the expected location.

Works on **Windows, macOS, and Linux** — no platform-specific scripts; all commands are standard npm.

---

## Architecture

```
┌─────────────┐  push event   ┌──────────────────────────────────────┐
│   GitHub     │──────────────▶│  Express Backend  (port 5001)        │
│  (Webhook)   │  POST /api/   │  ┌────────────────────────────────┐  │
└─────────────┘  webhook/      │  │ Webhook Auth  │ Geo-IP Lookup  │  │
                 github        │  │ Time Verify   │ Location Verify│  │
                               │  └──────────────┬───────────────-┘  │
                               │                 │                    │
                               │           MongoDB                    │
                               └─────────────────┬─────-──────────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    ▼                         ▼
                           Participant Dashboard       Judge Dashboard
                           (React – localhost:3000)  (React – /judge)
```

---

## Quick Start (all platforms)

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| MongoDB | any | Running locally **or** supply a remote `MONGO_URI` |
| Git | any | For cloning |

---

### 1. Clone & install

```bash
git clone <repo-url>
cd Hackathon-Judgement-Tool
```

### 2. Backend setup

```bash
cd backend
npm install

# Windows (PowerShell / CMD):
copy .env.example .env

# macOS / Linux:
cp .env.example .env
```

Open `backend/.env` and set at minimum:

```env
MONGO_URI=mongodb://127.0.0.1:27017/hackathon-monitor
PORT=5001
GITHUB_TOKEN=ghp_yourTokenHere   # recommended — see note below
```

Then start the dev server:

```bash
npm run dev      # nodemon — auto-restarts on file changes
```

> **The server auto-seeds the database on every startup** — you do **not** need to run `node seed.js` manually.

### 3. Frontend setup

Open a **new terminal** (keep the backend running):

```bash
cd frontend
npm install
npm run dev      # Vite dev server on http://localhost:3000
```

Open **http://localhost:3000** → Participant dashboard  
Open **http://localhost:3000/judge** → Judge dashboard

---

## Changing the Tracked Repository

All team/repo configuration lives in one place: `backend/seed.js`.

```js
// backend/seed.js  ← the only file you need to edit
const SEED_CONFIG = {
  team: {
    repoFullName: "owner/repo-name",   // ← change this
    ...
  },
};
```

**Workflow:**

1. Edit `repoFullName` in `backend/seed.js` and save.
2. `nodemon` detects the change → server restarts automatically.
3. The server detects the repo mismatch → wipes old data → seeds the new team → fetches commits from GitHub immediately.
4. Refresh **http://localhost:3000** — the new repo's commits appear instantly.

No manual commands. No server restart needed.

---

## GitHub API Rate Limits

Without a token the GitHub API allows **60 requests/hour** per IP (shared across all collaborators on the same network). With a token it's **5,000/hour**.

Add a Personal Access Token to `backend/.env`:

```env
GITHUB_TOKEN=ghp_yourTokenHere
```

Create one at **https://github.com/settings/tokens** — no extra scopes needed for public repos. For private repos, add the `repo` scope.

---

## Port Configuration

| Service | Default port | Config location |
|---------|-------------|-----------------|
| Backend (Express) | `5001` | `backend/.env` → `PORT` |
| Frontend (Vite) | `3000` | hardcoded in `frontend/vite.config.js` |
| Frontend → Backend proxy | `5001` | `frontend/vite.config.js` (reads `VITE_BACKEND_PORT` env, falls back to `5001`) |

If you need to run the backend on a different port, set `PORT` in `backend/.env` **and** set `VITE_BACKEND_PORT` in a `frontend/.env` file:

```env
# frontend/.env  (create this file if it doesn't exist)
VITE_BACKEND_PORT=5002
```

---

## Key Features

| Feature | How it works |
|---------|-------------|
| **Auto-reseed** | Changing `repoFullName` in `seed.js` + saving triggers nodemon → server detects DB mismatch → reseeds automatically. |
| **GitHub Poller** | Background job fetches commits every 2 minutes. On page load, an immediate sync is also triggered so data is never stale. |
| **Webhook Receiver** | `POST /api/webhook/github` — verifies HMAC signature, parses commits (used when deploying with a public URL). |
| **Time Verification** | Each commit timestamp is checked against the hackathon `startTime` / `endTime`. |
| **Location Verification** | Pusher's IP resolved via `geoip-lite` (offline MaxMind DB). Haversine distance checked against the venue geo-fence. |
| **Participant Dashboard** | Team's commit history with time/location badges and integrity summary. |
| **Judge Dashboard** | All teams for a hackathon — aggregate stats, flagged teams, per-commit drill-down. |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhook/github` | GitHub webhook receiver |
| `GET`  | `/api/hackathons` | List hackathons |
| `POST` | `/api/hackathons` | Create hackathon |
| `PUT`  | `/api/hackathons/:id/venue` | Update venue + re-verify commits |
| `GET`  | `/api/teams` | List teams |
| `POST` | `/api/teams` | Register team |
| `GET`  | `/api/participant/commits?team=<id>` | Commits for a team |
| `GET`  | `/api/participant/summary?team=<id>` | Summary stats for a team |
| `POST` | `/api/participant/location` | Report participant GPS location |
| `GET`  | `/api/judge/hackathon/:id/overview` | Full overview for judges |
| `GET`  | `/api/judge/team/:id/commits` | All commits for a team (judge view) |
| `POST` | `/api/sync/team/:teamId` | Manually trigger GitHub sync for one team |
| `POST` | `/api/sync/hackathon/:hackathonId` | Manually trigger GitHub sync for all teams |

---

## Connecting a Real GitHub Webhook (optional)

This is only needed when deploying on a server with a public URL. The GitHub poller works without it.

1. Deploy the backend to a server with a public URL.
2. Set `GITHUB_WEBHOOK_SECRET` in `backend/.env`.
3. On the GitHub repo → **Settings → Webhooks → Add webhook**:
   - **Payload URL:** `https://your-server.com/api/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** same value as `GITHUB_WEBHOOK_SECRET`
   - **Events:** select *Pushes*
4. Every push will now be captured, verified, and displayed in real time.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Frontend shows no data / blank dashboards | Make sure the backend is running (`npm run dev` in `backend/`). Check `PORT` in `backend/.env` matches the proxy in `frontend/vite.config.js`. |
| `Cannot GET /api/...` errors in browser console | Backend isn't running or `PORT` mismatch — see Port Configuration above. |
| Commits not appearing after changing `repoFullName` | Save the file again; check the backend terminal for `[auto-seed]` log lines. |
| GitHub API 403 / rate limited | Add `GITHUB_TOKEN` to `backend/.env`. |
| GitHub API 404 for repo | Check the `repoFullName` format is exactly `owner/repo` (no `https://github.com/` prefix). |
| MongoDB connection error | Ensure MongoDB is running. On Windows: `net start MongoDB`. On macOS/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`. |
