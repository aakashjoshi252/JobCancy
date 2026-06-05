const Job = require("../models/jobs.model");
const Application = require("../models/application.model");
const User = require("../models/user.model");
const Company = require("../models/company.model");
const mongoose = require("mongoose");
const {
  buildPublicJobsQuery,
  isJobExpired,
  normalizeJobStatus,
} = require("../utils/jobVisibility");

// Recruiter Dashboard
exports.recruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.user._id;

    // Find all jobs by this recruiter
    const recruiterJobs = await Job.find({ 
      recruiterId,
      deletedAt: null 
    }).select("_id status createdAt");

    const jobIds = recruiterJobs.map(job => job._id);
    const totalJobs = recruiterJobs.length;
    
    // Count active jobs (jobs that are not closed/deleted)
    const activeJobs = recruiterJobs.filter(
      (job) => normalizeJobStatus(job.status) === "active" && !isJobExpired(job)
    ).length;

    // Get all applications for these jobs
    const applications = await Application.find({
      jobId: { $in: jobIds }
    });

    const totalApplications = applications.length;
    
    // Get current date and date 7 days ago for new applications
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Count applications by status
    const newApplications = applications.filter(app => 
      app.status === "Pending" && new Date(app.createdAt) >= sevenDaysAgo
    ).length;
    
    const reviewing = applications.filter(app => app.status === "Reviewing").length;
    const shortlisted = applications.filter(app => app.status === "Shortlisted").length;
    const interviewed = applications.filter(app => app.status === "Interviewed").length;
    const accepted = applications.filter(app => 
      app.status === "Selected" || app.status === "Accepted"
    ).length;
    const rejected = applications.filter(app => app.status === "Rejected").length;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalJobs,
          totalApplications,
          newApplications,
          reviewing,
          shortlisted,
          interviewed,
          accepted,
          rejected,
          activeJobs
        }
      },
    });
  } catch (error) {
    console.error("Recruiter dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

// Candidate Dashboard
exports.candidateDashboard = async (req, res) => {
  try {
    const candidateId = req.user._id;
    
    // Get all applications by candidate
    const applications = await Application.find({
      candidateId,
    }).populate('jobId', 'title companyName');
    
    const totalApplications = applications.length;
    
    // Count applications by status
    const pending = applications.filter(app => 
      app.status === "Pending" || app.status === "Reviewing"
    ).length;
    
    const shortlisted = applications.filter(app => 
      app.status === "Shortlisted"
    ).length;
    
    const selected = applications.filter(app => 
      app.status === "Selected" || app.status === "Accepted"
    ).length;
    
    const rejected = applications.filter(app => 
      app.status === "Rejected"
    ).length;
    
    const interviewed = applications.filter(app => 
      app.status === "Interviewed"
    ).length;
    
    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        pending,
        shortlisted,
        selected,
        rejected,
        interviewed
      },
    });
  } catch (error) {
    console.error("Candidate dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

// Admin Dashboard
exports.adminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecruiters = await User.countDocuments({ role: "recruiter" });
    const totalCandidates = await User.countDocuments({ role: "candidate" });
    const totalJobs = await Job.countDocuments({ deletedAt: null });
    const totalApplications = await Application.countDocuments();
    const totalCompanies = await Company.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRecruiters,
        totalCandidates,
        totalJobs,
        totalApplications,
        totalCompanies,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

// Get jobs count
exports.getJobsCount = async (req, res) => {
  try {
    const jobsCount = await Job.countDocuments(buildPublicJobsQuery());
    res.status(200).json({
      success: true,
      data: { jobsCount },
    });
  } catch (error) {
    console.error("Get jobs count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get jobs count",
    });
  }
};

// Get applications count
exports.getApplicationsCount = async (req, res) => {
  try {
    const applicationsCount = await Application.countDocuments();
    res.status(200).json({
      success: true,
      data: { applicationsCount },
    });
  } catch (error) {
    console.error("Get applications count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get applications count",
    });
  }
};

// Get recruiters count
exports.getRecruitersCount = async (req, res) => {
  try {
    const recruitersCount = await User.countDocuments({ role: "recruiter" });
    res.status(200).json({
      success: true,
      data: { recruitersCount },
    });
  } catch (error) {
    console.error("Get recruiters count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recruiters count",
    });
  }
};

// Get candidates count
exports.getCandidatesCount = async (req, res) => {
  try {
    const candidatesCount = await User.countDocuments({ role: "candidate" });
    res.status(200).json({
      success: true,
      data: { candidatesCount },
    });
  } catch (error) {
    console.error("Get candidates count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get candidates count",
    });
  }
};

// Get companies count
exports.getCompaniesCount = async (req, res) => {
  try {
    const companiesCount = await Company.countDocuments();
    res.status(200).json({
      success: true,
      data: { companiesCount },
    });
  } catch (error) {
    console.error("Get companies count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get companies count",
    });
  }
};
