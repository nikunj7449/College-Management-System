const express = require('express');
const router = express.Router();
const { 
  addFaculty, 
  getAllFaculty, 
  updateFaculty, 
  deleteFaculty,
  addBulkFaculty
} = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cleanBody = require('../middleware/cleanBody');

// All routes here need login
router.use(protect);

router.route('/')
  .get(getAllFaculty) // Accessible to any logged-in user
  .post(authorize('ADMIN', 'SUPERADMIN'), upload.array('documents', 3),cleanBody, addFaculty); // Admin only

router.route('/bulk')
  .post(authorize('ADMIN', 'SUPERADMIN'), addBulkFaculty);

router.route('/:id')
  .put(authorize('ADMIN', 'SUPERADMIN'), upload.array('documents', 3), updateFaculty) // Admin only
  .delete(authorize('ADMIN', 'SUPERADMIN'), deleteFaculty); // Admin only

module.exports = router;