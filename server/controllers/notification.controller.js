const mongoose = require("mongoose");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const sanitizeText = (value, maxLength = 500) =>
  String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const getUserId = (req) => req.user?._id;

const ownNotificationFilter = (userId) => ({
  $or: [{ recipient: userId }, { recipientId: userId }],
});

const populateNotification = (query) =>
  query
    .populate("sender", "username email role profilePicture profileImage")
    .populate("senderId", "username email role profilePicture profileImage");

const normalizeNotification = (notification) => {
  if (!notification) return notification;
  const data = typeof notification.toObject === "function"
    ? notification.toObject({ virtuals: true })
    : { ...notification };

  data.recipient = data.recipient || data.recipientId;
  data.recipientId = data.recipientId || data.recipient;
  data.sender = data.sender || data.senderId || null;
  data.senderId = data.senderId || data.sender || null;
  data.relatedEntityId = data.relatedEntityId || data.relatedId || null;
  data.relatedId = data.relatedId || data.relatedEntityId || null;
  data.relatedEntityType = data.relatedEntityType || data.relatedModel || null;
  data.relatedModel = data.relatedModel || data.relatedEntityType || null;
  return data;
};

const getUnreadCountForUser = (userId) =>
  Notification.countDocuments({
    ...ownNotificationFilter(userId),
    isRead: false,
  });

const emitUnreadCount = async (req, userId) => {
  const io = req.app?.get("io");
  if (!io || !userId) return null;

  const count = await getUnreadCountForUser(userId);
  io.to(`user:${userId}`).to(`user_${userId}`).emit("notification:unreadCount", count);
  io.to(`user:${userId}`).to(`user_${userId}`).emit("unreadNotificationCount", count);
  return count;
};

const getNotificationId = (req) => req.params.id || req.params.notificationId;

const notificationController = {
  createNotification: async (notificationData) => Notification.create(notificationData),

  getUserNotifications: async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const page = Math.max(parseInt(req.query.page || "1", 10), 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
      const skip = (page - 1) * limit;
      const unreadOnly = req.query.unreadOnly === "true" || req.query.read === "false";
      const type = sanitizeText(req.query.type || "", 60);

      const filter = ownNotificationFilter(userId);
      if (unreadOnly) filter.isRead = false;
      if (type && type !== "all" && type !== "ALL") filter.type = type;

      const [notifications, unreadCount, totalCount] = await Promise.all([
        populateNotification(Notification.find(filter))
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        getUnreadCountForUser(userId),
        Notification.countDocuments(filter),
      ]);

      const data = {
        notifications: notifications.map(normalizeNotification),
        unreadCount,
        totalCount,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
          hasNextPage: page * limit < totalCount,
          hasPrevPage: page > 1,
        },
      };

      return res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        ...data,
        data,
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  },

  getUnreadCount: async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const count = await getUnreadCountForUser(userId);
      return res.status(200).json({
        success: true,
        count,
        data: { count, unreadCount: count },
      });
    } catch (error) {
      console.error("Get unread count error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get unread count",
        error: error.message,
      });
    }
  },

  markAsRead: async (req, res) => {
    try {
      const userId = getUserId(req);
      const id = getNotificationId(req);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid notification ID" });
      }

      const notification = await populateNotification(
        Notification.findOneAndUpdate(
          { _id: id, ...ownNotificationFilter(userId) },
          { isRead: true, readAt: new Date() },
          { new: true }
        )
      );

      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }

      const unreadCount = await emitUnreadCount(req, userId);
      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification: normalizeNotification(notification),
        unreadCount,
        data: { notification: normalizeNotification(notification), unreadCount },
      });
    } catch (error) {
      console.error("Mark as read error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
        error: error.message,
      });
    }
  },

  markAsUnread: async (req, res) => {
    try {
      const userId = getUserId(req);
      const id = getNotificationId(req);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid notification ID" });
      }

      const notification = await populateNotification(
        Notification.findOneAndUpdate(
          { _id: id, ...ownNotificationFilter(userId) },
          { isRead: false, readAt: null },
          { new: true }
        )
      );

      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }

      const unreadCount = await emitUnreadCount(req, userId);
      return res.status(200).json({
        success: true,
        message: "Notification marked as unread",
        notification: normalizeNotification(notification),
        unreadCount,
        data: { notification: normalizeNotification(notification), unreadCount },
      });
    } catch (error) {
      console.error("Mark as unread error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as unread",
        error: error.message,
      });
    }
  },

  markAllAsRead: async (req, res) => {
    try {
      const userId = getUserId(req);
      const result = await Notification.updateMany(
        { ...ownNotificationFilter(userId), isRead: false },
        { isRead: true, readAt: new Date() }
      );
      const unreadCount = await emitUnreadCount(req, userId);

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
        unreadCount,
        data: { modifiedCount: result.modifiedCount, unreadCount },
      });
    } catch (error) {
      console.error("Mark all as read error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
        error: error.message,
      });
    }
  },

  deleteNotification: async (req, res) => {
    try {
      const userId = getUserId(req);
      const id = getNotificationId(req);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid notification ID" });
      }

      const notification = await Notification.findOneAndDelete({
        _id: id,
        ...ownNotificationFilter(userId),
      });

      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }

      const unreadCount = await emitUnreadCount(req, userId);
      return res.status(200).json({
        success: true,
        message: "Notification deleted",
        unreadCount,
        data: { deletedId: id, unreadCount },
      });
    } catch (error) {
      console.error("Delete notification error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: error.message,
      });
    }
  },

  clearAll: async (req, res) => {
    try {
      const userId = getUserId(req);
      const result = await Notification.deleteMany(ownNotificationFilter(userId));
      const unreadCount = await emitUnreadCount(req, userId);

      return res.status(200).json({
        success: true,
        message: "All notifications cleared",
        deletedCount: result.deletedCount,
        unreadCount,
        data: { deletedCount: result.deletedCount, unreadCount },
      });
    } catch (error) {
      console.error("Clear all notifications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to clear notifications",
        error: error.message,
      });
    }
  },

  deleteAllRead: async (req, res) => {
    try {
      const userId = getUserId(req);
      const result = await Notification.deleteMany({
        ...ownNotificationFilter(userId),
        isRead: true,
      });
      const unreadCount = await emitUnreadCount(req, userId);

      return res.status(200).json({
        success: true,
        message: "Read notifications cleared",
        deletedCount: result.deletedCount,
        unreadCount,
        data: { deletedCount: result.deletedCount, unreadCount },
      });
    } catch (error) {
      console.error("Delete read notifications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to clear read notifications",
        error: error.message,
      });
    }
  },

  createSystemAlert: async (req, res) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admins can send system alerts",
        });
      }

      const { title, message, roles = [], userIds = [], link = "" } = req.body;
      const cleanTitle = sanitizeText(title, 120);
      const cleanMessage = sanitizeText(message, 500);

      if (!cleanTitle || !cleanMessage) {
        return res.status(400).json({
          success: false,
          message: "Title and message are required",
        });
      }

      const query = {};
      if (Array.isArray(userIds) && userIds.length > 0) {
        query._id = { $in: userIds };
      } else if (Array.isArray(roles) && roles.length > 0) {
        query.role = { $in: roles.filter((role) => ["candidate", "recruiter", "admin"].includes(role)) };
      }

      const recipients = await User.find(query).select("_id");
      const notifications = await Notification.insertMany(
        recipients.map((user) => ({
          recipient: user._id,
          recipientId: user._id,
          sender: req.user._id,
          senderId: req.user._id,
          type: "system_alert",
          title: cleanTitle,
          message: cleanMessage,
          relatedEntityType: "System",
          relatedModel: "System",
          link: sanitizeText(link, 300),
        }))
      );

      const io = req.app?.get("io");
      if (io) {
        await Promise.all(
          recipients.map(async (user, index) => {
            const count = await getUnreadCountForUser(user._id);
            const notification = normalizeNotification(notifications[index]);
            io.to(`user:${user._id}`).to(`user_${user._id}`).emit("notification:new", notification);
            io.to(`user:${user._id}`).to(`user_${user._id}`).emit("newNotification", notification);
            io.to(`user:${user._id}`).to(`user_${user._id}`).emit("notification:unreadCount", count);
          })
        );
      }

      return res.status(201).json({
        success: true,
        message: "System alert sent",
        data: { count: notifications.length },
      });
    } catch (error) {
      console.error("Create system alert error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send system alert",
        error: error.message,
      });
    }
  },
};

const createNotificationHelper = async ({
  recipient,
  recipientId,
  sender,
  senderId,
  type,
  title,
  message,
  relatedEntityId,
  relatedId,
  relatedEntityType,
  relatedModel,
  link,
}) => {
  const recipientValue = recipient || recipientId;
  if (!recipientValue) throw new Error("Notification recipient is required");

  return Notification.create({
    recipient: recipientValue,
    recipientId: recipientValue,
    sender: sender || senderId || null,
    senderId: senderId || sender || null,
    type,
    title: sanitizeText(title, 120),
    message: sanitizeText(message, 500),
    relatedEntityId: relatedEntityId || relatedId || null,
    relatedId: relatedId || relatedEntityId || null,
    relatedEntityType: relatedEntityType || relatedModel || null,
    relatedModel: relatedModel || relatedEntityType || null,
    link: sanitizeText(link || "", 300),
  });
};

module.exports = {
  ...notificationController,
  createNotificationHelper,
  getUnreadCountForUser,
  normalizeNotification,
};
