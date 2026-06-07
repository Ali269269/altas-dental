function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Coerce query/body values to plain strings — blocks NoSQL operator injection. */
function asQueryString(value, maxLength = 200) {
  if (value == null) return '';
  if (typeof value === 'object') return '';
  const str = String(value).trim();
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}

function pickAllowlisted(value, allowlist, fallback = '') {
  const str = asQueryString(value, 100);
  return allowlist.includes(str) ? str : fallback;
}

function clientErrorMessage(err, fallback = 'Server Error') {
  if (process.env.NODE_ENV === 'production') {
    return fallback;
  }
  return err?.message || fallback;
}

module.exports = {
  escapeRegex,
  asQueryString,
  pickAllowlisted,
  clientErrorMessage,
};
