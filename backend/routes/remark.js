const express = require("express");
const router = express.Router();
const ScoringCriteria = require("../models/ScoringCriteria");
const Remark = require("../models/Remark");
const Team = require("../models/Team");

/* ──────────────────────────────────────────────────────────
   SCORING CRITERIA  (per hackathon — the "template")
   ────────────────────────────────────────────────────────── */

/**
 * GET /api/remarks/criteria?hackathon=<id>
 * Returns the scoring sections for a hackathon.
 */
router.get("/criteria", async (req, res) => {
  try {
    const { hackathon } = req.query;
    if (!hackathon) return res.status(400).json({ error: "hackathon query param required" });

    const criteria = await ScoringCriteria.findOne({ hackathon });
    res.json(criteria || { hackathon, sections: [] });
  } catch (err) {
    console.error("[remarks] criteria GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/remarks/criteria
 * Create or update scoring sections for a hackathon.
 * Body: { hackathon, sections: [{ name, maxMarks }] }
 */
router.put("/criteria", async (req, res) => {
  try {
    const { hackathon, sections } = req.body;
    if (!hackathon || !sections) {
      return res.status(400).json({ error: "hackathon and sections are required" });
    }

    const criteria = await ScoringCriteria.findOneAndUpdate(
      { hackathon },
      { hackathon, sections },
      { upsert: true, new: true, runValidators: true }
    );

    // When criteria change, update all existing remarks for this hackathon
    // so any new sections are added and removed sections are cleaned up.
    const remarks = await Remark.find({ hackathon });
    for (const remark of remarks) {
      const updatedScores = sections.map((sec) => {
        const existing = remark.scores.find((s) => s.sectionName === sec.name);
        return {
          sectionName: sec.name,
          maxMarks: sec.maxMarks,
          marks: existing ? Math.min(existing.marks, sec.maxMarks) : 0,
        };
      });
      remark.scores = updatedScores;
      remark.maxTotalMarks = updatedScores.reduce((s, sc) => s + sc.maxMarks, 0);
      remark.totalMarks = updatedScores.reduce((s, sc) => s + sc.marks, 0);
      await remark.save();
    }

    res.json(criteria);
  } catch (err) {
    console.error("[remarks] criteria PUT error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ──────────────────────────────────────────────────────────
   REMARKS / SCORES  (per team)
   ────────────────────────────────────────────────────────── */

/**
 * GET /api/remarks/scores?hackathon=<id>
 * Returns all team remarks for a hackathon.
 */
router.get("/scores", async (req, res) => {
  try {
    const filter = {};
    if (req.query.hackathon) filter.hackathon = req.query.hackathon;
    if (req.query.team) filter.team = req.query.team;

    const remarks = await Remark.find(filter)
      .populate("team", "name repoFullName")
      .sort({ totalMarks: -1 });

    res.json(remarks);
  } catch (err) {
    console.error("[remarks] scores GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/remarks/scores/team/:teamId
 * Returns the remark for a single team (used by Participant Dashboard).
 */
router.get("/scores/team/:teamId", async (req, res) => {
  try {
    const remark = await Remark.findOne({ team: req.params.teamId })
      .populate("team", "name repoFullName");
    res.json(remark || null);
  } catch (err) {
    console.error("[remarks] single score GET error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/remarks/scores
 * Create or update marks + verdict for a team.
 * Body: { hackathon, team, scores: [{ sectionName, maxMarks, marks }], finalVerdict?, notes? }
 */
router.put("/scores", async (req, res) => {
  try {
    const { hackathon, team, scores, finalVerdict, notes } = req.body;
    if (!hackathon || !team) {
      return res.status(400).json({ error: "hackathon and team are required" });
    }

    const totalMarks = (scores || []).reduce((s, sc) => s + (sc.marks || 0), 0);
    const maxTotalMarks = (scores || []).reduce((s, sc) => s + (sc.maxMarks || 0), 0);

    const remark = await Remark.findOneAndUpdate(
      { hackathon, team },
      {
        hackathon,
        team,
        scores: scores || [],
        totalMarks,
        maxTotalMarks,
        finalVerdict: finalVerdict || "Pending",
        notes: notes ?? "",
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(remark);
  } catch (err) {
    console.error("[remarks] scores PUT error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
