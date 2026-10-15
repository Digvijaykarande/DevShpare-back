const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middlewares/authMiddleware');
const { getPublicProfile } = require('../controllers/profileController');

// Mounted at /api/profiles  ->  GET /api/profiles/:username
router.get('/:username', optionalProtect, getPublicProfile);

module.exports = router;
