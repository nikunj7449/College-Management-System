const express = require('express');
const router = express.Router();
const { 
  addRemark, 
  getStudentRemarks,
  getFacultyWorkLog
} = require('../controllers/remarkController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Create Remark
router.post('/', authorize('FACULTY'), addRemark);

// View Remarks for a Student
router.get('/student/:studentId', getStudentRemarks);

// Admin Module: View Faculty Daily Work Log
router.get('/faculty-log/:facultyId', authorize('ADMIN', 'SUPERADMIN'), getFacultyWorkLog);

module.exports = router;