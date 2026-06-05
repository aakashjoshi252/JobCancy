const express = require('express');
const blogRouter = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/auth.middleware');
const { isAdminOrRecruiter } = require('../middlewares/admin.middleware');
const { uploadBlogImage } = require('../config/cloudinary');
const blogController = require('../controllers/blog.controller');
const User = require('../models/user.model');

const optionalProtect = async (req, _res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user && user.accountStatus !== 'Blocked') {
      req.user = user;
    }
  } catch (_error) {
    // Public blog reads should not fail because a stale optional token exists.
  }

  return next();
};

// Public discovery routes.
blogRouter.get('/categories', blogController.getBlogCategories);
blogRouter.get('/tags', blogController.getBlogTags);
blogRouter.get('/featured', blogController.getFeaturedBlogs);
blogRouter.get('/trending', blogController.getTrendingBlogs);
blogRouter.get('/popular', blogController.getPopularBlogs);
blogRouter.get('/published', blogController.getPublishedBlogs);
blogRouter.get('/search', blogController.searchBlogs);
blogRouter.get('/category/:category', blogController.getBlogsByCategory);
blogRouter.get('/slug/:slug', optionalProtect, blogController.getBlogBySlug);
blogRouter.get('/related/:id', blogController.getRelatedBlogs);
blogRouter.get('/:id/comments', blogController.getBlogComments);
blogRouter.post('/:id/share', blogController.incrementBlogShare);
blogRouter.get('/', blogController.getAllBlogs);

// Protected read routes with path segments must be declared before "/:id".
blogRouter.get('/company/:companyId', protect, isAdminOrRecruiter, blogController.getCompanyBlogs);
blogRouter.get('/stats/:companyId', protect, isAdminOrRecruiter, blogController.getBlogStats);
blogRouter.get('/my/blogs', protect, blogController.getMyBlogs);
blogRouter.get('/manage/all', protect, isAdminOrRecruiter, blogController.getManageBlogs);

blogRouter.get('/:id', optionalProtect, blogController.getBlogById);

// Protected routes.
blogRouter.use(protect);

blogRouter.post(
  '/upload-image',
  isAdminOrRecruiter,
  uploadBlogImage.fields([
    { name: 'image', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  blogController.uploadBlogImage
);
blogRouter.post('/categories/:key/follow', blogController.followCategory);

blogRouter.post('/', isAdminOrRecruiter, blogController.createBlog);
blogRouter.patch('/bulk/status', isAdminOrRecruiter, blogController.bulkUpdateBlogStatus);
blogRouter.put('/:id', isAdminOrRecruiter, blogController.updateBlog);
blogRouter.patch('/:id', isAdminOrRecruiter, blogController.updateBlog);
blogRouter.delete('/:id', isAdminOrRecruiter, blogController.deleteBlog);

blogRouter.post('/:id/like', blogController.toggleBlogLike);
blogRouter.post('/:id/bookmark', blogController.toggleBlogBookmark);
blogRouter.post('/:id/comments', blogController.createBlogComment);
blogRouter.delete('/:id/comments/:commentId', blogController.deleteBlogComment);

module.exports = blogRouter;
