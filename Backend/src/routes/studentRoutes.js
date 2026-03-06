const express = require('express');
const router = express.Router();
const {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addBulkStudents,
  generateDummyStudents
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware'); // For documents

// All routes here need login
router.use(protect);

// Routes
router.route('/')
  .get(requirePermission('STUDENT', 'read'), getAllStudents) // View all (Admin/Faculty)
  .post(
    requirePermission('STUDENT', 'create'),
    upload.array('documents', 3), // Expects field name 'documents'
    addStudent
  ); // Add new (Admin/Faculty)

router.route('/bulk')
  .post(requirePermission('STUDENT', 'create'), addBulkStudents);

router.route('/generate')
  .post(requirePermission('STUDENT', 'create'), generateDummyStudents);

router.route('/:id')
  .get(requirePermission('STUDENT', 'read'), getStudentById)
  .put(requirePermission('STUDENT', 'update'), upload.array('documents', 3), updateStudent) // Only Admin can edit details
  .delete(requirePermission('STUDENT', 'delete'), deleteStudent);

module.exports = router;