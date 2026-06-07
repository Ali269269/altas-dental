const Blog = require('../models/Blog');
const {
  BLOG_CATEGORIES,
  slugify,
  formatDashboardDate,
  formatPublicDate,
  formatViewsLabel,
  escapeRegex,
  buildPagination,
} = require('../utils/blogHelpers');
const { asQueryString, pickAllowlisted } = require('../utils/securityHelpers');
const { sanitizeRichText } = require('../utils/sanitizeHtml');

function serializeAdminBlog(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    category: doc.category,
    slug: doc.slug,
    date: formatDashboardDate(doc.publishedAt || doc.createdAt),
    views: formatViewsLabel(doc.viewCount),
    viewCount: doc.viewCount,
    description: doc.description,
    quote: doc.quote || '',
    afterQuoteHeading: doc.afterQuoteHeading || '',
    afterQuoteText: doc.afterQuoteText || '',
    conclusion: doc.conclusion || '',
    imageUrl: doc.imageUrl || '',
    additionalImageUrl: doc.additionalImageUrl || '',
    additionalImageTitle: doc.additionalImageTitle || '',
    additionalImageDescription: doc.additionalImageDescription || '',
    status: doc.status,
    featured: Boolean(doc.featured),
    tag: doc.tag || '',
    seoTitle: doc.seo?.title || '',
    canonicalUrl: doc.seo?.canonicalUrl || '',
    seoDescription: doc.seo?.description || '',
    focusKeyword: doc.seo?.focusKeyword || '',
    seoSlug: doc.seo?.slug || doc.slug,
    seoSchema: doc.seo?.schema || '',
  };
}

function serializePublicBlog(doc) {
  return {
    id: doc._id.toString(),
    image: doc.imageUrl || '',
    date: formatPublicDate(doc.publishedAt || doc.createdAt),
    title: doc.title,
    slug: doc.slug,
    specialite: doc.category,
    tag: doc.tag || undefined,
    viewCount: doc.viewCount,
    category: doc.category,
  };
}

function serializePublicDetail(doc) {
  return {
    ...serializePublicBlog(doc),
    description: doc.description,
    quote: doc.quote || '',
    afterQuoteHeading: doc.afterQuoteHeading || '',
    afterQuoteText: doc.afterQuoteText || '',
    conclusion: doc.conclusion || '',
    additionalImageUrl: doc.additionalImageUrl || '',
    additionalImageTitle: doc.additionalImageTitle || '',
    additionalImageDescription: doc.additionalImageDescription || '',
    seo: {
      title: doc.seo?.title || doc.title,
      description: doc.seo?.description || '',
      canonicalUrl: doc.seo?.canonicalUrl || '',
      focusKeyword: doc.seo?.focusKeyword || '',
      schema: doc.seo?.schema || '',
    },
  };
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug || 'blog';
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Blog.exists(query);
    if (!exists) return candidate;
    suffix += 1;
  }
}

function buildAdminListQuery({ search, status, category }) {
  const query = {};

  const safeStatus = pickAllowlisted(status, ['draft', 'published', 'all'], 'all');
  if (safeStatus && safeStatus !== 'all') {
    query.status = safeStatus;
  }

  const safeCategory = asQueryString(category, 120);
  if (safeCategory && safeCategory !== 'all' && BLOG_CATEGORIES.includes(safeCategory)) {
    query.category = safeCategory;
  }

  if (search && search.trim()) {
    const term = escapeRegex(search.trim());
    query.$or = [
      { title: { $regex: term, $options: 'i' } },
      { category: { $regex: term, $options: 'i' } },
      { slug: { $regex: term, $options: 'i' } },
      { 'seo.focusKeyword': { $regex: term, $options: 'i' } },
    ];
  }

  return query;
}

function buildPublicListQuery({ search, category, featured }) {
  const query = { status: 'published' };

  const featuredValue = asQueryString(featured, 10);
  if (featuredValue === 'true') {
    query.featured = true;
  }

  const safeCategory = asQueryString(category, 120);
  if (safeCategory && safeCategory !== 'Toutes' && safeCategory !== 'all' && BLOG_CATEGORIES.includes(safeCategory)) {
    query.category = safeCategory;
  }

  if (search && search.trim()) {
    const term = escapeRegex(search.trim());
    query.$or = [
      { title: { $regex: term, $options: 'i' } },
      { category: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ];
  }

  return query;
}

function resolveSort(sort) {
  if (sort === 'popular') return { viewCount: -1, publishedAt: -1 };
  if (sort === 'recent') return { publishedAt: -1, createdAt: -1 };
  return { publishedAt: -1, createdAt: -1 };
}

function normalizeBlogPayload(body) {
  return {
    title: String(body.title || '').trim(),
    category: String(body.category || '').trim(),
    description: sanitizeRichText(String(body.description || '')),
    quote: sanitizeRichText(String(body.quote || '').trim()),
    afterQuoteHeading: String(body.afterQuoteHeading || '').trim(),
    afterQuoteText: sanitizeRichText(String(body.afterQuoteText || '').trim()),
    conclusion: sanitizeRichText(String(body.conclusion || '').trim()),
    imageUrl: String(body.imageUrl || '').trim(),
    additionalImageUrl: String(body.additionalImageUrl || '').trim(),
    additionalImageTitle: String(body.additionalImageTitle || '').trim(),
    additionalImageDescription: String(body.additionalImageDescription || '').trim(),
    tag: String(body.tag || '').trim(),
    status: body.status === 'published' ? 'published' : 'draft',
    featured: Boolean(body.featured),
    seoSlug: String(body.seoSlug || body.slug || '').trim().toLowerCase(),
    seoTitle: String(body.seoTitle || '').trim(),
    canonicalUrl: String(body.canonicalUrl || '').trim(),
    seoDescription: String(body.seoDescription || '').trim(),
    focusKeyword: String(body.focusKeyword || '').trim(),
    seoSchema: String(body.seoSchema || ''),
  };
}

function validateBlogPayload(payload, isUpdate = false) {
  const errors = [];

  if (!isUpdate || payload.title !== undefined) {
    if (!payload.title) errors.push('Title is required');
  }
  if (!isUpdate || payload.category !== undefined) {
    if (!payload.category) errors.push('Category is required');
    else if (!BLOG_CATEGORIES.includes(payload.category)) errors.push('Invalid category');
  }
  if (!isUpdate || payload.description !== undefined) {
    if (!payload.description || !payload.description.replace(/<[^>]*>/g, '').trim()) {
      errors.push('Description is required');
    }
  }

  return errors;
}

// @desc    Admin blogs overview (list + stats + pagination)
// @route   GET /api/blogs/overview
exports.getBlogsOverview = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 8));
  const search = asQueryString(req.query.search, 200);
  const status = pickAllowlisted(req.query.status, ['draft', 'published', 'all'], 'all');
  const category = asQueryString(req.query.category, 120) || 'all';

  const query = buildAdminListQuery({ search, status, category });
  const skip = (page - 1) * limit;

  const [blogs, total, published, drafts, viewsAgg] = await Promise.all([
    Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(query),
    Blog.countDocuments({ status: 'published' }),
    Blog.countDocuments({ status: 'draft' }),
    Blog.aggregate([{ $group: { _id: null, totalViews: { $sum: '$viewCount' } } }]),
  ]);

  const totalViews = viewsAgg[0]?.totalViews || 0;

  res.status(200).json({
    success: true,
    data: {
      blogs: blogs.map(serializeAdminBlog),
      pagination: buildPagination(page, limit, total),
      stats: {
        total: await Blog.countDocuments(),
        published,
        drafts,
        totalViews,
      },
      categories: BLOG_CATEGORIES,
    },
  });
};

// @desc    Get single blog (admin)
// @route   GET /api/blogs/:id
exports.getBlogById = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' });
  }

  res.status(200).json({
    success: true,
    data: serializeAdminBlog(blog),
  });
};

// @desc    Create blog
// @route   POST /api/blogs
exports.createBlog = async (req, res) => {
  const payload = normalizeBlogPayload(req.body);
  const errors = validateBlogPayload(payload);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const baseSlug = slugify(payload.seoSlug || payload.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const blog = await Blog.create({
    title: payload.title,
    slug,
    category: payload.category,
    description: payload.description,
    quote: payload.quote,
    afterQuoteHeading: payload.afterQuoteHeading,
    afterQuoteText: payload.afterQuoteText,
    conclusion: payload.conclusion,
    imageUrl: payload.imageUrl,
    additionalImageUrl: payload.additionalImageUrl,
    additionalImageTitle: payload.additionalImageTitle,
    additionalImageDescription: payload.additionalImageDescription,
    tag: payload.tag,
    status: payload.status,
    featured: payload.featured,
    publishedAt: payload.status === 'published' ? new Date() : null,
    createdBy: req.admin?._id || null,
    seo: {
      title: payload.seoTitle,
      canonicalUrl: payload.canonicalUrl,
      description: payload.seoDescription,
      focusKeyword: payload.focusKeyword,
      slug,
      schema: payload.seoSchema,
    },
  });

  res.status(201).json({
    success: true,
    data: serializeAdminBlog(blog),
  });
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
exports.updateBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' });
  }

  const payload = normalizeBlogPayload({ ...blog.toObject(), ...req.body });
  const errors = validateBlogPayload(payload, true);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const nextSlug = await ensureUniqueSlug(
    slugify(payload.seoSlug || payload.title),
    blog._id
  );

  const wasPublished = blog.status === 'published';
  blog.title = payload.title;
  blog.slug = nextSlug;
  blog.category = payload.category;
  blog.description = payload.description;
  blog.quote = payload.quote;
  blog.afterQuoteHeading = payload.afterQuoteHeading;
  blog.afterQuoteText = payload.afterQuoteText;
  blog.conclusion = payload.conclusion;
  blog.imageUrl = payload.imageUrl;
  blog.additionalImageUrl = payload.additionalImageUrl;
  blog.additionalImageTitle = payload.additionalImageTitle;
  blog.additionalImageDescription = payload.additionalImageDescription;
  blog.tag = payload.tag;
  blog.featured = payload.featured;
  blog.status = payload.status;

  if (payload.status === 'published' && !wasPublished) {
    blog.publishedAt = new Date();
  }
  if (payload.status === 'draft') {
    blog.publishedAt = blog.publishedAt || null;
  }

  blog.seo = {
    title: payload.seoTitle,
    canonicalUrl: payload.canonicalUrl,
    description: payload.seoDescription,
    focusKeyword: payload.focusKeyword,
    slug: nextSlug,
    schema: payload.seoSchema,
  };

  await blog.save();

  res.status(200).json({
    success: true,
    data: serializeAdminBlog(blog),
  });
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
exports.deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' });
  }

  await blog.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Blog deleted successfully',
  });
};

// @desc    Update blog status (publish / unpublish)
// @route   PATCH /api/blogs/:id/status
exports.updateBlogStatus = async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' });
  }

  if (status === 'published' && !blog.imageUrl) {
    return res.status(400).json({
      success: false,
      message: 'A cover image is required before publishing',
    });
  }

  blog.status = status;
  if (status === 'published' && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }
  if (status === 'draft') {
    blog.featured = false;
  }

  await blog.save();

  res.status(200).json({
    success: true,
    data: serializeAdminBlog(blog),
  });
};

// @desc    Toggle featured flag (Meilleurs Choix)
// @route   PATCH /api/blogs/:id/featured
exports.updateBlogFeatured = async (req, res) => {
  const { featured } = req.body;
  if (typeof featured !== 'boolean') {
    return res.status(400).json({ success: false, message: 'featured must be a boolean' });
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' });
  }

  if (featured && blog.status !== 'published') {
    return res.status(400).json({
      success: false,
      message: 'Only published blogs can be featured',
    });
  }

  blog.featured = featured;
  await blog.save();

  res.status(200).json({
    success: true,
    data: serializeAdminBlog(blog),
  });
};

// @desc    Upload blog image
// @route   POST /api/blogs/upload-image
exports.uploadBlogImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const url = `/uploads/blogs/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: { url },
  });
};

// @desc    Public blog list (published only)
// @route   GET /api/blogs/public
exports.getPublicBlogs = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));
  const search = asQueryString(req.query.search, 200);
  const category = asQueryString(req.query.category, 120) || 'all';
  const sort = pickAllowlisted(req.query.sort, ['recent', 'popular', 'oldest'], 'recent');
  const featured = asQueryString(req.query.featured, 10);

  const query = buildPublicListQuery({ search, category, featured });
  const skip = (page - 1) * limit;

  const [blogs, total, categories] = await Promise.all([
    Blog.find(query).sort(resolveSort(sort)).skip(skip).limit(limit).lean(),
    Blog.countDocuments(query),
    Blog.distinct('category', { status: 'published' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      blogs: blogs.map(serializePublicBlog),
      pagination: buildPagination(page, limit, total),
      categories: ['Toutes', ...categories.sort()],
    },
  });
};

// @desc    Public blog by slug
// @route   GET /api/blogs/public/:slug
exports.getPublicBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({
    slug: req.params.slug,
    status: 'published',
  });

  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog not found' });
  }

  await Blog.updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } });
  blog.viewCount += 1;

  const related = await Blog.find({
    status: 'published',
    category: blog.category,
    _id: { $ne: blog._id },
  })
    .sort({ publishedAt: -1 })
    .limit(6)
    .lean();

  if (related.length < 3) {
    const filler = await Blog.find({
      status: 'published',
      _id: { $nin: [blog._id, ...related.map((r) => r._id)] },
    })
      .sort({ viewCount: -1 })
      .limit(6 - related.length)
      .lean();
    related.push(...filler);
  }

  res.status(200).json({
    success: true,
    data: {
      blog: serializePublicDetail(blog),
      related: related.map(serializePublicBlog),
    },
  });
};
