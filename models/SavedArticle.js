const mongoose = require("mongoose");

const savedArticleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // articleId is whatever the frontend uses as `article.id`
    // (newsdata.io's article_id, or its link/generated fallback id)
    articleId: { type: String, required: true },

    // Snapshot of the article at save-time, shaped exactly like the
    // frontend's mapped article object so it can be re-rendered later
    // without another API call.
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    body: { type: String, default: "" },
    category: { type: String, default: "General" },
    date: { type: String, default: "" },
    brand: { type: String, default: "" },
    tone: { type: String, default: "" },
    brandTone: { type: String, default: "" },
    source: { type: String, default: "" },
    link: { type: String, default: "" },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

// A user can only save the same article once
savedArticleSchema.index({ user: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model("SavedArticle", savedArticleSchema);