const mongoose = require("mongoose");

// Kept in sync with CATEGORIES in the frontend's
// src/pages/questions/data/questionsData.js — maps a category pill to the
// tags that belong to it, so filtering by category behaves the same way.
const CATEGORIES = {
  All: [],
  Architecture: ["system design", "architecture", "docker"],
  "Distributed Systems": ["distributed systems", "cockroachdb", "system design", "networking"],
  Frontend: ["react", "react19", "nextjs", "javascript", "typescript", "css"],
  Backend: ["node.js", "nodejs", "python", "prisma", "sql", "concurrency"],
  "Rust & Go": ["rust", "go", "async-io"],
  Database: ["sql", "cockroachdb", "prisma", "database-migration"],
};

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: [{ type: String, trim: true }],

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorRole: { type: String, default: "Community member" },

    votes: { type: Number, default: 0 },
    answers: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    answered: { type: Boolean, default: false },

    // Optional decorative fields the mock data used — safe to leave unset
    flag: { type: String, enum: ["none", "active", "hot", "triage"], default: "none" },
    version: { type: String, default: "" },
    code: {
      file: { type: String, default: "" },
      lang: { type: String, default: "" },
      snippet: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
module.exports.CATEGORIES = CATEGORIES;