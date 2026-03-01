# Hackathon Monitor

> Real-time integrity monitoring for hackathons — verify that commits happen during the official time window and from the expected location.

## Architecture

```
┌─────────────┐  push event   ┌──────────────────┐
│   GitHub     │──────────────▶│  Express Backend  │
│  (Webhook)   │  POST /api/   │  ┌──────────────┐ │
└─────────────┘  webhook/      │  │ Webhook Auth  │ │
                 github        │  │ ────────────  │ │
                               │  │ Geo-IP Lookup │ │
                               │  │ Time Verify   │ │
                               │  │ Location      │ │
                               │  │   Verify      │ │
                               │  └──────┬───────┘ │
                               │         │         │
                               │    MongoDB        │
                               └────┬────┬─────────┘
                                    │    │
                     ┌──────────────┘    └──────────────┐
                     ▼                                   ▼
            Participant Dashboard               Judge Dashboard
            (React – /  )                  (React – /judge )
```

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally (or a connection URI)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit MONGO_URI & GITHUB_WEBHOOK_SECRET
node seed.js            # populate sample data
npm run dev             # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:3000 (proxies /api → :5000)
```

Open **http://localhost:3000** → Participant dashboard  
Open **http://localhost:3000/judge** → Judge dashboard

---

## Key Features

| Feature | How it works |
|---|---|
| **Webhook Receiver** | `POST /api/webhook/github` — GitHub sends push events; we verify the HMAC signature and parse every commit. |
| **Time Verification** | Each commit timestamp is compared against the official `startTime` / `endTime` of the hackathon. |
| **Location Verification** | The pusher's IP is resolved via `geoip-lite` (offline MaxMind DB). A Haversine distance check compares the resolved location against the venue geo-fence. |
| **Participant Dashboard** | Shows the participant their team's commit history with time/location badges and summary stats. |
| **Judge Dashboard** | Lists all teams for a hackathon, showing aggregate stats and flagging teams with suspicious commits. Click a team to expand and see every commit. |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/webhook/github` | GitHub webhook receiver |
| `GET`  | `/api/hackathons` | List hackathons |
| `POST` | `/api/hackathons` | Create hackathon |
| `GET`  | `/api/teams?hackathon=<id>` | List teams |
| `POST` | `/api/teams` | Register team |
| `GET`  | `/api/participant/commits?team=<id>` | Commits for a team |
| `GET`  | `/api/participant/summary?team=<id>` | Summary stats for a team |
| `GET`  | `/api/judge/hackathon/:id/overview` | Full overview for judges |
| `GET`  | `/api/judge/team/:id/commits` | Commits for a specific team (judge) |

## Connecting a Real GitHub Webhook

1. Create a hackathon via `POST /api/hackathons`
2. Register a team with their `repoFullName` via `POST /api/teams`
3. On the GitHub repo → Settings → Webhooks → Add webhook:
   - **Payload URL:** `https://your-server.com/api/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** same as `GITHUB_WEBHOOK_SECRET` in `.env`
   - **Events:** select *Pushes*
4. Every push will now be captured, verified, and displayed on both dashboards.
