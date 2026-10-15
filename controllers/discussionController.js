const mongoose = require("mongoose");
const Discussion = require("../models/Discussion");

const shape = (doc) => ({
  ...doc.toObject(),
  id: doc._id,
  answerCount: doc.answers.length,
});

const getDiscussions = async (req, res) => {
  try {
    const { tab = "latest", search = "", tag = "", page = 1, pageSize = 12 } = req.query;
    const filter = {};
    if (tag) filter.tags = tag.toLowerCase();
    if (search.trim()) filter.$text = { $search: search.trim() };
    if (tab === "unanswered") filter.answers = { $size: 0 };
    if (tab === "solved") filter.solved = true;
    const sort = tab === "active" ? { lastActivityAt: -1 } : tab === "top" ? { votes: -1, createdAt: -1 } : { createdAt: -1 };
    const safePage = Math.max(1, Number(page) || 1);
    const size = Math.min(50, Math.max(1, Number(pageSize) || 12));
    const [docs, total] = await Promise.all([
      Discussion.find(filter).sort(sort).skip((safePage - 1) * size).limit(size).populate("author", "name username role avatar"),
      Discussion.countDocuments(filter),
    ]);
    res.json({ discussions: docs.map(shape), total, page: safePage, pageSize: size, pages: Math.ceil(total / size) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getDiscussion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid discussion id" });
    const doc = await Discussion.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate("author", "name username role avatar")
      .populate("answers.author", "name username role avatar");
    if (!doc) return res.status(404).json({ error: "Discussion not found" });
    res.json({ discussion: shape(doc) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const createDiscussion = async (req, res) => {
  try {
    const { title, body, tags = [] } = req.body;
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: "Title and body are required" });
    const normalizedTags = (Array.isArray(tags) ? tags : String(tags).split(",")).map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 8);
    const doc = await Discussion.create({ title: title.trim(), body: body.trim(), tags: normalizedTags, author: req.user._id });
    await doc.populate("author", "name username role avatar");
    res.status(201).json({ discussion: shape(doc) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const addAnswer = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ error: "Answer cannot be empty" });
    const doc = await Discussion.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Discussion not found" });
    doc.answers.push({ author: req.user._id, body: body.trim() });
    doc.lastActivityAt = new Date();
    await doc.save();
    await doc.populate("answers.author", "name username role avatar");
    res.status(201).json({ answer: doc.answers[doc.answers.length - 1], discussion: shape(doc) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const voteDiscussion = async (req, res) => {
  try {
    const direction = req.body.direction === "down" ? -1 : 1;
    const doc = await Discussion.findByIdAndUpdate(req.params.id, { $inc: { votes: direction } }, { new: true });
    if (!doc) return res.status(404).json({ error: "Discussion not found" });
    res.json({ votes: doc.votes });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const acceptAnswer = async (req, res) => {
  try {
    const doc = await Discussion.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Discussion not found" });
    if (String(doc.author) !== String(req.user._id)) return res.status(403).json({ error: "Only the discussion author can accept an answer" });
    const answer = doc.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    doc.answers.forEach((item) => { item.accepted = String(item._id) === String(answer._id); });
    doc.solved = true;
    doc.lastActivityAt = new Date();
    await doc.save();
    res.json({ solved: doc.solved, acceptedAnswerId: String(answer._id) });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

const getDiscussionStats = async (_req, res) => {
  try {
    const [total, solved, unanswered, tags] = await Promise.all([
      Discussion.countDocuments(), Discussion.countDocuments({ solved: true }), Discussion.countDocuments({ answers: { $size: 0 } }),
      Discussion.aggregate([{ $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 }]),
    ]);
    res.json({ stats: { total, solved, unanswered, tags: tags.map((item) => ({ tag: item._id, count: item.count })) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { getDiscussions, getDiscussion, createDiscussion, addAnswer, voteDiscussion, acceptAnswer, getDiscussionStats };
