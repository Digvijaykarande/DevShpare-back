const Roadmap = require("../models/Roadmap");
const RoadmapProgress = require("../models/RoadmapProgress");

const TOPICS_PER_WEEK = 4; // rough pace used only for the "~N weeks left" estimate

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

function streakFrom(days) {
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const weeksLeft = (remaining) => `~${Math.max(1, Math.ceil(remaining / TOPICS_PER_WEEK))} weeks`;

// Walks the roadmap with one user's checked outcomes and derives everything the UI shows:
// each topic's status (completed / active / next / locked), each stage's status and labels,
// and the overall progress numbers. Nothing here is stored, so it can never drift.
function shapeRoadmap(roadmap, doneSet) {
  const flat = [];
  roadmap.stages.forEach((stage, si) =>
    stage.topics.forEach((topic) => {
      const total = topic.outcomes.length;
      const done = topic.outcomes.filter((o) => doneSet.has(o.id)).length;
      flat.push({ si, topic, total, done, complete: total > 0 && done === total });
    })
  );

  const activeIdx = flat.findIndex((t) => !t.complete); // -1 => everything is complete
  const statusAt = (i) => {
    if (flat[i].complete) return "completed";
    if (i === activeIdx) return "active";
    if (i === activeIdx + 1) return "next";
    return "locked";
  };

  let cursor = 0;
  const stages = roadmap.stages.map((stage, si) => {
    const topics = stage.topics.map((topic) => {
      const i = cursor++;
      const status = statusAt(i);
      const f = flat[i];
      return {
        id: topic.id,
        code: topic.code,
        iconName: topic.iconName,
        title: topic.title,
        description: topic.description,
        level: topic.level,
        duration: topic.duration,
        status,
        statusLabel:
          status === "completed" ? "Completed" : status === "active" ? "In progress" : status === "next" ? `Est. ${topic.duration || "2 hrs"}` : undefined,
        outcomes: topic.outcomes.map((o) => ({ id: o.id, label: o.label, done: doneSet.has(o.id) })),
        progress: f.total ? Math.round((f.done / f.total) * 100) : 0,
      };
    });

    const completed = topics.filter((t) => t.status === "completed").length;
    const hasActive = topics.some((t) => t.status === "active");
    const status = completed === topics.length ? "complete" : hasActive ? "active" : "locked";

    return {
      id: stage.id,
      index: stage.index,
      title: stage.title,
      status,
      meta:
        status === "complete"
          ? `${topics.length} / ${topics.length} topics`
          : status === "active"
          ? `${topics.length - completed} topic${topics.length - completed === 1 ? "" : "s"} remaining`
          : si > 0
          ? `Unlocks after stage ${roadmap.stages[si - 1].index}`
          : "Locked",
      completionLabel:
        status === "complete" ? "100% complete" : `${completed} of ${topics.length} completed`,
      topics,
    };
  });

  const topicsTotal = flat.length;
  const topicsDone = flat.filter((t) => t.complete).length;
  const percent = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;
  const activeStage = activeIdx === -1 ? null : roadmap.stages[flat[activeIdx].si];

  return {
    stages,
    activeTopicId: activeIdx === -1 ? null : flat[activeIdx].topic.id,
    stats: {
      topicsTotal,
      topicsDone,
      percent,
      estimate:
        topicsDone === topicsTotal && topicsTotal > 0 ? "Completed" : topicsDone === 0 && !doneSet.size ? "Not started" : `${weeksLeft(topicsTotal - topicsDone)} left`,
      estimatedCompletion: topicsDone === topicsTotal && topicsTotal > 0 ? "Done" : weeksLeft(topicsTotal - topicsDone),
      nextMilestone: activeStage
        ? `Next milestone: finish stage ${activeStage.index} — ${activeStage.title}.`
        : "You've completed every topic on this roadmap.",
    },
  };
}

async function loadProgress(userId, slug) {
  if (!userId) return { doneSet: new Set(), activeDays: [] };
  const doc = await RoadmapProgress.findOne({ user: userId, roadmap: slug });
  return { doneSet: new Set(doc?.doneOutcomes || []), activeDays: doc?.activeDays || [] };
}

// GET /api/roadmaps — cards for the listing page (progress is per-user when signed in)
const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().sort({ order: 1 });

    const progressDocs = req.user ? await RoadmapProgress.find({ user: req.user._id }) : [];
    const bySlug = Object.fromEntries(progressDocs.map((p) => [p.roadmap, new Set(p.doneOutcomes)]));

    const list = roadmaps.map((r) => {
      const { stats } = shapeRoadmap(r, bySlug[r.slug] || new Set());
      return {
        slug: r.slug,
        title: r.title,
        tagline: r.tagline,
        iconName: r.iconName,
        accent: r.accent,
        level: r.level,
        topicsDone: stats.topicsDone,
        topicsTotal: stats.topicsTotal,
        percent: stats.percent,
        estimate: stats.estimate,
      };
    });

    res.status(200).json({ count: list.length, roadmaps: list });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function buildDetail(roadmap, userId) {
  const { doneSet, activeDays } = await loadProgress(userId, roadmap.slug);
  const shaped = shapeRoadmap(roadmap, doneSet);

  // Other learners on this roadmap (real users who have checked something off)
  const peerDocs = await RoadmapProgress.find({
    roadmap: roadmap.slug,
    ...(userId ? { user: { $ne: userId } } : {}),
  })
    .sort({ updatedAt: -1 })
    .limit(3)
    .populate("user", "name");
  const peerTotal = await RoadmapProgress.countDocuments({
    roadmap: roadmap.slug,
    ...(userId ? { user: { $ne: userId } } : {}),
  });
  const peers = peerDocs.map((p) => p.user?.name).filter(Boolean);

  return {
    roadmap: {
      slug: roadmap.slug,
      title: roadmap.title,
      version: roadmap.version,
      summary: roadmap.summary,
      reviewedBy: roadmap.reviewedBy,
      iconName: roadmap.iconName,
      progress: {
        percent: shaped.stats.percent,
        topicsDone: shaped.stats.topicsDone,
        topicsTotal: shaped.stats.topicsTotal,
        nextMilestone: shaped.stats.nextMilestone,
        streakDays: streakFrom(activeDays),
        estimatedCompletion: shaped.stats.estimatedCompletion,
        peers,
        peerOverflow: Math.max(0, peerTotal - peers.length),
      },
    },
    stages: shaped.stages,
    activeTopicId: shaped.activeTopicId,
    featured: roadmap.featured || null,
  };
}

// GET /api/roadmaps/:slug
const getRoadmapBySlug = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ slug: req.params.slug.toLowerCase() });
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });
    res.status(200).json(await buildDetail(roadmap, req.user?._id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/roadmaps/:slug/outcomes/:outcomeId   Body: { done: true | false }
const setOutcome = async (req, res) => {
  try {
    const { done } = req.body;
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done must be true or false" });
    }

    const roadmap = await Roadmap.findOne({ slug: req.params.slug.toLowerCase() });
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });

    const { outcomeId } = req.params;
    const owner = roadmap.stages.flatMap((s) => s.topics).find((t) => t.outcomes.some((o) => o.id === outcomeId));
    if (!owner) return res.status(404).json({ error: "That checklist item isn't part of this roadmap" });

    // Locked topics can't be worked on until the earlier ones are complete.
    const { doneSet } = await loadProgress(req.user._id, roadmap.slug);
    const current = shapeRoadmap(roadmap, doneSet);
    const status = current.stages.flatMap((s) => s.topics).find((t) => t.id === owner.id)?.status;
    if (status === "locked" || status === "next") {
      return res.status(400).json({ error: "Finish the earlier topics first to unlock this one" });
    }

    await RoadmapProgress.findOneAndUpdate(
      { user: req.user._id, roadmap: roadmap.slug },
      {
        ...(done ? { $addToSet: { doneOutcomes: outcomeId, activeDays: dayKey() } } : { $pull: { doneOutcomes: outcomeId } }),
      },
      { upsert: true, new: true }
    );

    res.status(200).json(await buildDetail(roadmap, req.user._id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRoadmaps, getRoadmapBySlug, setOutcome };