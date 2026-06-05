const express = require("express");
const interviewRoutes = express.Router();
const {
  getUpcomingInterviews,
  getRecruiterInterviews,
  // ... other interview controllers
} = require("../controllers/interviews.controller");
const { protect, isRecruiter } = require("../middlewares/auth.middleware");

interviewRoutes.get("/recruiter/:recruiterId/upcoming", protect, isRecruiter, getUpcomingInterviews);
interviewRoutes.get("/recruiter/:recruiterId", protect, isRecruiter, getRecruiterInterviews);

module.exports = interviewRoutes;