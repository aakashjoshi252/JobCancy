const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogComment',
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'visible',
      index: true,
    },
  },
  { timestamps: true }
);

blogCommentSchema.index({ blogId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('BlogComment', blogCommentSchema);
