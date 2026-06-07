const mongoose = require('mongoose');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ContactSubmission = require('../models/ContactSubmission');
const EmailTemplate = require('../models/EmailTemplate');
const Notification = require('../models/Notification');
const { sendSubscriberEmail } = require('../utils/emailService');
const {
  mapSubscriberRow,
  mapContactRow,
  mapTemplateRow,
  withSerialNumber,
} = require('../utils/subscribersPageHelpers');
const { plainTextToEmailBodyHtml } = require('../utils/templateBodyText');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function buildSubscribersOverview() {
  const [subscribersRaw, contactsRaw, templatesRaw] = await Promise.all([
    NewsletterSubscriber.find().sort({ createdAt: -1 }).lean(),
    ContactSubmission.find().sort({ createdAt: -1 }).lean(),
    EmailTemplate.find().sort({ updatedAt: -1 }).lean(),
  ]);

  return {
    subscribers: withSerialNumber(subscribersRaw, mapSubscriberRow),
    contacts: withSerialNumber(contactsRaw, mapContactRow),
    templates: templatesRaw.map(mapTemplateRow),
    metadata: {
      subscriberCount: subscribersRaw.length,
      contactCount: contactsRaw.length,
      templateCount: templatesRaw.length,
      lastUpdated: new Date().toISOString(),
    },
  };
}

// @desc    Public newsletter subscription
// @route   POST /api/subscribers/newsletter
// @access  Public
exports.subscribeNewsletter = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again shortly.',
      });
    }

    const email = normalizeEmail(req.body.email);
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: 'You have successfully subscribed',
      });
    }

    const subscriber = await NewsletterSubscriber.create({ email, status: 'PENDING' });

    try {
      await Notification.create({
        type: 'NEWSLETTER_SUBSCRIPTION',
        title: 'New newsletter subscription',
        message: `${email} subscribed to the newsletter`,
        email,
        subscriberId: subscriber._id,
        isRead: false,
      });
    } catch (notifError) {
      console.error('Newsletter notification create failed:', notifError.message || notifError);
    }

    return res.status(201).json({
      success: true,
      message: 'You have successfully subscribed',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: 'You have successfully subscribed',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to subscribe. Please try again.',
    });
  }
};

// @desc    Public contact form submission
// @route   POST /api/subscribers/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Please try again shortly.',
      });
    }

    const name = String(req.body.name || req.body.nom || '').trim();
    const email = normalizeEmail(req.body.email);
    const message = String(req.body.message || '').trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name.',
      });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message.',
      });
    }
    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot exceed 5000 characters.',
      });
    }

    const contact = await ContactSubmission.create({ name, email, message, status: 'Contact' });

    try {
      await Notification.create({
        type: 'CONTACT_FORM_SUBMISSION',
        title: 'New contact form submission',
        message: message,
        patientName: name,
        email,
        contactId: contact._id,
        isRead: false,
      });
    } catch (notifError) {
      console.error('Contact notification create failed:', notifError.message || notifError);
    }

    return res.status(201).json({
      success: true,
      message: 'Your form has been submitted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit the form. Please try again.',
    });
  }
};

// @desc    Subscribers dashboard overview
// @route   GET /api/subscribers/overview
// @access  Private/Admin
exports.getSubscribersOverview = async (req, res) => {
  try {
    const data = await buildSubscribersOverview();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscribers overview',
      error: error.message,
    });
  }
};

// @desc    Delete newsletter subscriber
// @route   DELETE /api/subscribers/newsletter/:id
// @access  Private/Admin
exports.deleteNewsletterSubscriber = async (req, res) => {
  try {
    const deleted = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    return res.status(200).json({ success: true, message: 'Subscriber deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contact submission
// @route   DELETE /api/subscribers/contact/:id
// @access  Private/Admin
exports.deleteContactSubmission = async (req, res) => {
  try {
    const deleted = await ContactSubmission.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Contact entry not found' });
    }
    return res.status(200).json({ success: true, message: 'Contact entry deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update contact submission status
// @route   PUT /api/subscribers/contact/:id/status
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Contacted', 'Converted', 'Contact'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Contact entry not found' });
    }

    return res.status(200).json({
      success: true,
      data: mapContactRow(updated, 0),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send email to subscriber or contact
// @route   POST /api/subscribers/send-email
// @access  Private/Admin
exports.sendSubscriberEmail = async (req, res) => {
  try {
    const to = normalizeEmail(req.body.to);
    const title = String(req.body.title || '').trim();
    const body = String(req.body.body || '').trim();
    const subscriberId = req.body.subscriberId || null;
    const templateId = req.body.templateId || null;
    const contactId = req.body.contactId || null;
    const recipientName = String(req.body.recipientName || '').trim();

    if (!to || !isValidEmail(to)) {
      return res.status(400).json({ success: false, message: 'Invalid recipient email' });
    }
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required',
      });
    }

    const emailResult = await sendSubscriberEmail({
      to,
      subject: title,
      body,
      templateId,
      recipientName,
    });

    if (!emailResult.sent && !emailResult.skipped) {
      return res.status(502).json({
        success: false,
        message: emailResult.error || 'Failed to send email',
      });
    }

    if (subscriberId) {
      await NewsletterSubscriber.findByIdAndUpdate(subscriberId, {
        status: 'SENT',
        lastEmailSentAt: new Date(),
      });
    }

    if (contactId) {
      await ContactSubmission.findByIdAndUpdate(contactId, {
        status: 'Contacted',
      });
    }

    if (templateId) {
      await EmailTemplate.findByIdAndUpdate(templateId, {
        $inc: { usedTimes: 1 },
        lastUsedAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: emailResult.skipped
        ? 'Email recorded (SMTP not configured)'
        : 'Email sent successfully',
      email: emailResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create email template
// @route   POST /api/subscribers/templates
// @access  Private/Admin
exports.createEmailTemplate = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const bodyPlain = String(req.body.bodyPlain ?? req.body.body ?? '').trim();
    if (!title || !bodyPlain) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required',
      });
    }

    const template = await EmailTemplate.create({
      title,
      body: bodyPlain,
      bodyPlain,
    });
    return res.status(201).json({
      success: true,
      data: mapTemplateRow(template.toObject()),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update email template
// @route   PUT /api/subscribers/templates/:id
// @access  Private/Admin
exports.updateEmailTemplate = async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const bodyPlain = String(req.body.bodyPlain ?? req.body.body ?? '').trim();
    if (!title || !bodyPlain) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required',
      });
    }

    const existing = await EmailTemplate.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    const usesPatientLayout =
      existing.isSystem || (existing.patientEmailType && existing.patientEmailType !== 'none');
    const body = usesPatientLayout ? plainTextToEmailBodyHtml(bodyPlain) : bodyPlain;

    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      { title, bodyPlain, body },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: mapTemplateRow(template.toObject()),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete email template
// @route   DELETE /api/subscribers/templates/:id
// @access  Private/Admin
exports.deleteEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }
    if (template.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'System email templates cannot be deleted',
      });
    }
    await template.deleteOne();
    return res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
