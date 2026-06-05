const mongoose = require('mongoose');

const BLOG_CATEGORIES = [
  'technology',
  'career-tips',
  'interview-preparation',
  'resume-tips',
  'industry-news',
  'jewelry-industry',
  'hiring-trends',
  'freelancing',
  'remote-jobs',
  'ai-tech',
  'skill-development',
  // Legacy company-story categories kept for existing data.
  'event',
  'achievement',
  'growth',
  'culture',
  'news',
];

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

const getPlainText = (value = '') =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_>#|[\]()~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const calculateReadingTime = (value = '') => {
  const words = getPlainText(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    contentFormat: {
      type: String,
      enum: ['markdown', 'html'],
      default: 'markdown',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: BLOG_CATEGORIES,
      default: 'career-tips',
      index: true,
    },
    categoryName: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 40,
      },
    ],
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    },
    coverImage: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
      alt: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    readingTime: {
      type: Number,
      default: 1,
      min: 1,
    },
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: 70,
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: 180,
      },
      keywords: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      canonicalUrl: {
        type: String,
        trim: true,
      },
    },
    language: {
      type: String,
      default: 'en',
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ status: 1, featured: 1, publishedAt: -1, createdAt: -1 });
blogSchema.index({ category: 1, status: 1, publishedAt: -1, createdAt: -1 });
blogSchema.index({ tags: 1, status: 1, createdAt: -1 });
blogSchema.index({ companyId: 1, status: 1, createdAt: -1 });
blogSchema.index({ title: 'text', description: 'text', excerpt: 'text', content: 'text', tags: 'text' });

blogSchema.virtual('formattedDate').get(function formattedDate() {
  const date = this.publishedAt || this.createdAt;
  return date
    ? date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;
});

blogSchema.methods.incrementViews = async function incrementViews() {
  this.views += 1;
  await this.save();
  return this.views;
};

blogSchema.statics.getPopularBlogs = function getPopularBlogs(limit = 5) {
  return this.find({ status: 'published' })
    .sort({ views: -1, likes: -1, commentsCount: -1, publishedAt: -1, createdAt: -1 })
    .limit(limit)
    .populate('companyId', 'companyName uploadLogo')
    .populate('authorId', 'username email profilePicture profileImage bio');
};

blogSchema.statics.getCompanyStats = async function getCompanyStats(companyId) {
  const stats = await this.aggregate([
    { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
    {
      $group: {
        _id: null,
        totalBlogs: { $sum: 1 },
        publishedBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
        },
        draftBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] },
        },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        totalComments: { $sum: '$commentsCount' },
        totalShares: { $sum: '$shares' },
        avgViews: { $avg: '$views' },
        avgLikes: { $avg: '$likes' },
      },
    },
  ]);

  return (
    stats[0] || {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      avgViews: 0,
      avgLikes: 0,
    }
  );
};

blogSchema.pre('validate', async function validateRefs(next) {
  try {
    if (this.authorId && !this.author) {
      this.author = this.authorId;
    }

    if (this.author && !this.authorId) {
      this.authorId = this.author;
    }

    const plainContent = getPlainText(this.content || '');
    if (!this.description && (this.excerpt || plainContent)) {
      this.description = (this.excerpt || plainContent.slice(0, 220)).trim();
    }

    if (!this.excerpt && (this.description || plainContent)) {
      this.excerpt = (this.description || plainContent.slice(0, 220)).trim();
    }

    if (this.companyId) {
      const Company = mongoose.model('Company');
      const companyExists = await Company.exists({ _id: this.companyId });
      if (!companyExists) {
        return next(new Error('Company does not exist'));
      }
    }

    if (this.authorId) {
      const User = mongoose.model('User');
      const userExists = await User.exists({ _id: this.authorId });
      if (!userExists) {
        return next(new Error('Author does not exist'));
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
});

blogSchema.pre('save', function normalizeBlog(next) {
  if (this.title) this.title = this.title.trim();
  if (this.description) this.description = this.description.trim();
  if (this.authorId && !this.author) this.author = this.authorId;
  if (this.author && !this.authorId) this.authorId = this.author;

  this.slug = slugify(this.slug || this.title);
  this.excerpt = (this.excerpt || this.description || getPlainText(this.content).slice(0, 220)).trim();
  this.readingTime = calculateReadingTime(this.content);

  this.tags = Array.from(
    new Set((this.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean))
  ).slice(0, 12);

  if (this.image && !this.coverImage?.url) {
    this.coverImage = {
      ...(this.coverImage || {}),
      url: this.image,
      alt: this.title,
    };
  }

  if (this.coverImage?.url) {
    this.image = this.coverImage.url;
    if (!this.coverImage.alt) this.coverImage.alt = this.title;
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.status !== 'published') {
    this.featured = false;
  }

  if (!this.seo) this.seo = {};
  this.seo.metaTitle = this.seo.metaTitle || this.title;
  this.seo.metaDescription = this.seo.metaDescription || this.excerpt || this.description;
  this.seo.keywords = Array.from(new Set([...(this.seo.keywords || []), ...(this.tags || [])])).slice(0, 16);

  if (this.content && !this.content.trim()) {
    return next(new Error('Blog content cannot be empty'));
  }

  return next();
});

blogSchema.set('toJSON', {
  virtuals: true,
  transform: function transform(_doc, ret) {
    delete ret.__v;
    delete ret.likedBy;
    return ret;
  },
});

blogSchema.set('toObject', {
  virtuals: true,
});

blogSchema.statics.categories = BLOG_CATEGORIES;
blogSchema.statics.slugify = slugify;

module.exports = mongoose.model('Blog', blogSchema);
