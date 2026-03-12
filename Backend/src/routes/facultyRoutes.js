const express = require('express');
const router = express.Router();
const {
  addFaculty,
  getAllFaculty,
  updateFaculty,
  deleteFaculty,
  addBulkFaculty,
  getMyFaculty
} = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cleanBody = require('../middleware/cleanBody');

// All routes here need login
router.use(protect);

router.route('/my-faculty')
  .get(requirePermission('FACULTY', 'read'), getMyFaculty); // Student only

router.route('/')
  .get(requirePermission('FACULTY', 'read'), getAllFaculty) // Accessible to any logged-in user
  .post(requirePermission('FACULTY', 'create'), upload.array('documents', 3), cleanBody, addFaculty); // Admin only

router.route('/bulk')
  .post(requirePermission('FACULTY', 'create'), addBulkFaculty);

router.route('/:id')
  .put(requirePermission('FACULTY', 'update'), upload.array('documents', 3), updateFaculty) // Admin only
  .delete(requirePermission('FACULTY', 'delete'), deleteFaculty); // Admin only

module.exports = router;