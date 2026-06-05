const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


//  Protect routes - verifies JWT token

exports.protect = async (req, res, next) => {
  let token;

  // Read token from cookie or the Authorization header.
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: "AUTH_TOKEN_MISSING",
      message: "Unauthorized: No token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    if (user.accountStatus === "Blocked") {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_BLOCKED",
        message: "Account blocked by an administrator",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: "AUTH_TOKEN_INVALID",
      message: "Invalid token",
    });
  }
};

exports.optionalProtect = async (req, _res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (user && user.accountStatus !== "Blocked") {
      req.user = user;
    }
  } catch (_error) {
    // Public job routes should stay public even when a stale token is present.
  }

  return next();
};


//  Recruiter-only access
exports.isRecruiter = (req, res, next) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({
      success: false,
      code: "RECRUITER_ONLY",
      message: "Access denied: Recruiter only",
    });
  }
  next();
};

//  Candidate-only access

exports.isCandidate = (req, res, next) => {
  if (req.user.role !== "candidate") {
    return res.status(403).json({
      success: false,
      code: "CANDIDATE_ONLY",
      message: "Access denied: Candidate only",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      code: "ADMIN_ONLY",
      message: "Access denied: Admin only",
    });
  }
  next();
};
