const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Team = require("../models/Team");

/**
 * POST /api/tasks
 *
 * Judge creates a new task for a team.
 * Body: { team, hackathon, title }
 */
router.post("/", async (req, res) => {
  try {
    const { team, hackathon, title } = req.body;
    if (!team || !hackathon || !title) {
      return res.status(400).json({ error: "team, hackathon, and title are required" });
    }

    const teamDoc = await Team.findById(team);
    if (!teamDoc) return res.status(404).json({ error: "Team not found" });

    const task = await Task.create({ team, hackathon, title });
    res.status(201).json(task);
  } catch (err) {
    console.error("[tasks] Create error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tasks?team=<teamId>
 *
 * Get all tasks for a team. Used by both Judge and Participant dashboards.
 */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.team) filter.team = req.query.team;
    if (req.query.hackathon) filter.hackathon = req.query.hackathon;

    const tasks = await Task.find(filter)
      .sort({ createdAt: 1 })
      .populate("team", "name repoFullName");

    res.json(tasks);
  } catch (err) {
    console.error("[tasks] List error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/tasks/:id/toggle
 *
 * Judge toggles complete/incomplete status of a task.
 */
router.patch("/:id/toggle", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("[tasks] Toggle error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/tasks/:id
 *
 * Judge deletes a task.
 */
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("[tasks] Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
