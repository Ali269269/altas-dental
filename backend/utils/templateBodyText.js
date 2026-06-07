function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*/gi, '\n\n')
    .replace(/<\/div>\s*/gi, '\n')
    .replace(/<strong>/gi, '')
    .replace(/<\/strong>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function plainTextToEmailBodyHtml(plain) {
  return plain
    .split(/\n\n+/)
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^\{\{[\w]+\}\}$/.test(trimmed)) return trimmed;
      const inner = trimmed
        .split('\n')
        .map(line => {
          const lineTrimmed = line.trim();
          if (/^\{\{[\w]+\}\}$/.test(lineTrimmed)) return lineTrimmed;
          return escapeHtml(line);
        })
        .join('<br/>');
      return `<p style="margin:0 0 16px;">${inner}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

function templateDisplayBody(template) {
  const bodyPlain = String(template.bodyPlain || '').trim();
  if (bodyPlain) return bodyPlain;
  return htmlToPlainText(template.body);
}

module.exports = {
  htmlToPlainText,
  plainTextToEmailBodyHtml,
  templateDisplayBody,
};
