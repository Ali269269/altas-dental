const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { buildAdminSession } = require('./rbacHelpers');

exports.generateToken = (admin) => {
  const id = admin?._id || admin?.id || admin;
  const authVersion = admin?.authVersion || 0;
  return jwt.sign({ id, av: authVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.sendTokenResponse = async (admin, statusCode, res) => {
  const token = exports.generateToken(admin);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const session = await buildAdminSession(admin);

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    admin: session,
  });
};

exports.verifySession = async (adminId) => {
  const admin = await Admin.findById(adminId).populate('roleId');
  if (!admin || !admin.isActive) return null;
  return buildAdminSession(admin);
};
