const express = require('express');
const { protectedRoute } = require('../middleware/protectedRoute');
const { specialityImageUpload } = require('../middleware/specialityImageUpload');
const {
  getSpecialitiesOverview,
  getSpecialityById,
  createSpeciality,
  updateSpeciality,
  deleteSpeciality,
  uploadSpecialityImage,
  getPublicSpecialities,
  getPublicSpecialityBySlug,
} = require('../controllers/specialityController');

const router = express.Router();

router.get('/public', getPublicSpecialities);
router.get('/public/:slug', getPublicSpecialityBySlug);

router.get('/overview', ...protectedRoute('specialities', 'view'), getSpecialitiesOverview);
router.post('/upload-image', ...protectedRoute('specialities', 'edit'), (req, res, next) => {
  specialityImageUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
      });
    }
    next();
  });
}, uploadSpecialityImage);
router.post('/', ...protectedRoute('specialities', 'edit'), createSpeciality);
router.get('/:id', ...protectedRoute('specialities', 'view'), getSpecialityById);
router.put('/:id', ...protectedRoute('specialities', 'edit'), updateSpeciality);
router.delete('/:id', ...protectedRoute('specialities', 'edit'), deleteSpeciality);

module.exports = router;
