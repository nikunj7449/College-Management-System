const Performance = require('../models/Performance');
const Student = require('../models/Student');

// @desc    Add Exam Marks
// @route   POST /api/v1/performance
// @access  Private (Faculty/Admin)
exports.addPerformance = async (req, res, next) => {
  try {
    const { studentId, exam, subjects, grade, feedback } = req.body;

    if (!studentId || !exam || !subjects) {
      res.status(400);
      throw new Error('Please provide all performance details');
    }

    const performance = await Performance.create({
      student: studentId,
      exam,
      faculty: req.user.id,
      subjects,
      grade,
      feedback
    });

    // Populate before returning so frontend has the data without re-fetching
    await performance.populate([
      { path: 'student', select: 'name rollNum studentId' },
      { path: 'exam', select: 'name date type' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Performance record added successfully',
      performance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Performance by Student
// @route   GET /api/v1/performance/student/:studentId
// @access  Private
exports.getStudentPerformance = async (req, res, next) => {
  try {
    const records = await Performance.find({ student: req.params.studentId })
      .populate('exam', 'name date type');

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Performance Records
// @route   GET /api/v1/performance
// @access  Private (Faculty/Admin)
exports.getAllPerformance = async (req, res, next) => {
  try {
    const roleName = req.user.role?.name || req.user.role;
    let query = {};

    // If not SUPERADMIN or ADMIN, restrict to performance created by this faculty
    if (roleName !== 'SUPERADMIN' && roleName !== 'ADMIN') {
      query.faculty = req.user.id;
    }

    const records = await Performance.find(query)
      .populate('student', 'name rollNum studentId')
      .populate('exam', 'name date type')
      .populate('faculty', 'name email');

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Performance Record
// @route   PUT /api/v1/performance/:id
// @access  Private (Faculty/Admin)
exports.updatePerformance = async (req, res, next) => {
  try {
    const { studentId, exam, subjects, grade, feedback } = req.body;

    let performance = await Performance.findById(req.params.id);

    if (!performance) {
      res.status(404);
      throw new Error(`Performance record not found with id of ${req.params.id}`);
    }

    performance = await Performance.findByIdAndUpdate(
      req.params.id,
      { student: studentId, exam, subjects, grade, feedback },
      { new: true, runValidators: true }
    )
      .populate('student', 'name rollNum studentId')
      .populate('exam', 'name date type');

    res.status(200).json({
      success: true,
      message: 'Performance updated successfully',
      performance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Performance Record
// @route   DELETE /api/v1/performance/:id
// @access  Private (Faculty/Admin)
exports.deletePerformance = async (req, res, next) => {
  try {
    const performance = await Performance.findById(req.params.id);

    if (!performance) {
      res.status(404);
      throw new Error(`Performance record not found with id of ${req.params.id}`);
    }

    await performance.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Performance deleted successfully',
    });
  } catch (error) {
    require('console').log('delete error', error);
    next(error);
  }
};

// @desc    Get My Performance (Student Only)
// @route   GET /api/v1/performance/my-performance
// @access  Private (Student)
exports.getMyPerformance = async (req, res, next) => {
  try {
    const studentUser = req.user.id;
    
    // 1. Get student profile
    const student = await Student.findOne({ user: studentUser });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 2. Fetch all performance records for this student
    const records = await Performance.find({ student: student._id })
      .populate('exam', 'name date type')
      .populate('faculty', 'name');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};