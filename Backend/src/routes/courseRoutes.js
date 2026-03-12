const express = require('express');
const {
    addCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    addBranch,
    deleteBranch,
    addSubject,
    deleteSubject,
    addBulkCourses,
    updateBranch,
    updateSubject,
    getMyCourses
} = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes here need login
router.use(protect);

// 1. Course Routes (Base)
router.route('/my-courses')
    .get(requirePermission('COURSE', 'read'), getMyCourses);

router.route('/')
    .post(requirePermission('COURSE', 'create'), addCourse)
    .get(requirePermission('COURSE', 'read'), getAllCourses);

router.route('/:id')
    .get(requirePermission('COURSE', 'read'), getCourseById)
    .put(requirePermission('COURSE', 'update'), updateCourse)
    .delete(requirePermission('COURSE', 'delete'), deleteCourse);

// 2. Branch Routes
router.route('/:courseId/branches')
    .post(requirePermission('COURSE', 'update'), addBranch);

router.route('/:courseId/branches/:branchId')
    .put(requirePermission('COURSE', 'update'), updateBranch)
    .delete(requirePermission('COURSE', 'update'), deleteBranch);

// 3. Subject Routes
router.route('/:courseId/branches/:branchId/subjects')
    .post(requirePermission('COURSE', 'update'), addSubject);

router.route('/:courseId/branches/:branchId/subjects/:subjectId')
    .put(requirePermission('COURSE', 'update'), updateSubject)
    .delete(requirePermission('COURSE', 'update'), deleteSubject);

router.route('/bulk')
    .post(requirePermission('COURSE', 'create'), addBulkCourses);

module.exports = router;
