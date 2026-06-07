const BLOG_CATEGORIES = [
  'Dentisterie Esthétique',
  'Réhabilitation totale du sourire',
  'Implantologie',
  'Orthodontie',
  'Aligneurs',
  'Parodontologie',
  'Endodontie',
  'Chirurgie orale',
  'Pédodontie',
  'Prothèse dentaire',
];

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function formatDashboardDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

function formatPublicDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatViewsLabel(count) {
  const n = Number(count) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M Viewers`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K Viewers`;
  return `${n} Viewer${n === 1 ? '' : 's'}`;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPagination(page, limit, total) {
  const safeLimit = Math.max(1, limit);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    from: total === 0 ? 0 : (safePage - 1) * safeLimit + 1,
    to: Math.min(safePage * safeLimit, total),
  };
}

module.exports = {
  BLOG_CATEGORIES,
  slugify,
  formatDashboardDate,
  formatPublicDate,
  formatViewsLabel,
  escapeRegex,
  buildPagination,
};
