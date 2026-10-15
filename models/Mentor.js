const mongoose = require("mongoose");

// Kept in sync with EXPERTISE_OPTIONS / AVAILABILITY_OPTIONS / TIME_SLOTS
// in the frontend's src/pages/mentorship/data/mentorshipData.js
const EXPERTISE_OPTIONS = [
  "Frontend Engineering",
  "Backend & Systems",
  "DevOps & Cloud",
  "Data & ML",
  "Career Coaching",
  "Interview Prep",
];

const AVAILABILITY_OPTIONS = ["Available now", "Opens this week", "Currently away"];

const TIME_SLOTS = ["Today, 4:00 PM", "Tomorrow, 10:30 AM", "Fri, 2:00 PM"];

const mentorSchema = new mongoose.Schema(
  {
    // Optional link to a platform account (if the mentor also has a login).
    // Left null for mentors that only exist as profiles (e.g. seeded data).
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },

    expertise: { type: String, enum: EXPERTISE_OPTIONS, required: true },
    tags: [{ type: String, trim: true }],

    rating: { type: Number, default: 5, min: 0, max: 5 },
    sessions: { type: Number, default: 0, min: 0 },

    price: { type: String, default: "Free" }, // e.g. "Free" or "₹800/session"
    availability: { type: String, enum: AVAILABILITY_OPTIONS, default: "Available now" },

    bio: { type: String, required: true },

    // Used to compute the "Avg. Response Time" stat card
    responseTimeHours: { type: Number, default: 4, min: 0 },

    // Users who asked to be notified when this mentor becomes available again
    notifyRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mentor", mentorSchema);
module.exports.EXPERTISE_OPTIONS = EXPERTISE_OPTIONS;
module.exports.AVAILABILITY_OPTIONS = AVAILABILITY_OPTIONS;
module.exports.TIME_SLOTS = TIME_SLOTS;