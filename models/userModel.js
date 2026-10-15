const mongoose = require('mongoose');

// One row per signed-in device. The JWT carries the session id (sid), so
// deleting a row here instantly signs that device out.
const sessionSchema = new mongoose.Schema(
  {
    sid: { type: String, required: true },
    device: { type: String, default: 'Unknown device' },
    ip: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
  },
  { _id: false }
);

const notifChannel = { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: true } };

const userSchema = new mongoose.Schema(
  {
    // ---- existing auth fields (unchanged) ----
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountStatus: { type: String, enum: ['Active', 'Inactive', 'Banned'], default: 'Active' },

    // ---- profile ----
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    role: { type: String, default: 'Developer', trim: true, maxlength: 80 },
    bio: { type: String, default: '', maxlength: 250 },
    location: { type: String, default: '', maxlength: 80 },
    website: { type: String, default: '', maxlength: 200 },
    avatar: { type: String, default: null }, // small data URL (jpeg/png), capped in the controller
    emailVerified: { type: Boolean, default: false },

    techStack: [{ name: { type: String, trim: true }, skills: [{ type: String, trim: true }], _id: false }],
    currentlyLearning: [{ type: String, trim: true }],
    socialLinks: [{ name: String, handle: String, url: String, _id: false }],

    // ---- settings ----
    settings: {
      notifications: {
        answers: notifChannel,
        mentions: notifChannel,
        projectInvites: notifChannel,
        streak: { email: { type: Boolean, default: false }, inApp: { type: Boolean, default: true } },
        digest: { email: { type: Boolean, default: true }, inApp: { type: Boolean, default: false } },
        sessions: notifChannel,
        product: { email: { type: Boolean, default: false }, inApp: { type: Boolean, default: false } },
      },
      appearance: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
        reduceMotion: { type: Boolean, default: false },
      },
      privacy: {
        visibility: { type: String, enum: ['public', 'members', 'private'], default: 'public' },
        showEmail: { type: Boolean, default: false },
        showActivity: { type: Boolean, default: true },
        searchable: { type: Boolean, default: true },
        mentorRequests: { type: Boolean, default: true },
      },
      security: { twoFactor: { type: Boolean, default: false } },
      connections: {
        github: { type: Boolean, default: false },
        google: { type: Boolean, default: false },
        linkedin: { type: Boolean, default: false },
        x: { type: Boolean, default: false },
      },
    },

    sessions: { type: [sessionSchema], default: [] },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
