const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  enrollmentId: {
    type: String,
    required: [true, 'Please add an enrollment ID'],
    unique: true,
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
  },
  role: {
    type: String,
    enum: ['ADMIN', 'TEACHER', 'STUDENT'],
    default: 'STUDENT',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);