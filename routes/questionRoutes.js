const express = require("express");
const router = express.Router();

const { protect, optionalProtect } = require("../middlewares/authMiddleware");

const {
  getQuestions,
  getQuestionStats,
  getPopularTags,
  getTopContributors,
  getQuestionById,
  askQuestion,
  voteQuestion,
  bookmarkQuestion,
} = require("../controllers/questionController");

// IMPORTANT: static routes before "/:id" so they don't get swallowed by it
router.get("/stats", optionalProtect, getQuestionStats);
router.get("/tags/popular", getPopularTags);
router.get("/top-contributors", getTopContributors);

router.get("/", optionalProtect, getQuestions);
router.post("/", protect, askQuestion);

router.get("/:id", optionalProtect, getQuestionById);
router.post("/:id/vote", protect, voteQuestion);
router.post("/:id/bookmark", protect, bookmarkQuestion);

module.exports = router;