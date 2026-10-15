const SavedArticle = require("../models/SavedArticle");
const NewsPreference = require("../models/NewsPreference");

// GET /api/news/saved — the logged-in user's saved/bookmarked articles
const getSavedArticles = async (req, res) => {
  try {
    const saved = await SavedArticle.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ count: saved.length, saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/news/saved — bookmark an article
// Body: the full article object as shaped by the frontend
// { id, title, summary, body, category, date, brand, tone, brandTone, source, link, image }
const saveArticle = async (req, res) => {
  try {
    const { id, title, summary, body, category, date, brand, tone, brandTone, source, link, image } =
      req.body;

    if (!id || !title) {
      return res.status(400).json({ error: "Article id and title are required" });
    }

    const existing = await SavedArticle.findOne({ user: req.user._id, articleId: id });
    if (existing) {
      return res.status(200).json({ message: "Already saved", saved: existing });
    }

    const saved = await SavedArticle.create({
      user: req.user._id,
      articleId: id,
      title,
      summary: summary || "",
      body: body || "",
      category: category || "General",
      date: date || "",
      brand: brand || "",
      tone: tone || "",
      brandTone: brandTone || "",
      source: source || "",
      link: link || "",
      image: image || null,
    });

    res.status(201).json({ message: "Article saved", saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/news/saved/:articleId — remove a bookmark
const unsaveArticle = async (req, res) => {
  try {
    const result = await SavedArticle.findOneAndDelete({
      user: req.user._id,
      articleId: req.params.articleId,
    });

    if (!result) {
      return res.status(404).json({ error: "Saved article not found" });
    }

    res.status(200).json({ message: "Article removed from saved list" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/news/preferences — the logged-in user's Personalize Feed topics
const getPreferences = async (req, res) => {
  try {
    const pref = await NewsPreference.findOne({ user: req.user._id });
    res.status(200).json({ interests: pref?.interests || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/news/preferences — save Personalize Feed selections
// Body: { interests: ["Technology", "Business"] }
const savePreferences = async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res.status(400).json({ error: "interests must be an array of strings" });
    }

    const pref = await NewsPreference.findOneAndUpdate(
      { user: req.user._id },
      { $set: { interests } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Preferences saved", interests: pref.interests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSavedArticles,
  saveArticle,
  unsaveArticle,
  getPreferences,
  savePreferences,
};