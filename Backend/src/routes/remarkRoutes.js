const express = require('express');
const router = express.Router();
const {
  addRemark,
  getStudentRemarks,
  getFacultyWorkLog,
  getAllRemarks,
  deleteRemark
} = require('../controllers/remarkController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');

router.use(protect);

// Create Remark
router.post('/', requirePermission('REMARK', 'create'), addRemark);

// Get All Remarks (Dynamic)
router.get('/', requirePermission('REMARK', 'read'), getAllRemarks);

// View Remarks for a Student
router.get('/student/:studentId', requirePermission('REMARK', 'read'), getStudentRemarks);

// Admin Module: View Faculty Daily Work Log
router.get('/faculty-log/:facultyId', requirePermission('REMARK', 'read'), getFacultyWorkLog);

// Delete Remark
router.delete('/:id', requirePermission('REMARK', 'delete'), deleteRemark);

module.exports = router;