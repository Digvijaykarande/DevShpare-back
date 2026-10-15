const mongoose = require("mongoose");
const Mentor = require("../models/Mentor");
const MentorBooking = require("../models/MentorBooking");
const MentorApplication = require("../models/MentorApplication");

const { TIME_SLOTS } = Mentor;

// GET /api/mentors?search=&expertise=&availability=&sortBy=Top rated|Most sessions
const getMentors = async (req, res) => {
  try {
    const { search, expertise, availability, sortBy } = req.query;
    const filter = {};

    if (expertise) filter.expertise = expertise;
    if (availability) filter.availability = availability;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const sort = sortBy === "Most sessions" ? { sessions: -1 } : { rating: -1 };

    const mentors = await Mentor.find(filter).sort(sort);

    res.status(200).json({ count: mentors.length, mentors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/mentors/:id
const getMentorById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Mentor ID format" });
    }

    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    res.status(200).json({ mentor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/mentors/stats — powers MentorshipStats
const getMentorStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [activeMentors, sessionsThisMonth, ratingAgg, responseAgg] = await Promise.all([
      Mentor.countDocuments(),
      MentorBooking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Mentor.aggregate([{ $group: { _id: null, avgRating: { $avg: "$rating" } } }]),
      Mentor.aggregate([{ $group: { _id: null, avgResponse: { $avg: "$responseTimeHours" } } }]),
    ]);

    const avgRating = ratingAgg[0]?.avgRating ?? 0;
    const avgResponseHours = responseAgg[0]?.avgResponse ?? 4;

    res.status(200).json({
      stats: [
        { label: "Active Mentors", value: String(activeMentors), icon: "users" },
        { label: "Sessions This Month", value: String(sessionsThisMonth), icon: "calendar" },
        { label: "Avg. Rating", value: avgRating.toFixed(1), icon: "star" },
        { label: "Avg. Response Time", value: `< ${Math.ceil(avgResponseHours)} hrs`, icon: "clock" },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/mentors/sessions/upcoming — powers UpcomingSessionCard for the logged-in user
const getUpcomingSession = async (req, res) => {
  try {
    const booking = await MentorBooking.findOne({ user: req.user._id, status: "upcoming" })
      .sort({ createdAt: -1 })
      .populate("mentor", "name");

    if (!booking) {
      return res.status(200).json({ session: null });
    }

    res.status(200).json({
      session: {
        id: booking._id,
        mentor: booking.mentor?.name,
        topic: booking.topic,
        slot: booking.slot,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/mentors/:id/book
// Body: { slot }
const bookSession = async (req, res) => {
  try {
    const { slot } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Mentor ID format" });
    }

    if (!slot || !TIME_SLOTS.includes(slot)) {
      return res.status(400).json({ error: "Please choose a valid time slot" });
    }

    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    if (mentor.availability === "Currently away") {
      return res.status(400).json({ error: "This mentor isn't taking bookings right now" });
    }

    // Only one "upcoming" session shown at a time on the dashboard card,
    // so mark any previous upcoming bookings for this user as cancelled.
    await MentorBooking.updateMany(
      { user: req.user._id, status: "upcoming" },
      { $set: { status: "cancelled" } }
    );

    const booking = await MentorBooking.create({
      mentor: mentor._id,
      user: req.user._id,
      topic: `${mentor.expertise} · 1:1 session`,
      slot,
      status: "upcoming",
    });

    mentor.sessions += 1;
    await mentor.save();

    res.status(201).json({
      message: "Booked successfully",
      session: {
        id: booking._id,
        mentor: mentor.name,
        topic: booking.topic,
        slot: booking.slot,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/mentors/:id/notify — "Notify when back" for away mentors
const notifyWhenAvailable = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Mentor ID format" });
    }

    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    const alreadyRequested = mentor.notifyRequests.some(
      (userId) => String(userId) === String(req.user._id)
    );

    if (!alreadyRequested) {
      mentor.notifyRequests.push(req.user._id);
      await mentor.save();
    }

    res.status(200).json({ message: `We'll email you when ${mentor.name} is back` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/mentors/apply — "Apply to mentor" callout
// Body: { expertise, message }
const applyToMentor = async (req, res) => {
  try {
    const { expertise, message } = req.body;

    const existingPending = await MentorApplication.findOne({
      applicant: req.user._id,
      status: "pending",
    });
    if (existingPending) {
      return res.status(409).json({ error: "You already have a pending mentor application" });
    }

    const application = await MentorApplication.create({
      applicant: req.user._id,
      expertise: expertise || "",
      message: message || "",
    });

    res.status(201).json({ message: "Mentor application submitted successfully", application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/mentors — create a mentor profile (e.g. once an application is approved)
const createMentor = async (req, res) => {
  try {
    const { name, title, company, expertise, tags, price, availability, bio, responseTimeHours } =
      req.body;

    if (!name || !title || !company || !expertise || !bio) {
      return res.status(400).json({ error: "name, title, company, expertise and bio are required" });
    }

    const formattedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const mentor = await Mentor.create({
      user: req.user._id,
      name: name.trim(),
      title: title.trim(),
      company: company.trim(),
      expertise,
      tags: formattedTags,
      price: price || "Free",
      availability: availability || "Available now",
      bio: bio.trim(),
      responseTimeHours: responseTimeHours || 4,
    });

    res.status(201).json({ message: "Mentor profile created successfully", mentor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMentors,
  getMentorById,
  getMentorStats,
  getUpcomingSession,
  bookSession,
  notifyWhenAvailable,
  applyToMentor,
  createMentor,
};