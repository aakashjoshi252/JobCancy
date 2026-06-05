// routes/companyRoute.js
const express = require("express");
const companyRoute = express.Router();
const { protect, isRecruiter, isAdmin } = require("../middlewares/auth.middleware");
const companyController = require("../controllers/company.controller");
const { uploadCompanyLogo } = require("../config/cloudinary");

// ==================== PUBLIC ROUTES ====================
// Get all companies (with pagination and search)
companyRoute.get("/", companyController.getAllCompanies);

// Get top companies by job count (for homepage)
companyRoute.get("/top", companyController.getTopCompanies);

// Get company by ID
companyRoute.get("/:id", companyController.getCompanyById);

// ==================== PROTECTED ROUTES ====================
// Create company (recruiter only)
companyRoute.post(
  "/",
  protect,
  isRecruiter,
  uploadCompanyLogo.single("uploadLogo"),
  companyController.createCompany
);

companyRoute.post(
  "/register",
  protect,
  isRecruiter,
  uploadCompanyLogo.single("uploadLogo"),
  companyController.createCompany
);

// Get company by recruiter ID (recruiter only - own company)
companyRoute.get(
  "/recruiter/:recruiterId",
  protect,
  isRecruiter,
  companyController.getCompanyByRecruiterId
);

// Get company stats (recruiter or admin)
companyRoute.get(
  "/:id/stats",
  protect,
  companyController.getCompanyStats
);

// Update company (recruiter only - own company)
companyRoute.patch(
  "/:id",
  protect,
  isRecruiter,
  uploadCompanyLogo.single("uploadLogo"),
  companyController.updateCompanyById
);

companyRoute.put(
  "/update/:id",
  protect,
  isRecruiter,
  uploadCompanyLogo.single("uploadLogo"),
  companyController.updateCompanyById
);

// Delete company (recruiter only - own company, or admin)
companyRoute.delete(
  "/:id",
  protect,
  isRecruiter,
  companyController.deleteCompanyById
);

companyRoute.delete(
  "/delete/:id",
  protect,
  isRecruiter,
  companyController.deleteCompanyById
);

// ==================== ADMIN ROUTES ====================
// // Get all companies with full details (admin only)
// companyRoute.get(
//   "/admin/all",
//   protect,
//   isAdmin,
//   async (req, res) => {
//     try {
//       const { page = 1, limit = 50, status, search } = req.query;
      
//       let query = {};
//       if (search) {
//         query.$or = [
//           { companyName: { $regex: search, $options: 'i' } },
//           { industry: { $regex: search, $options: 'i' } }
//         ];
//       }
      
//       const companies = await Company.find(query)
//         .populate('recruiterId', 'username email')
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit));
      
//       const total = await Company.countDocuments(query);
      
//       res.json({
//         success: true,
//         data: companies,
//         pagination: {
//           page: parseInt(page),
//           limit: parseInt(limit),
//           total,
//           pages: Math.ceil(total / limit)
//         }
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
// );

// // Admin update any company
// companyRoute.put(
//   "/admin/update/:id",
//   protect,
//   isAdmin,
//   uploadCompanyLogo.single("uploadLogo"),
//   companyController.updateCompanyById
// );

// // Admin delete any company
// companyRoute.delete(
//   "/admin/delete/:id",
//   protect,
//   isAdmin,
//   companyController.deleteCompanyById
// );

// // ==================== BULK OPERATIONS ====================
// // Bulk delete companies (admin only)
// companyRoute.delete(
//   "/bulk-delete",
//   protect,
//   isAdmin,
//   async (req, res) => {
//     try {
//       const { companyIds } = req.body;
      
//       if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Company IDs array is required"
//         });
//       }
      
//       // Check if any companies have active jobs
//       const companiesWithJobs = await Job.find({
//         companyId: { $in: companyIds },
//         status: 'active',
//         deletedAt: null
//       }).distinct('companyId');
      
//       if (companiesWithJobs.length > 0) {
//         return res.status(400).json({
//           success: false,
//           message: `Cannot delete ${companiesWithJobs.length} companies with active jobs`,
//           companiesWithJobs
//         });
//       }
      
//       // Delete logos from Cloudinary
//       const companies = await Company.find({ _id: { $in: companyIds } });
//       for (const company of companies) {
//         if (company.cloudinaryPublicId) {
//           try {
//             await deleteFromCloudinary(company.cloudinaryPublicId);
//           } catch (error) {
//             console.error(`Failed to delete logo for company ${company._id}:`, error);
//           }
//         }
//       }
      
//       const result = await Company.deleteMany({ _id: { $in: companyIds } });
      
//       res.json({
//         success: true,
//         message: `${result.deletedCount} companies deleted successfully`,
//         data: result
//       });
//     } catch (error) {
//       console.error("Bulk delete error:", error);
//       res.status(500).json({
//         success: false,
//         message: error.message
//       });
//     }
//   }
// );

// ==================== EXPORT ====================
module.exports = companyRoute;
