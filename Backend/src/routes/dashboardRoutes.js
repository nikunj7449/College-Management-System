const express = require('express');
const router = express.Router();
const { 
  getAdminStats, 
  getFacultyStats,
  getStudentStats 
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/admin/stats', authorize('ADMIN', 'SUPERADMIN'), getAdminStats);
router.get('/faculty/stats', authorize('FACULTY'), getFacultyStats);
router.get('/student/stats', authorize('STUDENT'), getStudentStats);

module.exports = router;