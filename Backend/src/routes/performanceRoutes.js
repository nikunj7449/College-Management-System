const express = require('express');
const router = express.Router();
const {
  addPerformance,
  getStudentPerformance,
  getAllPerformance,
  updatePerformance,
  deletePerformance
} = require('../controllers/performanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');

router.use(protect);

// Add Marks
router.post('/', requirePermission('PERFORMANCE', 'create'), addPerformance);

// Get All Marks
router.get('/', requirePermission('PERFORMANCE', 'read'), getAllPerformance);

// Update Marks
router.put('/:id', requirePermission('PERFORMANCE', 'update'), updatePerformance);

// Delete Marks
router.delete('/:id', requirePermission('PERFORMANCE', 'delete'), deletePerformance);

// View Marks by Student
router.get('/student/:studentId', requirePermission('PERFORMANCE', 'read'), getStudentPerformance);

module.exports = router;