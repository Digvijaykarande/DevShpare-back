const mongoose = require("mongoose");

// Kept in sync with CATEGORIES in the frontend's
// src/pages/resources/data/resourcesData.js
const CATEGORIES = ["guides", "courses", "practice", "community", "reading"];
const ACCENTS = ["primary", "secondary", "tertiary"];

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    type: { type: String, required: true, trim: true }, // e.g. "Reference", "Course", "Tool"
    provider: { type: String, required: true, trim: true },

    // Lucide icon name (e.g. "BookOpen") — the frontend maps this string
    // back to the actual icon component, since components can't be stored in Mongo.
    iconName: { type: String, default: "BookOpen" },
    accent: { type: String, enum: ACCENTS, default: "primary" },

    free: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],

    summary: { type: String, required: true },
    details: { type: String, default: "" },
    url: { type: String, default: "" },

    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.ACCENTS = ACCENTS;