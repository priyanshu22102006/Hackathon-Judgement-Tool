const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");

/**
 * Normalise a GitHub URL or shorthand into "owner/repo".
 * Accepts:  https://github.com/owner/repo(.git)  |  owner/repo
 */
function normaliseRepo(raw) {
  if (!raw) return "";
  const s = raw.trim().replace(/\.git$/, "");
  // Match https://github.com/owner/repo or github.com/owner/repo
  const ghMatch = s.match(/github\.com\/([\w.-]+\/[\w.-]+)/);
  if (ghMatch) return ghMatch[1];
  // Already owner/repo
  if (/^[\w.-]+\/[\w.-]+$/.test(s)) return s;
  return "";
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_change_me";
const TOKEN_EXPIRY = "7d";

// ── POST /api/auth/register ───────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "email, password and role are required" });
    }
    if (!["participant", "judge"].includes(role)) {
      return res.status(400).json({ error: 'role must be "participant" or "judge"' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || "",
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("[auth/register]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password, githubRepo } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ── Participant: resolve GitHub repo → Team ────────────────────────
    let teamId = user.teamId || null;
    let resolvedRepo = user.githubRepo || "";

    if (user.role === "participant" && githubRepo) {
      const repoFullName = normaliseRepo(githubRepo);
      if (!repoFullName) {
        return res.status(400).json({ error: "Invalid GitHub repo format. Use owner/repo or the full GitHub URL." });
      }

      // Find the most recent active (or any) hackathon
      const hackathon =
        (await Hackathon.findOne({ status: "active" }).sort({ startTime: -1 })) ||
        (await Hackathon.findOne().sort({ startTime: -1 }));

      if (!hackathon) {
        return res.status(400).json({ error: "No hackathon found in the system yet." });
      }

      // Find or create a Team for this repo + hackathon
      let team = await Team.findOneAndUpdate(
        { hackathon: hackathon._id, repoFullName },
        {
          $setOnInsert: {
            name: repoFullName.split("/")[1] || repoFullName,
            hackathon: hackathon._id,
            repoFullName,
            members: [user.name || user.email],
          },
        },
        { upsert: true, new: true }
      );

      teamId = team._id;
      resolvedRepo = repoFullName;

      // Persist teamId + repo on the user record
      await User.findByIdAndUpdate(user._id, {
        teamId: team._id,
        githubRepo: repoFullName,
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: teamId ? String(teamId) : null,
        githubRepo: resolvedRepo,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
