const { formatLongDate } = require('./dashboardHelpers');
const { templateDisplayBody } = require('./templateBodyText');

function formatTemplateDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}·${m}·${day}`;
}

function withSerialNumber(rows, mapper) {
  return rows.map((row, index) => mapper(row, index));
}

function mapSubscriberRow(subscriber, index) {
  return {
    id: subscriber._id.toString(),
    srNo: String(index + 1).padStart(2, '0'),
    email: subscriber.email,
    date: formatLongDate(subscriber.createdAt),
    status: subscriber.status,
    createdAt: subscriber.createdAt,
  };
}

function mapContactRow(contact, index) {
  return {
    id: contact._id.toString(),
    srNo: String(index + 1).padStart(2, '0'),
    name: contact.name,
    email: contact.email,
    message: contact.message,
    date: formatLongDate(contact.createdAt),
    status: contact.status,
    createdAt: contact.createdAt,
  };
}

function mapTemplateRow(template) {
  const bodyPlain = String(template.bodyPlain || '').trim();
  return {
    id: template._id.toString(),
    key: template.key || '',
    title: template.title,
    body: template.body,
    bodyPlain,
    displayBody: templateDisplayBody(template),
    subject: template.subject || '',
    headerTitle: template.headerTitle || '',
    isSystem: Boolean(template.isSystem),
    patientEmailType: template.patientEmailType || 'none',
    created: formatTemplateDate(template.createdAt),
    lastUsed: formatTemplateDate(template.lastUsedAt || template.createdAt),
    usedTimes: template.usedTimes || 0,
  };
}

module.exports = {
  mapSubscriberRow,
  mapContactRow,
  mapTemplateRow,
  withSerialNumber,
};
