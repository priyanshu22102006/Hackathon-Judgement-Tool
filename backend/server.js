require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const webhookRoutes = require("./routes/webhook");
const hackathonRoutes = require("./routes/hackathon");
const teamRoutes = require("./routes/team");
const participantRoutes = require("./routes/participant");
const judgeRoutes = require("./routes/judge");
const syncRoutes = require("./routes/sync");
const authRoutes = require("./routes/auth");
const { authenticate, requireRole } = require("./middleware/authMiddleware");
const { startPollingLoop } = require("./services/githubPoller");
const SEED_CONFIG = require("./seed");
const { seed } = require("./seed");
const Team = require("./models/Team");
const User = require("./models/User");

const app = express();

// ── CORS ──────────────────────────────────────────────
app.use(cors());

// ── Body parsing ──────────────────────────────────────
// The webhook route needs the raw body to verify the HMAC signature,
// so we conditionally parse JSON.
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────
app.use("/api/auth", authRoutes);              // public
app.use("/api/webhook", webhookRoutes);         // secured by HMAC
app.use("/api/hackathons", hackathonRoutes);    // public (read)
app.use("/api/teams", teamRoutes);              // public (read)
app.use("/api/participant", authenticate, requireRole("participant"), participantRoutes);
app.use("/api/judge", authenticate, requireRole("judge"), judgeRoutes);
app.use("/api/sync", syncRoutes);

// ── Health check ──────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// ── Global error handlers (prevent silent crashes) ─
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err.message);
  console.error(err.stack);
});
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled promise rejection:", reason);
});

// ── Start ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // ── Auto-reseed if seed.js config changed ────────────────────────────
    // When you change repoFullName (or any field) in seed.js and save,
    // nodemon restarts the server here. We detect the mismatch and reseed
    // automatically so the new repo's commits are ready on the first refresh.
    const existingTeam = await Team.findOne({});
    const existingUsers = await User.countDocuments();
    const configuredRepo = SEED_CONFIG.team?.repoFullName;
    if (!existingTeam || existingTeam.repoFullName !== configuredRepo || existingUsers === 0) {
      console.log(
        `[auto-seed] Repo mismatch or missing users: DB has "${
          existingTeam?.repoFullName ?? "(none)"
        }", config says "${configuredRepo}", users: ${existingUsers}. Re-seeding now…`
      );
      await seed(true); // true = DB already connected, don't reconnect
    }
    // ────────────────────────────────────────────────────────────────────

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

      // Start background GitHub poller (syncs every 2 minutes)
      // Uses 1 API call per repo per cycle — 60 unauthenticated calls/hr
      // Add GITHUB_TOKEN to .env for 5000 calls/hr
      startPollingLoop(120_000);
    });
  })
  .catch((err) => {
    console.error("[FATAL] Failed to start server:", err.message);
    process.exit(1);
  });
