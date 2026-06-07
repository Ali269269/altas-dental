const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const notificationSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      default: () => randomUUID(),
    },
    type: {
      type: String,
      enum: [
        'APPOINTMENT_BOOKED',
        'APPOINTMENT_UPDATED',
        'NEWSLETTER_SUBSCRIPTION',
        'CONTACT_FORM_SUBMISSION',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    patientName: {
      type: String,
      trim: true,
      default: '',
    },
    service: {
      type: String,
      trim: true,
      default: '',
    },
    appointmentDate: {
      type: Date,
      default: null,
    },
    appointmentTime: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsletterSubscriber',
      default: null,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContactSubmission',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
