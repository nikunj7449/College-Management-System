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
  .post(authorize('ADMIN'), addCourse)
  .get(getAllCourses);

router.route('/:id')
  .get(getCourseById)
  .put(authorize('ADMIN'), updateCourse)
  .delete(authorize('ADMIN'), deleteCourse);

// 2. Branch Routes
router.route('/:courseId/branches')
  .post(authorize('ADMIN'), addBranch);

router.route('/:courseId/branches/:branchId')
  .put(authorize('ADMIN'), updateBranch)
  .delete(authorize('ADMIN'), deleteBranch);

// 3. Subject Routes
router.route('/:courseId/branches/:branchId/subjects')
  .post(authorize('ADMIN'), addSubject);

router.route('/:courseId/branches/:branchId/subjects/:subjectId')
  .put(authorize('ADMIN'), updateSubject)
  .delete(authorize('ADMIN'), deleteSubject);

  router.route('/bulk')
  .post(addBulkCourses);

module.exports = router;