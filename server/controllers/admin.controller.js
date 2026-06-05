const User = require('../models/user.model');
const Company = require('../models/company.model');
const Job = require('../models/jobs.model');
const Application = require('../models/application.model');
const Blog = require('../models/Blog');
const Report = require('../models/report.model');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const {
  notifyRecruiterApproval,
  notifyJobModeration,
} = require('../utils/notificationHelper');
const { getSubscriptionReport } = require('../services/subscription.service');
const {
  buildActiveStatusQuery,
  buildClosedStatusQuery,
  buildDraftStatusQuery,
  buildExpiredJobsQuery,
  buildPausedStatusQuery,
  isJobExpired,
  normalizeJobStatus,
  sanitizeJobForViewer,
} = require('../utils/jobVisibility');

const clampPeriod = (period) => Math.min(Math.max(parseInt(period, 10) || 30, 1), 365);

const percentageChange = (current, previous) => {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getReportWindow = (period) => {
  const periodDays = clampPeriod(period);
  const currentStart = new Date();
  currentStart.setDate(currentStart.getDate() - periodDays);
  const previousStart = new Date(currentStart);
  previousStart.setDate(previousStart.getDate() - periodDays);

  return { periodDays, currentStart, previousStart };
};

const buildReportOverview = async (period) => {
  const { periodDays, currentStart, previousStart } = getReportWindow(period);

  const [
    totalJobs,
    currentApplications,
    previousApplications,
    currentCandidates,
    previousCandidates,
    currentRecruiters,
    previousRecruiters,
    hiringBreakdown,
    professionBreakdown,
    applicationBreakdown,
    recruiterPerformance,
    monthlyGrowth,
    subscriptionReport,
  ] = await Promise.all([
    Job.countDocuments(),
    Application.countDocuments({ createdAt: { $gte: currentStart } }),
    Application.countDocuments({ createdAt: { $gte: previousStart, $lt: currentStart } }),
    User.countDocuments({ role: 'candidate', createdAt: { $gte: currentStart } }),
    User.countDocuments({ role: 'candidate', createdAt: { $gte: previousStart, $lt: currentStart } }),
    User.countDocuments({ role: 'recruiter', createdAt: { $gte: currentStart } }),
    User.countDocuments({ role: 'recruiter', createdAt: { $gte: previousStart, $lt: currentStart } }),
    Application.aggregate([
      { $match: { createdAt: { $gte: currentStart } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: { createdAt: { $gte: currentStart } } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: '$job' },
      { $group: { _id: '$job.jobProfession', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),
    Application.aggregate([
      { $match: { createdAt: { $gte: currentStart } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Application.aggregate([
      { $match: { createdAt: { $gte: currentStart } } },
      {
        $group: {
          _id: '$recruiterId',
          applications: { $sum: 1 },
          hires: {
            $sum: {
              $cond: [{ $in: ['$status', ['Selected', 'Accepted']] }, 1, 0],
            },
          },
        },
      },
      { $sort: { hires: -1, applications: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'recruiter',
        },
      },
      { $unwind: '$recruiter' },
      {
        $project: {
          recruiterId: '$_id',
          recruiterName: '$recruiter.username',
          recruiterEmail: '$recruiter.email',
          applications: 1,
          hires: 1,
        },
      },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: previousStart } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          users: { $sum: 1 },
          candidates: {
            $sum: { $cond: [{ $eq: ['$role', 'candidate'] }, 1, 0] },
          },
          recruiters: {
            $sum: { $cond: [{ $eq: ['$role', 'recruiter'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    getSubscriptionReport(),
  ]);

  const statusMap = hiringBreakdown.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  const hiredCount = (statusMap.Selected || 0) + (statusMap.Accepted || 0);
  const shortlistedCount = statusMap.Shortlisted || 0;
  const topProfession = professionBreakdown[0]?._id || 'job listings';
  const applicationGrowth = percentageChange(currentApplications, previousApplications);
  const recruiterGrowth = percentageChange(currentRecruiters, previousRecruiters);
  const growthDirection = applicationGrowth >= 0 ? 'increased' : 'decreased';
  const recruiterDirection = recruiterGrowth >= 0 ? 'improved' : 'slowed';

  return {
    periodDays,
    generatedAt: new Date().toISOString(),
    totals: {
      jobs: totalJobs,
      applications: currentApplications,
      candidates: currentCandidates,
      recruiters: currentRecruiters,
      shortlisted: shortlistedCount,
      hired: hiredCount,
      subscriptionRevenue: subscriptionReport.totalRevenue,
      monthlyRecurringRevenue: subscriptionReport.monthlyRecurringRevenue,
      activeSubscriptions: subscriptionReport.activeSubscriptions,
      expiredSubscriptions: subscriptionReport.expiredSubscriptions,
    },
    growth: {
      applications: applicationGrowth,
      candidates: percentageChange(currentCandidates, previousCandidates),
      recruiters: recruiterGrowth,
    },
    charts: {
      applicationConversion: applicationBreakdown,
      topProfessions: professionBreakdown.map((item) => ({
        profession: item._id || 'Unspecified',
        applications: item.count,
      })),
      monthlyGrowth: monthlyGrowth.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        users: item.users,
        candidates: item.candidates,
        recruiters: item.recruiters,
      })),
      planWiseSubscribers: subscriptionReport.planWiseSubscribers,
      recruiterJobPostUsage: subscriptionReport.usageByRecruiter,
    },
    subscriptions: subscriptionReport,
    recruiterPerformance,
    summary: `Applications ${growthDirection} by ${Math.abs(applicationGrowth)}% over the previous ${periodDays} days, recruiter growth ${recruiterDirection}, and ${topProfession} received the most applications. Subscription revenue is INR ${subscriptionReport.totalRevenue.toLocaleString('en-IN')} with ${subscriptionReport.activeSubscriptions} active subscriptions.`,
  };
};

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private/Admin
 */
const getAdminStats = async (req, res) => {
  try {
    const [userStats, companyStats, jobStats, applicationStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
          },
        },
      ]),
      Company.aggregate([
        {
          $group: {
            _id: '$isVerified',
            count: { $sum: 1 },
          },
        },
      ]),
      (async () => {
        const now = new Date();
        const [totalJobs, activeJobs, closedJobs, expiredJobs] = await Promise.all([
          Job.countDocuments(),
          Job.countDocuments({
            $and: [
              buildActiveStatusQuery(),
              { approvalStatus: { $ne: 'Rejected' } },
              { isExpired: { $ne: true } },
              { status: { $nin: ['expired'] } },
              {
                $or: [
                  { expiresAt: { $exists: false } },
                  { expiresAt: null },
                  { expiresAt: { $gt: now } },
                ],
              },
              {
                $or: [
                  { deadline: { $exists: false } },
                  { deadline: null },
                  { deadline: { $gt: now } },
                ],
              },
            ],
          }),
          Job.countDocuments(buildClosedStatusQuery()),
          Job.countDocuments(buildExpiredJobsQuery(now)),
        ]);

        return [{ totalJobs, activeJobs, closedJobs, expiredJobs }];
      })(),
      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format user stats
    const users = {
      total: userStats.reduce((acc, curr) => acc + curr.count, 0),
      candidates: userStats.find((u) => u._id === 'candidate')?.count || 0,
      recruiters: userStats.find((u) => u._id === 'recruiter')?.count || 0,
      admins: userStats.find((u) => u._id === 'admin')?.count || 0,
    };

    // Format company stats
    const companies = {
      total: companyStats.reduce((acc, curr) => acc + curr.count, 0),
      verified: companyStats.find((c) => c._id === true)?.count || 0,
      unverified: companyStats.find((c) => c._id === false)?.count || 0,
    };

    // Format job stats
    const jobs = jobStats[0] || {
      totalJobs: 0,
      activeJobs: 0,
      closedJobs: 0,
    };

    // Format application stats
    const applications = {
      total: applicationStats.reduce((acc, curr) => acc + curr.count, 0),
      pending: applicationStats.find((a) => a._id === 'Pending')?.count || 0,
      shortlisted: applicationStats.find((a) => a._id === 'Shortlisted')?.count || 0,
      accepted: applicationStats.find((a) => a._id === 'Accepted')?.count || 0,
      selected: applicationStats.find((a) => a._id === 'Selected')?.count || 0,
      rejected: applicationStats.find((a) => a._id === 'Rejected')?.count || 0,
    };

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role profilePicture profileImage createdAt');

    const recentCompanies = await Company.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName contactEmail isVerified createdAt');

    res.status(200).json({
      success: true,
      data: {
        users,
        companies,
        jobs,
        applications,
        recentActivity: {
          users: recentUsers,
          companies: recentCompanies,
        },
      },
    });
  } catch (error) {
    logger.error(`Get admin stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all users with pagination and filters
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

/**
 * @desc    Update user role or details
 * @route   PUT /api/v1/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const {
      role,
      username,
      email,
      phone,
      bio,
      location,
      accountStatus,
      recruiterApprovalStatus,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const previousRecruiterApprovalStatus = user.recruiterApprovalStatus;

    // Update fields
    if (role) user.role = role;
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (accountStatus && ['Active', 'Blocked'].includes(accountStatus)) {
      user.accountStatus = accountStatus;
      user.blockedAt = accountStatus === 'Blocked' ? new Date() : null;
    }
    if (
      recruiterApprovalStatus
      && user.role === 'recruiter'
      && ['Pending', 'Approved', 'Rejected'].includes(recruiterApprovalStatus)
    ) {
      user.recruiterApprovalStatus = recruiterApprovalStatus;
    }

    await user.save();

    if (
      user.role === 'recruiter'
      && recruiterApprovalStatus
      && recruiterApprovalStatus !== previousRecruiterApprovalStatus
      && ['Approved', 'Rejected'].includes(recruiterApprovalStatus)
    ) {
      await notifyRecruiterApproval(user, recruiterApprovalStatus, req.user._id);
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all companies with pagination
 * @route   GET /api/v1/admin/companies
 * @access  Private/Admin
 */
const getAllCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isVerified,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const [companies, total] = await Promise.all([
      Company.find(query)
        .populate('recruiterId', 'username email profilePicture profileImage')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Company.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get all companies error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify/Unverify company
 * @route   PATCH /api/v1/admin/companies/:id/verify
 * @access  Private/Admin
 */
const verifyCompany = async (req, res) => {
  try {
    const { isVerified } = req.body;

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    company.isVerified = isVerified;
    company.verifiedAt = isVerified ? new Date() : null;
    await company.save();

    res.status(200).json({
      success: true,
      message: `Company ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: company,
    });
  } catch (error) {
    logger.error(`Verify company error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error verifying company',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete company
 * @route   DELETE /api/v1/admin/companies/:id
 * @access  Private/Admin
 */
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete company error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all jobs with admin filters
 * @route   GET /api/v1/admin/jobs
 * @access  Private/Admin
 */
const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      approvalStatus,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const normalizedStatus = normalizeJobStatus(status);
    const clauses = [];
    const query = {};

    if (status) {
      if (normalizedStatus === 'expired') {
        clauses.push(buildExpiredJobsQuery());
      } else if (normalizedStatus === 'active') {
        clauses.push(buildActiveStatusQuery(), { $nor: [buildExpiredJobsQuery()] });
      } else if (normalizedStatus === 'paused') {
        clauses.push(buildPausedStatusQuery());
      } else if (normalizedStatus === 'closed') {
        clauses.push(buildClosedStatusQuery());
      } else if (normalizedStatus === 'draft') {
        clauses.push(buildDraftStatusQuery());
      } else if (status === 'Pending' || status === 'pending') {
        query.approvalStatus = 'Pending';
      } else if (status === 'Rejected' || status === 'rejected') {
        query.approvalStatus = 'Rejected';
      }
    }

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (search) {
      clauses.push({
        $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { jobLocation: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (clauses.length) query.$and = clauses;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('companyId', 'companyName email contactEmail location logo uploadLogo')
        .populate('recruiterId', 'username email profilePicture profileImage')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Job.countDocuments(query),
    ]);

    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobs.map((job) => job._id) } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const applicantCountMap = new Map(counts.map((item) => [String(item._id), item.count]));

    res.status(200).json({
      success: true,
      data: jobs.map((job) => ({
        ...sanitizeJobForViewer(job, req.user),
        applicantsCount: applicantCountMap.get(String(job._id)) || 0,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get all jobs error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message,
    });
  }
};

/**
 * @desc    Update job moderation state
 * @route   PATCH /api/v1/admin/jobs/:id/moderation
 * @access  Private/Admin
 */
const moderateJob = async (req, res) => {
  try {
    const { status, approvalStatus, moderationNote = '' } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    const previousApprovalStatus = job.approvalStatus;
    if (status) {
      const normalizedStatus = normalizeJobStatus(status);
      if (['active', 'paused', 'closed', 'expired', 'draft'].includes(normalizedStatus)) {
        job.status = normalizedStatus;
        job.isExpired = normalizedStatus === 'expired' || isJobExpired(job);
      }
    }
    if (approvalStatus && ['Pending', 'Approved', 'Rejected'].includes(approvalStatus)) {
      job.approvalStatus = approvalStatus;
      job.reviewedBy = req.user._id;
      job.reviewedAt = new Date();
    }
    if (moderationNote !== undefined) job.moderationNote = moderationNote;

    await job.save();

    if (
      approvalStatus
      && approvalStatus !== previousApprovalStatus
      && ['Approved', 'Rejected'].includes(approvalStatus)
    ) {
      await notifyJobModeration(job, approvalStatus, req.user._id);
    }

    return res.status(200).json({
      success: true,
      message: 'Job moderation updated',
      data: sanitizeJobForViewer(job, req.user),
    });
  } catch (error) {
    logger.error(`Moderate job error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error updating job moderation',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all applications with admin filters
 * @route   GET /api/v1/admin/applications
 * @access  Private/Admin
 */
const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 12, status, search } = req.query;
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const query = {};

    if (status) query.status = status;

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const matchingJobs = await Job.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      query.$or = [
        { candidateId: { $in: matchingUsers.map((user) => user._id) } },
        { recruiterId: { $in: matchingUsers.map((user) => user._id) } },
        { jobId: { $in: matchingJobs.map((job) => job._id) } },
      ];
    }

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('candidateId', 'username email jobProfession profilePicture profileImage')
        .populate('recruiterId', 'username email profilePicture profileImage')
        .populate('jobId', 'title companyName jobProfession status')
        .populate('companyId', 'companyName logo')
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      Application.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    });
  } catch (error) {
    logger.error(`Get admin applications error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message,
    });
  }
};

/**
 * @desc    Get job profession counts for admin taxonomy view
 * @route   GET /api/v1/admin/job-professions
 * @access  Private/Admin
 */
const getJobProfessionStats = async (_req, res) => {
  try {
    const professions = await Job.aggregate([
      { $group: { _id: '$jobProfession', jobs: { $sum: 1 } } },
      { $sort: { jobs: -1, _id: 1 } },
      { $project: { _id: 0, profession: '$_id', jobs: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: professions,
    });
  } catch (error) {
    logger.error(`Get job professions error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching job professions',
      error: error.message,
    });
  }
};

/**
 * @desc    Get report overview and generated summary
 * @route   GET /api/v1/admin/reports/overview
 * @access  Private/Admin
 */
const getReportsOverview = async (req, res) => {
  try {
    const report = await buildReportOverview(req.query.period);
    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error(`Get reports overview error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error generating reports',
      error: error.message,
    });
  }
};

/**
 * @desc    Persist report snapshot
 * @route   POST /api/v1/admin/reports/snapshots
 * @access  Private/Admin
 */
const createReportSnapshot = async (req, res) => {
  try {
    const report = await buildReportOverview(req.body.period);
    const snapshot = await Report.create({
      type: 'platform-overview',
      periodDays: report.periodDays,
      generatedBy: req.user._id,
      summary: report.summary,
      metrics: report,
    });

    return res.status(201).json({
      success: true,
      message: 'Report snapshot saved',
      data: snapshot,
    });
  } catch (error) {
    logger.error(`Create report snapshot error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error saving report snapshot',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete job
 * @route   DELETE /api/v1/admin/jobs/:id
 * @access  Private/Admin
 */
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete job error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message,
    });
  }
};

/**
 * @desc    Get platform analytics
 * @route   GET /api/v1/admin/analytics
 * @access  Private/Admin
 */
const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = clampPeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Application trends
    const applicationTrends = await Application.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const [currentUsers, previousUsers, currentApplications, previousApplications] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } }),
      Application.countDocuments({ createdAt: { $gte: startDate } }),
      Application.countDocuments({ createdAt: { $gte: previousStartDate, $lt: startDate } }),
    ]);

    // Top companies by jobs
    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$companyId',
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      { $unwind: '$companyDetails' },
      {
        $project: {
          name: '$companyDetails.companyName',
          logo: '$companyDetails.uploadLogo',
          count: '$jobCount',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth: {
          currentPeriod: currentUsers,
          previousPeriod: previousUsers,
          series: userGrowth,
        },
        applicationTrends: {
          currentPeriod: currentApplications,
          previousPeriod: previousApplications,
          series: applicationTrends,
        },
        topCompanies,
        period: `${periodDays} days`,
      },
    });
  } catch (error) {
    logger.error(`Get analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllCompanies,
  verifyCompany,
  deleteCompany,
  getAllJobs,
  moderateJob,
  deleteJob,
  getAllApplications,
  getJobProfessionStats,
  getAnalytics,
  getReportsOverview,
  createReportSnapshot,
};
