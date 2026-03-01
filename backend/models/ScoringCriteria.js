const mongoose = require("mongoose");

/**
 * ScoringCriteria — defines the scoring sections for a hackathon.
 * One document per hackathon. Judges set up sections like "Innovation",
 * "Code Quality", etc. with max marks for each.
 */
const scoringCriteriaSchema = new mongoose.Schema(
  {
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
      unique: true, // one criteria set per hackathon
    },

    sections: [
      {
        name: { type: String, required: true, trim: true },
        maxMarks: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScoringCriteria", scoringCriteriaSchema);
