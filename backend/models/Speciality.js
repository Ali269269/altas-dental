const mongoose = require('mongoose');

const bulletSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    text: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const accordionCardSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    accent: { type: String, trim: true, default: '#7B2D3E' },
  },
  { _id: false }
);

const specialitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a specialty title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    heroSubtitle: {
      type: String,
      trim: true,
      default: '',
    },
    heroImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    heading1: {
      type: String,
      trim: true,
      default: '',
    },
    image1Url: {
      type: String,
      trim: true,
      default: '',
    },
    description1: {
      type: String,
      default: '',
    },
    bullets: {
      type: [bulletSchema],
      default: [],
    },
    heading2: {
      type: String,
      trim: true,
      default: '',
    },
    accordionCards: {
      type: [accordionCardSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    order: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

specialitySchema.index({ status: 1, order: 1, title: 1 });

module.exports = mongoose.model('Speciality', specialitySchema);
