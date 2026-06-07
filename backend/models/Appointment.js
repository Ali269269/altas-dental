const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Please provide patient name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      lowercase: true,
      trim: true,
      validate: {
        validator(value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: 'Please provide a valid email',
      },
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Please select a specialty'],
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Please provide appointment date'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Please provide appointment time'],
      // Format: "HH:MM AM/PM" or "HH:MM"
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'PENDING', 'CONFIRMED', 'SEEN', 'COMPLETED', 'CANCELLED'],
      default: 'NEW',
    },
    cancellationReason: {
      type: String,
      default: '',
      trim: true,
    },
    checkup: {
      complaint: { type: String, default: '' },
      clinicalObs: { type: String, default: '' },
      primaryDiagnosis: { type: String, default: '' },
      diagnostics: [
        {
          label: { type: String, required: true },
          tag: { type: Boolean, default: false },
        },
      ],
      treatment: [{ type: String }],
      prescriptions: { type: String, default: '' },
      followUp: { type: String, default: '' },
      postOpInstructions: [{ type: String }],
      additionalNotes: { type: String, default: '' },
      scanNames: [{ type: String }],
      scans: [
        {
          storedName: { type: String, required: true },
          originalName: { type: String, default: '' },
          mimeType: { type: String, default: '' },
          size: { type: Number, default: 0 },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      completedAt: { type: Date },
    },
    isNewPatient: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.Appointment ||
  mongoose.model('Appointment', appointmentSchema);
