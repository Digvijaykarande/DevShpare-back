const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { getResources, getResourceStats, createResource } = require("../controllers/resourceController");

router.get("/stats", getResourceStats);
router.get("/", getResources);
router.post("/", protect, createResource);

module.exports = router;