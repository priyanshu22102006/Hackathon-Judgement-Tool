/**
 * seed.js – Populate the database with sample hackathon, team, and commits
 * so you can see the dashboards in action without a real GitHub webhook.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CHANGE repoFullName (or any field) below and SAVE the file.
 * nodemon will restart the server which auto-reseeds + syncs the new repo.
 * Just refresh localhost:3000 — no manual `node seed.js` needed.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Manual usage:  node seed.js
 */
require("dotenv").config();
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const Hackathon = require("./models/Hackathon");
const Team = require("./models/Team");
const Commit = require("./models/Commit");
const User = require("./models/User");
const { syncAllTeams } = require("./services/githubPoller");

// ── EDIT THIS BLOCK to change the hackathon / team ──────────────────────────
const SEED_CONFIG = {
  hackathon: {
    name: "Diversion 2026",
    description: "48-hour on-site hackathon",
    startTime: new Date("2026-02-27T09:00:00Z"),
    endTime: new Date("2026-03-02T09:00:00Z"),
    venue: {
      label: "IEM Kolkata",
      latitude: 22.5726,
      longitude: 88.3639,
      radiusKm: 5,
    },
    status: "active",
  },
  team: {
    name: "Alpha Coders",
    // repoFullName: "pritimmondall/demo",   // ← change this to any repo
    repoFullName: "priyanshu22102006/Coding",
    members: ["alice", "bob", "charlie"],
  },
  users: [
    { name: "Priyanshu",  email: "priyanshuchandrasarker2210@gmail.com", password: "priyanshu154632",  role: "participant" },
    { name: "Pritim",     email: "mondalpritim14@gmail.com",             password: "pritim14082004",    role: "participant" },
    { name: "Judge One",  email: "judgesdiv-001@gmail.com",              password: "judgediv001",       role: "judge" },
    { name: "Judge Two",  email: "judgesdiv-002@gmail.com",              password: "judgediv002",       role: "judge" },
  ],
};
// ────────────────────────────────────────────────────────────────────────────

module.exports = SEED_CONFIG; // exported so server.js can read the config

async function seed(dbAlreadyConnected = false) {
  if (!dbAlreadyConnected) await connectDB();

  // Clean
  await Commit.deleteMany({});
  await Team.deleteMany({});
  await Hackathon.deleteMany({});
  await User.deleteMany({});

  // ── Hackathon ────────────────────────────────────────
  const hackathon = await Hackathon.create(SEED_CONFIG.hackathon);

  // ── Team ─────────────────────────────────────────────
  const team = await Team.create({
    ...SEED_CONFIG.team,
    hackathon: hackathon._id,
  });

  // ── Seed Users ──────────────────────────────────────────
  for (const u of SEED_CONFIG.users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({
      name: u.name,
      email: u.email.toLowerCase(),
      passwordHash,
      role: u.role,
    });
  }
  console.log(`✅  Seeded ${SEED_CONFIG.users.length} user accounts.`);

  // Immediately sync commits from GitHub so data is available on first page load.
  console.log(`⏳  Seeded hackathon + team. Fetching commits for ${team.repoFullName}…`);
  try {
    const syncResult = await syncAllTeams(hackathon._id);
    const repoName = Object.keys(syncResult)[0] || team.repoFullName;
    const stats = syncResult[repoName] || {};
    console.log(
      `✅  Sync complete for ${repoName}: ${stats.total ?? 0} commits fetched` +
      ` (${stats.new ?? 0} new, ${stats.updated ?? 0} updated).`
    );
  } catch (syncErr) {
    console.warn("⚠️  Commit sync failed (server will retry on next poll):", syncErr.message);
  }

  return { hackathon, team };
}

module.exports.seed = seed;

// Only exit when run directly (`node seed.js`)
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
