const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  examName: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  subjects: [{
    subjectName: { type: String, required: true, trim: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true }
  }],
  grade: {
    type: String,
    trim: true
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Performance', performanceSchema);