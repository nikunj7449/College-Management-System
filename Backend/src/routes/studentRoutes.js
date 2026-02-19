const express = require('express');
const router = express.Router();
const { 
  addStudent, 
  getAllStudents, 
  getStudentById, 
  updateStudent ,
  deleteStudent,
  addBulkStudents
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware'); // For documents

// All routes here need login
router.use(protect);

// Routes
router.route('/')
  .get(authorize('ADMIN', 'SUPERADMIN', 'FACULTY'), getAllStudents) // View all (Admin/Faculty)
  .post(
    authorize('ADMIN', 'SUPERADMIN', 'FACULTY'), 
    upload.array('documents', 3), // Expects field name 'documents'
    addStudent
  ); // Add new (Admin/Faculty)

router.route('/bulk')
  .post(authorize('ADMIN', 'SUPERADMIN'), addBulkStudents);

router.route('/:id')
  .get(authorize('ADMIN', 'SUPERADMIN'),getStudentById)
  .put(authorize('ADMIN', 'SUPERADMIN', 'FACULTY'), upload.array('documents', 3), updateStudent) // Only Admin can edit details
  .delete(authorize('ADMIN', 'SUPERADMIN', 'FACULTY'), deleteStudent);

module.exports = router;