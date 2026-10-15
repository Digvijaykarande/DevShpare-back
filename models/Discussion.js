const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  body: { type: String, required: true, trim: true, maxlength: 10000 },
  votes: { type: Number, default: 0 },
  accepted: { type: Boolean, default: false },
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  body: { type: String, required: true, trim: true, maxlength: 15000 },
  tags: [{ type: String, trim: true, lowercase: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: { type: [answerSchema], default: [] },
  votes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  solved: { type: Boolean, default: false },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ title: "text", body: "text" });
module.exports = mongoose.model("Discussion", discussionSchema);
