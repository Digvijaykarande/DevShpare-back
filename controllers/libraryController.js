const LibraryProject = require("../models/LibraryProject");

// GET /api/projects/library?language=&search=
const getLibraryProjects = async (req, res) => {
  try {
    const { language, search } = req.query;
    const filter = {};

    if (language) filter.language = { $regex: `^${language}$`, $options: "i" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const items = await LibraryProject.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    const shaped = items.map((doc) => {
      const item = doc.toObject();
      const authorId = String(item.author?._id || item.author || "");
      return { ...item, isMine: req.user ? authorId === String(req.user._id) : false };
    });

    res.status(200).json({ count: shaped.length, items: shaped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/projects/library
const createLibraryProject = async (req, res) => {
  try {
    const { title, language, description, tags, repoUrl } = req.body;

    if (!title || !description || !language) {
      return res.status(400).json({ error: "Title, language and description are required" });
    }

    const parsedTags = Array.isArray(tags)
      ? tags.slice(0, 6)
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6)
      : [];

    const item = await LibraryProject.create({
      title: title.trim(),
      language: language.trim(),
      description: description.trim(),
      tags: parsedTags,
      repoUrl: repoUrl || null,
      downloadUrl: repoUrl || null,
      author: req.user._id,
    });

    res.status(201).json({ message: "Library project created successfully", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getLibraryProjects, createLibraryProject };