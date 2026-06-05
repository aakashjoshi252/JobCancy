const express = require('express');
const resumeController = require('../controllers/resume.builder.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');
const resumeBuilderRoutes = express.Router();

// ==================== PUBLIC ROUTES ====================
// (No public routes for resumes - all require authentication)

// ==================== PROTECTED ROUTES ====================
// All routes require authentication
resumeBuilderRoutes.use(protect);

// ==================== RESUME OPERATIONS ====================

// GET current user's resumes (checklist compatibility)
resumeBuilderRoutes.get('/', resumeController.getMyResumes);

// GET current user's resumes (using auth token)
resumeBuilderRoutes.get('/my', resumeController.getMyResumes);

// GET resumes by user ID with /data endpoint (for frontend)
resumeBuilderRoutes.get('/:userId/data', resumeController.getResumesByUserIdData);

// GET resume statistics (admin only)
// resumeBuilderRoutes.get('/stats', isAdmin, resumeController.getResumeStats);

// GET all resumes (admin only)
// resumeBuilderRoutes.get('/admin/all', isAdmin, resumeController.getAllResumes);

// GET resumes by user ID
resumeBuilderRoutes.get('/user/:userId', resumeController.getResumesByUserId);

// GET resumes by user ID with pagination
resumeBuilderRoutes.get('/user/:userId/paginated', resumeController.getResumesByUserIdPaginated);

// GET resume preview (lightweight data)
resumeBuilderRoutes.get('/preview/:resumeId', resumeController.getResumePreview);

// GET a single resume by ID
resumeBuilderRoutes.get('/:resumeId', resumeController.getResumeById);

// GET download resume as PDF
resumeBuilderRoutes.get('/:resumeId/download', resumeController.downloadResume);

// POST create a new resume
resumeBuilderRoutes.post('/generate', resumeController.createResume);
resumeBuilderRoutes.post('/create', resumeController.createResume);

// PUT update a resume
resumeBuilderRoutes.put('/:resumeId', resumeController.updateResume);

// DELETE a resume
resumeBuilderRoutes.delete('/:resumeId', resumeController.deleteResume);

module.exports = resumeBuilderRoutes;
