const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  // Link to Login Account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  facultyId: {
    type: String, // e.g., "F-2026-01"
    required: [true, 'Faculty ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  email: {
    type: String,
    required: [true, 'Personal Email is required'], // contact email
    unique: true
  },
   personalEmail: {
    type: String,
    required: [true, 'Personal Email is required'], // Personal contact email
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
  },
  branch: {
    type: String,
    required: [true, 'Branch is required']
  },
  sem: {
    type: [String],
    required: [true, 'At least one Semester is required']
  },
  subject: {
    type: [String], // e.g., "Mathematics"
    required: [true, 'Main Subject is required']
  },
  qualification: {
    type: String, // e.g., "M.Sc, B.Ed"
    required: true
  },
  designation: {
    type: String, // e.g., "Senior Teacher"
    default: "Assistant Teacher"
  },
  salary: {
    type: Number,
    default: 0
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  documents: [{
    name: { type: String, trim: true },
    url: { type: String, trim: true },
    type: { type: String, trim: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);