const createResumePDF = require('../utils/resumePdfGenerator');
const ResumeBuilder = require('../models/resume.builder.model');
const User = require('../models/user.model');

// Get a resume by ID
const getResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;

        const resume = await ResumeBuilder.findById(resumeId)
            .populate('userId', 'username email profilePicture profileImage');

        if (!resume) {
            return res.status(404).json({ 
                success: false,
                message: 'Resume not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            data: resume 
        });
    } catch (error) {
        console.error('Error fetching resume:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resume', 
            error: error.message 
        });
    }
};

// Create Resume
const createResume = async (req, res) => {
    try {
        const resumeData = req.body;
        
        // Check if userId exists in the request body
        if (!resumeData.userId) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }

        // Check if user exists
        const userExists = await User.findById(resumeData.userId);
        if (!userExists) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Process skills array if it's a string
        if (typeof resumeData.skills === 'string') {
            resumeData.skills = resumeData.skills.split(',').map(s => s.trim()).filter(s => s);
        }

        // Process languages array if it's a string
        if (typeof resumeData.languages === 'string') {
            resumeData.languages = resumeData.languages.split(',').map(l => l.trim()).filter(l => l);
        }

        const newResume = new ResumeBuilder(resumeData);
        await newResume.save();

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: newResume
        });
    } catch (error) {
        console.error('Error creating resume:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating resume', 
            error: error.message 
        });
    }
};

// Update Resume
const updateResume = async (req, res) => {
    try {
        const { resumeId } = req.params;

        // Check if resume exists
        const existingResume = await ResumeBuilder.findById(resumeId);
        if (!existingResume) {
            return res.status(404).json({ 
                success: false,
                message: 'Resume not found' 
            });
        }

        const updatedResume = await ResumeBuilder.findByIdAndUpdate(
            resumeId,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Resume updated successfully',
            data: updatedResume
        });

    } catch (error) {
        console.error('Error updating resume:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating resume', 
            error: error.message 
        });
    }
};

// Delete Resume
const deleteResume = async (req, res) => {
    try {
        const { resumeId } = req.params;

        const deletedResume = await ResumeBuilder.findByIdAndDelete(resumeId);

        if (!deletedResume) {
            return res.status(404).json({ 
                success: false,
                message: 'Resume not found' 
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Resume deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting resume', 
            error: error.message 
        });
    }
};

// Download Resume PDF
const downloadResume = async (req, res) => {
    try {
        const { resumeId } = req.params;

        const resume = await ResumeBuilder.findById(resumeId);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        const pdfBuffer = await createResumePDF(resume);

        // Set headers for PDF download
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${resume.fullName || 'resume'}.pdf"`,
            "Content-Length": pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error generating PDF",
            error: error.message
        });
    }
};

// Get All Resumes (Admin)
const getAllResumes = async (req, res) => {
    try {
        const { page = 1, limit = 20, userId, search } = req.query;
        
        let query = {};
        
        // Filter by userId
        if (userId) {
            query.userId = userId;
        }
        
        // Search by fullName or email
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { jobTitle: { $regex: search, $options: 'i' } }
            ];
        }
        
        const resumes = await ResumeBuilder.find(query)
            .populate('userId', 'username email profilePicture profileImage')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await ResumeBuilder.countDocuments(query);

        res.status(200).json({ 
            success: true,
            data: resumes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching all resumes:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resumes', 
            error: error.message 
        });
    }
};

// Get Resumes by User ID
const getResumesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        const resumes = await ResumeBuilder.find({ userId })
            .sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true,
            message: 'Resumes fetched successfully', 
            data: resumes,
            count: resumes.length
        });
        
    } catch (error) {
        console.error("Error fetching resumes by user:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resumes', 
            error: error.message 
        });
    }
};

// Get Resumes by User ID with /data endpoint (for frontend)
const getResumesByUserIdData = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        const resumes = await ResumeBuilder.find({ userId })
            .sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true,
            message: 'Resumes fetched successfully', 
            data: resumes,
            count: resumes.length
        });
        
    } catch (error) {
        console.error("Error fetching resumes by user:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resumes', 
            error: error.message 
        });
    }
};

// Get Current User's Resumes (using auth token)
const getMyResumes = async (req, res) => {
    try {
        const userId = req.user._id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please log in.'
            });
        }
        
        const resumes = await ResumeBuilder.find({ userId })
            .sort({ createdAt: -1 });
        
        res.status(200).json({ 
            success: true,
            data: resumes,
            count: resumes.length
        });
        
    } catch (error) {
        console.error("Error fetching my resumes:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resumes', 
            error: error.message 
        });
    }
};

// Get Resumes by User ID with Pagination
const getResumesByUserIdPaginated = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        const resumes = await ResumeBuilder.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await ResumeBuilder.countDocuments({ userId });
        
        res.status(200).json({ 
            success: true,
            data: resumes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error("Error fetching resumes:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resumes', 
            error: error.message 
        });
    }
};

// Get Resume Statistics
const getResumeStats = async (req, res) => {
    try {
        const totalResumes = await ResumeBuilder.countDocuments();
        const resumesByUser = await ResumeBuilder.aggregate([
            {
                $group: {
                    _id: '$userId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    userId: '$_id',
                    username: '$user.username',
                    email: '$user.email',
                    resumeCount: '$count'
                }
            },
            {
                $sort: { resumeCount: -1 }
            }
        ]);
        
        const recentResumes = await ResumeBuilder.find()
            .populate('userId', 'username email profilePicture profileImage')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.status(200).json({
            success: true,
            data: {
                totalResumes,
                resumesByUser,
                recentResumes
            }
        });
        
    } catch (error) {
        console.error("Error fetching resume stats:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resume statistics', 
            error: error.message 
        });
    }
};

// Get Resume Preview Data
const getResumePreview = async (req, res) => {
    try {
        const { resumeId } = req.params;
        
        const resume = await ResumeBuilder.findById(resumeId)
            .select('-__v -updatedAt');
        
        if (!resume) {
            return res.status(404).json({ 
                success: false,
                message: 'Resume not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            data: resume 
        });
        
    } catch (error) {
        console.error("Error fetching resume preview:", error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching resume preview', 
            error: error.message 
        });
    }
};

module.exports = {
    getResumeById,
    createResume,
    updateResume,
    deleteResume,
    downloadResume,
    getAllResumes,
    getResumesByUserId,
    getResumesByUserIdData,
    getMyResumes,
    getResumesByUserIdPaginated,
    getResumeStats,
    getResumePreview
};
