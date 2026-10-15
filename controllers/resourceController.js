const Resource = require("../models/Resource");
const { CATEGORIES } = Resource;

// GET /api/resources?category=&search=
const getResources = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { provider: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: resources.length, resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/resources/stats — powers the 3 stat chips under the hero
const getResourceStats = async (req, res) => {
  try {
    const [total, freeCount] = await Promise.all([
      Resource.countDocuments(),
      Resource.countDocuments({ free: true }),
    ]);

    res.status(200).json({
      stats: [
        { label: "Curated resources", value: String(total) },
        { label: "Free to start", value: String(freeCount) },
        { label: "Categories", value: String(CATEGORIES.length) },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/resources — "Contribute a Resource" / Add Resource
const createResource = async (req, res) => {
  try {
    const { title, category, type, provider, iconName, accent, free, tags, summary, details, url } =
      req.body;

    if (!title || !category || !type || !provider || !summary) {
      return res
        .status(400)
        .json({ error: "title, category, type, provider and summary are required" });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(", ")}` });
    }

    const resource = await Resource.create({
      title: title.trim(),
      category,
      type: type.trim(),
      provider: provider.trim(),
      iconName: iconName || "BookOpen",
      accent: accent || "primary",
      free: free !== undefined ? free : true,
      tags: Array.isArray(tags) ? tags : [],
      summary,
      details: details || "",
      url: url || "",
      addedBy: req.user._id,
    });

    res.status(201).json({ message: "Resource added successfully", resource });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getResources, getResourceStats, createResource };