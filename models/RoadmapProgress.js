const mongoose = require("mongoose");

const roadmapProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roadmap: { type: String, required: true }, // Roadmap.slug
    doneOutcomes: [{ type: String }], // outcome ids the user has checked off
    activeDays: [{ type: String }], // "YYYY-MM-DD" days with activity, for the streak
  },
  { timestamps: true }
);

roadmapProgressSchema.index({ user: 1, roadmap: 1 }, { unique: true });

module.exports = mongoose.model("RoadmapProgress", roadmapProgressSchema);