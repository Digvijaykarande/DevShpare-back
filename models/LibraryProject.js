const mongoose = require("mongoose");

const libraryProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    language: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String, trim: true }],

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    stars: { type: Number, default: 0 },
    sizeKb: { type: Number, default: 0 },

    repoUrl: { type: String, default: null },
    downloadUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LibraryProject", libraryProjectSchema);