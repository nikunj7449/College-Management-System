const Remark = require('../models/Remark');
const Student = require('../models/Student');

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

// @desc    Get All Remarks (Dynamic based on role)
// @route   GET /api/v1/remarks
// @access  Private
exports.getAllRemarks = async (req, res, next) => {
  try {
    const roleName = req.user.role?.name || req.user.role;
    let query = {};

    // Dynamic logic based on role
    if (roleName === 'STUDENT') {
      // Find the linked student profile
      const studentProfile = await Student.findOne({ user: req.user.id });
      if (!studentProfile) {
        return res.status(200).json({ success: true, count: 0, remarks: [] });
      }
      query.student = studentProfile._id;
    } else if (roleName !== 'SUPERADMIN' && roleName !== 'ADMIN') {
      // Faculty view: Only their own remarks
      query.faculty = req.user.id;
    }

    const remarks = await Remark.find(query)
      .populate('student', 'name studentId rollNum course sem')
      .populate('faculty', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: remarks.length,
      remarks: remarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Remark
// @route   DELETE /api/v1/remarks/:id
// @access  Private
exports.deleteRemark = async (req, res, next) => {
  try {
    const remark = await Remark.findById(req.params.id);

    if (!remark) {
      res.status(404);
      throw new Error('Remark not found');
    }

    const userRole = req.user.role?.name || req.user.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

    // Faculty can only delete their own remarks. Admins can delete any.
    if (!isAdmin && remark.faculty.toString() !== req.user.id.toString()) {
      res.status(403);
      throw new Error('User not authorized to delete this remark');
    }

    await remark.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Remark deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};