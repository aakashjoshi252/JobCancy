const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate ID is required"],
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recruiter ID is required"],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: [true, "Resume ID is required"],
    },
    coverLetter: {
      type: String,
      default: "",
      trim: true,
      maxlength: [5000, "Cover letter cannot exceed 5000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: [
          "Pending",      // Initial application, waiting for review
          "Reviewing",    // Application is being reviewed
          "Shortlisted",  // Candidate shortlisted for interview
          "Interviewed",  // Interview has been conducted
          "Selected",     // Candidate selected for position
          "Rejected",     // Application rejected
          "Accepted"      // Candidate accepted the offer
        ],
        message: "{VALUE} is not a valid application status"
      },
      default: "Pending",
      index: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    feedback: {
      type: String,
      default: "",
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    offerDetails: {
      salary: {
        type: Number,
        default: null,
      },
      joiningDate: {
        type: Date,
        default: null,
      },
      position: {
        type: String,
        default: "",
      },
      additionalNotes: {
        type: String,
        default: "",
      },
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for performance and uniqueness
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ recruiterId: 1, status: 1 });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ candidateId: 1, status: 1 });
applicationSchema.index({ appliedDate: -1 });

// Virtual for application age in days
applicationSchema.virtual('ageInDays').get(function() {
  const days = Math.floor((Date.now() - this.appliedDate) / (1000 * 60 * 60 * 24));
  return days;
});

// Virtual for application status color (for frontend)
applicationSchema.virtual('statusColor').get(function() {
  const colors = {
    'Pending': 'yellow',
    'Reviewing': 'blue',
    'Shortlisted': 'purple',
    'Interviewed': 'indigo',
    'Selected': 'green',
    'Rejected': 'red',
    'Accepted': 'emerald'
  };
  return colors[this.status] || 'gray';
});

// Virtual for application status badge text
applicationSchema.virtual('statusBadge').get(function() {
  const badges = {
    'Pending': 'Pending Review',
    'Reviewing': 'Under Review',
    'Shortlisted': 'Shortlisted',
    'Interviewed': 'Interviewed',
    'Selected': 'Selected',
    'Rejected': 'Not Selected',
    'Accepted': 'Offer Accepted'
  };
  return badges[this.status] || this.status;
});

// Pre-save middleware to set reviewedAt when status changes
applicationSchema.pre('save', function(next) {
  const finalStatuses = ['Selected', 'Accepted', 'Rejected'];
  
  // Set reviewedAt when application moves from Pending/Reviewing to other statuses
  if (this.isModified('status') && 
      !['Pending', 'Reviewing'].includes(this.status) && 
      !this.reviewedAt) {
    this.reviewedAt = new Date();
    this.reviewedBy = this.recruiterId;
  }
  
  // Auto-delete after 1 year for rejected applications
  if (this.status === 'Rejected' && !this.deletedAt) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    this.deletedAt = oneYearFromNow;
  }
  
  next();
});

// Instance method to check if application is withdrawable
applicationSchema.methods.isWithdrawable = function() {
  return ['Pending', 'Reviewing'].includes(this.status);
};

// Instance method to check if application is editable
applicationSchema.methods.isEditable = function() {
  return ['Pending'].includes(this.status);
};

// Instance method to update status with validation
applicationSchema.methods.updateStatus = function(newStatus, userId) {
  const validTransitions = {
    'Pending': ['Reviewing', 'Rejected'],
    'Reviewing': ['Shortlisted', 'Rejected'],
    'Shortlisted': ['Interviewed', 'Rejected'],
    'Interviewed': ['Selected', 'Rejected'],
    'Selected': ['Accepted', 'Rejected'],
    'Rejected': [],
    'Accepted': []
  };
  
  const allowedTransitions = validTransitions[this.status];
  
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  if (!['Pending', 'Reviewing'].includes(newStatus)) {
    this.reviewedAt = new Date();
    this.reviewedBy = userId;
  }
  
  return this;
};

// Static method to get application statistics
applicationSchema.statics.getStatsByRecruiter = async function(recruiterId) {
  const stats = await this.aggregate([
    {
      $match: { recruiterId: mongoose.Types.ObjectId(recruiterId) }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    interviewed: 0,
    selected: 0,
    rejected: 0,
    accepted: 0
  };
  
  stats.forEach(stat => {
    const key = stat._id.toLowerCase();
    if (result.hasOwnProperty(key)) {
      result[key] = stat.count;
    }
    result.total += stat.count;
  });
  
  return result;
};

// Static method to get applications by date range
applicationSchema.statics.getByDateRange = async function(recruiterId, startDate, endDate) {
  return this.find({
    recruiterId: recruiterId,
    appliedDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('jobId candidateId');
};

// Static method to get application trend (last 30 days)
applicationSchema.statics.getTrend = async function(recruiterId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const trend = await this.aggregate([
    {
      $match: {
        recruiterId: mongoose.Types.ObjectId(recruiterId),
        appliedDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$appliedDate" },
          month: { $month: "$appliedDate" },
          day: { $dayOfMonth: "$appliedDate" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);
  
  return trend;
};

// Pre-find middleware to exclude deleted applications by default
applicationSchema.pre(/^find/, function(next) {
  // Only apply if not explicitly requested to include deleted
  if (this.getOptions().includeDeleted !== true) {
    this.where({ deletedAt: null });
  }
  next();
});

// Method to soft delete application
applicationSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Method to restore soft deleted application
applicationSchema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};

// Create the model
const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;