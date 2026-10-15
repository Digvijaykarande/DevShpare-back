const mongoose = require("mongoose");

// Roadmap CONTENT (shared by everyone). Per-user progress lives in RoadmapProgress.
const outcomeSchema = new mongoose.Schema(
  { id: { type: String, required: true }, label: { type: String, required: true } },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    code: { type: String, default: "" },
    iconName: { type: String, default: "Code2" }, // lucide-react icon name, resolved on the frontend
    title: { type: String, required: true },
    description: { type: String, default: "" },
    level: { type: String, default: "" },
    duration: { type: String, default: "" },
    outcomes: [outcomeSchema], // a topic is complete when every outcome is checked
  },
  { _id: false }
);

const stageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    index: { type: String, required: true }, // "01", "02" ...
    title: { type: String, required: true },
    topics: [topicSchema],
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    iconName: { type: String, default: "LayoutGrid" },
    accent: { type: String, enum: ["primary", "secondary", "tertiary"], default: "primary" },
    level: { type: String, default: "" },
    version: { type: String, default: "1.0" },
    summary: { type: String, default: "" },
    reviewedBy: { type: String, default: "" },
    stages: [stageSchema],

    // Hand-authored rich content (study material, challenges, snippet...) for one topic.
    // Every other topic gets generated content on the frontend.
    featured: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);