const mongoose = require("mongoose");

const questionBookmarkSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

questionBookmarkSchema.index({ question: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("QuestionBookmark", questionBookmarkSchema);