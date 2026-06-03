function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderActionResultPage({ title, message, variant }) {
  const accent = variant === 'success' ? '#3DAA7A' : variant === 'error' ? '#C94A3A' : '#591727';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)} — Atlas Dental Center</title>
</head>
<body style="margin:0;padding:40px 20px;background:#f4eee1;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:36px 32px;border:1px solid #e8ddd4;box-shadow:0 12px 40px rgba(89,23,39,0.08);">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#7A6040;">Atlas Dental Center</p>
    <h1 style="margin:0 0 16px;font-size:24px;color:${accent};">${escapeHtml(title)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#591727;">${message}</p>
    <a href="${escapeHtml(process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:3000')}/dashboard/Appointments"
       style="display:inline-block;padding:12px 24px;background:#591727;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;">
      Open admin dashboard
    </a>
  </div>
</body>
</html>`;
}

module.exports = { renderActionResultPage, escapeHtml };
