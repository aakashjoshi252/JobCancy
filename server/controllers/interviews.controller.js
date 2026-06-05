const Interview = require("../models/interview.model");
const Job = require("../models/jobs.model");
const Application = require("../models/application.model");
const { notifyInterviewScheduled } = require("../utils/notificationHelper");

const canManageApplication = (req, application) =>
  req.user?.role === "admin" ||
  (req.user?.role === "recruiter" &&
    application.recruiterId?.toString() === req.user._id.toString());

const populateInterview = (query) =>
  query
    .populate("applicationId", "candidateId jobId status")
    .populate("jobId", "title companyName")
    .populate("candidateId", "username email profilePicture profileImage")
    .populate("recruiterId", "username email profilePicture profileImage")
    .populate("companyId", "companyName");

// Get upcoming interviews for recruiter
exports.getUpcomingInterviews = async (req, res) => {
  try {
    const recruiterId = req.params.recruiterId;
    if (req.user.role !== "admin" && recruiterId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    // Get all jobs by this recruiter
    const jobs = await Job.find({ recruiterId }).select('_id');
    const jobIds = jobs.map(job => job._id);
    
    // Get applications for these jobs
    const applications = await Application.find({
      jobId: { $in: jobIds },
      status: "Interviewed"
    }).select('_id');
    
    const applicationIds = applications.map(app => app._id);
    
    // Get upcoming interviews
    const interviews = await Interview.find({
      applicationId: { $in: applicationIds },
      scheduledAt: { $gte: new Date() }
    })
    .populate('applicationId', 'candidateId jobId')
    .populate({
      path: 'applicationId',
      populate: [
        { path: 'candidateId', select: 'username email profilePicture profileImage' },
        { path: 'jobId', select: 'title companyName' }
      ]
    })
    .sort({ scheduledAt: 1 });
    
    // Transform data for frontend
    const formattedInterviews = interviews.map(interview => ({
      _id: interview._id,
      candidate: interview.applicationId?.candidateId,
      job: interview.applicationId?.jobId,
      scheduledAt: interview.scheduledAt,
      type: interview.type || "Virtual",
      status: interview.status,
      meetingLink: interview.meetingLink
    }));
    
    res.status(200).json({
      success: true,
      data: formattedInterviews
    });
  } catch (error) {
    console.error("Error fetching upcoming interviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews"
    });
  }
};

// Get all interviews for recruiter
exports.getRecruiterInterviews = async (req, res) => {
  try {
    const recruiterId = req.params.recruiterId;
    if (req.user.role !== "admin" && recruiterId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    
    const jobs = await Job.find({ recruiterId }).select('_id');
    const jobIds = jobs.map(job => job._id);
    
    const applications = await Application.find({
      jobId: { $in: jobIds }
    }).select('_id');
    
    const applicationIds = applications.map(app => app._id);
    
    const interviews = await Interview.find({
      applicationId: { $in: applicationIds }
    })
    .populate({
      path: 'applicationId',
      populate: [
        { path: 'candidateId', select: 'username email profilePicture profileImage' },
        { path: 'jobId', select: 'title' }
      ]
    })
    .sort({ scheduledAt: -1 });
    
    res.status(200).json({
      success: true,
      data: interviews
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews"
    });
  }
};

exports.getInterviewById = async (req, res) => {
  try {
    const interview = await populateInterview(Interview.findById(req.params.id));

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const userId = req.user._id.toString();
    const authorized =
      req.user.role === "admin" ||
      interview.recruiterId?._id?.toString() === userId ||
      interview.candidateId?._id?.toString() === userId;

    if (!authorized) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({ success: true, data: interview });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch interview" });
  }
};

exports.createInterview = async (req, res) => {
  try {
    const {
      applicationId,
      type = "Virtual",
      scheduledAt,
      duration = 60,
      location = "",
      meetingLink = "",
      notes = "",
      status = "Scheduled",
    } = req.body;

    if (!applicationId || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Application and scheduled date are required",
      });
    }

    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (!canManageApplication(req, application)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const interview = await Interview.create({
      applicationId: application._id,
      jobId: application.jobId?._id || application.jobId,
      candidateId: application.candidateId,
      recruiterId: application.recruiterId,
      companyId: application.companyId,
      type,
      scheduledAt,
      duration,
      location,
      meetingLink,
      notes,
      status,
    });

    application.status = "Interviewed";
    await application.save();

    await notifyInterviewScheduled(application, interview, application.jobId, req.user._id);

    const populated = await populateInterview(Interview.findById(interview._id));
    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to schedule interview",
    });
  }
};

exports.updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const application = await Application.findById(interview.applicationId);
    if (!application || !canManageApplication(req, application)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const allowedFields = [
      "type",
      "scheduledAt",
      "duration",
      "location",
      "meetingLink",
      "notes",
      "status",
      "feedback",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) interview[field] = req.body[field];
    });

    await interview.save();
    const populated = await populateInterview(Interview.findById(interview._id));
    return res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update interview",
    });
  }
};

exports.updateInterviewStatus = async (req, res) => {
  req.body = { status: req.body.status };
  return exports.updateInterview(req, res);
};

exports.deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const application = await Application.findById(interview.applicationId);
    if (!application || !canManageApplication(req, application)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await interview.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
      data: { deletedId: req.params.id },
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return res.status(500).json({ success: false, message: "Failed to delete interview" });
  }
};
