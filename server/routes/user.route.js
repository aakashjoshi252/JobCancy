const express = require("express");
const userRoute = express.Router();
const userController = require("../controllers/user.controller.js");
const { protect, isAdmin } = require("../middlewares/auth.middleware.js");
const { authLimiter } = require("../middlewares/security");
const {
  uploadProfileImage,
  handleMulterError,
} = require("../middlewares/upload.middleware");

// =========================
// AUTH ROUTES
// =========================
userRoute.post("/register", authLimiter, userController.createUser);     // Register + send OTP
userRoute.post("/login", authLimiter, userController.loginUser);         // Login
userRoute.post("/logout", userController.logoutUser);
userRoute.post("/forgot-password", authLimiter, userController.forgotPassword);
userRoute.post("/reset-password", authLimiter, userController.resetPassword);
userRoute.post("/change-password", protect, userController.changePassword);

// =========================
// EMAIL VERIFICATION ROUTES
// =========================
userRoute.post("/verify-email", authLimiter, userController.verifyEmail);   // Verify OTP
userRoute.post("/resend-otp", authLimiter, userController.resendOTP);       // Resend OTP

// =========================
// USER ROUTES
// =========================
userRoute.get("/me", protect, userController.getLoggedInUser);
userRoute.get("/data", protect, isAdmin, userController.getUsers);
userRoute.patch(
  "/profile",
  protect,
  uploadProfileImage.single("profileImage"),
  handleMulterError,
  userController.updateOwnProfile
);
userRoute.patch(
  "/profile-image",
  protect,
  uploadProfileImage.single("profileImage"),
  handleMulterError,
  userController.uploadOwnProfileImage
);
userRoute.delete("/profile-image", protect, userController.deleteOwnProfileImage);
userRoute.put("/:id", protect, userController.updateUsersById);
userRoute.delete("/users/:id", protect, isAdmin, userController.deleteUsersById);

// ========== PROFILE PICTURE ROUTES ==========
// Upload profile picture
userRoute
.post(
  "/profile-picture",
  protect,
  uploadProfileImage.single("profilePicture"),
  handleMulterError,
  userController.uploadProfilePicture
);

// Delete profile picture
userRoute
.delete(
  "/profile-picture",
  protect,
  userController.deleteProfilePicture
);

// Get user profile picture by ID
userRoute
.get("/:id/profile-picture", userController.getProfilePicture);

userRoute.get("/recruiters",userController.getRecruiter)

module.exports = userRoute;
