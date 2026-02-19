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
  updateSubject
} = require('../controllers/courseController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes here need login
router.use(protect);

// 1. Course Routes (Base)
router.route('/')
  .post(authorize('ADMIN', 'SUPERADMIN'), addCourse)
  .get(getAllCourses);

router.route('/:id')
  .get(getCourseById)
  .put(authorize('ADMIN', 'SUPERADMIN'), updateCourse)
  .delete(authorize('ADMIN', 'SUPERADMIN'), deleteCourse);

// 2. Branch Routes
router.route('/:courseId/branches')
  .post(authorize('ADMIN', 'SUPERADMIN'), addBranch);

router.route('/:courseId/branches/:branchId')
  .put(authorize('ADMIN', 'SUPERADMIN'), updateBranch)
  .delete(authorize('ADMIN', 'SUPERADMIN'), deleteBranch);

// 3. Subject Routes
router.route('/:courseId/branches/:branchId/subjects')
  .post(authorize('ADMIN', 'SUPERADMIN'), addSubject);

router.route('/:courseId/branches/:branchId/subjects/:subjectId')
  .put(authorize('ADMIN', 'SUPERADMIN'), updateSubject)
  .delete(authorize('ADMIN', 'SUPERADMIN'), deleteSubject);

  router.route('/bulk')
  .post(authorize('ADMIN', 'SUPERADMIN'), addBulkCourses);

module.exports = router;
