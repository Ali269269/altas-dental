const { BRAND } = require('./emailBrand');

/**
 * Canonical system templates — content mirrors patient email layouts in emailService.
 * Stored in DB on seed; edits in admin UI override DB copy while keeping structure.
 */
const SYSTEM_EMAIL_TEMPLATES = [
  {
    key: 'book_appointment',
    title: 'Book Your Appointment Today',
    isSystem: true,
    patientEmailType: 'book_appointment',
    subject: 'Book your appointment today — Atlas Dental Center',
    headerTitle: 'Book Your Appointment Today',
    headerSubtitle: 'Schedule your visit with Atlas Dental Center',
    statusLabel: 'Booking',
    bodyPlain: `Dear {{patientName}},

We would love to welcome you at Atlas Dental Center. You can book your next appointment online in just a few minutes — choose the service and time that works best for you.

{{appointmentSummary}}

If you have questions before booking, our team is happy to help. We look forward to caring for your smile.`,
    body: `<p style="margin:0 0 16px;">Dear <strong>{{patientName}}</strong>,</p>
<p style="margin:0 0 16px;">We would love to welcome you at Atlas Dental Center. You can book your next appointment online in just a few minutes — choose the service and time that works best for you.</p>
{{appointmentSummary}}
<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">If you have questions before booking, our team is happy to help. We look forward to caring for your smile.</p>`,
    ctaLabel: 'Book your appointment online',
    footerNote:
      'Thank you for choosing Atlas Dental Center. This is an automated message — please contact the clinic for assistance.',
  },
  {
    key: 'appointment_due',
    title: 'Your Appointment is Due',
    isSystem: true,
    patientEmailType: 'appointment_due',
    subject: 'Your appointment is due — Atlas Dental Center',
    headerTitle: 'Your Appointment is Due',
    headerSubtitle: 'Your scheduled visit is approaching',
    statusLabel: 'Due soon',
    bodyPlain: `Dear {{patientName}},

This is a reminder that your appointment at Atlas Dental Center is coming up soon. Please arrive a few minutes early and bring any relevant medical documents if applicable.

{{appointmentSummary}}

We look forward to seeing you on {{dateLabel}} at {{appointmentTime}}. If you need to reschedule, use the button below.`,
    body: `<p style="margin:0 0 16px;">Dear <strong>{{patientName}}</strong>,</p>
<p style="margin:0 0 16px;">This is a reminder that your appointment at Atlas Dental Center is coming up soon. Please arrive a few minutes early and bring any relevant medical documents if applicable.</p>
{{appointmentSummary}}
<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">We look forward to seeing you on <strong>{{dateLabel}}</strong> at <strong>{{appointmentTime}}</strong>. If you need to reschedule, use the button below.</p>`,
    ctaLabel: 'View or reschedule online',
    footerNote:
      'This message was sent by Atlas Dental Center. If you already completed or cancelled this visit, please contact the clinic.',
  },
  {
    key: 'follow_up',
    title: 'You Need a Follow-Up',
    isSystem: true,
    patientEmailType: 'follow_up',
    subject: 'Follow-up instructions — Atlas Dental Center',
    headerTitle: 'Follow-up Instructions',
    headerSubtitle: 'Next steps after your visit',
    statusLabel: 'Follow-up',
    bodyPlain: `Dear {{patientName}},

Please find your follow-up instructions from your recent visit below.

{{followUpBox}}

{{clinicalRecord}}`,
    body: `<p style="margin:0 0 16px;">Dear <strong>{{patientName}}</strong>,</p>
<p style="margin:0 0 16px;">Please find your follow-up instructions from your recent visit below.</p>
{{followUpBox}}
{{clinicalRecord}}`,
    ctaLabel: 'Book or manage appointments',
    footerNote:
      'This message was sent by Atlas Dental Center. Contact the clinic for urgent concerns.',
  },
  {
    key: 'reminder',
    title: 'Reminder Email',
    isSystem: true,
    patientEmailType: 'reminder',
    subject: 'Reminder: your upcoming appointment — Atlas Dental Center',
    headerTitle: 'Appointment Reminder',
    headerSubtitle: 'Your visit is coming up soon',
    statusLabel: 'Scheduled',
    bodyPlain: `Dear {{patientName}},

This is a friendly reminder about your upcoming visit at Atlas Dental Center. Please arrive a few minutes early. If you need to reschedule, use the link below.

{{appointmentSummary}}

We look forward to seeing you on {{dateLabel}} at {{appointmentTime}}.`,
    body: `<p style="margin:0 0 16px;">Dear <strong>{{patientName}}</strong>,</p>
<p style="margin:0 0 16px;">This is a friendly reminder about your upcoming visit at Atlas Dental Center. Please arrive a few minutes early. If you need to reschedule, use the link below.</p>
{{appointmentSummary}}
<p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">We look forward to seeing you on <strong>{{dateLabel}}</strong> at <strong>{{appointmentTime}}</strong>.</p>`,
    ctaLabel: 'View or reschedule online',
    footerNote:
      'This reminder was sent by Atlas Dental Center. If you already completed or cancelled this visit, please contact the clinic.',
  },
  {
    key: 'clinical_summary',
    title: 'Clinical Notes Summary',
    isSystem: true,
    patientEmailType: 'treatment_summary',
    subject: 'Treatment summary — Atlas Dental Center',
    headerTitle: 'Treatment Summary',
    headerSubtitle: 'Your complete clinical record',
    statusLabel: 'Summary',
    bodyPlain: `Dear {{patientName}},

Here is your complete clinical record from your recent visit at Atlas Dental Center. Download imaging files using the links in the Diagnostics & imaging section below (files are also attached).

{{appointmentSummary}}

{{clinicalRecord}}`,
    body: `<p style="margin:0 0 16px;">Dear <strong>{{patientName}}</strong>,</p>
<p style="margin:0 0 16px;color:${BRAND.maroon};">Here is your complete clinical record from your recent visit at Atlas Dental Center. Download imaging files using the links in the Diagnostics &amp; imaging section below (files are also attached).</p>
{{appointmentSummary}}
{{clinicalRecord}}`,
    ctaLabel: 'Book or manage appointments',
    footerNote:
      'This summary was sent by Atlas Dental Center for your records. Download links and attachments include clinical imaging when provided.',
  },
];

const PATIENT_EMAIL_TYPE_TO_KEY = {
  reminder: 'reminder',
  follow_up: 'follow_up',
  followup: 'follow_up',
  treatment_summary: 'clinical_summary',
  summary: 'clinical_summary',
  book_appointment: 'book_appointment',
  appointment_due: 'appointment_due',
};

module.exports = {
  SYSTEM_EMAIL_TEMPLATES,
  PATIENT_EMAIL_TYPE_TO_KEY,
};
