const { protect } = require('./authMiddleware');

const requireAdmin = [protect, (req, res, next) => {
  if (String(req.user?.role || '').toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}];
module.exports = { requireAdmin };
