const mongoose = require("mongoose");

const newsPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    interests: [{ type: String, trim: true }], // subset of NEWS_CATEGORIES (minus "All News")
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewsPreference", newsPreferenceSchema);