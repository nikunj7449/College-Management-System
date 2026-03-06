const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
  markBulkAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');

router.use(protect);

// Mark Attendance
router.post('/', requirePermission('ATTENDANCE', 'create'), markAttendance);

// View specific student's history (Student can view their own)
router.get('/student/:studentId', requirePermission('ATTENDANCE', 'read'), getStudentAttendance);
// Bulk Mark Attendance (Faculty Only ideally but controlled by permission)
router.post('/student/bulk', requirePermission('ATTENDANCE', 'create'), markBulkAttendance);
// View Class/Date Report
router.get('/history', requirePermission('ATTENDANCE', 'read'), getClassAttendance);

module.exports = router;