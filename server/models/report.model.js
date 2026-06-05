const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "platform-overview",
        "jobs",
        "candidate-activity",
        "recruiter-performance",
        "application-conversion",
        "hiring",
        "monthly-growth",
      ],
      required: true,
    },
    periodDays: {
      type: Number,
      default: 30,
      min: 1,
      max: 3650,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    summary: {
      type: String,
      default: "",
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });

module.exports = mongoose.models.Report || mongoose.model("Report", reportSchema);
