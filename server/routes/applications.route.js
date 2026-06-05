const express = require("express");
const applicationsRoute = express.Router();
const applicationController = require("../controllers/applications.controller");
const { protect, isRecruiter, isCandidate } = require("../middlewares/auth.middleware");

const getApplicationsForCurrentRole = (req, res) => {
  if (req.user.role === "candidate") {
    return applicationController.getApplicationsByCandidate(req, res);
  }

  if (req.user.role === "recruiter") {
    return applicationController.getApplicationsByRecruiter(req, res);
  }

  return res.status(403).json({
    success: false,
    code: "FORBIDDEN",
    message: "Only candidates and recruiters can access this endpoint",
  });
};

// ==================== CANDIDATE ROUTES ====================
// Candidate applies for a job
applicationsRoute.post("/", protect, isCandidate, applicationController.applyJob);
applicationsRoute.post("/apply", protect, isCandidate, applicationController.applyJob);

applicationsRoute.get("/", protect, getApplicationsForCurrentRole);
applicationsRoute.get("/my-applications", protect, isCandidate, applicationController.getApplicationsByCandidate);

// Get applications by candidate (for candidate dashboard)
applicationsRoute.get("/candidate", protect, isCandidate, applicationController.getApplicationsByCandidate);

// Get applications by candidate ID (alternative endpoint)
applicationsRoute.get("/candidate/:candidateId", protect, isCandidate, applicationController.getApplicationsByCandidate);
applicationsRoute.get("/applied/:candidateId", protect, isCandidate, applicationController.getApplicationsByCandidate);

// Withdraw application
applicationsRoute.delete("/:applicationId/withdraw", protect, isCandidate, applicationController.withdrawApplication);

// ==================== RECRUITER ROUTES ====================
// Get application statistics for recruiter
applicationsRoute.get("/recruiter/stats", protect, isRecruiter, applicationController.getApplicationStats);

// Get recent applications for recruiter (for dashboard)
applicationsRoute.get("/recruiter/:recruiterId/recent", protect, isRecruiter, applicationController.getRecentApplications);

// Get all applications by recruiter with pagination and filters
applicationsRoute.get("/recruiter/:recruiterId", protect, isRecruiter, applicationController.getApplicationsByRecruiter);

// Get applications by job ID
applicationsRoute.get("/job/:jobId", protect, applicationController.getApplicationsByJob);

// Get candidate data from application
applicationsRoute.get("/candidatedata/:id", protect, isRecruiter, applicationController.getCandidateData);
applicationsRoute.get("/candidate-data/:id", protect, isRecruiter, applicationController.getCandidateData);

// Update application status
applicationsRoute.patch("/:applicationId/status", protect, applicationController.updateApplicationStatus);

// ==================== ADMIN ROUTES ====================
// Get all applications (admin only)
// applicationsRoute.get("/admin/all", protect, isAdmin, async (req, res) => {
//   try {
//     const applications = await Application.find()
//       .populate("candidateId", "username email")
//       .populate("jobId", "title")
//       .populate("recruiterId", "username email")
//       .sort({ createdAt: -1 });
    
//     res.status(200).json({
//       success: true,
//       data: applications
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// });

// Bulk update application status (admin only)
// applicationsRoute.patch("/bulk-status", protect, isAdmin, async (req, res) => {
//   try {
//     const { applicationIds, status } = req.body;
    
//     const result = await Application.updateMany(
//       { _id: { $in: applicationIds } },
//       { status: status }
//     );
    
//     res.status(200).json({
//       success: true,
//       message: `${result.modifiedCount} applications updated`,
//       data: result
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// });

// ==================== SHARED ROUTES ====================
// Get application by ID (both recruiter and candidate can access their own)
applicationsRoute.get("/:applicationId", protect, applicationController.getApplicationById);

// Export the router
module.exports = applicationsRoute;
