const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator(value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Please provide a valid email',
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT'],
      default: 'PENDING',
    },
    lastEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ createdAt: -1 });
newsletterSubscriberSchema.index({ status: 1 });

module.exports =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
