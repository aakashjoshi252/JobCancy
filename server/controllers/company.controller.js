const Company = require("../models/company.model");
const Users = require("../models/user.model");
const Job = require("../models/jobs.model");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const logger = require('../utils/logger');
const { buildPublicJobsQuery } = require("../utils/jobVisibility");

const buildCompanyActiveJobsQuery = (companyId) => ({
  $and: [
    { companyId },
    ...(buildPublicJobsQuery().$and || []),
  ],
});

const companyController = {
  // Create company
  createCompany: async (req, res) => {
    try {
      logger.info("Creating company:", req.body.companyName);

      const {
        companyName, industry, companyType, size, establishedYear,
        website, location, description, contactEmail, contactNumber, recruiterId
      } = req.body;

      // Parse JSON arrays safely
      const parseJsonSafe = (str) => {
        try { return str ? JSON.parse(str) : []; } catch { return []; }
      };

      const specializations = parseJsonSafe(req.body.specializations);
      const certifications = parseJsonSafe(req.body.certifications);
      const workshopFacilities = parseJsonSafe(req.body.workshopFacilities);
      const branches = parseJsonSafe(req.body.branches);
      const socialMedia = parseJsonSafe(req.body.socialMedia);

      // Validate required fields
      const requiredFields = [
        'companyName', 'industry', 'companyType', 'size', 
        'establishedYear', 'location', 'description', 
        'contactEmail', 'contactNumber', 'recruiterId'
      ];
      
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          missing: missingFields
        });
      }

      // Check if recruiter exists and has correct role
      const recruiter = await Users.findById(recruiterId);
      if (!recruiter) {
        return res.status(404).json({ 
          success: false,
          message: "Recruiter not found" 
        });
      }
      
      if (recruiter.role !== "recruiter") {
        return res.status(403).json({ 
          success: false,
          message: "User is not a recruiter" 
        });
      }

      // Check if recruiter already has a company
      const existingCompanyByRecruiter = await Company.findOne({ recruiterId });
      if (existingCompanyByRecruiter) {
        return res.status(409).json({
          success: false,
          message: "Recruiter already has a company",
          data: existingCompanyByRecruiter
        });
      }

      // Check for duplicate email or phone
      const existingByEmail = await Company.findOne({ contactEmail });
      const existingByPhone = await Company.findOne({ contactNumber });
      
      if (existingByEmail || existingByPhone) {
        return res.status(409).json({
          success: false,
          message: "Company with this email or phone already exists",
          existingEmail: !!existingByEmail,
          existingPhone: !!existingByPhone
        });
      }

      // **CLOUDINARY UPLOAD** - Handle logo buffer
      let uploadLogo = null;
      let cloudinaryPublicId = null;

      if (req.file?.buffer) {
        try {
          const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'jobs_portal/companies',
            public_id: `logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ],
          });
          uploadLogo = result.secure_url;
          cloudinaryPublicId = result.public_id;
          logger.info(`Logo uploaded: ${result.public_id}`);
        } catch (error) {
          logger.error('Cloudinary upload failed:', error.message);
          return res.status(500).json({
            success: false,
            message: 'Company created but logo upload failed',
            error: error.message
          });
        }
      }

      // Create company
      const newCompany = await Company.create({
        uploadLogo,
        cloudinaryPublicId,
        companyName, 
        industry, 
        companyType, 
        size, 
        establishedYear,
        website, 
        location, 
        description, 
        contactEmail, 
        contactNumber,
        specializations, 
        certifications, 
        workshopFacilities, 
        branches, 
        socialMedia,
        recruiterId
      });

      res.status(201).json({
        success: true,
        message: "Company created successfully! 💎",
        data: newCompany
      });

    } catch (error) {
      logger.error("Create company error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error", 
        error: error.message 
      });
    }
  },

  // Update company by ID
  updateCompanyById: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if company exists
      const existingCompany = await Company.findById(id);
      if (!existingCompany) {
        return res.status(404).json({
          success: false,
          message: "Company not found"
        });
      }

      // Check authorization (only the owner or admin can update)
      if (req.user.role !== "admin" && existingCompany.recruiterId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this company"
        });
      }

      // Parse JSON fields
      const parseJsonSafe = (str) => {
        try {
          return str ? JSON.parse(str) : [];
        } catch {
          return [];
        }
      };

      const updateData = {
        ...req.body,
        specializations: parseJsonSafe(req.body.specializations),
        certifications: parseJsonSafe(req.body.certifications),
        workshopFacilities: parseJsonSafe(req.body.workshopFacilities),
        branches: parseJsonSafe(req.body.branches),
        socialMedia: parseJsonSafe(req.body.socialMedia),
      };

      // Remove fields that shouldn't be updated
      delete updateData._id;
      delete updateData.recruiterId;
      delete updateData.createdAt;
      delete updateData.__v;

      // Check for duplicate email/phone (excluding current company)
      if (req.body.contactEmail && req.body.contactEmail !== existingCompany.contactEmail) {
        const emailExists = await Company.findOne({ 
          contactEmail: req.body.contactEmail,
          _id: { $ne: id }
        });
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: "Another company already uses this email"
          });
        }
      }

      if (req.body.contactNumber && req.body.contactNumber !== existingCompany.contactNumber) {
        const phoneExists = await Company.findOne({ 
          contactNumber: req.body.contactNumber,
          _id: { $ne: id }
        });
        if (phoneExists) {
          return res.status(409).json({
            success: false,
            message: "Another company already uses this phone number"
          });
        }
      }

      // **CLOUDINARY UPDATE** - Delete old + upload new
      if (req.file?.buffer) {
        // Delete old logo if exists
        if (existingCompany.cloudinaryPublicId) {
          try {
            await deleteFromCloudinary(existingCompany.cloudinaryPublicId);
            logger.info(`Deleted old logo: ${existingCompany.cloudinaryPublicId}`);
          } catch (error) {
            logger.error('Failed to delete old logo:', error.message);
          }
        }

        // Upload new logo
        try {
          const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'jobs_portal/companies',
            public_id: `logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ],
          });
          updateData.uploadLogo = result.secure_url;
          updateData.cloudinaryPublicId = result.public_id;
          logger.info(`New logo uploaded: ${result.public_id}`);
        } catch (error) {
          logger.error('Cloudinary upload failed:', error.message);
          return res.status(500).json({
            success: false,
            message: 'Logo upload failed',
            error: error.message
          });
        }
      }

      const updated = await Company.findByIdAndUpdate(
        id, 
        updateData,
        { new: true, runValidators: true }
      );

      res.json({ 
        success: true,
        message: "Company updated successfully!", 
        data: updated 
      });
    } catch (error) {
      logger.error("Update error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error", 
        error: error.message 
      });
    }
  },

  // Get all companies
  getAllCompanies: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, industry, sort = 'createdAt' } = req.query;
      
      let query = {};
      
      // Search functionality
      if (search) {
        query.$or = [
          { companyName: { $regex: search, $options: 'i' } },
          { industry: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Filter by industry
      if (industry) {
        query.industry = industry;
      }
      
      // Get total count
      const total = await Company.countDocuments(query);
      
      // Get companies with pagination
      const companies = await Company.find(query)
        .populate('recruiterId', 'username email profilePicture profileImage')
        .sort({ [sort]: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      res.json({
        success: true,
        data: companies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error("Get all companies error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error",
        error: error.message 
      });
    }
  },

  // Get company by ID
  getCompanyById: async (req, res) => {
    try {
      const { id } = req.params;
      const company = await Company.findById(id)
        .populate('recruiterId', 'username email profilePicture profileImage');

      if (!company) {
        return res.status(404).json({ 
          success: false,
          message: "Company not found" 
        });
      }

      // Get job count for this company
      const jobCount = await Job.countDocuments(buildCompanyActiveJobsQuery(id));

      res.json({
        success: true,
        data: {
          ...company.toObject(),
          stats: {
            jobCount
          }
        }
      });
    } catch (error) {
      logger.error("Get company by ID error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error",
        error: error.message 
      });
    }
  },

  // Get company by recruiter ID
  getCompanyByRecruiterId: async (req, res) => {
    try {
      const { recruiterId } = req.params;
      
      // Check authorization
      if (req.user.role !== "admin" && req.user._id.toString() !== recruiterId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this company"
        });
      }
      
      const company = await Company.findOne({ recruiterId });

      if (!company) {
        return res.status(404).json({ 
          success: false,
          message: "Company not found" 
        });
      }

      res.json({ 
        success: true,
        data: company 
      });
    } catch (error) {
      logger.error("Get company by recruiter ID error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error",
        error: error.message 
      });
    }
  },

  // Delete company by ID
  deleteCompanyById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found"
        });
      }
      
      // Check authorization
      if (req.user.role !== "admin" && company.recruiterId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this company"
        });
      }
      
      // Check if company has active jobs
      const activeJobs = await Job.countDocuments(buildCompanyActiveJobsQuery(id));
      
      if (activeJobs > 0 && req.user.role !== "admin") {
        return res.status(400).json({
          success: false,
          message: `Cannot delete company with ${activeJobs} active jobs. Please close or delete jobs first.`
        });
      }
      
      // Delete logo from Cloudinary
      if (company.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(company.cloudinaryPublicId);
          logger.info(`Deleted logo: ${company.cloudinaryPublicId}`);
        } catch (error) {
          logger.error('Failed to delete logo from Cloudinary:', error.message);
        }
      }
      
      // Soft delete or hard delete? Using hard delete for now
      await Company.findByIdAndDelete(id);
      
      res.json({ 
        success: true,
        message: "Company deleted successfully" 
      });
    } catch (error) {
      logger.error("Delete company error:", error);
      res.status(500).json({ 
        success: false,
        message: "Server error",
        error: error.message 
      });
    }
  },

  // Get company stats
  getCompanyStats: async (req, res) => {
    try {
      const { id } = req.params;
      
      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found"
        });
      }
      
      // Get job statistics
      const [jobs, activeJobs, totalApplications] = await Promise.all([
        Job.find({ companyId: id }),
        Job.countDocuments(buildCompanyActiveJobsQuery(id)),
        Job.aggregate([
          { $match: { companyId: company._id } },
          {
            $lookup: {
              from: 'applications',
              localField: '_id',
              foreignField: 'jobId',
              as: 'applications',
            },
          },
          { $project: { applicationsCount: { $size: '$applications' } } },
          { $group: { _id: null, total: { $sum: '$applicationsCount' } } },
        ]).then((result) => result[0]?.total || 0),
      ]);
      
      // Get recent jobs
      const recentJobs = await Job.find({ companyId: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status createdAt');
      
      res.json({
        success: true,
        data: {
          totalJobs: jobs.length,
          activeJobs,
          totalApplications,
          recentJobs,
          companyDetails: {
            name: company.companyName,
            industry: company.industry,
            establishedYear: company.establishedYear,
            location: company.location
          }
        }
      });
    } catch (error) {
      logger.error("Get company stats error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  },

  // Get top companies by job count
  getTopCompanies: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      const topCompanies = await Company.aggregate([
        {
          $lookup: {
            from: 'jobs',
            localField: '_id',
            foreignField: 'companyId',
            as: 'jobs'
          }
        },
        {
          $addFields: {
            jobCount: { $size: '$jobs' },
            activeJobs: {
              $size: {
                $filter: {
                  input: '$jobs',
                  as: 'job',
                  cond: {
                    $and: [
                      { $in: ['$$job.status', ['Open', 'active', null]] },
                      { $ne: ['$$job.approvalStatus', 'Rejected'] },
                      { $ne: ['$$job.isExpired', true] },
                    ],
                  }
                }
              }
            }
          }
        },
        {
          $match: {
            jobCount: { $gt: 0 }
          }
        },
        {
          $sort: { jobCount: -1 }
        },
        {
          $limit: parseInt(limit)
        },
        {
          $project: {
            companyName: 1,
            uploadLogo: 1,
            industry: 1,
            location: 1,
            description: 1,
            jobCount: 1,
            activeJobs: 1
          }
        }
      ]);
      
      res.json({
        success: true,
        data: topCompanies
      });
    } catch (error) {
      logger.error("Get top companies error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message
      });
    }
  }
};

module.exports = companyController;
