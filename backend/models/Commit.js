const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema(
  {
    // Link to team & hackathon
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    // ── Git / GitHub metadata ────────────────────────────
    commitHash: { type: String, required: true },
    message: { type: String, default: "" },
    author: { type: String, required: true }, // GitHub username
    authorEmail: { type: String, default: "" },
    timestamp: { type: Date, required: true }, // author timestamp from git
    url: { type: String, default: "" }, // link to commit on GitHub
    branch: { type: String, default: "main" },

    filesChanged: [
      {
        filename: String,
        status: String, // added | modified | removed
        additions: { type: Number, default: 0 },
        deletions: { type: Number, default: 0 },
      },
    ],

    // Aggregate line-change stats (populated by deep sync)
    additions: { type: Number, default: null },
    deletions: { type: Number, default: null },

    // ── Verification results ─────────────────────────────
    timeValid: {
      type: Boolean,
      default: null, // null = not yet checked
    },

    // Location info derived from pusher IP
    ip: { type: String, default: null },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      city: { type: String, default: null },
      region: { type: String, default: null },
      country: { type: String, default: null },
    },
    locationStatus: {
      type: String,
      enum: ["on-site", "mixed", "outside", "unknown"],
      default: "unknown",
    },
  },
  { timestamps: true }
);

commitSchema.index({ team: 1, commitHash: 1 }, { unique: true });

module.exports = mongoose.model("Commit", commitSchema);
