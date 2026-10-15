const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    code: { type: String, required: true },
    language: { type: String, default: "JavaScript" },

    // Mirrors the shape returned by utils/codeRunner.js -> executeCode()
    status: {
      type: String,
      enum: ["Accepted", "Wrong Answer", "Runtime Error", "Compile Error"],
      required: true,
    },
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    runtime: { type: String, default: "" }, // e.g. "48 ms"
    memory: { type: String, default: "" }, // e.g. "44.1 MB"
    beats: { type: String, default: "" }, // e.g. "92.4%"
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);