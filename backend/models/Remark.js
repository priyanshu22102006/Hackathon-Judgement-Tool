const mongoose = require("mongoose");

/**
 * Remark — per-team scoring by judges.
 * Stores marks for each section, a final verdict, and optional notes.
 * One document per team per hackathon.
 */
const remarkSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    // Marks per section (mirrors the ScoringCriteria sections)
    scores: [
      {
        sectionName: { type: String, required: true },
        maxMarks: { type: Number, required: true },
        marks: { type: Number, default: 0, min: 0 },
      },
    ],

    // Computed total
    totalMarks: { type: Number, default: 0 },
    maxTotalMarks: { type: Number, default: 0 },

    // Judge's final decision for this team
    finalVerdict: {
      type: String,
      enum: ["Pending", "Winner", "Runner Up", "Honorable Mention", "Participated", "Disqualified"],
      default: "Pending",
    },

    // Free-text notes / feedback
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// One remark per team per hackathon
remarkSchema.index({ hackathon: 1, team: 1 }, { unique: true });

module.exports = mongoose.model("Remark", remarkSchema);
