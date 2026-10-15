const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protects a route: checks for a valid "Bearer <token>" header, verifies it,
// and loads the matching user onto req.user (without the password)
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }
    if (user.accountStatus && user.accountStatus !== 'Active') {
      return res.status(403).json({ error: `This account is ${user.accountStatus.toLowerCase()}` });
    }

    // Tokens issued at login carry a session id. If that session was signed out
    // (from Settings -> Security), the token stops working immediately.
    // Older tokens without a sid keep working.
    if (decoded.sid) {
      const sessions = Array.isArray(user.sessions) ? user.sessions : [];
      const session = sessions.find((s) => s.sid === decoded.sid);
      if (!session) {
        return res.status(401).json({ error: 'This session has been signed out' });
      }
      req.sessionId = decoded.sid;
      // refresh "last active" at most every 5 minutes to avoid a write per request
      if (session.lastActive && Date.now() - new Date(session.lastActive).getTime() > 5 * 60 * 1000) {
        await User.updateOne({ _id: user._id, 'sessions.sid': decoded.sid }, { $set: { 'sessions.$.lastActive': new Date() } });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, invalid or expired token' });
  }
};

// Optional Protect: extracts token if provided, but does not block unauthenticated requests
const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, optionalProtect };
