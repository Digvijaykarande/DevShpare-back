const mongoose = require('mongoose');
const User = require('../models/userModel');
const Roadmap = require('../models/Roadmap');
const Problem = require('../models/Problem');
const Resource = require('../models/Resource');
const Question = require('../models/Question');
const Project = require('../models/Project');
const Mentor = require('../models/Mentor');
const Discussion = require('../models/Discussion');
const MentorBooking = require('../models/MentorBooking');
const MentorApplication = require('../models/MentorApplication');
const models = { users: User, roadmaps: Roadmap, problems: Problem, resources: Resource, questions: Question, projects: Project, mentors: Mentor, discussions: Discussion, sessions: MentorBooking, requests: MentorApplication };
const allowed = new Set(Object.keys(models));
const id = (v) => String(v?._id || v?.id || v);
const clean = (doc) => { const r = doc.toObject ? doc.toObject() : doc; return { ...r, id: id(r), _id: undefined }; };
const jsonValue = (value, fallback = []) => { if (typeof value !== 'string' || !value.trim()) return value || fallback; try { return JSON.parse(value); } catch { return value; } };
function present(resource, doc) {
  const r = clean(doc);
  if (resource === 'users') return { ...r, name: r.name, joined: r.createdAt, status: r.accountStatus || 'Active', role: r.role };
  if (resource === 'roadmaps') return { ...r, category: r.level || 'General', status: 'Published', views: '—' };
  if (resource === 'problems') return { ...r, tags: Array.isArray(r.tags) ? r.tags.join(', ') : r.tags, submissions: r.submissionsCount, status: r.status || (r.challengeDate ? 'Published' : 'Draft'), statement: typeof r.statement === 'string' ? r.statement : JSON.stringify(r.statement || []), examples: typeof r.examples === 'string' ? r.examples : JSON.stringify(r.examples || []), constraints: typeof r.constraints === 'string' ? r.constraints : JSON.stringify(r.constraints || []), hints: typeof r.hints === 'string' ? r.hints : JSON.stringify(r.hints || []), testCases: typeof r.testCases === 'string' ? r.testCases : JSON.stringify(r.testCases || []), editorial: typeof r.editorial === 'string' ? r.editorial : JSON.stringify(r.editorial || {}) };
  if (resource === 'resources') return { ...r, status: 'Published', views: '—' };
  if (resource === 'questions') return { ...r, askedBy: r.author?.name || 'Community member', category: r.tags?.[0] || 'General', status: r.flag === 'active' ? 'Reported' : r.answered ? 'Resolved' : 'Published' };
  if (resource === 'projects') return { ...r, author: r.lead?.name || 'Community member', tech: (r.techStack || []).join(', '), status: r.status?.stage || 'Ideation', views: '—' };
  if (resource === 'mentors') return { ...r, specialization: r.expertise, status: r.availability === 'Currently away' ? 'Inactive' : 'Active' };
  if (resource === 'discussions') return { ...r, status: r.solved ? 'Resolved' : 'Published' };
  if (resource === 'sessions') return { ...r, student: r.user?.name, mentor: r.mentor?.name, status: r.status };
  if (resource === 'requests') return { ...r, student: r.applicant?.name || 'Community member', mentor: 'Pending assignment', topic: r.expertise || 'Mentor application', date: r.createdAt, status: r.status ? r.status[0].toUpperCase() + r.status.slice(1) : 'Pending' };
  return r;
}
function getModel(resource) { if (!allowed.has(resource)) { const e = new Error('Unsupported admin resource'); e.status = 404; throw e; } return models[resource]; }
const list = async (req, res) => {
  try {
    const resource = req.params.resource; const Model = getModel(resource);
    let query = Model.find();
    if (resource === 'users') query = query.select('-password -sessions');
    if (resource === 'questions') query = query.populate('author', 'name');
    if (resource === 'projects') query = query.populate('lead', 'name');
    if (resource === 'mentors') query = query.populate('user', 'name');
    if (resource === 'sessions') query = query.populate('user', 'name').populate('mentor', 'name');
    if (resource === 'requests') query = query.populate('applicant', 'name');
    const docs = await query.sort({ createdAt: -1 }).limit(500);
    res.json({ resource, count: docs.length, rows: docs.map((d) => present(resource, d)) });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
};
const dashboard = async (_req, res) => {
  try {
    const [users, roadmaps, problems, resources, questions, projects, mentors, discussions, submissions] = await Promise.all([
      User.countDocuments(), Roadmap.countDocuments(), Problem.countDocuments(), Resource.countDocuments(), Question.countDocuments(), Project.countDocuments(), Mentor.countDocuments(), Discussion.countDocuments(), require('../models/Submission').countDocuments(),
    ]);
    res.json({ kpis: [{ id: 'users', label: 'Total Users', value: users }, { id: 'content', label: 'Total Content', value: roadmaps + problems + resources + questions + discussions }, { id: 'projects', label: 'Projects', value: projects }, { id: 'competitions', label: 'Submissions', value: submissions }], counts: { users, roadmaps, problems, resources, questions, projects, mentors, discussions, submissions } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
function mapPatch(resource, body) {
  const b = { ...body }; delete b.id; delete b._id; delete b.password; delete b.sessions;
  if (resource === 'users') { if (b.status) { b.accountStatus = b.status; delete b.status; } return b; }
  if (resource === 'questions') { if (b.status) { b.flag = b.status === 'Reported' ? 'active' : 'none'; b.answered = b.status === 'Resolved'; delete b.status; } if (b.category && !b.tags) b.tags = [b.category]; delete b.askedBy; return b; }
  if (resource === 'projects') { if (typeof b.tech === 'string') { b.techStack = b.tech.split(',').map((x) => x.trim()).filter(Boolean); delete b.tech; } if (b.status) { b.status = { stage: b.status, label: b.status }; } if (typeof b.openPositions === 'string') b.openPositions = jsonValue(b.openPositions, []); if (b.progress !== undefined && !Number.isNaN(Number(b.progress))) b.progress = { percent: Math.max(0, Math.min(100, Number(b.progress))), label: `${Number(b.progress)}% complete` }; delete b.author; return b; }
  if (resource === 'roadmaps' && typeof b.stages === 'string') b.stages = jsonValue(b.stages, []);
  if (resource === 'mentors') { if (b.specialization) { b.expertise = b.specialization; delete b.specialization; } if (typeof b.tags === 'string') b.tags = b.tags.split(',').map((x) => x.trim()).filter(Boolean); if (b.status) { b.availability = b.status === 'Inactive' ? 'Currently away' : 'Available now'; delete b.status; } return b; }
  if (resource === 'requests') { if (b.status) b.status = String(b.status).toLowerCase(); delete b.student; delete b.mentor; delete b.date; return b; }
  if (resource === 'problems' && typeof b.tags === 'string') b.tags = b.tags.split(',').map((x) => x.trim()).filter(Boolean);
  if (resource === 'problems') ['statement', 'examples', 'constraints', 'hints', 'testCases', 'editorial'].forEach((key) => { if (key in b) b[key] = jsonValue(b[key], key === 'editorial' ? {} : []); });
  if (resource === 'resources') { if (typeof b.tags === 'string') b.tags = b.tags.split(',').map((x) => x.trim()).filter(Boolean); if (typeof b.free === 'string') b.free = b.free === 'true'; }
  return b;
}
const update = async (req, res) => {
  try { const Model = getModel(req.params.resource); if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' }); const doc = await Model.findByIdAndUpdate(req.params.id, { $set: mapPatch(req.params.resource, req.body) }, { new: true, runValidators: true }); if (!doc) return res.status(404).json({ error: 'Record not found' }); res.json({ row: present(req.params.resource, doc) }); }
  catch (e) { res.status(e.status || 400).json({ error: e.message }); }
};
const create = async (req, res) => {
  try { const resource = req.params.resource; const Model = getModel(resource); const body = mapPatch(resource, req.body); if (resource === 'users') { body.email = body.email || `admin-created-${Date.now()}@invalid.local`; body.password = body.password || require('bcryptjs').hashSync(`ChangeMe-${Date.now()}`, 10); body.name = body.name || 'New user'; } if (resource === 'problems') { body.slug = body.slug || String(body.title || 'new-problem').toLowerCase().replace(/[^a-z0-9]+/g, '-'); body.number = body.number || Date.now(); body.difficulty = body.difficulty || 'Easy'; } if (resource === 'resources') { body.provider = body.provider || 'Devsphere'; body.summary = body.summary || body.title || 'Curated resource'; body.category = body.category || 'guides'; body.type = body.type || 'Reference'; } if (resource === 'roadmaps') { body.slug = body.slug || String(body.title || 'new-roadmap').toLowerCase().replace(/[^a-z0-9]+/g, '-'); body.stages = body.stages || []; } if (resource === 'mentors') { body.title = body.title || 'Community Mentor'; body.company = body.company || 'Devsphere'; body.expertise = body.expertise || 'Career Coaching'; body.bio = body.bio || 'Community mentor'; } if (resource === 'projects') { body.description = body.description || body.title || 'Project'; body.lead = req.user._id; } if (resource === 'questions' || resource === 'discussions') { body.author = req.user._id; body.body = body.body || body.title || 'Admin-created content'; } const doc = await Model.create(body); res.status(201).json({ row: present(resource, doc) }); }
  catch (e) { res.status(e.status || 400).json({ error: e.message }); }
};
const remove = async (req, res) => { try { const Model = getModel(req.params.resource); if (req.params.resource === 'users' && String(req.params.id) === String(req.user._id)) return res.status(400).json({ error: 'You cannot delete your own admin account' }); const doc = await Model.findByIdAndDelete(req.params.id); if (!doc) return res.status(404).json({ error: 'Record not found' }); res.status(204).end(); } catch (e) { res.status(e.status || 400).json({ error: e.message }); } };
const me = (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
module.exports = { list, dashboard, update, create, remove, me };
