const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 80,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },
    jobPostLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    durationType: {
      type: String,
      enum: ["month", "months", "year"],
      required: true,
    },
    isUnlimited: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

subscriptionPlanSchema.pre("validate", function normalizePlan(next) {
  if (this.isUnlimited) {
    this.jobPostLimit = 0;
  }

  if (!this.isUnlimited && !this.jobPostLimit) {
    this.invalidate("jobPostLimit", "Job post limit is required for limited plans");
  }

  next();
});

subscriptionPlanSchema.index({ isActive: 1, sortOrder: 1, price: 1 });

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
