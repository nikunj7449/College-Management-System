const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Leave'],
    required: [true, 'Attendance status is required']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty ID is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);