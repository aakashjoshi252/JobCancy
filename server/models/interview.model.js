const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application ID is required'],
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required'],
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['Virtual', 'In-person', 'Phone', 'Technical', 'HR'],
        message: '{VALUE} is not a valid interview type'
      },
      required: [true, 'Interview type is required'],
      default: 'Virtual',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview schedule date and time is required'],
      index: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No-Show'],
        message: '{VALUE} is not a valid interview status'
      },
      default: 'Scheduled',
      index: true,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comments: {
        type: String,
        maxlength: [2000, 'Feedback comments cannot exceed 2000 characters'],
        default: '',
      },
      strengths: [{
        type: String,
        trim: true,
      }],
      weaknesses: [{
        type: String,
        trim: true,
      }],
      recommendation: {
        type: String,
        enum: ['Strong Hire', 'Hire', 'Maybe', 'No Hire'],
        default: null,
      },
      technicalSkills: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      communicationSkills: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      problemSolving: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      culturalFit: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      submittedAt: {
        type: Date,
        default: null,
      },
    },
    reminder: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: {
        type: Date,
        default: null,
      },
      reminderType: {
        type: String,
        enum: ['email', 'sms', 'both'],
        default: 'email',
      },
      reminderMinutes: {
        type: Number,
        default: 60, // minutes before interview
      },
    },
    rescheduleHistory: [{
      previousDate: {
        type: Date,
        required: true,
      },
      newDate: {
        type: Date,
        required: true,
      },
      reason: {
        type: String,
        maxlength: 500,
      },
      rescheduledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rescheduledAt: {
        type: Date,
        default: Date.now,
      },
    }],
    cancellationReason: {
      type: String,
      maxlength: 500,
      default: '',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    attended: {
      type: Boolean,
      default: null,
    },
    attendedAt: {
      type: Date,
      default: null,
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

// Compound indexes for better query performance
interviewSchema.index({ recruiterId: 1, scheduledAt: 1 });
interviewSchema.index({ candidateId: 1, status: 1 });
interviewSchema.index({ jobId: 1, status: 1 });
interviewSchema.index({ companyId: 1, scheduledAt: 1 });
interviewSchema.index({ scheduledAt: 1, status: 1 });
interviewSchema.index({ status: 1, scheduledAt: 1 });

// Virtual for interview time (formatted)
interviewSchema.virtual('formattedTime').get(function() {
  if (!this.scheduledAt) return '';
  return this.scheduledAt.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

// Virtual for interview date (formatted)
interviewSchema.virtual('formattedDate').get(function() {
  if (!this.scheduledAt) return '';
  return this.scheduledAt.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

// Virtual for status color (for frontend)
interviewSchema.virtual('statusColor').get(function() {
  const colors = {
    'Scheduled': 'blue',
    'Completed': 'green',
    'Cancelled': 'red',
    'Rescheduled': 'orange',
    'No-Show': 'gray'
  };
  return colors[this.status] || 'gray';
});

// Virtual for type icon (for frontend)
interviewSchema.virtual('typeIcon').get(function() {
  const icons = {
    'Virtual': 'video-camera',
    'In-person': 'location',
    'Phone': 'phone',
    'Technical': 'code',
    'HR': 'users'
  };
  return icons[this.type] || 'calendar';
});

// Virtual to check if interview is upcoming
interviewSchema.virtual('isUpcoming').get(function() {
  return this.status === 'Scheduled' && new Date(this.scheduledAt) > new Date();
});

// Virtual to check if interview is past
interviewSchema.virtual('isPast').get(function() {
  return new Date(this.scheduledAt) < new Date();
});

// Virtual to get time until interview (in hours)
interviewSchema.virtual('timeUntil').get(function() {
  if (!this.isUpcoming) return null;
  const timeDiff = new Date(this.scheduledAt) - new Date();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
});

// Pre-save middleware
interviewSchema.pre('save', function(next) {
  // Set default meeting link for virtual interviews
  if (this.type === 'Virtual' && !this.meetingLink && this.status === 'Scheduled') {
    // Generate a default meeting link or use a service
    this.meetingLink = `https://meet.example.com/${this._id}`;
  }
  
  // Auto-cancel past interviews that are still scheduled
  if (this.status === 'Scheduled' && new Date(this.scheduledAt) < new Date()) {
    this.status = 'Cancelled';
    this.cancellationReason = 'Auto-cancelled: Interview date has passed';
    this.cancelledAt = new Date();
  }
  
  next();
});

// Pre-find middleware to exclude deleted interviews
interviewSchema.pre(/^find/, function(next) {
  if (this.getOptions().includeDeleted !== true) {
    this.where({ deletedAt: null });
  }
  next();
});

// Instance method to cancel interview
interviewSchema.methods.cancel = async function(reason, userId) {
  if (this.status === 'Cancelled') {
    throw new Error('Interview is already cancelled');
  }
  
  if (this.status === 'Completed') {
    throw new Error('Cannot cancel a completed interview');
  }
  
  this.status = 'Cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  
  return this.save();
};

// Instance method to reschedule interview
interviewSchema.methods.reschedule = async function(newDate, reason, userId) {
  if (this.status === 'Cancelled') {
    throw new Error('Cannot reschedule a cancelled interview');
  }
  
  if (this.status === 'Completed') {
    throw new Error('Cannot reschedule a completed interview');
  }
  
  // Add to reschedule history
  this.rescheduleHistory.push({
    previousDate: this.scheduledAt,
    newDate: newDate,
    reason: reason,
    rescheduledBy: userId,
    rescheduledAt: new Date(),
  });
  
  // Update interview details
  this.scheduledAt = newDate;
  this.status = 'Rescheduled';
  this.reminder.sent = false; // Reset reminder
  this.reminder.sentAt = null;
  
  return this.save();
};

// Instance method to mark as completed
interviewSchema.methods.complete = async function(feedback, userId) {
  if (this.status === 'Completed') {
    throw new Error('Interview is already completed');
  }
  
  if (this.status === 'Cancelled') {
    throw new Error('Cannot complete a cancelled interview');
  }
  
  this.status = 'Completed';
  this.attended = true;
  this.attendedAt = new Date();
  
  if (feedback) {
    this.feedback = {
      ...this.feedback,
      ...feedback,
      submittedBy: userId,
      submittedAt: new Date(),
    };
  }
  
  return this.save();
};

// Instance method to mark as no-show
interviewSchema.methods.markNoShow = async function() {
  if (this.status !== 'Scheduled') {
    throw new Error('Only scheduled interviews can be marked as no-show');
  }
  
  this.status = 'No-Show';
  this.attended = false;
  this.attendedAt = new Date();
  
  return this.save();
};

// Static method to get upcoming interviews for recruiter
interviewSchema.statics.getUpcomingForRecruiter = async function(recruiterId, limit = 10) {
  return this.find({
    recruiterId: recruiterId,
    status: 'Scheduled',
    scheduledAt: { $gte: new Date() },
    deletedAt: null,
  })
    .populate('candidateId', 'username email profilePicture profileImage')
    .populate('jobId', 'title companyName')
    .populate('companyId', 'companyName logo')
    .sort({ scheduledAt: 1 })
    .limit(limit);
};

// Static method to get today's interviews
interviewSchema.statics.getTodaysInterviews = async function(recruiterId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    recruiterId: recruiterId,
    scheduledAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['Scheduled', 'Rescheduled'] },
    deletedAt: null,
  })
    .populate('candidateId', 'username email profilePicture profileImage')
    .populate('jobId', 'title companyName')
    .sort({ scheduledAt: 1 });
};

// Static method to get interview statistics
interviewSchema.statics.getStats = async function(recruiterId) {
  const stats = await this.aggregate([
    {
      $match: {
        recruiterId: mongoose.Types.ObjectId(recruiterId),
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);
  
  const result = {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0,
    noShow: 0,
  };
  
  stats.forEach(stat => {
    const key = stat._id.toLowerCase();
    if (result.hasOwnProperty(key)) {
      result[key] = stat.count;
    }
    result.total += stat.count;
  });
  
  // Get upcoming count
  const upcoming = await this.countDocuments({
    recruiterId: recruiterId,
    status: 'Scheduled',
    scheduledAt: { $gte: new Date() },
    deletedAt: null,
  });
  
  result.upcoming = upcoming;
  
  return result;
};

// Static method to get interviews by date range
interviewSchema.statics.getByDateRange = async function(recruiterId, startDate, endDate) {
  return this.find({
    recruiterId: recruiterId,
    scheduledAt: { $gte: startDate, $lte: endDate },
    deletedAt: null,
  })
    .populate('candidateId', 'username email profilePicture profileImage')
    .populate('jobId', 'title')
    .sort({ scheduledAt: 1 });
};

// Static method to get interview trend
interviewSchema.statics.getTrend = async function(recruiterId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const trend = await this.aggregate([
    {
      $match: {
        recruiterId: mongoose.Types.ObjectId(recruiterId),
        scheduledAt: { $gte: startDate },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$scheduledAt' },
          month: { $month: '$scheduledAt' },
          day: { $dayOfMonth: '$scheduledAt' },
        },
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);
  
  return trend;
};

// Soft delete method
interviewSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
interviewSchema.methods.restore = function() {
  this.deletedAt = null;
  return this.save();
};

// Create the model
const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
