const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Remark = require('../models/Remark');
const Course = require('../models/Course');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/v1/dashboard/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await User.countDocuments({ role: 'FACULTY' });
    const totalCourses = await Course.countDocuments();
    
    // Get today's attendance count (System-wide)
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    
    const presentToday = await Attendance.countDocuments({ 
      date: { $gte: todayStart }, 
      status: { $regex: /^Present$/i } 
    });

    // Get Attendance Data for Graph
    let startDate = new Date();
    let endDate = new Date();
    
    // Helper to get Monday of the current week
    const getMonday = (d) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      date.setDate(diff);
      return date;
    };

    if (req.query.filter === 'this_week') {
      startDate = getMonday(new Date());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday
      endDate.setHours(23, 59, 59, 999);
    } else if (req.query.filter === 'last_week') {
      const thisMonday = getMonday(new Date());
      startDate = new Date(thisMonday);
      startDate.setDate(startDate.getDate() - 7); // Previous Monday
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Previous Sunday
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default: Last 7 Days
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    }

    const attendanceStats = await Attendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          present: {
            $sum: {
              $cond: [{ $regexMatch: { input: "$status", regex: /^Present$/i } }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $regexMatch: { input: "$status", regex: /^Absent$/i } }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format data based on the calculated date range
    const attendanceData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = days[currentDate.getDay()];

      const stat = attendanceStats.find(s => s._id === dateStr);
      
      attendanceData.push({
        name: dayName,
        present: stat ? stat.present : 0,
        absent: stat ? stat.absent : 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get Recent Remarks (System-wide)
    const recentRemarksRaw = await Remark.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('student', 'name')
      .populate('faculty', 'name');

    const recentRemarks = recentRemarksRaw.map(r => ({
      id: r._id,
      faculty: r.faculty ? r.faculty.name : 'Unknown',
      student: r.student ? r.student.name : 'Unknown',
      remark: r.comment,
      time: r.date
    }));

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalCourses,
        presentToday,
        attendanceData,
        recentRemarks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Faculty Dashboard Stats
// @route   GET /api/v1/dashboard/faculty/stats
// @access  Private (Faculty)
exports.getFacultyStats = async (req, res, next) => {
  try {
    const facultyId = req.user.id;

    // 1. Total Students (System wide or filter by course/sem if passed in query)
    // If your frontend sends ?course=BTech&sem=1, we can filter here.
    const studentCount = await Student.countDocuments(); 

    // 2. Attendance Status (Today's activity for this faculty)
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const attendanceToday = await Attendance.find({
      markedBy: facultyId,
      date: { $gte: todayStart }
    });

    const presentCount = attendanceToday.filter(a => /^Present$/i.test(a.status)).length;
    const absentCount = attendanceToday.filter(a => /^Absent$/i.test(a.status)).length;

    // 3. Recent Remarks Added (By this faculty)
    const recentRemarks = await Remark.find({ faculty: facultyId })
      .sort({ date: -1 })
      .limit(5)
      .populate('student', 'name rollNum'); // Show student name in the card

    res.status(200).json({
      success: true,
      data: {
        studentCount,
        attendanceToday: {
          totalMarked: attendanceToday.length,
          present: presentCount,
          absent: absentCount
        },
        recentRemarks
      },
    });
  } catch (error) {
    next(error);
  }
};