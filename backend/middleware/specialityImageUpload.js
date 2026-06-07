const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { imageFileFilter, safeUploadFilename } = require('./uploadValidation');

const specialityRoot = path.join(__dirname, '..', 'uploads', 'specialities');

fs.mkdirSync(specialityRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, specialityRoot);
  },
  filename(_req, file, cb) {
    cb(null, safeUploadFilename(file.originalname));
  },
});

const specialityImageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
}).single('image');

module.exports = { specialityImageUpload, specialityRoot };
