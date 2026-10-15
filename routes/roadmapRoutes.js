const express = require("express");
const router = express.Router();

const { protect, optionalProtect } = require("../middlewares/authMiddleware");
const { getRoadmaps, getRoadmapBySlug, setOutcome } = require("../controllers/roadmapController");

router.get("/", optionalProtect, getRoadmaps);
router.get("/:slug", optionalProtect, getRoadmapBySlug);
router.put("/:slug/outcomes/:outcomeId", protect, setOutcome);

module.exports = router;