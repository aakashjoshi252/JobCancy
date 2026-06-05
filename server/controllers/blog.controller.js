const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const BlogComment = require('../models/BlogComment');
const BlogLike = require('../models/BlogLike');
const BlogBookmark = require('../models/BlogBookmark');
const Company = require('../models/company.model');
const logger = require('../utils/logger');
const { uploadBlogImageToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const DEFAULT_BLOG_CATEGORIES = [
  {
    key: 'technology',
    slug: 'technology',
    name: 'Technology',
    icon: 'cpu',
    color: 'blue',
    description: 'Tools, platforms, and digital skills shaping modern hiring.',
  },
  {
    key: 'career-tips',
    slug: 'career-tips',
    name: 'Career Tips',
    icon: 'briefcase',
    color: 'emerald',
    description: 'Practical guidance for growing a placement-ready career.',
  },
  {
    key: 'interview-preparation',
    slug: 'interview-preparation',
    name: 'Interview Preparation',
    icon: 'messages-square',
    color: 'violet',
    description: 'Interview frameworks, questions, and confidence builders.',
  },
  {
    key: 'resume-tips',
    slug: 'resume-tips',
    name: 'Resume Tips',
    icon: 'file-text',
    color: 'amber',
    description: 'Resume, portfolio, and profile improvements recruiters notice.',
  },
  {
    key: 'industry-news',
    slug: 'industry-news',
    name: 'Industry News',
    icon: 'newspaper',
    color: 'rose',
    description: 'Market updates and career news across hiring sectors.',
  },
  {
    key: 'jewelry-industry',
    slug: 'jewelry-industry',
    name: 'Jewelry Industry',
    icon: 'gem',
    color: 'cyan',
    description: 'Specialized insights for jewelry, gems, retail, and design careers.',
  },
  {
    key: 'hiring-trends',
    slug: 'hiring-trends',
    name: 'Hiring Trends',
    icon: 'trending-up',
    color: 'indigo',
    description: 'What recruiters are looking for and how hiring is changing.',
  },
  {
    key: 'freelancing',
    slug: 'freelancing',
    name: 'Freelancing',
    icon: 'sparkles',
    color: 'fuchsia',
    description: 'Independent work, clients, contracts, and portfolio growth.',
  },
  {
    key: 'remote-jobs',
    slug: 'remote-jobs',
    name: 'Remote Jobs',
    icon: 'wifi',
    color: 'sky',
    description: 'Remote hiring, async work, and distributed team advice.',
  },
  {
    key: 'ai-tech',
    slug: 'ai-tech',
    name: 'AI & Tech',
    icon: 'bot',
    color: 'slate',
    description: 'AI skills, automation, and job-search technology.',
  },
  {
    key: 'skill-development',
    slug: 'skill-development',
    name: 'Skill Development',
    icon: 'graduation-cap',
    color: 'teal',
    description: 'Learning paths, certifications, and upskilling strategies.',
  },
  {
    key: 'news',
    slug: 'news',
    name: 'Company News',
    icon: 'building-2',
    color: 'pink',
    description: 'Announcements, company updates, and placement stories.',
  },
  {
    key: 'event',
    slug: 'event',
    name: 'Events',
    icon: 'calendar-days',
    color: 'blue',
    description: 'Hiring events, webinars, workshops, and meetups.',
  },
  {
    key: 'achievement',
    slug: 'achievement',
    name: 'Achievements',
    icon: 'award',
    color: 'amber',
    description: 'Milestones, awards, and success stories.',
  },
  {
    key: 'growth',
    slug: 'growth',
    name: 'Growth',
    icon: 'line-chart',
    color: 'emerald',
    description: 'Company expansion, team growth, and new opportunities.',
  },
  {
    key: 'culture',
    slug: 'culture',
    name: 'Culture',
    icon: 'users-round',
    color: 'violet',
    description: 'Workplace culture, teams, and people stories.',
  },
];

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parsePagination = (query) => {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  return { limit, page, skip: (page - 1) * limit };
};

const normalizeList = (value) => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : value.toString().split(',');
  return Array.from(new Set(items.map((item) => item.trim().toLowerCase()).filter(Boolean)));
};

const normalizeSeo = (body = {}) => ({
  metaTitle: body.seo?.metaTitle || body.metaTitle || body.seoTitle || body.title,
  metaDescription:
    body.seo?.metaDescription ||
    body.metaDescription ||
    body.seoDescription ||
    body.excerpt ||
    body.description,
  keywords: normalizeList(body.seo?.keywords || body.keywords || body.tags),
  canonicalUrl: body.seo?.canonicalUrl || body.canonicalUrl || '',
});

const normalizeCoverImage = (body = {}) => {
  const coverImage = body.coverImage || {};
  return {
    url: coverImage.url || body.image || '',
    publicId: coverImage.publicId || body.publicId || '',
    alt: coverImage.alt || body.title || '',
  };
};

const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex((part) => part === 'upload');
    if (uploadIndex === -1) return null;

    const pathAfterUpload = parts.slice(uploadIndex + 1).join('/');
    return pathAfterUpload.replace(/\.[^.]+$/, '');
  } catch (error) {
    logger.error(`Error extracting public_id: ${error.message}`);
    return null;
  }
};

const buildSort = (sort = 'latest') => {
  const sorts = {
    latest: { publishedAt: -1, createdAt: -1 },
    newest: { publishedAt: -1, createdAt: -1 },
    'most-viewed': { views: -1, publishedAt: -1, createdAt: -1 },
    mostViewed: { views: -1, publishedAt: -1, createdAt: -1 },
    'most-liked': { likes: -1, publishedAt: -1, createdAt: -1 },
    mostLiked: { likes: -1, publishedAt: -1, createdAt: -1 },
    trending: { views: -1, likes: -1, commentsCount: -1, shares: -1, publishedAt: -1 },
    popular: { views: -1, likes: -1, commentsCount: -1, publishedAt: -1 },
    oldest: { createdAt: 1 },
  };

  return sorts[sort] || sorts.latest;
};

const populateBlog = (query) =>
  query
    .populate('companyId', 'companyName uploadLogo website location description industry')
    .populate('authorId', 'username email profilePicture profileImage bio role location website')
    .populate('author', 'username email profilePicture profileImage bio role location website');

const normalizeBlogForResponse = (blog) => {
  if (!blog) return blog;

  const payload = typeof blog.toObject === 'function' ? blog.toObject({ virtuals: true }) : { ...blog };
  payload.coverImage = payload.coverImage || {};

  if (!payload.coverImage.url && payload.image) {
    payload.coverImage.url = payload.image;
  }

  if (!payload.image && payload.coverImage.url) {
    payload.image = payload.coverImage.url;
  }

  if (!payload.coverImage.alt && payload.title) {
    payload.coverImage.alt = payload.title;
  }

  payload.author = payload.authorId || payload.author || null;
  delete payload.__v;
  delete payload.likedBy;

  return payload;
};

const normalizeBlogsForResponse = (blogs = []) => blogs.map(normalizeBlogForResponse);

const sendListResponse = (
  res,
  {
    statusCode = 200,
    message = 'Blogs fetched successfully',
    blogs = [],
    pagination = null,
    extra = {},
  } = {}
) => {
  const normalizedBlogs = normalizeBlogsForResponse(blogs);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      blogs: normalizedBlogs,
      ...(pagination ? { pagination } : {}),
      ...extra,
    },
    count: normalizedBlogs.length,
    blogs: normalizedBlogs,
    ...(pagination ? { pagination } : {}),
    ...extra,
  });
};

const sendSingleResponse = (
  res,
  {
    statusCode = 200,
    message = 'Blog fetched successfully',
    blog = null,
    extra = {},
  } = {}
) => {
  const normalizedBlog = normalizeBlogForResponse(blog);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      blog: normalizedBlog,
      ...extra,
    },
    blog: normalizedBlog,
    ...extra,
  });
};

const ensureUniqueSlug = async ({ title, slug, blogId }) => {
  const baseSlug = Blog.slugify(slug || title);
  let candidate = baseSlug || `blog-${Date.now()}`;
  let suffix = 2;

  const query = { slug: candidate };
  if (blogId) query._id = { $ne: blogId };

  while (await Blog.exists(query)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
    query.slug = candidate;
  }

  return candidate;
};

const buildBlogPayload = async (body, reqUser, existingBlogId = null) => {
  const category = body.category || 'career-tips';

  return {
    title: body.title?.trim(),
    slug: await ensureUniqueSlug({
      title: body.title,
      slug: body.slug,
      blogId: existingBlogId,
    }),
    description: body.description?.trim() || body.excerpt?.trim(),
    excerpt: body.excerpt?.trim() || body.description?.trim(),
    content: body.content,
    contentFormat: body.contentFormat || 'markdown',
    category,
    categoryName: body.categoryName || DEFAULT_BLOG_CATEGORIES.find((item) => item.key === category)?.name,
    tags: normalizeList(body.tags),
    image: body.image || body.coverImage?.url || undefined,
    coverImage: normalizeCoverImage(body),
    status: body.status || 'draft',
    featured: Boolean(body.featured),
    publishedAt: body.status === 'published' ? body.publishedAt || new Date() : body.publishedAt || null,
    companyId: body.companyId || null,
    authorId: body.authorId || body.author || reqUser?._id,
    author: body.author || body.authorId || reqUser?._id,
    seo: normalizeSeo(body),
    language: body.language || 'en',
  };
};

const canManageBlog = (user, blog) => {
  if (!user || !blog) return false;
  if (user.role === 'admin') return true;
  return blog.authorId?.toString() === user._id.toString();
};

const attachViewerState = async (blogPayload, userId) => {
  if (!userId || !blogPayload?._id) {
    return {
      ...blogPayload,
      isLiked: false,
      isBookmarked: false,
    };
  }

  const [isLiked, isBookmarked] = await Promise.all([
    BlogLike.exists({ blogId: blogPayload._id, userId }),
    BlogBookmark.exists({ blogId: blogPayload._id, userId }),
  ]);

  return {
    ...blogPayload,
    isLiked: Boolean(isLiked),
    isBookmarked: Boolean(isBookmarked),
  };
};

exports.uploadBlogImage = async (req, res) => {
  try {
    const file =
      req.file ||
      req.files?.image?.[0] ||
      req.files?.coverImage?.[0] ||
      req.files?.file?.[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed',
      });
    }

    const result = await uploadBlogImageToCloudinary(file.buffer, file.originalname);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id,
        coverImage: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
      imageUrl: result.secure_url,
      publicId: result.public_id,
      coverImage: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    logger.error(`Error uploading blog image: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getBlogCategories = async (_req, res) => {
  try {
    const [storedCategories, categoryCounts] = await Promise.all([
      BlogCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const counts = new Map(categoryCounts.map((item) => [item._id, item.count]));
    const storedByKey = new Map(storedCategories.map((item) => [item.key, item]));
    const merged = DEFAULT_BLOG_CATEGORIES.map((category, index) => ({
      ...category,
      ...(storedByKey.get(category.key) || {}),
      sortOrder: storedByKey.get(category.key)?.sortOrder ?? index,
      count: counts.get(category.key) || 0,
      followersCount: storedByKey.get(category.key)?.followers?.length || 0,
    }));

    const customCategories = storedCategories
      .filter((category) => !DEFAULT_BLOG_CATEGORIES.some((item) => item.key === category.key))
      .map((category) => ({
        ...category,
        count: counts.get(category.key) || 0,
        followersCount: category.followers?.length || 0,
      }));

    return res.status(200).json({
      success: true,
      message: 'Blog categories fetched successfully',
      data: {
        categories: [...merged, ...customCategories],
      },
      categories: [...merged, ...customCategories],
    });
  } catch (error) {
    logger.error(`Error fetching blog categories: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blog categories',
    });
  }
};

exports.followCategory = async (req, res) => {
  try {
    const { key } = req.params;
    const fallback = DEFAULT_BLOG_CATEGORIES.find((category) => category.key === key);
    const category = await BlogCategory.findOneAndUpdate(
      { key },
      {
        $setOnInsert: {
          key,
          slug: key,
          name: fallback?.name || key,
          description: fallback?.description || '',
          icon: fallback?.icon || 'newspaper',
          color: fallback?.color || 'blue',
          isActive: true,
        },
      },
      { new: true, upsert: true }
    );

    const isFollowing = category.followers.some((id) => id.toString() === req.user._id.toString());
    if (isFollowing) {
      category.followers = category.followers.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      category.followers.push(req.user._id);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category follow state updated successfully',
      data: {
        isFollowing: !isFollowing,
        followersCount: category.followers.length,
      },
      isFollowing: !isFollowing,
      followersCount: category.followers.length,
    });
  } catch (error) {
    logger.error(`Error toggling category follow: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error updating category follow state',
    });
  }
};

exports.getBlogTags = async (_req, res) => {
  try {
    const tags = await Blog.aggregate([
      { $match: { status: 'published', tags: { $exists: true, $ne: [] } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 40 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Blog tags fetched successfully',
      data: { tags },
      tags,
    });
  } catch (error) {
    logger.error(`Error fetching blog tags: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blog tags',
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const { category, tag, sort = 'latest' } = req.query;
    const search = req.query.search || req.query.query || req.query.q || '';
    const { limit, page, skip } = parsePagination(req.query);

    const query = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (tag && tag !== 'all') {
      query.tags = tag.toString().toLowerCase();
    }

    if (search?.trim()) {
      const searchTerm = search.trim();
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      populateBlog(Blog.find(query))
        .sort(buildSort(sort))
        .limit(limit)
        .skip(skip)
        .lean({ virtuals: true }),
      Blog.countDocuments(query),
    ]);

    return sendListResponse(res, {
      message: 'Blogs fetched successfully',
      blogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Error in getAllBlogs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getPublishedBlogs = (req, res) => exports.getAllBlogs(req, res);

exports.searchBlogs = (req, res) => {
  req.query.search = req.query.query || req.query.search || req.query.q || '';
  return exports.getAllBlogs(req, res);
};

exports.getBlogsByCategory = (req, res) => {
  req.query.category = req.params.category;
  return exports.getAllBlogs(req, res);
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await populateBlog(Blog.findOne({ slug }));

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.status !== 'published' && !canManageBlog(req.user, blog)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to unpublished blog',
      });
    }

    if (blog.status === 'published') {
      await blog.incrementViews();
    }

    const payload = await attachViewerState(blog.toObject({ virtuals: true }), req.user?._id);

    return sendSingleResponse(res, {
      message: 'Blog fetched successfully',
      blog: payload,
    });
  } catch (error) {
    logger.error(`Error in getBlogBySlug: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getFeaturedBlogs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 12);
    const blogs = await populateBlog(
      Blog.find({ status: 'published', featured: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit)
    ).lean({ virtuals: true });

    return sendListResponse(res, {
      message: 'Featured blogs fetched successfully',
      blogs,
    });
  } catch (error) {
    logger.error(`Error in getFeaturedBlogs: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error fetching featured blogs' });
  }
};

exports.getTrendingBlogs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
    const blogs = await populateBlog(
      Blog.find({ status: 'published' })
        .sort({ views: -1, likes: -1, commentsCount: -1, shares: -1, publishedAt: -1 })
        .limit(limit)
    ).lean({ virtuals: true });

    return sendListResponse(res, {
      message: 'Trending blogs fetched successfully',
      blogs,
    });
  } catch (error) {
    logger.error(`Error in getTrendingBlogs: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error fetching trending blogs' });
  }
};

exports.getPopularBlogs = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 20);
    const blogs = await Blog.getPopularBlogs(limit).lean({ virtuals: true });

    return sendListResponse(res, {
      message: 'Popular blogs fetched successfully',
      blogs,
    });
  } catch (error) {
    logger.error(`Error in getPopularBlogs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching popular blogs',
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = isObjectId(id) ? { _id: id } : { slug: id };

    const blog = await populateBlog(Blog.findOne(query));

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.status !== 'published' && !canManageBlog(req.user, blog)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to unpublished blog',
      });
    }

    if (blog.status === 'published') {
      await blog.incrementViews();
    }

    const payload = await attachViewerState(blog.toObject({ virtuals: true }), req.user?._id);

    return sendSingleResponse(res, {
      message: 'Blog fetched successfully',
      blog: payload,
    });
  } catch (error) {
    logger.error(`Error in getBlogById: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getCompanyBlogs = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status = 'all' } = req.query;

    if (!isObjectId(companyId)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID format' });
    }

    const query = { companyId };
    if (status !== 'all') query.status = status;

    const blogs = await populateBlog(Blog.find(query))
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    return sendListResponse(res, {
      message: 'Company blogs fetched successfully',
      blogs,
    });
  } catch (error) {
    logger.error(`Error in getCompanyBlogs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching company blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getMyBlogs = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const { limit, page, skip } = parsePagination(req.query);
    const query = { authorId: req.user._id };

    if (status !== 'all') query.status = status;

    const [blogs, total] = await Promise.all([
      populateBlog(Blog.find(query))
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean({ virtuals: true }),
      Blog.countDocuments(query),
    ]);

    return sendListResponse(res, {
      message: 'Your blogs fetched successfully',
      blogs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Error in getMyBlogs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching your blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getManageBlogs = async (req, res) => {
  try {
    const { status = 'all', category, search, sort = 'latest' } = req.query;
    const { limit, page, skip } = parsePagination(req.query);
    const query = {};

    if (req.user.role !== 'admin') {
      query.authorId = req.user._id;
    }

    if (status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search?.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { content: { $regex: term, $options: 'i' } },
      ];
    }

    const [blogs, total, statsAgg] = await Promise.all([
      populateBlog(Blog.find(query))
        .sort(buildSort(sort))
        .limit(limit)
        .skip(skip)
        .lean({ virtuals: true }),
      Blog.countDocuments(query),
      Blog.aggregate([
        { $match: req.user.role === 'admin' ? {} : { authorId: req.user._id } },
        {
          $group: {
            _id: null,
            totalBlogs: { $sum: 1 },
            publishedBlogs: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
            draftBlogs: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: '$likes' },
            totalComments: { $sum: '$commentsCount' },
            totalShares: { $sum: '$shares' },
          },
        },
      ]),
    ]);

    return sendListResponse(res, {
      message: 'Blog management data fetched successfully',
      blogs,
      extra: {
        stats: statsAgg[0] || {
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
      },
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Error in getManageBlogs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blog management data',
    });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const requiredFields = ['title', 'content', 'category'];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    if (!['recruiter', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters and admins can create blogs',
      });
    }

    if (req.user.role === 'recruiter') {
      if (!req.body.companyId || !isObjectId(req.body.companyId)) {
        return res.status(400).json({
          success: false,
          message: 'A valid company ID is required for recruiter blogs',
        });
      }

      const company = await Company.findById(req.body.companyId);
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company not found' });
      }

      if (company.recruiterId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create blogs for this company',
        });
      }
    }

    const payload = await buildBlogPayload(req.body, req.user);
    const blog = await Blog.create(payload);
    const populatedBlog = await populateBlog(Blog.findById(blog._id));

    return sendSingleResponse(res, {
      statusCode: 201,
      message: 'Blog created successfully',
      blog: populatedBlog,
    });
  } catch (error) {
    logger.error(`Error in createBlog: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this slug already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error creating blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (!canManageBlog(req.user, blog)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog',
      });
    }

    const allowedFields = [
      'title',
      'slug',
      'description',
      'excerpt',
      'content',
      'contentFormat',
      'category',
      'categoryName',
      'tags',
      'image',
      'coverImage',
      'status',
      'featured',
      'publishedAt',
      'seo',
      'metaTitle',
      'metaDescription',
      'seoTitle',
      'seoDescription',
      'keywords',
      'language',
      'author',
      'authorId',
    ];

    const requested = allowedFields.reduce((updates, field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
      return updates;
    }, {});

    const payload = {
      ...(await buildBlogPayload({ ...blog.toObject(), ...requested }, req.user, id)),
      authorId: blog.authorId,
      companyId: req.body.companyId !== undefined ? req.body.companyId : blog.companyId,
    };

    const oldImagePublicId = blog.coverImage?.publicId || extractPublicId(blog.image);
    const newImagePublicId = payload.coverImage?.publicId || extractPublicId(payload.image);

    Object.assign(blog, payload);
    await blog.save();

    if (oldImagePublicId && newImagePublicId && oldImagePublicId !== newImagePublicId) {
      try {
        await deleteFromCloudinary(oldImagePublicId);
      } catch (cloudinaryError) {
        logger.error(`Failed to delete replaced blog image: ${cloudinaryError.message}`);
      }
    }

    const updatedBlog = await populateBlog(Blog.findById(id));

    return sendSingleResponse(res, {
      message: 'Blog updated successfully',
      blog: updatedBlog,
    });
  } catch (error) {
    logger.error(`Error in updateBlog: ${error.message}`);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog with this slug already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error updating blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (!canManageBlog(req.user, blog)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog',
      });
    }

    const imagePublicId = blog.coverImage?.publicId || extractPublicId(blog.image);
    const imageUrl = blog.coverImage?.url || blog.image;
    if (imagePublicId && imageUrl?.includes('cloudinary.com')) {
      try {
        await deleteFromCloudinary(imagePublicId);
      } catch (cloudinaryError) {
        logger.error(`Failed to delete image from Cloudinary: ${cloudinaryError.message}`);
      }
    }

    await Promise.all([
      BlogComment.deleteMany({ blogId: blog._id }),
      BlogLike.deleteMany({ blogId: blog._id }),
      BlogBookmark.deleteMany({ blogId: blog._id }),
      blog.deleteOne(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in deleteBlog: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error deleting blog',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.toggleBlogLike = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const existingLike = await BlogLike.findOne({ blogId: id, userId: req.user._id });
    let isLiked = false;

    if (existingLike) {
      await existingLike.deleteOne();
      await Blog.findByIdAndUpdate(id, { $pull: { likedBy: req.user._id } });
    } else {
      await BlogLike.create({ blogId: id, userId: req.user._id });
      await Blog.findByIdAndUpdate(id, { $addToSet: { likedBy: req.user._id } });
      isLiked = true;
    }

    const likes = await BlogLike.countDocuments({ blogId: id });
    await Blog.findByIdAndUpdate(id, { likes });

    return res.status(200).json({
      success: true,
      message: isLiked ? 'Blog liked successfully' : 'Blog unliked successfully',
      data: {
        likes,
        isLiked,
      },
      likes,
      isLiked,
    });
  } catch (error) {
    logger.error(`Error in toggleBlogLike: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error processing like action',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.toggleBlogBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const existingBookmark = await BlogBookmark.findOne({ blogId: id, userId: req.user._id });
    let isBookmarked = false;

    if (existingBookmark) {
      await existingBookmark.deleteOne();
    } else {
      await BlogBookmark.create({ blogId: id, userId: req.user._id });
      isBookmarked = true;
    }

    const bookmarks = await BlogBookmark.countDocuments({ blogId: id });
    await Blog.findByIdAndUpdate(id, { bookmarks });

    return res.status(200).json({
      success: true,
      message: isBookmarked ? 'Blog bookmarked successfully' : 'Blog bookmark removed successfully',
      data: {
        bookmarks,
        isBookmarked,
      },
      bookmarks,
      isBookmarked,
    });
  } catch (error) {
    logger.error(`Error in toggleBlogBookmark: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error processing bookmark action',
    });
  }
};

exports.incrementBlogShare = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findByIdAndUpdate(id, { $inc: { shares: 1 } }, { new: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog share count updated successfully',
      data: { shares: blog.shares },
      shares: blog.shares,
    });
  } catch (error) {
    logger.error(`Error incrementing blog share: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error updating share count' });
  }
};

exports.getBlogComments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const comments = await BlogComment.find({ blogId: id, status: 'visible' })
      .populate('userId', 'username email profilePicture profileImage role')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Blog comments fetched successfully',
      data: { comments },
      comments,
      count: comments.length,
    });
  } catch (error) {
    logger.error(`Error fetching blog comments: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error fetching comments' });
  }
};

exports.createBlogComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const blog = await Blog.findById(id);
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const comment = await BlogComment.create({
      blogId: id,
      userId: req.user._id,
      parentId: parentId || null,
      content: content.trim(),
    });

    await Blog.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });

    const populatedComment = await BlogComment.findById(comment._id).populate(
      'userId',
      'username email profilePicture profileImage role'
    );

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: populatedComment },
      comment: populatedComment,
    });
  } catch (error) {
    logger.error(`Error creating blog comment: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error creating comment' });
  }
};

exports.deleteBlogComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    if (!isObjectId(id) || !isObjectId(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const comment = await BlogComment.findOne({ _id: commentId, blogId: id });
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (req.user.role !== 'admin' && comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    await comment.deleteOne();
    await Blog.findByIdAndUpdate(id, { $inc: { commentsCount: -1 } });

    return res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting blog comment: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Error deleting comment' });
  }
};

exports.getRelatedBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 3, 1), 10);

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID format' });
    }

    const sourceBlog = await Blog.findOne({ _id: id, status: 'published' }).select('category tags');
    if (!sourceBlog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const blogs = await populateBlog(
      Blog.find({
        _id: { $ne: id },
        status: 'published',
        $or: [{ category: sourceBlog.category }, { tags: { $in: sourceBlog.tags || [] } }],
      })
        .sort({ views: -1, publishedAt: -1, createdAt: -1 })
        .limit(limit)
    ).lean({ virtuals: true });

    return sendListResponse(res, {
      message: 'Related blogs fetched successfully',
      blogs,
    });
  } catch (error) {
    logger.error(`Error in getRelatedBlogs: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching related blogs',
    });
  }
};

exports.getBlogStats = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!isObjectId(companyId)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID format' });
    }

    const stats = await Blog.getCompanyStats(companyId);
    return res.status(200).json({
      success: true,
      message: 'Blog statistics fetched successfully',
      data: { stats },
      stats,
    });
  } catch (error) {
    logger.error(`Error in getBlogStats: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error fetching blog statistics',
    });
  }
};

exports.bulkUpdateBlogStatus = async (req, res) => {
  try {
    const { blogIds, status } = req.body;

    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of blog IDs',
      });
    }

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be draft, published, or archived',
      });
    }

    const invalidIds = blogIds.filter((blogId) => !isObjectId(blogId));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid blog IDs: ${invalidIds.join(', ')}`,
      });
    }

    const query = { _id: { $in: blogIds } };
    if (req.user.role !== 'admin') query.authorId = req.user._id;

    const update = {
      status,
      ...(status === 'published' ? { publishedAt: new Date() } : {}),
      ...(status !== 'published' ? { featured: false } : {}),
    };

    const result = await Blog.updateMany(query, update);

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} blog(s) updated to ${status}`,
      data: { updatedCount: result.modifiedCount },
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error(`Error in bulkUpdateBlogStatus: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Error updating blogs',
    });
  }
};
