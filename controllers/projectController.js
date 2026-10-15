const mongoose = require("mongoose");
const Project = require("../models/Project");
const Application = require("../models/Application");

// Reshapes a Project mongoose doc into what the frontend cards expect,
// adding the computed `isOwnTeam` flag (true if the logged-in user is the
// lead or a member) since that isn't stored on the document itself.
function shapeProject(projectDoc, userId) {
  const project = projectDoc.toObject();
  const isOwnTeam = userId
    ? String(project.lead?._id || project.lead) === String(userId) ||
      project.members?.some((m) => String(m._id || m) === String(userId))
    : false;

  return { ...project, isOwnTeam };
}

// GET /api/projects?tech=&difficulty=&stage=&role=&search=&mine=true
const getProjects = async (req, res) => {
  try {
    const { tech, difficulty, stage, role, search, mine } = req.query;
    const filter = {};

    if (tech) filter.techStack = tech;
    if (difficulty) filter.difficulty = difficulty;
    if (stage) filter["status.stage"] = stage;
    if (role) filter["openPositions.role"] = { $regex: role, $options: "i" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } },
      ];
    }

    if (mine === "true" && req.user) {
      filter.$and = [
        ...(filter.$and || []),
        { $or: [{ lead: req.user._id }, { members: req.user._id }] },
      ];
    }

    const projects = await Project.find(filter)
      .populate("lead", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    const shaped = projects.map((p) => shapeProject(p, req.user?._id));

    res.status(200).json({ count: shaped.length, projects: shaped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Project ID format" });
    }

    const project = await Project.findById(req.params.id)
      .populate("lead", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ project: shapeProject(project, req.user?._id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/projects
// Body: { title, description, techStack, difficulty, status, openPositions }
const createProject = async (req, res) => {
  try {
    const { title, description, techStack, difficulty, status, openPositions, progress, version } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const formattedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === "string"
      ? techStack.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      techStack: formattedTechStack,
      difficulty: difficulty || "Intermediate",
      status: status || undefined,
      openPositions: openPositions || [],
      progress: progress || undefined,
      version: version || null,
      lead: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/projects/:id/apply
// Body: { role, message }
const applyToProject = async (req, res) => {
  try {
    const { role, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Project ID format" });
    }

    if (!role) {
      return res.status(400).json({ error: "A role selection is required" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const isTeamMember =
      String(project.lead) === String(req.user._id) ||
      project.members.some((m) => String(m) === String(req.user._id));
    if (isTeamMember) {
      return res.status(400).json({ error: "You are already on this project's team" });
    }

    const validRole = project.openPositions.some(
      (p) => p.role.toLowerCase() === role.trim().toLowerCase()
    );
    if (!validRole) {
      return res.status(400).json({ error: "That role is not open on this project" });
    }

    const alreadyApplied = await Application.findOne({
      project: project._id,
      applicant: req.user._id,
    });
    if (alreadyApplied) {
      return res.status(409).json({ error: "You already applied to this project" });
    }

    const application = await Application.create({
      project: project._id,
      applicant: req.user._id,
      role: role.trim(),
      message: message || "",
    });

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/projects/stats — powers the StatsBento widget
const getProjectStats = async (req, res) => {
  try {
    const [activeCollabs, shippedToProd, openSeatsAgg, totalApplications, acceptedApplications] =
      await Promise.all([
        Project.countDocuments({ "status.stage": { $ne: "Production" } }),
        Project.countDocuments({ "status.stage": "Production" }),
        Project.aggregate([{ $unwind: "$openPositions" }, { $count: "openRoles" }]),
        Application.countDocuments(),
        Application.countDocuments({ status: "accepted" }),
      ]);

    const openSeats = openSeatsAgg[0]?.openRoles || 0;
    const matchRate = totalApplications
      ? ((acceptedApplications / totalApplications) * 100).toFixed(1)
      : "0.0";

    res.status(200).json({
      stats: [
        { label: "Active Collabs", value: String(activeCollabs), icon: "hub" },
        { label: "Open Seats", value: `${openSeats} Roles`, icon: "seats" },
        { label: "Shipped to Prod", value: `${shippedToProd} MVPs`, icon: "rocket" },
        { label: "Match Rate", value: `${matchRate}%`, icon: "verified" },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  applyToProject,
  getProjectStats,
};