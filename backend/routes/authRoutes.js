const express = require('express');
const {
  login,
  signup,
  getProfile,
  logout,
  getDashboard,
} = require('../controllers/authController');
const { protect, checkActiveAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/signup', signup);

// Protected routes
router.get('/profile', protect, checkActiveAdmin, getProfile);
router.get('/dashboard', protect, checkActiveAdmin, getDashboard);
router.get('/logout', protect, logout);

module.exports = router;
