const express = require("express");
const router = express.Router();

const { protect, optionalProtect } = require("../middlewares/authMiddleware");

const {
  getProjects,
  getProjectById,
  createProject,
  applyToProject,
  getProjectStats,
} = require("../controllers/projectController");

router.get("/stats", optionalProtect, getProjectStats);
router.get("/", optionalProtect, getProjects);
router.get("/:id", optionalProtect, getProjectById);
router.post("/", protect, createProject);
router.post("/:id/apply", protect, applyToProject);

module.exports = router;