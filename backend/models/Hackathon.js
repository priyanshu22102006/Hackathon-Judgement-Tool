const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },

    // Official hackathon time window (UTC)
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },

    // Geo-fence: centre + radius in km
    venue: {
      label: { type: String, default: "Venue" },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      radiusKm: { type: Number, default: 5 }, // allowed radius
    },

    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hackathon", hackathonSchema);
