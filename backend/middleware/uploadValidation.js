const path = require('path');

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
]);

const ALLOWED_CLINICAL_MIMES = new Set([
  ...ALLOWED_IMAGE_MIMES,
  'application/pdf',
]);

const ALLOWED_CLINICAL_EXTENSIONS = new Set([
  ...ALLOWED_IMAGE_EXTENSIONS,
  '.pdf',
]);

function extensionOf(filename) {
  return path.extname(String(filename || '')).toLowerCase();
}

function isAllowedImageMime(mime) {
  return (
    ALLOWED_IMAGE_MIMES.has(mime)
    || mime === 'image/jpg'
    || mime === 'image/pjpeg'
  );
}

function imageFileFilter(_req, file, cb) {
  const ext = extensionOf(file.originalname);
  const mime = String(file.mimetype || '').toLowerCase();
  const ok =
    isAllowedImageMime(mime)
    && (ALLOWED_IMAGE_EXTENSIONS.has(ext) || !ext);
  cb(null, ok);
}

function clinicalFileFilter(_req, file, cb) {
  const ext = extensionOf(file.originalname);
  const mime = String(file.mimetype || '').toLowerCase();
  const ok = ALLOWED_CLINICAL_MIMES.has(mime) && ALLOWED_CLINICAL_EXTENSIONS.has(ext);
  cb(null, ok);
}

function safeUploadFilename(originalname) {
  const ext = extensionOf(originalname);
  const allowed = [...ALLOWED_CLINICAL_EXTENSIONS, ...ALLOWED_IMAGE_EXTENSIONS];
  const safeExt = allowed.includes(ext) ? ext : '';
  return `${Date.now()}-${require('crypto').randomBytes(8).toString('hex')}${safeExt}`;
}

module.exports = {
  imageFileFilter,
  clinicalFileFilter,
  safeUploadFilename,
};
