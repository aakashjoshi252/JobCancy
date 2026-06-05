const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { protect, isAdmin } = require("../middlewares/auth.middleware.js");

const allowNotificationRoles = (req, res, next) => {
  if (!["candidate", "recruiter", "admin"].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access notifications",
    });
  }
  next();
};

router.use(protect, allowNotificationRoles);

router.get("/", notificationController.getUserNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.post("/system-alert", isAdmin, notificationController.createSystemAlert);
router.patch("/mark-all-read", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/:id/unread", notificationController.markAsUnread);
router.delete("/clear-all", notificationController.clearAll);
router.delete("/clear/read", notificationController.deleteAllRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
