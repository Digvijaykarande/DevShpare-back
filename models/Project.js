const mongoose = require("mongoose");

const openPositionSchema = new mongoose.Schema(
  {
    role: { type: String, required: true, trim: true },
    slots: { type: String, default: "1 slot" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    techStack: [{ type: String, trim: true }],

    difficulty: {
      type: String,
      enum: ["Beginner Friendly", "Intermediate", "Advanced"],
      default: "Intermediate",
    },

    status: {
      label: { type: String, default: "Ideation" },
      variant: { type: String, default: "default" }, // default | success | warning | solid | neutral
      stage: {
        type: String,
        enum: ["Ideation", "MVP in Progress", "Alpha Testing", "Production"],
        default: "Ideation",
      },
    },

    lead: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    openPositions: [openPositionSchema],

    progress: {
      label: { type: String, default: "" },
      percent: { type: Number, default: 0, min: 0, max: 100 },
      barVariant: { type: String, default: "primary" },
      icon: { type: String, default: "clock" }, // clock | check | doc | commit | trend | blueprint
    },

    version: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);