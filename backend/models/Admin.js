const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { randomUUID } = require('crypto');

const adminSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      default: () => randomUUID(),
      index: true,
    },
    email: {

      type: String,

      required: [true, 'Please provide an email'],

      unique: true,

      lowercase: true,

      match: [

        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,

        'Please provide a valid email',

      ],

    },

    password: {

      type: String,

      required: [true, 'Please provide a password'],

      minlength: 6,

      select: false,

    },

    firstName: {

      type: String,

      default: '',

    },

    lastName: {

      type: String,

      default: '',

    },

    displayName: {

      type: String,

      default: '',

      trim: true,

      maxlength: 120,

    },

    professionalTitle: {

      type: String,

      default: '',

      trim: true,

      maxlength: 120,

    },

    phone: {

      type: String,

      default: '',

      trim: true,

      maxlength: 40,

    },

    profilePhoto: {

      type: String,

      default: '',

      trim: true,

    },

    twoFactorEnabled: {

      type: Boolean,

      default: false,

    },

    alertPreferences: {

      appointmentSms: { type: Boolean, default: true },

      clinicReports: { type: Boolean, default: true },

      marketingEmails: { type: Boolean, default: false },

    },

    passwordChangedAt: {

      type: Date,

      default: null,

    },

    authVersion: {

      type: Number,

      default: 0,

    },

    roleId: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'Role',

      default: null,

      index: true,

    },

    isSuperAdmin: {

      type: Boolean,

      default: false,

      index: true,

    },

    canChangePassword: {

      type: Boolean,

      default: false,

    },

    isActive: {

      type: Boolean,

      default: true,

    },

    lastLogin: {

      type: Date,

      default: null,

    },

  },

  {

    timestamps: true,

  }

);



adminSchema.pre('save', async function (next) {

  if (!this.isModified('password')) {

    return next();

  }

  this.passwordChangedAt = new Date();

  try {

    const salt = await bcryptjs.genSalt(10);

    this.password = await bcryptjs.hash(this.password, salt);

    next();

  } catch (error) {

    next(error);

  }

});



adminSchema.methods.matchPassword = async function (enteredPassword) {

  return await bcryptjs.compare(enteredPassword, this.password);

};



module.exports = mongoose.model('Admin', adminSchema);


