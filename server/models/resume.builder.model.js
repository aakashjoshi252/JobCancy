const  mongoose =require('mongoose');

const experienceSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    experienceTitle: { type: String, required: true },
    duration: String,
    workDetails: String
});

const educationSchema = new mongoose.Schema({
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: String
});

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String
});

const portfolioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    imageUrl: { type: String, required: true },
    category: String,
    materials: [String],
    techniques: [String],
    year: String
});

const resumeBuilderSchema = new mongoose.Schema({
    // Basic Information
    fullName: { type: String, required: true },
    jobTitle: String,
    email: String,
    phone: String,
    address: String,
    summary: String,
    
    // Jewelry Industry Specific
    specialization: [String],
    materialsExpertise: [String],
    technicalSkills: [String],
    
    // Skills
    skills: [String],
    languages: [String],
    
    // Sections
    experiences: [experienceSchema],
    education: [educationSchema],
    certifications: [certificationSchema],
    portfolio: [portfolioSchema],
    portfolioWebsite: String,
    
    // Metadata
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, );

// Update the updatedAt timestamp on save
resumeBuilderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const ResumeBuilder = mongoose.model('ResumeBuilder', resumeBuilderSchema);
module.exports= ResumeBuilder;