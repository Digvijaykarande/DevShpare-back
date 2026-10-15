const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Question = require('../models/Question');
const QuestionVote = require('../models/QuestionVote');
const QuestionBookmark = require('../models/QuestionBookmark');
const Project = require('../models/Project');
const Application = require('../models/Application');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const MentorBooking = require('../models/MentorBooking');

// ---------- helpers ----------
const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;
const AVATAR_RE = /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/;
const MAX_AVATAR_CHARS = 400 * 1024; // ~300 KB of image data

const isBool = (v) => typeof v === 'boolean';
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

function validWebsite(v) {
  if (!v) return true;
  try {
    const u = new URL(v);
    return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.');
  } catch { return false; }
}

// Gives a user a unique username (from their email) the first time it's needed.
async function ensureUsername(user) {
  if (user.username) return user;
  const base = (user.email.split('@')[0] || 'dev').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 24) || 'dev';
  let candidate = base.length >= 3 ? base : `${base}dev`;
  let n = 0;
  while (await User.exists({ username: candidate })) {
    n += 1;
    candidate = `${base.slice(0, 24)}${n}`;
  }
  user.username = candidate;
  await user.save();
  return user;
}

const monthYear = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

// The shape the frontend's PROFILE object expects.
function toProfile(u) {
  return {
    id: u._id,
    name: u.name,
    username: u.username,
    email: u.email,
    emailVerified: u.emailVerified,
    role: u.role,
    bio: u.bio,
    location: u.location,
    website: u.website,
    avatar: u.avatar,
    joined: monthYear(u.createdAt),
    techStack: u.techStack || [],
    currentlyLearning: u.currentlyLearning || [],
    socialLinks: u.socialLinks || [],
  };
}

const toSettings = (u) => {
  const s = u.settings?.toObject ? u.settings.toObject() : u.settings || {};
  return { notifications: s.notifications, appearance: s.appearance, privacy: s.privacy, security: s.security, connections: s.connections };
};

// ---------- GET /me ----------
exports.getMe = async (req, res) => {
  try {
    const user = await ensureUsername(await User.findById(req.user._id));
    res.json({ profile: toProfile(user), settings: toSettings(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- PATCH /me ----------
exports.updateMe = async (req, res) => {
  try {
    const b = req.body || {};
    const user = await User.findById(req.user._id);
    const errors = {};

    if (b.name !== undefined) {
      const v = clean(b.name, 60);
      if (!v || v.length < 2) errors.name = 'Name must be 2 to 60 characters.';
      else user.name = v;
    }
    if (b.username !== undefined) {
      const v = clean(b.username, 30)?.toLowerCase();
      if (!v || !USERNAME_RE.test(v)) errors.username = 'Use 3-30 lowercase letters, numbers, dots, dashes or underscores.';
      else if (v !== user.username) {
        if (await User.exists({ username: v, _id: { $ne: user._id } })) errors.username = 'That username is already taken.';
        else user.username = v;
      }
    }
    if (b.website !== undefined) {
      const v = clean(b.website, 200);
      if (!validWebsite(v)) errors.website = 'Enter a full link, like https://yoursite.dev.';
      else user.website = v;
    }
    if (b.role !== undefined) user.role = clean(b.role, 80);
    if (b.bio !== undefined) user.bio = clean(b.bio, 250);
    if (b.location !== undefined) user.location = clean(b.location, 80);

    if (Array.isArray(b.currentlyLearning)) {
      user.currentlyLearning = b.currentlyLearning.map((t) => clean(t, 40)).filter(Boolean).slice(0, 12);
    }
    if (Array.isArray(b.techStack)) {
      user.techStack = b.techStack.slice(0, 6).map((g) => ({
        name: clean(g?.name, 40) || 'Skills',
        skills: (Array.isArray(g?.skills) ? g.skills : []).map((s) => clean(s, 30)).filter(Boolean).slice(0, 15),
      }));
    }
    if (Array.isArray(b.socialLinks)) {
      user.socialLinks = b.socialLinks.slice(0, 6)
        .map((l) => ({ name: clean(l?.name, 30), handle: clean(l?.handle, 60), url: clean(l?.url, 200) }))
        .filter((l) => l.name && validWebsite(l.url));
    }

    if (Object.keys(errors).length) return res.status(400).json({ error: Object.values(errors)[0], errors });
    await user.save();
    res.json({ profile: toProfile(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- PUT /me/avatar  |  DELETE /me/avatar ----------
exports.setAvatar = async (req, res) => {
  try {
    const { avatar } = req.body || {};
    if (typeof avatar !== 'string' || !AVATAR_RE.test(avatar)) {
      return res.status(400).json({ error: 'Send a JPG or PNG as a base64 data URL.' });
    }
    if (avatar.length > MAX_AVATAR_CHARS) return res.status(413).json({ error: 'Photo is too large. Try a smaller one.' });
    await User.updateOne({ _id: req.user._id }, { $set: { avatar } });
    res.json({ avatar });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.removeAvatar = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $set: { avatar: null } });
    res.json({ avatar: null });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- GET /me/settings  |  PATCH /me/settings ----------
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ settings: toSettings(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateSettings = async (req, res) => {
  try {
    const b = req.body || {};
    const user = await User.findById(req.user._id);
    const s = user.settings;

    // Only known keys with the right type are copied; anything else is ignored.
    for (const [key, ch] of Object.entries(b.notifications || {})) {
      if (!s.notifications[key]) continue;
      if (isBool(ch?.email)) s.notifications[key].email = ch.email;
      if (isBool(ch?.inApp)) s.notifications[key].inApp = ch.inApp;
    }
    const a = b.appearance || {};
    if (['light', 'dark', 'system'].includes(a.theme)) s.appearance.theme = a.theme;
    if (isBool(a.reduceMotion)) s.appearance.reduceMotion = a.reduceMotion;

    const p = b.privacy || {};
    if (['public', 'members', 'private'].includes(p.visibility)) s.privacy.visibility = p.visibility;
    for (const k of ['showEmail', 'showActivity', 'searchable', 'mentorRequests']) if (isBool(p[k])) s.privacy[k] = p[k];

    if (isBool(b.security?.twoFactor)) s.security.twoFactor = b.security.twoFactor;
    for (const k of ['github', 'google', 'linkedin', 'x']) if (isBool(b.connections?.[k])) s.connections[k] = b.connections[k];

    user.markModified('settings');
    await user.save();
    res.json({ settings: toSettings(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- POST /me/change-password ----------
exports.changePassword = async (req, res) => {
  try {
    const { current, next } = req.body || {};
    if (!current || !next) return res.status(400).json({ error: 'Enter your current and new password.' });
    if (next.length < 8 || !/[a-z]/.test(next) || !/[A-Z]/.test(next) || !/\d/.test(next)) {
      return res.status(400).json({ error: 'New password needs 8+ characters with uppercase, lowercase and a number.' });
    }
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(current, user.password))) return res.status(400).json({ error: 'Current password is incorrect.' });
    if (await bcrypt.compare(next, user.password)) return res.status(400).json({ error: "Choose a password you haven't used here." });

    user.password = await bcrypt.hash(next, await bcrypt.genSalt(10));
    user.passwordChangedAt = new Date();
    // Sign out every other device; keep the one making the change.
    user.sessions = user.sessions.filter((x) => x.sid === req.sessionId);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- Sessions ----------
const ago = (d) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 2) return 'Active now';
  if (m < 60) return `${m} minutes ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const days = Math.round(h / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

exports.getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sessions = [...user.sessions]
      .sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive))
      .map((x) => ({ id: x.sid, device: x.device, place: x.ip || 'Unknown location', when: ago(x.lastActive), current: x.sid === req.sessionId }));
    res.json({ sessions });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.revokeSession = async (req, res) => {
  try {
    if (req.params.sid === req.sessionId) return res.status(400).json({ error: "Use Log out to end this device's session." });
    await User.updateOne({ _id: req.user._id }, { $pull: { sessions: { sid: req.params.sid } } });
    res.json({ message: 'Device signed out' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.revokeOtherSessions = async (req, res) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $pull: { sessions: { sid: { $ne: req.sessionId } } } });
    res.json({ message: 'Signed out of all other devices' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.logout = async (req, res) => {
  try {
    if (req.sessionId) await User.updateOne({ _id: req.user._id }, { $pull: { sessions: { sid: req.sessionId } } });
    res.json({ message: 'Logged out' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- Stats & activity ----------
async function buildStats(userId) {
  const [questions, projects, solved, sessions, bookmarks] = await Promise.all([
    Question.countDocuments({ author: userId }),
    Project.countDocuments({ $or: [{ lead: userId }, { members: userId }] }),
    Submission.distinct('problem', { user: userId, status: 'Accepted' }),
    MentorBooking.countDocuments({ user: userId, status: { $ne: 'cancelled' } }),
    QuestionBookmark.countDocuments({ user: userId }),
  ]);
  const votesAgg = await Question.aggregate([{ $match: { author: userId } }, { $group: { _id: null, votes: { $sum: '$votes' } } }]);
  return { questions, projects, solved: solved.length, sessions, bookmarks, reputation: votesAgg[0]?.votes || 0 };
}

// The browser sends its UTC offset (minutes, as from Date#getTimezoneOffset) so "today" and
// the heatmap days match the user's own calendar instead of UTC.
const parseTz = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && Math.abs(n) <= 14 * 60 ? n : 0;
};
const localDay = (d, tz) => new Date(new Date(d).getTime() - tz * 60000).toISOString().slice(0, 10);

// Daily activity for the last 16 weeks -> feeds the heatmap on the profile page.
async function buildHeatmap(userId, tz = 0, weeks = 16) {
  const since = new Date(Date.now() - (weeks * 7 + 1) * 86400000);
  const [qs, vs, ss] = await Promise.all([
    Question.find({ author: userId, createdAt: { $gte: since } }).select('createdAt').lean(),
    QuestionVote.find({ user: userId, createdAt: { $gte: since } }).select('createdAt').lean(),
    Submission.find({ user: userId, createdAt: { $gte: since } }).select('createdAt').lean(),
  ]);
  const counts = {};
  [...qs, ...vs, ...ss].forEach((x) => { const k = localDay(x.createdAt, tz); counts[k] = (counts[k] || 0) + 1; });
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

// Everything the "Coding" card on the profile needs, derived from real submissions.
async function buildCoding(userId, tz = 0) {
  const [problems, subs] = await Promise.all([
    Problem.find().select('slug title difficulty').lean(),
    Submission.find({ user: userId }).sort({ createdAt: -1 }).select('problem status language createdAt').lean(),
  ]);

  const byId = Object.fromEntries(problems.map((p) => [String(p._id), p]));
  const solvedIds = new Set(subs.filter((s) => s.status === 'Accepted').map((s) => String(s.problem)));
  const triedIds = new Set(subs.map((s) => String(s.problem)));

  const byDifficulty = { Easy: { solved: 0, total: 0 }, Medium: { solved: 0, total: 0 }, Hard: { solved: 0, total: 0 } };
  problems.forEach((p) => {
    if (!byDifficulty[p.difficulty]) return;
    byDifficulty[p.difficulty].total += 1;
    if (solvedIds.has(String(p._id))) byDifficulty[p.difficulty].solved += 1;
  });

  const accepted = subs.filter((s) => s.status === 'Accepted').length;

  const langs = {};
  subs.forEach((s) => { if (s.language) langs[s.language] = (langs[s.language] || 0) + 1; });

  // Streak = consecutive days (user's own calendar) with at least one submission, ending today or yesterday.
  const days = new Set(subs.map((s) => localDay(s.createdAt, tz)));
  let streak = 0;
  const cursor = new Date(Date.now() - tz * 60000);
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setUTCDate(cursor.getUTCDate() - 1); }

  const seen = new Set();
  const recentSolved = [];
  for (const s of subs) {
    const id = String(s.problem);
    if (s.status !== 'Accepted' || seen.has(id) || !byId[id]) continue;
    seen.add(id);
    recentSolved.push({ slug: byId[id].slug, title: byId[id].title, difficulty: byId[id].difficulty, at: s.createdAt });
    if (recentSolved.length === 5) break;
  }

  return {
    solved: solvedIds.size,
    attempted: [...triedIds].filter((id) => !solvedIds.has(id)).length,
    totalProblems: problems.length,
    byDifficulty,
    submissions: subs.length,
    acceptanceRate: subs.length ? Math.round((accepted / subs.length) * 100) : 0,
    streak,
    languages: Object.entries(langs).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    recentSolved: recentSolved.map((r) => ({ ...r, time: timeAgo(r.at) })),
  };
}

// Badges are earned from real numbers, never hardcoded.
function buildAchievements(stats, coding, joinedAt) {
  const list = [];
  const earlyAdopter = new Date(joinedAt) < new Date('2027-01-01');
  if (earlyAdopter) list.push({ label: 'DevSphere', value: 'Founding member', icon: 'crown', tone: 'amber' });
  if (coding.solved >= 1) list.push({ label: 'Problem Solver', value: `${coding.solved} problem${coding.solved > 1 ? 's' : ''} solved`, icon: 'target', tone: 'emerald' });
  if (coding.streak >= 3) list.push({ label: 'On Fire', value: `${coding.streak}-day coding streak`, icon: 'flame', tone: 'rose' });
  if (stats.projects >= 1) list.push({ label: 'Builder', value: `${stats.projects} project${stats.projects > 1 ? 's' : ''}`, icon: 'rocket', tone: 'sky' });
  if (stats.reputation >= 10) list.push({ label: 'Helpful', value: `${stats.reputation} votes earned`, icon: 'award', tone: 'amber' });
  return list;
}

const timeAgo = (d) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${Math.max(m, 1)} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const days = Math.round(h / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

async function buildActivity(userId, limit = 8) {
  const [qs, subs, projs, bookings] = await Promise.all([
    Question.find({ author: userId }).sort({ createdAt: -1 }).limit(limit).select('title createdAt').lean(),
    Submission.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).populate('problem', 'title').lean(),
    Project.find({ lead: userId }).sort({ createdAt: -1 }).limit(limit).select('title createdAt').lean(),
    MentorBooking.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).populate('mentor', 'name').lean(),
  ]);
  return [
    ...qs.map((x) => ({ id: `q${x._id}`, text: 'Asked a question', target: x.title, at: x.createdAt })),
    ...subs.map((x) => ({ id: `s${x._id}`, text: x.status === 'Accepted' ? 'Solved a problem' : 'Attempted a problem', target: x.problem?.title || 'a problem', at: x.createdAt })),
    ...projs.map((x) => ({ id: `p${x._id}`, text: 'Created a project', target: x.title, at: x.createdAt })),
    ...bookings.map((x) => ({ id: `b${x._id}`, text: 'Booked a session with', target: x.mentor?.name || 'a mentor', at: x.createdAt })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit)
    .map((x) => ({ ...x, time: timeAgo(x.at) }));
}

async function buildProjects(userId) {
  const list = await Project.find({ $or: [{ lead: userId }, { members: userId }] }).sort({ createdAt: -1 }).limit(6).lean();
  return list.map((p) => ({
    id: p._id,
    title: p.title,
    description: p.description,
    tech: p.techStack || [],
    stage: p.status?.stage,
    percent: p.progress?.percent ?? 0,
    role: String(p.lead) === String(userId) ? 'Lead' : 'Member',
  }));
}

// One call gives the profile page everything it needs.   GET /me/overview?tz=<minutes>
exports.getMyProfileOverview = async (req, res) => {
  try {
    const tz = parseTz(req.query.tz);
    const user = await ensureUsername(await User.findById(req.user._id));
    const [stats, activity, projects, heatmap, coding] = await Promise.all([
      buildStats(user._id), buildActivity(user._id), buildProjects(user._id), buildHeatmap(user._id, tz), buildCoding(user._id, tz),
    ]);
    res.json({ profile: toProfile(user), stats, activity, projects, heatmap, coding, achievements: buildAchievements(stats, coding, user.createdAt) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- GET /users/:username  (public profile, respects Privacy settings) ----------
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: String(req.params.username).toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isOwner = req.user && String(req.user._id) === String(user._id);
    const { visibility, showEmail, showActivity } = user.settings.privacy;
    if (!isOwner && (visibility === 'private' || (visibility === 'members' && !req.user))) {
      return res.status(403).json({ error: 'This profile is private.' });
    }

    const profile = toProfile(user);
    if (!isOwner && !showEmail) delete profile.email;
    delete profile.emailVerified;

    const tz = parseTz(req.query.tz);
    const [stats, projects, coding] = await Promise.all([buildStats(user._id), buildProjects(user._id), buildCoding(user._id, tz)]);
    const out = { profile, stats, projects, achievements: buildAchievements(stats, coding, user.createdAt) };
    if (isOwner || showActivity) {
      out.activity = await buildActivity(user._id);
      out.heatmap = await buildHeatmap(user._id, tz);
      out.coding = coding;
    }
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- GET /me/export ----------
exports.exportData = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id).select('-password -sessions').lean();
    const [questions, projects, submissions, bookings, applications] = await Promise.all([
      Question.find({ author: id }).lean(),
      Project.find({ $or: [{ lead: id }, { members: id }] }).lean(),
      Submission.find({ user: id }).select('-code').lean(),
      MentorBooking.find({ user: id }).lean(),
      Application.find({ applicant: id }).lean(),
    ]);
    if (user.avatar) user.avatar = '(uploaded photo)';
    res.setHeader('Content-Disposition', `attachment; filename="devsphere-${user.username || 'me'}-data.json"`);
    res.json({ exportedAt: new Date().toISOString(), user, questions, projects, submissions, bookings, applications });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ---------- DELETE /me ----------
exports.deleteMe = async (req, res) => {
  try {
    const { confirm, password } = req.body || {};
    const user = await User.findById(req.user._id);
    if (confirm !== user.username) return res.status(400).json({ error: 'Type your username to confirm.' });
    if (!password || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Password is incorrect.' });

    const id = user._id;
    // Projects the user leads are kept for the other members; everything personal goes.
    await Promise.all([
      Question.deleteMany({ author: id }),
      QuestionVote.deleteMany({ user: id }),
      QuestionBookmark.deleteMany({ user: id }),
      Submission.deleteMany({ user: id }),
      MentorBooking.deleteMany({ user: id }),
      Application.deleteMany({ applicant: id }),
      Project.updateMany({ members: id }, { $pull: { members: id } }),
    ]);
    await User.deleteOne({ _id: id });
    res.json({ message: 'Account deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.ensureUsername = ensureUsername;