const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const c = require('../controllers/profileController');

// Mounted at /api/me
router.get('/', protect, c.getMe);
router.patch('/', protect, c.updateMe);
router.delete('/', protect, c.deleteMe);

router.get('/overview', protect, c.getMyProfileOverview); // profile page: stats + activity + projects + heatmap
router.get('/export', protect, c.exportData);

router.put('/avatar', protect, c.setAvatar);
router.delete('/avatar', protect, c.removeAvatar);

router.get('/settings', protect, c.getSettings);
router.patch('/settings', protect, c.updateSettings);

router.post('/change-password', protect, c.changePassword);

router.get('/sessions', protect, c.getSessions);
router.delete('/sessions', protect, c.revokeOtherSessions); // all except this device
router.delete('/sessions/:sid', protect, c.revokeSession);
router.post('/logout', protect, c.logout);

module.exports = router;
