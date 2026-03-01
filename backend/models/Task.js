const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // The team this task is assigned to
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    // The hackathon this task belongs to
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    // Task title / description
    title: { type: String, required: true, trim: true },

    // Whether the task has been completed (marked by judge)
    completed: { type: Boolean, default: false },

    // When the judge marked it completed
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for quick lookups by team
taskSchema.index({ team: 1 });
taskSchema.index({ hackathon: 1 });

module.exports = mongoose.model("Task", taskSchema);
