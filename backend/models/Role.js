const mongoose = require('mongoose');
const { MODULE_KEYS } = require('../constants/dashboardModules');

const permissionSchema = new mongoose.Schema(
  {
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    accessLevel: {
      type: String,
      enum: ['Full', 'Limited'],
      default: 'Limited',
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: Map,
      of: permissionSchema,
      default: () => new Map(),
    },
  },
  { timestamps: true }
);

roleSchema.methods.toPermissionObject = function toPermissionObject() {
  const result = {};
  MODULE_KEYS.forEach((key) => {
    const value = this.permissions?.get?.(key) || this.permissions?.[key];
    result[key] = {
      view: Boolean(value?.view),
      edit: Boolean(value?.edit),
    };
  });
  return result;
};

module.exports = mongoose.model('Role', roleSchema);
