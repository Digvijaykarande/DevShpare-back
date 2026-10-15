const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);

// Builds a { [problemId]: "solved" | "attempted" } map for one user,
// used to compute per-user status instead of a hardcoded field.
async function buildStatusMap(userId) {
  if (!userId) return {};

  const submissions = await Submission.find({ user: userId }).select("problem status");
  const map = {};
  for (const s of submissions) {
    const key = String(s.problem);
    if (s.status === "Accepted") {
      map[key] = "solved";
    } else if (map[key] !== "solved") {
      map[key] = "attempted";
    }
  }
  return map;
}

// GET /api/coding — lightweight list for the ProblemListDrawer
// Query: difficulty=Easy|Medium|Hard, search=
const getProblems = async (req, res) => {
  try {
    const { difficulty, search } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const problems = await Problem.find(filter)
      .select("slug number title difficulty tags stats")
      .sort({ number: 1 });

    const statusMap = await buildStatusMap(req.user?._id);

    const list = problems.map((p) => ({
      slug: p.slug,
      number: p.number,
      title: p.title,
      difficulty: p.difficulty,
      status: statusMap[String(p._id)] || "todo",
      tags: p.tags,
      acceptance: p.stats?.acceptance,
    }));

    res.status(200).json({ count: list.length, problems: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/coding/:slug — full detail, shaped like codingProblems[slug] in the frontend
const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug.toLowerCase() });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const statusMap = await buildStatusMap(req.user?._id);
    const status = statusMap[String(problem._id)] || "todo";

    const lastAccepted = req.user
      ? await Submission.findOne({
          user: req.user._id,
          problem: problem._id,
          status: "Accepted",
        }).sort({ createdAt: -1 })
      : null;

    res.status(200).json({
      problem: {
        id: problem._id,
        slug: problem.slug,
        number: problem.number,
        title: problem.title,
        difficulty: problem.difficulty,
        status,
        tags: problem.tags,
        stats: problem.stats,
        submissions: problem.submissionsCount,
        accuracy: problem.accuracy,
        hasAcceptedSolution: Boolean(lastAccepted),
        statement: problem.statement,
        examples: problem.examples,
        constraints: problem.constraints,
        hints: problem.hints,
        editorial: problem.editorial,
        language: problem.language,
        starterCode: problem.starterCode,
        testCases: problem.testCases,
        challengeDate: problem.challengeDate,
        points: problem.points,
        elevation: problem.elevation && problem.elevation.length ? problem.elevation : undefined,
        lastResult: lastAccepted
          ? {
              status: lastAccepted.status,
              runtime: lastAccepted.runtime,
              beats: lastAccepted.beats,
              memory: lastAccepted.memory,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/coding — create a new problem
const createProblem = async (req, res) => {
  try {
    const {
      slug,
      number,
      title,
      difficulty,
      tags,
      stats,
      submissionsCount,
      accuracy,
      statement,
      examples,
      constraints,
      hints,
      editorial,
      language,
      starterCode,
      testCases,
      challengeDate,
      points,
    } = req.body;

    if (!slug || !number || !title || !difficulty) {
      return res.status(400).json({ error: "slug, number, title and difficulty are required" });
    }

    const problem = await Problem.create({
      slug: slug.trim().toLowerCase(),
      number,
      title: title.trim(),
      difficulty,
      tags: Array.isArray(tags) ? tags : [],
      stats: stats || undefined,
      submissionsCount: submissionsCount || "0",
      accuracy: accuracy || "Medium",
      statement: statement || [],
      examples: examples || [],
      constraints: constraints || [],
      hints: hints || [],
      editorial: editorial || {},
      language: language || "JavaScript",
      starterCode: starterCode || "",
      testCases: testCases || [],
      challengeDate: challengeDate || null,
      points: Number(points) || 100,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Problem created successfully", problem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "A problem with that slug or number already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// POST /api/coding/:slug/submit
// Body: { code, language, result } where `result` is exactly what
// utils/codeRunner.js -> executeCode() returned on the client
// (status, passedCount, totalCount, totalTime, memory, beats)
const submitSolution = async (req, res) => {
  try {
    const { code, language, result } = req.body;

    if (!code || !result || !result.status) {
      return res.status(400).json({ error: "code and a result from the client-side judge are required" });
    }

    const problem = await Problem.findOne({ slug: req.params.slug.toLowerCase() });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const submission = await Submission.create({
      problem: problem._id,
      user: req.user._id,
      code,
      language: language || problem.language,
      status: result.status,
      passedCount: result.passedCount || 0,
      totalCount: result.totalCount || 0,
      runtime: result.totalTime || "",
      memory: result.memory || "",
      beats: result.beats || "",
    });

    res.status(201).json({ message: "Submission recorded", submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/coding/:slug/submissions — the logged-in user's submission history for one problem
const getMySubmissions = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug.toLowerCase() });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const submissions = await Submission.find({ problem: problem._id, user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/coding/progress — the logged-in user's overall coding stats
// (solved count, attempted count, total problems) — handy for a profile/dashboard widget
const getMyProgress = async (req, res) => {
  try {
    const [totalProblems, statusMap] = await Promise.all([
      Problem.countDocuments(),
      buildStatusMap(req.user._id),
    ]);

    const statuses = Object.values(statusMap);
    const solved = statuses.filter((s) => s === "solved").length;
    const attempted = statuses.filter((s) => s === "attempted").length;

    res.status(200).json({
      totalProblems,
      solved,
      attempted,
      todo: Math.max(0, totalProblems - solved - attempted),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/coding/challenge — today's published problem, falling back to the latest one.
const getDailyChallenge = async (req, res) => {
  try {
    const today = dayKey();
    const problem = await Problem.findOne({ challengeDate: today }) || await Problem.findOne().sort({ challengeDate: -1, createdAt: -1 });
    if (!problem) return res.status(404).json({ error: "No coding challenge has been published yet" });
    res.json({ challenge: { slug: problem.slug, number: problem.number, title: problem.title, difficulty: problem.difficulty, points: problem.points, challengeDate: problem.challengeDate || today } });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// GET /api/coding/leaderboard?period=daily|weekly|all-time
const getLeaderboard = async (req, res) => {
  try {
    const period = ["daily", "weekly", "all-time"].includes(req.query.period) ? req.query.period : "daily";
    const now = new Date();
    const start = period === "daily" ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) : period === "weekly" ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) : new Date(0);
    const rows = await Submission.aggregate([
      { $match: { status: "Accepted", createdAt: { $gte: start } } },
      { $sort: { createdAt: 1 } },
      { $group: { _id: { user: "$user", problem: "$problem" }, firstAccepted: { $first: "$createdAt" } } },
      { $lookup: { from: "problems", localField: "_id.problem", foreignField: "_id", as: "problem" } },
      { $unwind: "$problem" },
      { $group: { _id: "$_id.user", solved: { $sum: 1 }, points: { $sum: "$problem.points" }, lastSolvedAt: { $max: "$firstAccepted" } } },
      { $sort: { points: -1, solved: -1, lastSolvedAt: 1 } },
      { $limit: 50 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, userId: "$_id", name: { $ifNull: ["$user.name", "Developer"] }, username: "$user.username", solved: 1, points: 1, lastSolvedAt: 1 } },
    ]);
    let streak = 0;
    if (req.user) {
      const days = await Submission.aggregate([{ $match: { user: req.user._id, status: "Accepted" } }, { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } }, { $group: { _id: "$day" } }]);
      const daySet = new Set(days.map((d) => d._id));
      const cursor = new Date();
      while (daySet.has(dayKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    }
    res.json({ period, leaderboard: rows.map((row, index) => ({ ...row, rank: index + 1 })), streak });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = {
  getProblems,
  getProblemBySlug,
  createProblem,
  submitSolution,
  getMySubmissions,
  getMyProgress,
  getDailyChallenge,
  getLeaderboard,
};
