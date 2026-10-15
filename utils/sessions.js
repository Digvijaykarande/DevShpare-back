const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const MAX_SESSIONS = 10;

// "Mozilla/5.0 (Windows NT 10.0) ... Chrome/120" -> "Chrome on Windows"
function describeDevice(ua = '') {
  const browser = /edg\//i.test(ua) ? 'Edge' : /opr\/|opera/i.test(ua) ? 'Opera'
    : /chrome|crios/i.test(ua) ? 'Chrome' : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /safari/i.test(ua) ? 'Safari' : 'Browser';
  const os = /iphone|ipad|ios/i.test(ua) ? 'iOS' : /android/i.test(ua) ? 'Android'
    : /windows/i.test(ua) ? 'Windows' : /mac os|macintosh/i.test(ua) ? 'macOS'
    : /linux|ubuntu/i.test(ua) ? 'Linux' : 'Unknown OS';
  return `${browser} on ${os}`;
}

// Creates a session row on the user and returns a signed 30-day token bound to it.
async function startSession(user, req) {
  const sid = crypto.randomBytes(12).toString('hex');
  if (!Array.isArray(user.sessions)) user.sessions = [];
  user.sessions.push({
    sid,
    device: describeDevice(req.headers['user-agent']),
    ip: req.ip || '',
  });
  if (user.sessions.length > MAX_SESSIONS) user.sessions = user.sessions.slice(-MAX_SESSIONS);
  await user.save();
  return jwt.sign({ id: user._id, sid }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

module.exports = { startSession, describeDevice };
