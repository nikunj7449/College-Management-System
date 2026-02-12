const mongoose = require('mongoose');

// 1. Subject Schema (The smallest unit)
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true }, // e.g., CS101
  credits: { type: Number, required: true },
  semester: { type: Number, required: true } // e.g., 1, 2, 3...
});

// 2. Branch Schema (Contains Subjects)
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g., "Computer Science"
  subjects: [subjectSchema] // Array of subjects inside this branch
});

// 3. Course Schema (The main container)
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // e.g., "B.Tech"
  duration: { type: Number, required: true }, // e.g., 4 years
  branches: [branchSchema] // Array of branches inside this course
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);