const EmailTemplate = require('../models/EmailTemplate');
const { SYSTEM_EMAIL_TEMPLATES } = require('./systemEmailTemplates');

async function seedSystemEmailTemplates() {
  for (const template of SYSTEM_EMAIL_TEMPLATES) {
    await EmailTemplate.findOneAndUpdate(
      { key: template.key },
      {
        $setOnInsert: {
          key: template.key,
          title: template.title,
          isSystem: true,
          patientEmailType: template.patientEmailType,
          subject: template.subject,
          headerTitle: template.headerTitle,
          headerSubtitle: template.headerSubtitle,
          statusLabel: template.statusLabel,
          body: template.body,
          bodyPlain: template.bodyPlain,
          ctaLabel: template.ctaLabel,
          footerNote: template.footerNote,
          usedTimes: 0,
          lastUsedAt: null,
        },
      },
      { upsert: true }
    );

    await EmailTemplate.updateOne(
      {
        key: template.key,
        $or: [{ bodyPlain: { $exists: false } }, { bodyPlain: '' }],
      },
      { $set: { bodyPlain: template.bodyPlain } }
    );
  }
}

module.exports = { seedSystemEmailTemplates };
