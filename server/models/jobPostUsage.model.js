const mongoose = require("mongoose");

const jobPostUsageSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      unique: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruiterSubscription",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
      index: true,
    },
    countedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    monthKey: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
    action: {
      type: String,
      enum: ["job_created"],
      default: "job_created",
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

jobPostUsageSchema.pre("deleteOne", function preventUsageDelete(next) {
  next(new Error("Job post usage logs are immutable. Archive them instead of deleting."));
});

jobPostUsageSchema.pre("deleteMany", function preventBulkUsageDelete(next) {
  next(new Error("Job post usage logs are immutable. Archive them instead of deleting."));
});

jobPostUsageSchema.index({ recruiterId: 1, subscriptionId: 1, monthKey: 1, countedAt: -1 });
jobPostUsageSchema.index({ subscriptionId: 1, countedAt: -1 });

module.exports = mongoose.model("JobPostUsage", jobPostUsageSchema);
