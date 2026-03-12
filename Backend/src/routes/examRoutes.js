const express = require('express');
const {
    getExams,
    getExam,
    createExam,
    updateExam,
    deleteExam,
    getMyExams
} = require('../controllers/examController');

const router = express.Router();

// Middleware
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');

// Protect all routes
router.use(protect);

router.route('/my-exams')
    .get(requirePermission('EXAM', 'read'), getMyExams);

router.route('/')
    .get(requirePermission('EXAM', 'read'), getExams)
    .post(requirePermission('EXAM', 'create'), createExam);

router.route('/:id')
    .get(requirePermission('EXAM', 'read'), getExam)
    .put(requirePermission('EXAM', 'update'), updateExam)
    .delete(requirePermission('EXAM', 'delete'), deleteExam);

module.exports = router;
