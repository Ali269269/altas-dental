const express = require('express');
const { protectedRoute } = require('../middleware/protectedRoute');
const { blogImageUpload } = require('../middleware/blogImageUpload');
const {
  getBlogsOverview,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  updateBlogFeatured,
  uploadBlogImage,
  getPublicBlogs,
  getPublicBlogBySlug,
} = require('../controllers/blogController');

const router = express.Router();

// Public routes
router.get('/public', getPublicBlogs);
router.get('/public/:slug', getPublicBlogBySlug);

// Admin routes
router.get('/overview', ...protectedRoute('blogs', 'view'), getBlogsOverview);
router.post('/upload-image', ...protectedRoute('blogs', 'edit'), (req, res, next) => {
  blogImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
      });
    }
    next();
  });
}, uploadBlogImage);
router.post('/', ...protectedRoute('blogs', 'edit'), createBlog);
router.get('/:id', ...protectedRoute('blogs', 'view'), getBlogById);
router.put('/:id', ...protectedRoute('blogs', 'edit'), updateBlog);
router.patch('/:id/status', ...protectedRoute('blogs', 'edit'), updateBlogStatus);
router.patch('/:id/featured', ...protectedRoute('blogs', 'edit'), updateBlogFeatured);
router.delete('/:id', ...protectedRoute('blogs', 'edit'), deleteBlog);

module.exports = router;
