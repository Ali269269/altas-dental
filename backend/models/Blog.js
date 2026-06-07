const mongoose = require('mongoose');
const { BLOG_CATEGORIES } = require('../utils/blogHelpers');

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    canonicalUrl: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    focusKeyword: { type: String, trim: true, default: '' },
    slug: { type: String, trim: true, default: '' },
    schema: { type: String, default: '' },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: BLOG_CATEGORIES,
    },
    description: {
      type: String,
      required: [true, 'Please provide blog content'],
      default: '',
    },
    quote: {
      type: String,
      trim: true,
      default: '',
    },
    afterQuoteHeading: {
      type: String,
      trim: true,
      default: '',
    },
    afterQuoteText: {
      type: String,
      trim: true,
      default: '',
    },
    conclusion: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    additionalImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    additionalImageTitle: {
      type: String,
      trim: true,
      default: '',
    },
    additionalImageDescription: {
      type: String,
      trim: true,
      default: '',
    },
    tag: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', 'seo.focusKeyword': 'text' });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ status: 1, viewCount: -1 });
blogSchema.index({ status: 1, category: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);
