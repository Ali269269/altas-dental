const mongoose = require('mongoose');

const businessHourSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    start: { type: String, default: '08:00', trim: true },
    end: { type: String, default: '18:00', trim: true },
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const clinicSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
    },
    clinicName: {
      type: String,
      default: 'Atlas Dental Center',
      trim: true,
      maxlength: 120,
    },
    primaryContact: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    address: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    clinicEmail: {
      type: String,
      default: 'contact@atlasdentalcenter.com',
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    businessHours: {
      type: [businessHourSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.ClinicSettings ||
  mongoose.model('ClinicSettings', clinicSettingsSchema);
