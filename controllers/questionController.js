const mongoose = require("mongoose");
const Question = require("../models/Question");
const QuestionVote = require("../models/QuestionVote");
const QuestionBookmark = require("../models/QuestionBookmark");

const { CATEGORIES } = Question;

// Same trending formula as the frontend's filteredQuestions memo:
// (votes*2 + views/50) / sqrt(ageHours + 2)
function trendScore(q, now) {
  const ageHours = (now - new Date(q.createdAt).getTime()) / 3.6e6;
  return (q.votes * 2 + q.views / 50) / Math.sqrt(ageHours + 2);
}

// GET /api/questions?tab=latest|trending|unanswered|solved|bookmarks&category=&tag=&search=&page=&pageSize=
const getQuestions = async (req, res) => {
  try {
    const { tab = "latest", category = "All", tag, search, page = 1, pageSize = 5 } = req.query;
    const filter = {};

    if (tab === "unanswered") filter.answered = false;
    if (tab === "solved") filter.answered = true;

    if (tab === "bookmarks") {
      if (!req.user) {
        return res.status(401).json({ error: "Login required to view bookmarks" });
      }
      const bookmarkedIds = await QuestionBookmark.find({ user: req.user._id }).distinct("question");
      filter._id = { $in: bookmarkedIds };
    }

    if (tag) {
      filter.tags = { $regex: `^${tag}$`, $options: "i" };
    } else if (category && category !== "All" && CATEGORIES[category]?.length) {
      filter.tags = { $in: CATEGORIES[category].map((t) => new RegExp(`^${t}$`, "i")) };
    }

    if (search) {
      const term = { $regex: search, $options: "i" };
      filter.$or = [{ title: term }, { body: term }, { tags: term }];
    }

    let questions = await Question.find(filter).populate("author", "name").lean();

    const now = Date.now();
    questions.sort((a, b) =>
      tab === "trending" ? trendScore(b, now) - trendScore(a, now) : new Date(b.createdAt) - new Date(a.createdAt)
    );

    const total = questions.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.max(1, parseInt(pageSize, 10) || 5);
    const start = (pageNum - 1) * size;
    const pageItems = questions.slice(start, start + size);

    // Attach this user's vote/bookmark state for just the questions being returned
    let voteMap = {};
    let bookmarkSet = new Set();
    if (req.user) {
      const ids = pageItems.map((q) => q._id);
      const [votes, bookmarks] = await Promise.all([
        QuestionVote.find({ user: req.user._id, question: { $in: ids } }),
        QuestionBookmark.find({ user: req.user._id, question: { $in: ids } }),
      ]);
      voteMap = Object.fromEntries(votes.map((v) => [String(v.question), v.direction]));
      bookmarkSet = new Set(bookmarks.map((b) => String(b.question)));
    }

    const result = pageItems.map((q) => ({
      id: q._id,
      title: q.title,
      body: q.body,
      tags: q.tags,
      author: { name: q.author?.name || "Deleted user", role: q.authorRole },
      votes: q.votes,
      answers: q.answers,
      views: q.views,
      answered: q.answered,
      flag: q.flag !== "none" ? q.flag : undefined,
      version: q.version || undefined,
      code: q.code?.snippet ? q.code : undefined,
      createdAt: q.createdAt,
      userVote: voteMap[String(q._id)] || null,
      bookmarked: bookmarkSet.has(String(q._id)),
    }));

    res.status(200).json({
      count: total,
      page: pageNum,
      totalPages: Math.max(1, Math.ceil(total / size)),
      questions: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/questions/stats
const getQuestionStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 86400 * 1000);

    const [openQuestions, answeredToday, activeThisWeek] = await Promise.all([
      Question.countDocuments(),
      Question.countDocuments({ answered: true, updatedAt: { $gte: startOfToday } }),
      Question.countDocuments({ createdAt: { $gte: weekAgo } }),
    ]);

    let yourStreak = 0;
    if (req.user) {
      yourStreak = await computeStreak(req.user._id);
    }

    res.status(200).json({
      stats: [
        { icon: "help", label: "Open questions", value: String(openQuestions) },
        { icon: "check", label: "Answered today", value: String(answeredToday) },
        { icon: "users", label: "Active this week", value: String(activeThisWeek) },
        { icon: "flame", label: "Your streak", value: `${yourStreak} days` },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Consecutive-day streak of activity (asking or voting), counting back from today
async function computeStreak(userId) {
  const [questionDates, voteDates] = await Promise.all([
    Question.find({ author: userId }).distinct("createdAt"),
    QuestionVote.find({ user: userId }).distinct("createdAt"),
  ]);

  const days = new Set(
    [...questionDates, ...voteDates].map((d) => new Date(d).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// GET /api/questions/tags/popular
const getPopularTags = async (req, res) => {
  try {
    const results = await Question.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: { $toLower: "$tags" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      tags: results.map((r) => ({ tag: r._id, count: String(r.count) })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/questions/top-contributors — ranked by total votes earned across their questions
const getTopContributors = async (req, res) => {
  try {
    const results = await Question.aggregate([
      { $group: { _id: "$author", reputation: { $sum: "$votes" } } },
      { $sort: { reputation: -1 } },
      { $limit: 3 },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" },
      },
      { $unwind: "$user" },
    ]);

    res.status(200).json({
      contributors: results.map((r, i) => ({
        id: r._id,
        name: r.user.name,
        rank: i + 1,
        reputation: r.reputation,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/questions/:id
const getQuestionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Question ID format" });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("author", "name");

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/questions — Ask a question
const askQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "title and body are required" });
    }

    const question = await Question.create({
      title: title.trim(),
      body,
      tags: Array.isArray(tags) ? tags : [],
      author: req.user._id,
    });

    res.status(201).json({ message: "Your question is live", question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/questions/:id/vote
// Body: { direction: "up" | "down" }
// Mirrors the frontend's toggle/flip logic exactly, but server-authoritative.
const voteQuestion = async (req, res) => {
  try {
    const { direction } = req.body;
    if (!["up", "down"].includes(direction)) {
      return res.status(400).json({ error: "direction must be 'up' or 'down'" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Question ID format" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const existing = await QuestionVote.findOne({ question: question._id, user: req.user._id });

    let delta = 0;
    let userVote = direction;

    if (!existing) {
      delta = direction === "up" ? 1 : -1;
      await QuestionVote.create({ question: question._id, user: req.user._id, direction });
    } else if (existing.direction === direction) {
      // clicking the active direction again clears the vote
      delta = direction === "up" ? -1 : 1;
      userVote = null;
      await existing.deleteOne();
    } else {
      // flipping straight from the opposite side
      delta = direction === "up" ? 2 : -2;
      existing.direction = direction;
      await existing.save();
    }

    question.votes += delta;
    await question.save();

    res.status(200).json({ votes: question.votes, userVote });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/questions/:id/bookmark — toggle
const bookmarkQuestion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Question ID format" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const existing = await QuestionBookmark.findOne({ question: question._id, user: req.user._id });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ bookmarked: false, message: "Removed from bookmarks" });
    }

    await QuestionBookmark.create({ question: question._id, user: req.user._id });
    res.status(200).json({ bookmarked: true, message: "Saved to My Bookmarks" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getQuestions,
  getQuestionStats,
  getPopularTags,
  getTopContributors,
  getQuestionById,
  askQuestion,
  voteQuestion,
  bookmarkQuestion,
};