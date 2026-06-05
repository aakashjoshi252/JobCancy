const express = require("express");
const dashboardRoutes = express.Router();

const {
  recruiterDashboard,
  candidateDashboard,
  adminDashboard,
  getApplicationsCount,
  getCandidatesCount,
  getCompaniesCount,
  getRecruitersCount,
  getJobsCount,
} = require("../controllers/dashboard.controller");

const {
  protect,
  isRecruiter,
  isCandidate,
  isAdmin,
} = require("../middlewares/auth.middleware");

// Role-based dashboard endpoints
dashboardRoutes.get("/recruiter", protect, isRecruiter, recruiterDashboard);
dashboardRoutes.get("/candidate", protect, isCandidate, candidateDashboard);
dashboardRoutes.get("/admin", protect, isAdmin, adminDashboard);

// Global stats endpoints
dashboardRoutes.get("/jobs/count", getJobsCount);
dashboardRoutes.get("/applications/count", getApplicationsCount);
dashboardRoutes.get("/candidates/count", getCandidatesCount);
dashboardRoutes.get("/recruiters/count", getRecruitersCount);
dashboardRoutes.get("/companies/count", getCompaniesCount);

module.exports = dashboardRoutes;
