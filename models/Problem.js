const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    number: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    tags: [{ type: String, trim: true }],

    // Public engagement numbers shown in ProblemMeta (not tied to any one user)
    stats: {
      likes: { type: String, default: "0" },
      dislikes: { type: String, default: "0" },
      acceptance: { type: String, default: "0%" },
    },
    submissionsCount: { type: String, default: "0" },
    accuracy: { type: String, default: "Medium" },
    hasAcceptedSolution: { type: Boolean, default: false },
    // YYYY-MM-DD marks the problem selected by the platform for that day.
    challengeDate: { type: String, default: null, index: true },
    points: { type: Number, default: 100, min: 1, max: 1000 },

    // Rich structured content — arrays of { text/code/emphasis } segments,
    // authored once per problem. Kept as Mixed so the schema doesn't have
    // to mirror every possible content shape.
    statement: { type: mongoose.Schema.Types.Mixed, default: [] },
    examples: { type: mongoose.Schema.Types.Mixed, default: [] },
    constraints: { type: mongoose.Schema.Types.Mixed, default: [] },
    hints: { type: mongoose.Schema.Types.Mixed, default: [] },
    editorial: { type: mongoose.Schema.Types.Mixed, default: {} },

    language: { type: String, default: "JavaScript" },
    starterCode: { type: String, default: "" },
    testCases: { type: mongoose.Schema.Types.Mixed, default: [] },
    elevation: [{ type: Number }], // optional bar heights for the trapping-rain-water chart

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Problem", problemSchema);
