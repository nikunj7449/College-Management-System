const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // --- 1. LINK TO LOGIN ACCOUNT (REQUIRED) ---
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Essential for linking Profile <-> Login
  },

  // --- 2. EMAIL (REQUIRED BY CONTROLLER) ---
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },

  // --- REST OF YOUR FIELDS ---
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  studentId: {  
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  },
  rollNum: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  sem: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true
  },
  parentContact: {
    type: String,
    required: [true, 'Parent contact is required'],
    trim: true
  },
  studentPhone: {
    type: String,
    trim: true
  },
  personalEmail: {
    type: String,
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: [{
    name: { type: String, trim: true },
    url: { type: String, trim: true },
    type: { type: String, trim: true },
    publicId: { type: String, trim: true }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate age automatically
studentSchema.virtual('age').get(function() {
  if (!this.dob) return undefined;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

module.exports = mongoose.model('Student', studentSchema);