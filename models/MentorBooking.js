const mongoose = require("mongoose");

const mentorBookingSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    topic: { type: String, default: "" }, // e.g. "Career Coaching · 1:1 session"
    slot: { type: String, required: true }, // e.g. "Tomorrow, 10:30 AM"

    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorBooking", mentorBookingSchema);