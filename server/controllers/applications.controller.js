const Application = require("../models/application.model");
const Job = require("../models/jobs.model");
const {
  isJobExpired,
  normalizeJobStatus,
} = require("../utils/jobVisibility");
const {
  notifyApplicationSubmitted,
  notifyApplicationStatusChange,
} = require("../utils/notificationHelper");
// const User = require("../models/user.model");
// const mongoose = require("mongoose");

const applicationController = {
  // Candidate applies for a job
  applyJob: async (req, res) => {
    try {
      const { jobId, resumeId, coverLetter } = req.body;
      const candidateId = req.user._id;

      // Allow only candidates
      if (req.user.role !== "candidate") {
        return res.status(403).json({
          success: false,
          message: "Only candidates can apply for jobs"
        });
      }

      // Validate required fields
      if (!jobId) {
        return res.status(400).json({ 
          success: false,
          message: "Job ID is required" 
        });
      }

      if (!resumeId) {
        return res.status(400).json({ 
          success: false,
          message: "Resume ID is required" 
        });
      }

      // Check job exists
      const job = await Job.findById(jobId).populate("companyId");
      if (!job) {
        return res.status(404).json({ 
          success: false,
          message: "Job not found" 
        });
      }

      if (isJobExpired(job)) {
        return res.status(400).json({
          success: false,
          code: "JOB_EXPIRED",
          message: "This job has expired and no longer accepts applications"
        });
      }

      // Check if job is active and approved for candidates.
      const jobIsOpen = !job.status || normalizeJobStatus(job.status) === "active";
      const jobIsApproved = !job.approvalStatus || job.approvalStatus === "Approved";
      if (!jobIsOpen || !jobIsApproved) {
        return res.status(400).json({
          success: false,
          code: "JOB_NOT_ACCEPTING_APPLICATIONS",
          message: "This job is no longer accepting applications"
        });
      }

      // Prevent recruiter applying to own job
      if (job.recruiterId.toString() === candidateId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Recruiter cannot apply to their own job"
        });
      }

      // Prevent duplicate application
      const existing = await Application.findOne({
        jobId: jobId,
        candidateId: candidateId
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Already applied to this job"
        });
      }

      // Create application
      const application = await Application.create({
        jobId: jobId,
        candidateId: candidateId,
        recruiterId: job.recruiterId,
        companyId: job.companyId,
        resumeId: resumeId,
        coverLetter: coverLetter || "",
        status: "Pending"
      });

      await notifyApplicationSubmitted(application, job, req.user);

      res.status(201).json({
        success: true,
        message: "Job applied successfully",
        data: application
      });

    } catch (error) {
      console.error("Apply Job Error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to submit application",
        error: error.message 
      });
    }
  },

  // Get applications by candidate
  getApplicationsByCandidate: async (req, res) => {
    try {
      const candidateId = req.user._id;

      // Allow only candidates
      if (req.user.role !== "candidate") {
        return res.status(403).json({
          success: false,
          message: "Only candidates can view their applications"
        });
      }

      const applications = await Application.find({
        candidateId: candidateId
      })
        .populate("jobId", "title companyName location salary empType")
        .populate("companyId", "companyName logo")
        .populate("recruiterId", "username email profilePicture profileImage")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Applications fetched successfully",
        data: applications
      });

    } catch (error) {
      console.error("Get Applications Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },

  // Get applications by recruiter (with pagination and filters)
  getApplicationsByRecruiter: async (req, res) => {
    try {
      const recruiterId = req.user._id;
      const { status, jobId, page = 1, limit = 20 } = req.query;

      // Allow only recruiters
      if (req.user.role !== "recruiter") {
        return res.status(403).json({
          success: false,
          message: "Only recruiters can view received applications"
        });
      }

      // Build query
      let query = { recruiterId: recruiterId };
      
      if (status) {
        query.status = status;
      }
      
      if (jobId) {
        query.jobId = jobId;
      }

      // Get total count for pagination
      const total = await Application.countDocuments(query);

      const applications = await Application.find(query)
        .populate("jobId", "title companyName location salary empType status")
        .populate("companyId", "companyName logo")
        .populate("candidateId", "username email phone profilePicture profileImage")
        .populate("resumeId", "fileName fileUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      return res.status(200).json({
        success: true,
        message: "Received applications fetched successfully",
        data: applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error("Get Received Applications Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },

  // Get recent applications for recruiter (for dashboard)
  getRecentApplications: async (req, res) => {
    try {
      const recruiterId = req.params.recruiterId || req.user._id;

      // Check authorization
      if (req.user.role !== "recruiter" && req.user._id.toString() !== recruiterId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view these applications"
        });
      }

      // Get recruiter's jobs
      const jobs = await Job.find({ 
        recruiterId: recruiterId,
        deletedAt: null 
      }).select('_id');
      
      const jobIds = jobs.map(job => job._id);
      
      // Get recent applications
      const applications = await Application.find({
        jobId: { $in: jobIds }
      })
      .populate("candidateId", "username email profilePicture profileImage phone")
      .populate("jobId", "title companyName location salary")
      .populate("companyId", "companyName logo")
      .sort({ createdAt: -1 })
      .limit(10);
      
      // Transform data for frontend
      const formattedApplications = applications.map(app => ({
        _id: app._id,
        candidate: app.candidateId,
        job: app.jobId,
        company: app.companyId,
        status: app.status,
        appliedAt: app.createdAt,
        resumeId: app.resumeId,
        coverLetter: app.coverLetter
      }));
      
      res.status(200).json({
        success: true,
        data: formattedApplications
      });
      
    } catch (error) {
      console.error("Get Recent Applications Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recent applications",
        error: error.message
      });
    }
  },

  // Get application by ID
  getApplicationById: async (req, res) => {
    try {
      const id = req.params.applicationId || req.params.id;

      const application = await Application.findById(id)
        .populate("jobId", "title companyName location salary empType description requirements")
        .populate("companyId", "companyName logo website")
        .populate("candidateId", "username email phone profilePicture profileImage location")
        .populate("recruiterId", "username email profilePicture profileImage")
        .populate("resumeId", "fileName fileUrl uploadedAt");

      if (!application) {
        return res.status(404).json({ 
          success: false,
          message: "Application not found" 
        });
      }

      // Check authorization
      const isCandidate = req.user.role === "candidate" && application.candidateId._id.toString() === req.user._id.toString();
      const isRecruiter = req.user.role === "recruiter" && application.recruiterId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isCandidate && !isRecruiter && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this application"
        });
      }

      res.status(200).json({
        success: true,
        message: "Application fetched successfully",
        data: application
      });

    } catch (error) {
      console.error("Get Application By ID Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },

  // Update application status
  updateApplicationStatus: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;
      const userId = req.user._id;
      const userRole = req.user.role;

      // Allowed statuses (matching frontend expectations)
      const allowedStatuses = [
        "Pending",
        "Reviewing",
        "Shortlisted",
        "Interviewed",
        "Selected",
        "Rejected",
        "Accepted"
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value. Allowed values: " + allowedStatuses.join(", ")
        });
      }

      const application = await Application.findById(applicationId)
        .populate("jobId");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found"
        });
      }

      // Check authorization
      const isRecruiter = userRole === "recruiter" && application.recruiterId.toString() === userId.toString();
      const isAdmin = userRole === "admin";

      if (!isRecruiter && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update application status"
        });
      }

      // Prevent updating after final decision
      const finalStatuses = ["Selected", "Accepted", "Rejected"];
      if (finalStatuses.includes(application.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change status after ${application.status}`
        });
      }

      // Update status
      const oldStatus = application.status;
      application.status = status;
      await application.save();

      if (oldStatus !== status) {
        await notifyApplicationStatusChange(application, status, application.jobId, userId);
      }

      res.status(200).json({
        success: true,
        message: `Application status updated to ${status}`,
        data: application
      });

    } catch (error) {
      console.error("Update Application Status Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },

  // Get candidate data from application
  getCandidateData: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role;

      const application = await Application.findById(id)
        .populate("candidateId", "username email phone profilePicture profileImage location skills experience")
        .populate("resumeId", "fileName fileUrl uploadedAt")
        .populate("jobId", "title companyName location salary");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found"
        });
      }

      // Check authorization
      const isRecruiter = userRole === "recruiter" && application.recruiterId.toString() === userId.toString();
      const isCandidate = userRole === "candidate" && application.candidateId._id.toString() === userId.toString();
      const isAdmin = userRole === "admin";

      if (!isRecruiter && !isCandidate && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access candidate data"
        });
      }

      res.status(200).json({
        success: true,
        message: "Candidate data fetched successfully",
        candidateData: application.candidateId,
        jobData: application.jobId,
        resumeData: application.resumeId,
        application,
        data: {
          candidate: application.candidateId,
          job: application.jobId,
          resume: application.resumeId,
          application: {
            _id: application._id,
            status: application.status,
            coverLetter: application.coverLetter,
            appliedAt: application.createdAt,
            updatedAt: application.updatedAt
          }
        }
      });

    } catch (error) {
      console.error("Get Candidate Data Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },

  // Get applications by job ID
  getApplicationsByJob: async (req, res) => {
    try {
      const { jobId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found"
        });
      }

      // Check authorization
      const isRecruiter = req.user.role === "recruiter" && job.recruiterId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin";

      if (!isRecruiter && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view applications for this job"
        });
      }

      const total = await Application.countDocuments({ jobId });

      const applications = await Application.find({ jobId })
        .populate("candidateId", "username email profilePicture profileImage")
        .populate("resumeId", "fileName fileUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        data: applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error("Get Applications By Job Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },

  // Get application statistics for recruiter
  getApplicationStats: async (req, res) => {
    try {
      const recruiterId = req.user._id;

      if (req.user.role !== "recruiter") {
        return res.status(403).json({
          success: false,
          message: "Only recruiters can view application statistics"
        });
      }

      const jobs = await Job.find({ recruiterId }).select('_id');
      const jobIds = jobs.map(job => job._id);

      const stats = await Application.aggregate([
        {
          $match: {
            jobId: { $in: jobIds }
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      const statsObject = {
        Pending: 0,
        Reviewing: 0,
        Shortlisted: 0,
        Interviewed: 0,
        Selected: 0,
        Rejected: 0,
        Accepted: 0
      };

      stats.forEach(stat => {
        statsObject[stat._id] = stat.count;
      });

      res.status(200).json({
        success: true,
        data: statsObject
      });

    } catch (error) {
      console.error("Get Application Stats Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  },

  // Withdraw application
  withdrawApplication: async (req, res) => {
    try {
      const { applicationId } = req.params;
      const candidateId = req.user._id;

      const application = await Application.findOne({
        _id: applicationId,
        candidateId: candidateId
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found"
        });
      }

      // Can only withdraw pending or reviewing applications
      if (!["Pending", "Reviewing"].includes(application.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot withdraw application with status: ${application.status}`
        });
      }

      await application.deleteOne();

      res.status(200).json({
        success: true,
        message: "Application withdrawn successfully"
      });

    } catch (error) {
      console.error("Withdraw Application Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
};

module.exports = applicationController;
