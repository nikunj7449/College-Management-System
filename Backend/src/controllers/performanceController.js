const Performance = require('../models/Performance');

// @desc    Add Exam Marks
// @route   POST /api/v1/performance
// @access  Private (Faculty/Admin)
exports.addPerformance = async (req, res, next) => {
  try {
    const { studentId, examName, subjects, grade, feedback } = req.body;

    if (!studentId || !examName || !subjects) {
      res.status(400);
      throw new Error('Please provide all performance details');
    }

    const performance = await Performance.create({
      student: studentId,
      examName,
      subjects,
      grade,
      feedback
    });

    // Populate before returning so frontend has the data without re-fetching
    await performance.populate('student', 'name rollNum studentId');

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

// @desc    Get All Performance Records
// @route   GET /api/v1/performance
// @access  Private (Faculty/Admin)
exports.getAllPerformance = async (req, res, next) => {
  try {
    const records = await Performance.find().populate('student', 'name rollNum studentId');

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
    const { studentId, examName, subjects, grade, feedback } = req.body;

    let performance = await Performance.findById(req.params.id);

    if (!performance) {
      res.status(404);
      throw new Error(`Performance record not found with id of ${req.params.id}`);
    }

    performance = await Performance.findByIdAndUpdate(
      req.params.id,
      { student: studentId, examName, subjects, grade, feedback },
      { new: true, runValidators: true }
    ).populate('student', 'name rollNum studentId');

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
    next(error);
  }
};