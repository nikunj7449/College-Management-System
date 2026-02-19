const express = require('express');
const router = express.Router();
const { 
  markAttendance, 
  getStudentAttendance, 
  getClassAttendance, 
  markBulkAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Mark Attendance
router.post('/', authorize('FACULTY', 'ADMIN', 'SUPERADMIN'), markAttendance);

// View specific student's history (Student can view their own)
router.get('/student/:studentId', getStudentAttendance);
// Bulk Mark Attendance (Faculty Only)
router.post('/student/bulk', markBulkAttendance);
// View Class/Date Report (Admin/Faculty Only)
router.get('/history', authorize('ADMIN', 'SUPERADMIN', 'FACULTY'), getClassAttendance);

module.exports = router;