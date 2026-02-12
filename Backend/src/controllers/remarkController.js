const Remark = require('../models/Remark');

// @desc    Add a Remark (Faculty Work Log)
// @route   POST /api/v1/remarks
// @access  Private (Faculty)
exports.addRemark = async (req, res, next) => {
  try {
    const { studentId, comment } = req.body;

    if (!studentId || !comment) {
      res.status(400);
      throw new Error('Student ID and Comment are required');
    }

    const remark = await Remark.create({
      student: studentId,
      faculty: req.user.id,
      comment,
      date: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Remark added successfully',
      remark: remark,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Remarks for a Student
// @route   GET /api/v1/remarks/student/:studentId
// @access  Private
exports.getStudentRemarks = async (req, res, next) => {
  try {
    const remarks = await Remark.find({ student: req.params.studentId })
      .populate('faculty', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: remarks.length,
      remarks: remarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Faculty Work Log (Admin only: Filter by faculty)
// @route   GET /api/v1/remarks/faculty-log/:facultyId
// @access  Private (Admin)
exports.getFacultyWorkLog = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    
    // Fetch all remarks made by this faculty
    // We populate student details so the Admin knows who the remark was for
    const logs = await Remark.find({ faculty: facultyId })
      .populate('student', 'name course sem rollNum')
      .sort({ date: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: logs.length,
       logs
    });
  } catch (error) {
    next(error);
  }
};