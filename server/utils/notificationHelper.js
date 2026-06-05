const Notification = require("../models/notification.model");
const {
  getUnreadCountForUser,
  normalizeNotification,
} = require("../controllers/notification.controller");

let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

const getIO = () => io;

const sanitizeText = (value, maxLength = 500) =>
  String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const legacyTypeMap = {
  APPLICATION_SUBMITTED: "job_applied",
  APPLICATION_REVIEWED: "application_status_changed",
  APPLICATION_SHORTLISTED: "application_status_changed",
  APPLICATION_REJECTED: "application_status_changed",
  APPLICATION_APPROVED: "application_status_changed",
  NEW_MESSAGE: "message_received",
  JOB_POSTED: "system_alert",
  JOB_UPDATED: "system_alert",
  JOB_CLOSED: "system_alert",
  PROFILE_VIEWED: "system_alert",
  RESUME_VIEWED: "system_alert",
  SYSTEM: "system_alert",
};

const normalizeType = (type) => legacyTypeMap[type] || type || "system_alert";

const emitNotification = async (recipientId, notification) => {
  if (!io || !recipientId) return;

  const unreadCount = await getUnreadCountForUser(recipientId);
  const payload = normalizeNotification(notification);

  io.to(`user:${recipientId}`).to(`user_${recipientId}`).emit("notification:new", payload);
  io.to(`user:${recipientId}`).to(`user_${recipientId}`).emit("newNotification", payload);
  io.to(`user:${recipientId}`).to(`user_${recipientId}`).emit("notification:unreadCount", unreadCount);
  io.to(`user:${recipientId}`).to(`user_${recipientId}`).emit("unreadNotificationCount", unreadCount);
};

const sendNotification = async ({
  recipientId,
  recipient,
  senderId = null,
  sender = null,
  type,
  title,
  message,
  relatedEntityId = null,
  relatedId = null,
  relatedEntityType = null,
  relatedModel = null,
  link = "",
  dedupeKey = "",
}) => {
  try {
    const recipientValue = recipientId || recipient;
    if (!recipientValue) return null;

    const normalizedType = normalizeType(type);
    const entityId = relatedEntityId || relatedId || null;
    const entityType = relatedEntityType || relatedModel || null;
    const cleanTitle = sanitizeText(title, 120);
    const cleanMessage = sanitizeText(message, 500);

    if (!cleanTitle || !cleanMessage) return null;

    const dedupeQuery = dedupeKey
      ? { "metadata.dedupeKey": dedupeKey }
      : entityId
        ? {
            recipient: recipientValue,
            type: normalizedType,
            relatedEntityId: entityId,
            createdAt: { $gte: new Date(Date.now() - 5000) },
          }
        : null;

    if (dedupeQuery) {
      const existing = await Notification.findOne(dedupeQuery).sort({ createdAt: -1 });
      if (existing) return existing;
    }

    const notification = await Notification.create({
      recipient: recipientValue,
      recipientId: recipientValue,
      sender: sender || senderId || null,
      senderId: senderId || sender || null,
      type: normalizedType,
      title: cleanTitle,
      message: cleanMessage,
      relatedEntityId: entityId,
      relatedId: entityId,
      relatedEntityType: entityType,
      relatedModel: entityType,
      link: sanitizeText(link, 300),
      metadata: {
        dedupeKey,
      },
    });

    await notification.populate("sender", "username email role profilePicture profileImage");
    await emitNotification(recipientValue.toString(), notification);
    return notification;
  } catch (error) {
    console.error("Notification delivery failed:", error);
    return null;
  }
};

const notifyApplicationSubmitted = async (application, job, candidate) =>
  sendNotification({
    recipientId: application.recruiterId || job.recruiterId,
    senderId: candidate?._id || application.candidateId,
    type: "job_applied",
    title: "New job application",
    message: `${candidate?.username || "A candidate"} applied for ${job.title || "your job"}.`,
    relatedEntityId: application._id,
    relatedEntityType: "Application",
    link: `/recruiter/candidates-list/${application._id}`,
    dedupeKey: `job_applied:${application._id}`,
  });

const notifyApplicationStatusChange = async (application, newStatus, job, recruiterId) =>
  sendNotification({
    recipientId: application.candidateId,
    senderId: recruiterId || application.recruiterId,
    type: "application_status_changed",
    title: "Application status updated",
    message: `Your application for ${job?.title || "a job"} is now ${newStatus}.`,
    relatedEntityId: application._id,
    relatedEntityType: "Application",
    link: `/candidate/applications`,
    dedupeKey: `application_status_changed:${application._id}:${newStatus}`,
  });

const notifyInterviewScheduled = async (application, interview, job, recruiterId) =>
  sendNotification({
    recipientId: application.candidateId || application.applicant,
    senderId: recruiterId || application.recruiterId,
    type: "interview_scheduled",
    title: "Interview scheduled",
    message: `Your interview for ${job?.title || "a job"} has been scheduled.`,
    relatedEntityId: interview._id,
    relatedEntityType: "Interview",
    link: `/candidate/applications`,
    dedupeKey: `interview_scheduled:${interview._id}`,
  });

const notifyNewMessage = async ({ senderId, recipientId, senderName, messagePreview, chatId, messageId }) =>
  sendNotification({
    recipientId,
    senderId,
    type: "message_received",
    title: "New message",
    message: `${senderName || "User"}: ${sanitizeText(messagePreview, 80)}`,
    relatedEntityId: messageId || chatId,
    relatedEntityType: "Message",
    link: `/chat`,
    dedupeKey: messageId ? `message_received:${messageId}` : "",
  });

const notifyRecruiterApproval = async (recruiter, status, adminId) => {
  const approved = status === "Approved";
  return sendNotification({
    recipientId: recruiter._id,
    senderId: adminId,
    type: "recruiter_approved",
    title: approved ? "Recruiter account approved" : "Recruiter account rejected",
    message: approved
      ? "Your recruiter account has been approved. You can now manage jobs and applicants."
      : "Your recruiter account approval request was rejected.",
    relatedEntityId: recruiter._id,
    relatedEntityType: "User",
    link: `/recruiter/dashboard`,
    dedupeKey: `recruiter_approved:${recruiter._id}:${status}`,
  });
};

const notifyJobModeration = async (job, approvalStatus, adminId) => {
  if (!["Approved", "Rejected"].includes(approvalStatus)) return null;

  return sendNotification({
    recipientId: job.recruiterId,
    senderId: adminId,
    type: approvalStatus === "Approved" ? "job_approved" : "job_rejected",
    title: approvalStatus === "Approved" ? "Job approved" : "Job rejected",
    message: `${job.title || "Your job"} was ${approvalStatus.toLowerCase()} by admin.`,
    relatedEntityId: job._id,
    relatedEntityType: "Job",
    link: `/recruiter/postedjobs`,
    dedupeKey: `job_moderation:${job._id}:${approvalStatus}`,
  });
};

const notifyAdminsAboutJob = async (job, adminIds = []) =>
  Promise.all(
    adminIds.map((adminId) =>
      sendNotification({
        recipientId: adminId,
        senderId: job.recruiterId,
        type: "system_alert",
        title: "New job pending approval",
        message: `${job.title || "A job"} was posted and may need review.`,
        relatedEntityId: job._id,
        relatedEntityType: "Job",
        link: `/admin/jobs`,
        dedupeKey: `admin_job_review:${adminId}:${job._id}`,
      })
    )
  );

const notifyProfileUpdated = async (user) =>
  sendNotification({
    recipientId: user._id,
    senderId: user._id,
    type: "profile_updated",
    title: "Profile updated",
    message: "Your profile was updated successfully.",
    relatedEntityId: user._id,
    relatedEntityType: "User",
    link: `/${user.role}/profile`,
  });

const notifySystem = async (userId, title, message, link = "") =>
  sendNotification({
    recipientId: userId,
    type: "system_alert",
    title,
    message,
    link,
  });

const getPlanName = (subscription) =>
  subscription?.planId?.planName || subscription?.planSnapshot?.planName || "your subscription plan";

const notifySubscriptionPurchased = async (userId, subscription) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_purchased",
    title: "Subscription purchased",
    message: `${getPlanName(subscription)} is active until ${new Date(subscription.endDate).toLocaleDateString("en-IN")}.`,
    relatedEntityId: subscription._id,
    relatedEntityType: "Subscription",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_purchased:${subscription._id}`,
  });

const notifySubscriptionCancelled = async (userId, subscription) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_cancelled",
    title: "Subscription cancelled",
    message: `${getPlanName(subscription)} was cancelled.`,
    relatedEntityId: subscription._id,
    relatedEntityType: "Subscription",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_cancelled:${subscription._id}`,
  });

const notifySubscriptionExpiringSoon = async (userId, subscription) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_expiring_soon",
    title: "Subscription expiring soon",
    message: `${getPlanName(subscription)} expires on ${new Date(subscription.endDate).toLocaleDateString("en-IN")}.`,
    relatedEntityId: subscription._id,
    relatedEntityType: "Subscription",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_expiring_soon:${subscription._id}:${new Date(subscription.endDate).toISOString().slice(0, 10)}`,
  });

const notifySubscriptionExpired = async (userId, subscription) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_expired",
    title: "Subscription expired",
    message: `${getPlanName(subscription)} has expired. Renew a plan to post jobs.`,
    relatedEntityId: subscription._id,
    relatedEntityType: "Subscription",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_expired:${subscription._id}`,
  });

const notifySubscriptionLimit80 = async (userId, subscription) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_limit_80",
    title: "80% job post limit used",
    message: `You have used 80% of ${getPlanName(subscription)} for this month.`,
    relatedEntityId: subscription._id,
    relatedEntityType: "Subscription",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_limit_80:${subscription._id}:${subscription.currentMonthKey}`,
  });

const notifySubscriptionLimitReached = async (userId, subscription) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_limit_reached",
    title: "Job post limit reached",
    message: "Your monthly job posting limit is over. Please upgrade your plan.",
    relatedEntityId: subscription._id,
    relatedEntityType: "Subscription",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_limit_reached:${subscription._id}:${subscription.currentMonthKey}`,
  });

const notifyPaymentFailed = async (userId, transaction) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_payment_failed",
    title: "Payment verification failed",
    message: "We could not verify your subscription payment. No subscription was activated.",
    relatedEntityId: transaction._id,
    relatedEntityType: "PaymentTransaction",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_payment_failed:${transaction._id}`,
  });

const notifySubscriptionUpgraded = async (userId, subscription) =>
  sendNotification({
    recipientId: userId,
    type: "subscription_upgraded",
    title: "Plan upgraded",
    message: `${getPlanName(subscription)} is now your active plan.`,
    relatedEntityId: subscription._id,
    relatedEntityType: "Subscription",
    link: "/recruiter/subscription",
    dedupeKey: `subscription_upgraded:${subscription._id}`,
  });

module.exports = {
  setIO,
  getIO,
  sendNotification,
  notifyApplicationSubmitted,
  notifyApplicationStatusChange,
  notifyInterviewScheduled,
  notifyNewMessage,
  notifyRecruiterApproval,
  notifyJobModeration,
  notifyAdminsAboutJob,
  notifyProfileUpdated,
  notifySystem,
  notifyPaymentFailed,
  notifySubscriptionCancelled,
  notifySubscriptionExpired,
  notifySubscriptionExpiringSoon,
  notifySubscriptionLimit80,
  notifySubscriptionLimitReached,
  notifySubscriptionPurchased,
  notifySubscriptionUpgraded,
};
