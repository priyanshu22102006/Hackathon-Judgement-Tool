/**
 * seed.js – Populate the database with sample hackathon, team, and commits
 * so you can see the dashboards in action without a real GitHub webhook.
 *
 * Usage:  node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Hackathon = require("./models/Hackathon");
const Team = require("./models/Team");
const Commit = require("./models/Commit");

async function seed() {
  await connectDB();

  // Clean
  await Commit.deleteMany({});
  await Team.deleteMany({});
  await Hackathon.deleteMany({});

  // ── Hackathon ────────────────────────────────────────
  const hackathon = await Hackathon.create({
    name: "Diversion 2026",
    description: "48-hour on-site hackathon",
    startTime: new Date("2026-02-27T09:00:00Z"),
    endTime: new Date("2026-03-01T09:00:00Z"),
    venue: {
      label: "IEM Kolkata",
      latitude: 22.5726,
      longitude: 88.3639,
      radiusKm: 5,
    },
    status: "active",
  });

  // ── Team ─────────────────────────────────────────────
  const team = await Team.create({
    name: "Alpha Coders",
    hackathon: hackathon._id,
    repoFullName: "alpha-coders/hackathon-project",
    members: ["alice", "bob", "charlie"],
  });

  // ── Sample commits ───────────────────────────────────
  const now = new Date("2026-02-27T14:00:00Z");

  const sampleCommits = [
    {
      commitHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      message: "feat: add login form component",
      author: "alice",
      authorEmail: "alice@example.com",
      timestamp: new Date(now.getTime() - 3 * 3600000), // 3 hours ago
      url: "https://github.com/alpha-coders/hackathon-project/commit/a1b2c3d",
      branch: "main",
      filesChanged: [
        { filename: "src/Login.jsx", status: "added" },
        { filename: "src/App.jsx", status: "modified" },
      ],
      timeValid: true,
      ip: "49.37.200.100",
      location: { latitude: 22.57, longitude: 88.36, city: "Kolkata", region: "WB", country: "IN" },
      locationStatus: "on-site",
    },
    {
      commitHash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
      message: "fix: resolve CORS issue on API",
      author: "bob",
      authorEmail: "bob@example.com",
      timestamp: new Date(now.getTime() - 1 * 3600000),
      url: "https://github.com/alpha-coders/hackathon-project/commit/b2c3d4e",
      branch: "main",
      filesChanged: [
        { filename: "server/index.js", status: "modified" },
      ],
      timeValid: true,
      ip: "49.37.200.101",
      location: { latitude: 22.58, longitude: 88.37, city: "Kolkata", region: "WB", country: "IN" },
      locationStatus: "on-site",
    },
    {
      commitHash: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      message: "chore: pre-commit linter config",
      author: "charlie",
      authorEmail: "charlie@example.com",
      timestamp: new Date("2026-02-26T23:00:00Z"), // BEFORE hackathon start
      url: "https://github.com/alpha-coders/hackathon-project/commit/c3d4e5f",
      branch: "main",
      filesChanged: [
        { filename: ".eslintrc.json", status: "added" },
      ],
      timeValid: false, // outside window
      ip: "103.100.14.55",
      location: { latitude: 28.61, longitude: 77.20, city: "New Delhi", region: "DL", country: "IN" },
      locationStatus: "outside",
    },
    {
      commitHash: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
      message: "feat: implement dashboard charts",
      author: "alice",
      authorEmail: "alice@example.com",
      timestamp: new Date(now.getTime()),
      url: "https://github.com/alpha-coders/hackathon-project/commit/d4e5f6a",
      branch: "main",
      filesChanged: [
        { filename: "src/Dashboard.jsx", status: "added" },
        { filename: "src/utils/chart.js", status: "added" },
        { filename: "package.json", status: "modified" },
      ],
      timeValid: true,
      ip: null,
      location: {},
      locationStatus: "unknown",
    },
  ];

  for (const c of sampleCommits) {
    await Commit.create({ ...c, team: team._id, hackathon: hackathon._id });
  }

  console.log("✅  Seeded 1 hackathon, 1 team, 4 commits");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
