const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    // GitHub repo full name e.g. "octocat/Hello-World"
    repoFullName: { type: String, required: true },

    // Members (simple list of GitHub usernames)
    members: [{ type: String }],

    // Webhook id returned by GitHub so we can delete later
    webhookId: { type: Number, default: null },

    // Last known GPS location reported by participant's browser
    lastKnownLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null }, // metres
      reportedAt: { type: Date, default: null },
    },

    // ── Gitignore analysis data (populated by deep sync) ──
    gitignoreContent: { type: String, default: null },
    gitignoreAnalyzedAt: { type: Date, default: null },
    repoTree: [{ type: String }], // list of all file paths in repo
  },
  { timestamps: true }
);

// Compound index: one repo per hackathon
teamSchema.index({ hackathon: 1, repoFullName: 1 }, { unique: true });

module.exports = mongoose.model("Team", teamSchema);
