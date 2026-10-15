const mongoose = require("mongoose");

const questionVoteSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    direction: { type: String, enum: ["up", "down"], required: true },
  },
  { timestamps: true }
);

questionVoteSchema.index({ question: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("QuestionVote", questionVoteSchema);