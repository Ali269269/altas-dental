const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { imageFileFilter, safeUploadFilename } = require('./uploadValidation');

const profileRoot = path.join(__dirname, '..', 'uploads', 'profiles');

fs.mkdirSync(profileRoot, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, profileRoot);
  },
  filename(_req, file, cb) {
    cb(null, `profile-${safeUploadFilename(file.originalname)}`);
  },
});

const profilePhotoUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: imageFileFilter,
}).single('photo');

module.exports = { profilePhotoUpload, profileRoot };
