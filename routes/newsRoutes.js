const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

const {
  getSavedArticles,
  saveArticle,
  unsaveArticle,
  getPreferences,
  savePreferences,
} = require("../controllers/newsController");

router.get("/saved", protect, getSavedArticles);
router.post("/saved", protect, saveArticle);
router.delete("/saved/:articleId", protect, unsaveArticle);

router.get("/preferences", protect, getPreferences);
router.post("/preferences", protect, savePreferences);

module.exports = router;