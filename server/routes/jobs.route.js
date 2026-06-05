const express = require("express");
const jobsRoute = express.Router();
const jobsController = require("../controllers/jobs.controller.js");
const candidateController = require("../controllers/candidate.controller.js");
const { protect, optionalProtect, isCandidate, isRecruiter } = require("../middlewares/auth.middleware.js");
const {
  checkJobPostLimit,
  recordJobPostUsage,
  requireActiveSubscription,
} = require("../middlewares/subscription.middleware.js");

const protectJobCreation = [
  protect,
  isRecruiter,
  requireActiveSubscription,
  checkJobPostLimit,
  recordJobPostUsage,
];

// Public routes (no auth required)
jobsRoute.get("/featured", optionalProtect, jobsController.fetchFeaturedJobs); // Get featured jobs
jobsRoute.get("/categories", jobsController.fetchJobCategories); // Get job categories
jobsRoute.get("/candidate/recommended", protect, isCandidate, jobsController.fetchCandidateJobs);
jobsRoute.get("/recommended", protect, isCandidate, jobsController.fetchCandidateJobs);
jobsRoute.get("/saved-jobs", protect, isCandidate, candidateController.getSavedJobs);
jobsRoute.get("/", optionalProtect, jobsController.fetchJobs); // Fetch all jobs
jobsRoute.get("/latest", optionalProtect, jobsController.fetchLatestJobs);
jobsRoute.get("/company/:companyId", optionalProtect, jobsController.fetchJobsByCompany);
jobsRoute.get("/recruiter/:recruiterId", protect, jobsController.fetchJobsByRecruiter);
jobsRoute.post("/saved-jobs", protect, isCandidate, candidateController.saveJob);
jobsRoute.put("/saved-jobs/:id", protect, isCandidate, candidateController.updateSavedJob);
jobsRoute.delete("/saved-jobs/:id", protect, isCandidate, candidateController.removeSavedJob);
jobsRoute.get("/:id", optionalProtect, jobsController.fetchJobById); // Must be last to avoid conflicts

// Protected routes (auth required)
jobsRoute.post("/", protectJobCreation, jobsController.createJob);
jobsRoute.post("/create", protectJobCreation, jobsController.createJob);
jobsRoute.patch("/:id", protect, isRecruiter, jobsController.updateJobId);
jobsRoute.put("/:id", protect, isRecruiter, jobsController.updateJobId);
jobsRoute.delete("/:id", protect, isRecruiter, jobsController.deleteJobId);

module.exports = jobsRoute; 
