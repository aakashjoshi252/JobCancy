const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: 'newspaper',
      trim: true,
    },
    color: {
      type: String,
      default: 'blue',
      trim: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  { timestamps: true }
);

blogCategorySchema.index({ isActive: 1, sortOrder: 1, name: 1 });

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
