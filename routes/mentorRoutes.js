const express = require("express");
const router = express.Router();

const { protect, optionalProtect } = require("../middlewares/authMiddleware");

const {
  getMentors,
  getMentorById,
  getMentorStats,
  getUpcomingSession,
  bookSession,
  notifyWhenAvailable,
  applyToMentor,
  createMentor,
} = require("../controllers/mentorController");

// IMPORTANT: static routes before "/:id" so they don't get swallowed by it
router.get("/stats", getMentorStats);
router.get("/sessions/upcoming", protect, getUpcomingSession);

router.get("/", optionalProtect, getMentors);
router.post("/", protect, createMentor);
router.post("/apply", protect, applyToMentor);

router.get("/:id", optionalProtect, getMentorById);
router.post("/:id/book", protect, bookSession);
router.post("/:id/notify", protect, notifyWhenAvailable);

module.exports = router;