const express = require("express");
const router = express.Router();

const { protect, optionalProtect } = require("../middlewares/authMiddleware");

const {
  getProblems,
  getProblemBySlug,
  createProblem,
  submitSolution,
  getMySubmissions,
  getMyProgress,
  getDailyChallenge,
  getLeaderboard,
} = require("../controllers/codingController");

// IMPORTANT: static routes before "/:slug" so they don't get swallowed by it
router.get("/progress", protect, getMyProgress);
router.get("/challenge", optionalProtect, getDailyChallenge);
router.get("/leaderboard", optionalProtect, getLeaderboard);

router.get("/", optionalProtect, getProblems);
router.post("/", protect, createProblem);

router.get("/:slug", optionalProtect, getProblemBySlug);
router.post("/:slug/submit", protect, submitSolution);
router.get("/:slug/submissions", protect, getMySubmissions);

module.exports = router;
