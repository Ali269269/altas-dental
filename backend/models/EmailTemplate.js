const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a template title'],
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    patientEmailType: {
      type: String,
      enum: [
        'none',
        'reminder',
        'follow_up',
        'treatment_summary',
        'book_appointment',
        'appointment_due',
      ],
      default: 'none',
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    headerTitle: {
      type: String,
      default: '',
      trim: true,
    },
    headerSubtitle: {
      type: String,
      default: '',
      trim: true,
    },
    statusLabel: {
      type: String,
      default: '',
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Please provide template body'],
      default: '',
    },
    bodyPlain: {
      type: String,
      default: '',
    },
    ctaLabel: {
      type: String,
      default: '',
      trim: true,
    },
    footerNote: {
      type: String,
      default: '',
      trim: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    usedTimes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

emailTemplateSchema.index({ updatedAt: -1 });
emailTemplateSchema.index({ isSystem: 1 });

module.exports =
  mongoose.models.EmailTemplate ||
  mongoose.model('EmailTemplate', emailTemplateSchema);
