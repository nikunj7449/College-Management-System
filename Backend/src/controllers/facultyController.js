const Faculty = require('../models/faculty');
const Student = require('../models/Student');
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const Remark = require('../models/Remark');
const cloudinary = require('cloudinary').v2;
const sendEmail = require('../utils/sendEmail');
const { getWelcomeEmailTemplate } = require('../utils/emailTemplates');

// @desc    Add a new Faculty
// @route   POST /api/v1/faculty
// @access  Private (Admin)
exports.addFaculty = async (req, res, next) => {
  try {
    const {
      name, facultyId, personalEmail, phone, subject, qualification, designation, salary, dob, course, branch, sem, joiningDate
    } = req.body;
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
      throw new Error('User login email for this Faculty ID already exists');
    }

    // --- PASSWORD FORMATTING LOGIC ---
    // Convert "YYYY-MM-DD" -> "DD/MM/YYYY"
    const dateParts = dob.split('-');
    const formattedPassword = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formattedPassword, salt);

    // Get Faculty Role ID
    const facultyRole = await Role.findOne({ name: 'FACULTY' });
    if (!facultyRole) {
      res.status(500);
      throw new Error('Faculty role not found in database. Please run seeding script.');
    }

    const newUser = await User.create({
      name,
      email: loginEmail,
      password: hashedPassword,
      role: facultyRole._id
    });
    // Process Documents
    let documentsArray = [];
    if (req.files && req.files.length > 0) {
      documentsArray = req.files.map(file => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype,
        publicId: file.filename
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

    // Send Welcome Email
    try {
      const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/login';
      const emailHtml = getWelcomeEmailTemplate(
          name, 
          'Faculty', 
          loginEmail, 
          formattedPassword, 
          loginUrl
      );

      await sendEmail({
          email: personalEmail,
          subject: `Welcome to ${process.env.COLLEGE_NAME || 'College'} - Your Faculty Portal Credentials`,
          html: emailHtml
      });
      console.log(`Welcome email sent to faculty ${facultyId} at ${personalEmail}`);
    } catch (emailError) {
      console.error(`Failed to send welcome email to faculty ${facultyId}:`, emailError);
      // We do not throw here, because the faculty account was successfully created.
    }

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
        // Get Faculty Role ID
        const facultyRole = await Role.findOne({ name: 'FACULTY' });
        if (!facultyRole) {
          skippedCount++;
          errors.push(`Skipped '${facultyId}' - Faculty role not found in database`);
          continue;
        }

        const newUser = await User.create({
          name: name,
          email: loginEmail,
          password: hashedPassword,
          role: facultyRole._id
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

// @desc    Get My Faculty (Student Only)
// @route   GET /api/v1/faculty/my-faculty
// @access  Private (Student)
exports.getMyFaculty = async (req, res, next) => {
  try {
    const studentUser = req.user.id;
    
    // 1. Get the current logged in student's details
    const student = await Student.findOne({ user: studentUser });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // 2. Fetch all faculty members matching the student's branch
    const faculties = await Faculty.find({ branch: student.branch })
      .select('name facultyId personalEmail email phone designation subject qualification course branch joiningDate')
      .sort({ name: 1 });

    res.status(200).json({ 
      success: true, 
      count: faculties.length,
      data: faculties 
    });
  } catch (error) { next(error); }
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

    // Handle Documents (Add New & Delete Removed)
    let updatedDocuments = faculty.documents;

    // 1. Handle Existing Documents (Delete removed ones from Cloudinary)
    if (req.body.existingDocuments) {
      try {
        const keptDocuments = JSON.parse(req.body.existingDocuments);
        const keptPublicIds = keptDocuments.map(doc => doc.publicId).filter(id => id);

        // Identify documents to delete
        const docsToDelete = faculty.documents.filter(doc =>
          doc.publicId && !keptPublicIds.includes(doc.publicId)
        );

        // Delete from Cloudinary
        for (const doc of docsToDelete) {
          await cloudinary.uploader.destroy(doc.publicId);
        }
        updatedDocuments = keptDocuments;
      } catch (error) {
        console.error('Error parsing existingDocuments:', error);
      }
    }

    // 2. Handle New Files
    if (req.files && req.files.length > 0) {
      const newDocuments = req.files.map(file => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype,
        publicId: file.filename
      }));
      updatedDocuments = [...updatedDocuments, ...newDocuments];
    }

    req.body.documents = updatedDocuments;

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

// @desc    Get logged in faculty profile
// @route   GET /api/v1/faculty/profile/me
// @access  Private (Faculty)
exports.getMyProfile = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });

    if (!faculty) {
      res.status(404);
      throw new Error('Faculty profile not found');
    }

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged in faculty profile
// @route   PUT /api/v1/faculty/profile/me
// @access  Private (Faculty)
exports.updateMyProfile = async (req, res, next) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });

    if (!faculty) {
      res.status(404);
      throw new Error('Faculty profile not found');
    }

    // Only allow updating specific fields
    const allowedUpdates = {};
    if (req.body.phone) allowedUpdates.phone = req.body.phone;
    if (req.body.personalEmail) allowedUpdates.personalEmail = req.body.personalEmail;

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      faculty._id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedFaculty
    });
  } catch (error) {
    next(error);
  }
};