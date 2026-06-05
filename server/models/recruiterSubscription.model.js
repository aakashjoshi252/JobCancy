const mongoose = require("mongoose");

const recruiterSubscriptionSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    jobPostLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    jobsPostedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingPosts: {
      type: Number,
      default: null,
      min: 0,
    },
    isUnlimited: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    orderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    paymentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentTransaction",
      default: null,
    },
    currentMonthKey: {
      type: String,
      default: "",
      trim: true,
    },
    currentMonthPostedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    planSnapshot: {
      planName: String,
      price: Number,
      currency: String,
      duration: Number,
      durationType: String,
    },
  },
  { timestamps: true, versionKey: false }
);

recruiterSubscriptionSchema.index({ recruiterId: 1, status: 1, endDate: -1 });
recruiterSubscriptionSchema.index({ planId: 1, status: 1 });
recruiterSubscriptionSchema.index({ currentMonthKey: 1, recruiterId: 1 });

module.exports = mongoose.model("RecruiterSubscription", recruiterSubscriptionSchema);
