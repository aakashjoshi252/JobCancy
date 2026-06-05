const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "job_applied",
  "application_status_changed",
  "interview_scheduled",
  "message_received",
  "recruiter_approved",
  "job_approved",
  "job_rejected",
  "profile_updated",
  "subscription_purchased",
  "subscription_cancelled",
  "subscription_expiring_soon",
  "subscription_expired",
  "subscription_limit_80",
  "subscription_limit_reached",
  "subscription_payment_failed",
  "subscription_upgraded",
  "system_alert",
  // Legacy values kept so old rows remain readable until they age out.
  "APPLICATION_SUBMITTED",
  "APPLICATION_REVIEWED",
  "APPLICATION_SHORTLISTED",
  "APPLICATION_REJECTED",
  "APPLICATION_APPROVED",
  "NEW_MESSAGE",
  "JOB_POSTED",
  "JOB_UPDATED",
  "JOB_CLOSED",
  "PROFILE_VIEWED",
  "RESUME_VIEWED",
  "SYSTEM",
];

const RELATED_ENTITY_TYPES = [
  "Job",
  "Application",
  "Interview",
  "Message",
  "User",
  "Company",
  "Resume",
  "Report",
  "Subscription",
  "SubscriptionPlan",
  "PaymentTransaction",
  "System",
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedEntityType: {
      type: String,
      enum: RELATED_ENTITY_TYPES,
      default: null,
    },
    link: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      dedupeKey: {
        type: String,
        default: "",
        index: true,
      },
    },

    // Legacy fields kept in sync for existing frontend/backend callers.
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      enum: RELATED_ENTITY_TYPES,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.pre("validate", function syncNotificationAliases(next) {
  this.recipient = this.recipient || this.recipientId;
  this.recipientId = this.recipientId || this.recipient;
  this.sender = this.sender || this.senderId || null;
  this.senderId = this.senderId || this.sender || null;
  this.relatedEntityId = this.relatedEntityId || this.relatedId || null;
  this.relatedId = this.relatedId || this.relatedEntityId || null;
  this.relatedEntityType = this.relatedEntityType || this.relatedModel || null;
  this.relatedModel = this.relatedModel || this.relatedEntityType || null;

  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }

  if (!this.isRead) {
    this.readAt = null;
  }

  next();
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, relatedEntityId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
