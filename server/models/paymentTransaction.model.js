const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
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
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruiterSubscription",
      default: null,
    },
    gateway: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountInPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "created", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    receipt: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      default: undefined,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
      select: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    failureCode: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    webhookEventIds: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, versionKey: false }
);

paymentTransactionSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { razorpayPaymentId: { $type: "string" } } }
);
paymentTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("PaymentTransaction", paymentTransactionSchema);
