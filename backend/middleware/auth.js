const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check if token is in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).populate('roleId');

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Session invalid',
      });
    }

    if (!req.admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is disabled',
      });
    }

    const tokenAuthVersion = Number(decoded.av || 0);
    const currentAuthVersion = Number(req.admin.authVersion || 0);
    if (tokenAuthVersion !== currentAuthVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }

    if (
      req.admin.passwordChangedAt
      && decoded.iat
      && decoded.iat * 1000 < req.admin.passwordChangedAt.getTime() - 2000
    ) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Middleware to check if admin is active
exports.checkActiveAdmin = (req, res, next) => {
  if (!req.admin.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account is disabled',
    });
  }
  next();
};
