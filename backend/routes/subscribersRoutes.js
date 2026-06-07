const express = require('express');
const {
  subscribeNewsletter,
  submitContactForm,
  getSubscribersOverview,
  deleteNewsletterSubscriber,
  deleteContactSubmission,
  updateContactStatus,
  sendSubscriberEmail,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} = require('../controllers/subscribersController');
const { protectedRoute } = require('../middleware/protectedRoute');
const { publicFormLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public
router.post('/newsletter', publicFormLimiter, subscribeNewsletter);
router.post('/contact', publicFormLimiter, submitContactForm);

// Admin
router.get('/overview', ...protectedRoute('subscribers', 'view'), getSubscribersOverview);
router.delete('/newsletter/:id', ...protectedRoute('subscribers', 'edit'), deleteNewsletterSubscriber);
router.delete('/contact/:id', ...protectedRoute('subscribers', 'edit'), deleteContactSubmission);
router.put('/contact/:id/status', ...protectedRoute('subscribers', 'edit'), updateContactStatus);
router.post('/send-email', ...protectedRoute('subscribers', 'edit'), sendSubscriberEmail);
router.post('/templates', ...protectedRoute('subscribers', 'edit'), createEmailTemplate);
router.put('/templates/:id', ...protectedRoute('subscribers', 'edit'), updateEmailTemplate);
router.delete('/templates/:id', ...protectedRoute('subscribers', 'edit'), deleteEmailTemplate);

module.exports = router;
