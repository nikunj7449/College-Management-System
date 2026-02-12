const Performance = require('../models/Performance');

// @desc    Add Exam Marks
// @route   POST /api/v1/performance
// @access  Private (Faculty/Admin)
exports.addPerformance = async (req, res, next) => {
  try {
    const { studentId, examName, subjects, feedback } = req.body;

    if (!studentId || !examName || !subjects) {
      res.status(400);
      throw new Error('Please provide all performance details');
    }

    const performance = await Performance.create({
      student: studentId,
      examName,
      subjects,
      feedback
    });

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
    const records = await Performance.find({ student: req.params.studentId });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};