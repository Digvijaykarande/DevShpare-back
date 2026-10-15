const express = require("express");
const router = express.Router();

const { protect, optionalProtect } = require("../middlewares/authMiddleware");
const { getLibraryProjects, createLibraryProject } = require("../controllers/libraryController");

router.get("/", optionalProtect, getLibraryProjects);
router.post("/", protect, createLibraryProject);

module.exports = router;