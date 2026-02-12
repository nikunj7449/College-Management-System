const Attendance = require('../models/Attendance');

// @desc    Mark Attendance
// @route   POST /api/v1/attendance
// @access  Private (Faculty/Admin)
exports.markAttendance = async (req, res, next) => {
  try {
    const { studentId, date, status } = req.body;
    
    if (!studentId || !date || !status) {
        res.status(400);
        throw new Error('Please provide student ID, date, and status');
    }

    // Normalize status to Title Case (e.g., "present" -> "Present")
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Normalize date to ignore time (YYYY-MM-DD)
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0,0,0,0);

    // Check if attendance already marked
    const existingAttendance = await Attendance.findOne({ 
      student: studentId, 
      date: attendanceDate 
    });

    if (existingAttendance) {
      // Update existing record
      existingAttendance.status = normalizedStatus;
      existingAttendance.markedBy = req.user.id;
      await existingAttendance.save();
      
      res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance,
      });
    } else {
      // Create new record
      const attendance = await Attendance.create({
        student: studentId,
        date: attendanceDate,
        status: normalizedStatus,
        markedBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        attendance,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Mark Attendance
// @route   POST /api/v1/attendance/student/bulk
// @access  Private (Faculty/Admin)
exports.markBulkAttendance = async (req, res, next) => {
  try {
    const attendanceData = req.body; // Expecting Array of { studentId, date, status }

    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      res.status(400);
      throw new Error('Please provide an array of attendance records');
    }

    let successCount = 0;
    const errors = [];

    for (const record of attendanceData) {
      const { studentId, date, status, facultyId } = record;

      if (!studentId || !date || !status || !facultyId) {
        errors.push(`Skipped a record: Missing studentId, date, or status`);
        continue;
      }

      try {
        // Normalize status
        const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

        // Normalize date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Upsert (Update if exists, Insert if new)
        await Attendance.findOneAndUpdate(
          { student: studentId, date: attendanceDate },
          { 
            status: normalizedStatus,
            markedBy: facultyId 
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        successCount++;
      } catch (err) {
        errors.push(`Failed for student ${studentId}: ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk attendance processed. Successful: ${successCount}`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Attendance History for a Student
// @route   GET /api/v1/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ student: req.params.studentId }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};


// Get Attendance for a specific Date and Class (For Admin/Faculty View)
exports.getClassAttendance = async (req, res, next) => { 
  try {
    const { date, course, sem } = req.query;

    // 1. Get IDs of students in that course/sem
    const students = await require('../models/Student').find({ course, sem }).select('_id name rollNum');
    const studentIds = students.map(s => s._id);

    // 2. Get attendance records for those IDs on the specific date
    const attendanceRecords = await require('../models/Attendance').find({
      student: { $in: studentIds },
      date: new Date(date)
    }).populate('student', 'name rollNum');

    res.status(200).json({ success: true, data: attendanceRecords });
  } catch (error) {
    next(error);
  }
};