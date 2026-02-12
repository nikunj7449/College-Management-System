const Faculty = require('../models/faculty');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Remark = require('../models/Remark');

// @desc    Add a new Faculty
// @route   POST /api/v1/faculty
// @access  Private (Admin)
exports.addFaculty = async (req, res, next) => {
  try {
    const { 
      name, facultyId, personalEmail, phone, subject, qualification, designation, salary, dob, course, branch, sem, joiningDate
    } = req.body;
    console.log("req.body:", req.body);
    // 1. Validation
    if (!name || !facultyId || !personalEmail || !phone || !subject || !qualification || !dob || !course || !branch || !sem) {
      res.status(400);
      throw new Error('Please fill all required fields');
    }

    // 2. Check for Duplicate Faculty ID
    const facultyExists = await Faculty.findOne({ facultyId });
    if (facultyExists) {
      res.status(400);
      throw new Error('Faculty with this ID already exists');
    }

    // --- CREATE USER LOGIN (Auto-Generated) ---
    // Login Email = facultyId@school.com
    // Login Password = faculty dob in "DD/MM/YYYY" format (e.g., "15/05/2006")
    const loginEmail = `${facultyId}@school.com`;
    
    // Check if Login already exists
    const userExists = await User.findOne({ email: loginEmail });
    if (userExists) {
      res.status(400);
      throw new Error('User login for this Faculty ID already exists');
    }

    // --- PASSWORD FORMATTING LOGIC ---
    // Convert "YYYY-MM-DD" -> "DD/MM/YYYY"
    const dateParts = dob.split('-');
    const formattedPassword = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formattedPassword, salt);

    const newUser = await User.create({
      name,
      email: loginEmail,
      password: hashedPassword,
      role: 'FACULTY'
    });
    // Process Documents
    let documentsArray = [];
    if (req.files && req.files.length > 0) {
      documentsArray = req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`, 
        type: file.mimetype
      }));  
    }

    // 3. Create Faculty Profile
    const faculty = await Faculty.create({
      user: newUser._id,
      name,
      facultyId,
      email: loginEmail, // Mapping loginEmail to email to satisfy schema requirements
      personalEmail,
      dob,
      phone,
      subject,
      course,
      branch,
      sem,
      qualification,
      designation,
      salary,
      joiningDate: joiningDate || undefined,
      documents: documentsArray
    });
    console.log('Created Faculty:', faculty);
    res.status(201).json({
      success: true,
      message: 'Faculty added and Login created successfully',
      data: faculty,
      credentials: {
        loginEmail: loginEmail,
        password: formattedPassword 
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Upload Faculty
// @route   POST /api/v1/faculty/bulk
// @access  Private (Admin)
exports.addBulkFaculty = async (req, res, next) => {
  try {
    const facultyData = req.body; // Expecting Array

    if (!Array.isArray(facultyData) || facultyData.length === 0) {
      res.status(400);
      throw new Error('Please provide an array of faculty members');
    }

    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const data of facultyData) {
      let { 
        name, facultyId, personalEmail, phone, subject, qualification, 
        designation, salary, dob, course, branch, sem, joiningDate 
      } = data;

      if (!name || !facultyId || !dob || !personalEmail) {
        skippedCount++;
        errors.push(`Skipped record with missing mandatory fields (Name/ID/DOB/Email)`);
        continue;
      }

      try {
        // Check duplicates
        const facultyExists = await Faculty.findOne({ facultyId });
        if (facultyExists) {
          skippedCount++;
          errors.push(`Skipped '${facultyId}' - Faculty ID already exists`);
          continue;
        }

        const loginEmail = `${facultyId}@school.com`;
        const userExists = await User.findOne({ email: loginEmail });
        if (userExists) {
          skippedCount++;
          errors.push(`Skipped '${facultyId}' - User login already exists`);
          continue;
        }

        // Password generation
        const dateParts = dob.split('-');
        if (dateParts.length !== 3) {
             skippedCount++;
             errors.push(`Skipped '${facultyId}' - Invalid DOB format (Use YYYY-MM-DD)`);
             continue;
        }
        const formattedPassword = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(formattedPassword, salt);

        // Create User
        const newUser = await User.create({
          name,
          email: loginEmail,
          password: hashedPassword,
          role: 'FACULTY'
        });

        // Ensure arrays for subject and sem
        const subjectArray = Array.isArray(subject) ? subject : (typeof subject === 'string' ? subject.split(',').map(s => s.trim()) : []);
        const semArray = Array.isArray(sem) ? sem : (typeof sem === 'string' ? sem.split(',').map(s => s.trim()) : []);

        // Create Faculty
        await Faculty.create({
          user: newUser._id,
          name,
          facultyId,
          email: loginEmail,
          personalEmail,
          dob,
          phone,
          subject: subjectArray,
          course,
          branch,
          sem: semArray,
          qualification,
          designation,
          salary,
          joiningDate: joiningDate || undefined,
          documents: []
        });

        addedCount++;

      } catch (err) {
        skippedCount++;
        errors.push(`Failed to add '${facultyId || 'Unknown'}' - ${err.message}`);
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

// @desc    Get All Faculty
// @route   GET /api/v1/faculty
// @access  Private
exports.getAllFaculty = async (req, res, next) => {
  try {
    const { search, designation, branch, course, sem, subject } = req.query;
    
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

    // 2. Strict Filters (Dropdowns)
    addFilter('designation', designation);
    addFilter('course', course);
    addFilter('branch', branch);
    addFilter('sem', sem);
    addFilter('subject', subject);

    // 3. Search Functionality (Name or Faculty ID)
    if (search) {
      const searchTerm = search.toString().trim(); // Safety trim
      
      if (searchTerm !== "") {
        query.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },      // Case-insensitive Name
          { facultyId: { $regex: searchTerm, $options: 'i' } }  // Case-insensitive ID
        ];
      }
    }

    // 4. Execute Query with Sorting
    const faculty = await Faculty.find(query)
      .sort({ facultyId: 1 }); // Sort by ID (or change to { name: 1 })

    res.status(200).json({
      success: true,
      count: faculty.length,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Faculty
// @route   PUT /api/v1/faculty/:id
// @access  Private (Admin)
exports.updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      res.status(404);
      throw new Error('Faculty not found');
    }

    // Sync Name changes to User Login
    if (req.body.name) {
      await User.findByIdAndUpdate(faculty.user, { name: req.body.name });
    }

    // Handle File Uploads (Append new files)
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        type: file.mimetype
      }));
      
      await Faculty.findByIdAndUpdate(req.params.id, { 
        $push: { documents: { $each: newDocuments } } 
      });
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedFaculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Faculty
// @route   DELETE /api/v1/faculty/:id
// @access  Private (Admin)
exports.deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      res.status(404);
      throw new Error('Faculty not found');
    }

    // Delete Remarks created by this faculty
    await Remark.deleteMany({ faculty: faculty.user });

    // Delete the Linked User Login First
    await User.findByIdAndDelete(faculty.user);

    // Then Delete the Profile
    await faculty.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Faculty deleted'
    });
  } catch (error) {
    next(error);
  }
};