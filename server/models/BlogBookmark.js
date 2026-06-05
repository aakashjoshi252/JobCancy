const mongoose = require('mongoose');

const blogBookmarkSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

blogBookmarkSchema.index({ blogId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('BlogBookmark', blogBookmarkSchema);
