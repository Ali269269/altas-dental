const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { clinicalFileFilter, safeUploadFilename } = require('./uploadValidation');

const clinicalRoot = path.join(__dirname, '..', 'uploads', 'clinical');

function appointmentUploadDir(appointmentId) {
  const dir = path.join(clinicalRoot, String(appointmentId));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    try {
      cb(null, appointmentUploadDir(req.params.id));
    } catch (err) {
      cb(err);
    }
  },
  filename(_req, file, cb) {
    cb(null, safeUploadFilename(file.originalname));
  },
});

const clinicalScanUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
  fileFilter: clinicalFileFilter,
}).array('scans', 8);

module.exports = { clinicalScanUpload, clinicalRoot };
