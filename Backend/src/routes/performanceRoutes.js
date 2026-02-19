const express = require('express');
const router = express.Router();
const { 
  addPerformance, 
  getStudentPerformance 
} = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

// Add Marks
router.post('/', authorize('ADMIN', 'SUPERADMIN', 'FACULTY'), addPerformance);

// View Marks
router.get('/student/:studentId', getStudentPerformance);

module.exports = router;