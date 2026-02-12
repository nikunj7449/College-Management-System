const Student = require('../models/Student');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');     
const Attendance = require('../models/Attendance');
const Remark = require('../models/Remark');
const Performance = require('../models/Performance');

// @desc    Add a new student
// @route   POST /api/v1/students
// @access  Private (Admin/Faculty)
exports.addStudent = async (req, res, next) => {
  try {
    let { 
      name, 
      studentId, 
      rollNum, 
      course, 
      branch,
      sem, 
      parentContact, 
      studentPhone,
      personalEmail,
      dob // Expected format from frontend: "YYYY-MM-DD" (e.g., "2006-05-15")
    } = req.body;

    // 1. Validation
    if (!name || !studentId || !studentPhone || !personalEmail || !rollNum || !course || !branch || !sem || !parentContact || !dob) {
        res.status(400);
        throw new Error('Please fill all required fields');
    }

    studentId = studentId.toUpperCase();

    // 2. Check for duplicate Student ID
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      res.status(400);
      throw new Error('Student with this Student ID already exists');
    }

    // --- PASSWORD FORMATTING LOGIC ---
    // Convert "2006-05-15" -> "15/05/2006"
    // We split by '-' to avoid timezone issues with new Date()
    const dateParts = dob.split('-'); 
    // parts[0] is Year, parts[1] is Month, parts[2] is Day
    const formattedPassword = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; 
    // Result: "15/05/2006"

    // 3. User Login Creation
    const studentEmail = `${studentId}@school.com`;

    const userExists = await User.findOne({ email: studentEmail });
    if (userExists) {
      res.status(400);
      throw new Error('User login with this Student ID already exists');
    }

    // Hash the FORMATTED password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formattedPassword, salt); 

    const newUser = await User.create({
      name: name,
      email: studentEmail,
      password: hashedPassword,
      role: 'STUDENT'
    });

    // 4. Process Documents
    let documentsArray = [];
    if (req.files && req.files.length > 0) {
      documentsArray = req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`, 
        type: file.mimetype
      }));
    }

    // 5. Create Student Profile
    const student = await Student.create({
      user: newUser._id, 
      name,
      email: studentEmail,
      studentId,
      rollNum,
      course,
      branch,
      sem,
      parentContact,
      studentPhone,
      personalEmail,
      dob, 
      documents: documentsArray 
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
      credentials: {
        email: studentEmail,
        password: formattedPassword 
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Upload Students
// @route   POST /api/v1/students/bulk
// @access  Private (Admin)
exports.addBulkStudents = async (req, res, next) => {
  try {
    const studentsData = req.body; // Expecting Array

    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      res.status(400);
      throw new Error('Please provide an array of students');
    }

    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const studentData of studentsData) {
      // Destructure and basic validation
      let { 
        name, studentId, rollNum, course, branch, sem, 
        parentContact, studentPhone, personalEmail, dob 
      } = studentData;

      if (!name || !studentId || !dob) {
        skippedCount++;
        errors.push(`Skipped record with missing mandatory fields (Name/ID/DOB)`);
        continue;
      }

      try {
        studentId = studentId.toUpperCase();

        // Check duplicates
        const studentExists = await Student.findOne({ studentId });
        if (studentExists) {
          skippedCount++;
          errors.push(`Skipped '${studentId}' - Student ID already exists`);
          continue;
        }

        const studentEmail = `${studentId}@school.com`;
        const userExists = await User.findOne({ email: studentEmail });
        if (userExists) {
          skippedCount++;
          errors.push(`Skipped '${studentId}' - User login already exists`);
          continue;
        }

        // Password generation
        const dateParts = dob.split('-');
        if (dateParts.length !== 3) {
             skippedCount++;
             errors.push(`Skipped '${studentId}' - Invalid DOB format (Use YYYY-MM-DD)`);
             continue;
        }
        const formattedPassword = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(formattedPassword, salt);

        // Create User
        const newUser = await User.create({
          name,
          email: studentEmail,
          password: hashedPassword,
          role: 'STUDENT'
        });

        // Create Student
        await Student.create({
          user: newUser._id,
          name,
          email: studentEmail,
          studentId,
          rollNum,
          course,
          branch,
          sem,
          parentContact,
          studentPhone,
          personalEmail,
          dob,
          documents: [] // No documents in bulk upload
        });

        addedCount++;

      } catch (err) {
        skippedCount++;
        errors.push(`Failed to add '${studentId || 'Unknown'}' - ${err.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Process complete. Added: ${addedCount}, Skipped: ${skippedCount}`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (Filter by Class/Section or Search by Name/ID)
// @route   GET /api/v1/students
// @access  Private
exports.getAllStudents = async (req, res, next) => {
  try {
    const { course, branch, sem, search, isActive } = req.query;
    let query = {};

    // Helper to handle single value or array for $in query
    const addFilter = (field, value) => {
      if (!value) return;
      if (Array.isArray(value)) {
        query[field] = { $in: value };
      } else if (typeof value === 'string' && value.includes(',')) {
        query[field] = { $in: value.split(',') };
      } else {
        query[field] = value;
      }
    };

    // 1. Filter by Course & Sem
    addFilter('course', course);
    addFilter('branch', branch);
    addFilter('sem', sem);
    if (isActive) query.isActive = isActive === 'true';

    // 2. Search functionality (Name or Student ID)
    if (search) {
      const searchTerm = search.toString().trim();
      if (searchTerm !== "") {
        query.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },      // Case-insensitive name
          { studentId: { $regex: searchTerm, $options: 'i' } }  // Case-insensitive ID
        ];
      }
    }

    // 3. Find User Email
    const students = await Student.find(query)
      .sort({ course: 1, sem: 1, rollNum: 1 }); // Sort by Course, Sem, then Roll Number

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student (Syncs with User Login)
// @route   PUT /api/v1/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // If Name or StudentID changes, we must update the linked User account
    if (req.body.name || req.body.studentId) {
      const updateFields = {};
      if (req.body.name) updateFields.name = req.body.name;
      
      // If Student ID changes, update Email too (e.g., S-101@school.com)
      if (req.body.studentId) {
         req.body.studentId = req.body.studentId.toUpperCase();
         updateFields.email = `${req.body.studentId}@school.com`;
      }

      await User.findByIdAndUpdate(student.user, updateFields);
    }
    // -------------------------------------

    // Handle File Uploads (Append new files to existing ones)
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        type: file.mimetype
      }));
      
      // Add new files to the update list
      // $push is a MongoDB operator to append to array
      await Student.findByIdAndUpdate(req.params.id, { 
        $push: { documents: { $each: newDocuments } } 
      });
    }

    // Update the rest of the text fields
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Student profile and linked login updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Delete linked User account
    await User.findByIdAndDelete(student.user);

    // Delete associated data (Attendance, Remarks, Performance)
    await Attendance.deleteMany({ student: student._id });
    await Remark.deleteMany({ student: student._id });
    await Performance.deleteMany({ student: student._id });

    // Delete Student profile
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};