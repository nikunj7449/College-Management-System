const Course = require('../models/Course');

// ==========================================
//                 CREATE
// ==========================================

// @desc    Create a new Course (e.g., B.Tech)
// @route   POST /api/v1/courses
exports.addCourse = async (req, res, next) => {
  try {
    const { name, duration, branches } = req.body;
    const course = await Course.create({ name, duration, branches });
    res.status(201).json({ success: true, data: course });
  } catch (error) { next(error); }
};

// @desc    Add a Branch to a Course
// @route   POST /api/v1/courses/:courseId/branches
exports.addBranch = async (req, res, next) => {
  try {
    const { name } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404); throw new Error('Course not found');
    }

    // Check duplicate branch name in this course
    if (course.branches.some(b => b.name === name)) {
      res.status(400); throw new Error('Branch already exists');
    }

    course.branches.push({ name, subjects: [] });
    await course.save();

    res.status(200).json({ success: true, data: course });
  } catch (error) { next(error); }
};

// @desc    Add Subject to a Branch
// @route   POST /api/v1/courses/:courseId/branches/:branchId/subjects
exports.addSubject = async (req, res, next) => {
  try {
    const { name, code, credits, semester } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404); throw new Error('Course not found');
    }

    const branch = course.branches.id(req.params.branchId);
    if (!branch) {
      res.status(404); throw new Error('Branch not found');
    }

    branch.subjects.push({ name, code, credits, semester });
    await course.save();

    res.status(200).json({ success: true, data: branch });
  } catch (error) { next(error); }
};

// ==========================================
//                 READ
// ==========================================

// @desc    Get All Courses (with full hierarchy)
// @route   GET /api/v1/courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) { next(error); }
};

// @desc    Get Single Course
// @route   GET /api/v1/courses/:id
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404); throw new Error('Course not found');
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) { next(error); }
};

// ==========================================
//                 UPDATE
// ==========================================

// @desc    Update Course Details (Name/Duration)
// @route   PUT /api/v1/courses/:id
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!course) {
      res.status(404); throw new Error('Course not found');
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) { next(error); }
};

// @desc    Update a Branch
// @route   PUT /api/v1/courses/:courseId/branches/:branchId
exports.updateBranch = async (req, res, next) => {
  try {
    const { name } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404); throw new Error('Course not found');
    }

    const branch = course.branches.id(req.params.branchId);
    if (!branch) {
      res.status(404); throw new Error('Branch not found');
    }

    // Check duplicate branch name in this course (excluding current branch)
    if (course.branches.some(b => b.name === name && b._id.toString() !== req.params.branchId)) {
      res.status(400); throw new Error('Branch name already exists');
    }

    branch.name = name || branch.name;
    await course.save();

    res.status(200).json({ success: true, data: course });
  } catch (error) { next(error); }
};

// @desc    Update a Subject
// @route   PUT /api/v1/courses/:courseId/branches/:branchId/subjects/:subjectId
exports.updateSubject = async (req, res, next) => {
  try {
    const { name, code, credits, semester } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404); throw new Error('Course not found');
    }

    const branch = course.branches.id(req.params.branchId);
    if (!branch) {
      res.status(404); throw new Error('Branch not found');
    }

    const subject = branch.subjects.id(req.params.subjectId);
    if (!subject) {
      res.status(404); throw new Error('Subject not found');
    }

    if (name) subject.name = name;
    if (code) subject.code = code;
    if (credits) subject.credits = credits;
    if (semester) subject.semester = semester;

    await course.save();

    res.status(200).json({ success: true, data: branch });
  } catch (error) { next(error); }
};

// ==========================================
//                 DELETE
// ==========================================

// @desc    Delete Entire Course
// @route   DELETE /api/v1/courses/:id
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404); throw new Error('Course not found');
    }
    await course.deleteOne();
    res.status(200).json({ success: true, message: 'Course deleted' });
  } catch (error) { next(error); }
};

// @desc    Delete a Specific Branch
// @route   DELETE /api/v1/courses/:courseId/branches/:branchId
exports.deleteBranch = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404); throw new Error('Course not found');
    }

    // Pull (Remove) the branch from the array
    course.branches.pull({ _id: req.params.branchId });
    await course.save();

    res.status(200).json({ success: true, message: 'Branch deleted', data: course });
  } catch (error) { next(error); }
};

// @desc    Delete a Subject from a Branch
// @route   DELETE /api/v1/courses/:courseId/branches/:branchId/subjects/:subjectId
exports.deleteSubject = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404); throw new Error('Course not found');
    }

    const branch = course.branches.id(req.params.branchId);
    if (!branch) {
      res.status(404); throw new Error('Branch not found');
    }

    // Pull subject from branch
    branch.subjects.pull({ _id: req.params.subjectId });
    await course.save();

    res.status(200).json({ success: true, message: 'Subject deleted', data: branch });
  } catch (error) { next(error); }
};

// ... existing imports

// @desc    Bulk Upload Courses (Mass Entry)
// @route   POST /api/v1/courses/bulk
// @access  Private (Admin)
exports.addBulkCourses = async (req, res, next) => {
  try {
    const coursesData = req.body; // Expecting an Array [ {}, {} ]

    // 1. Basic Validation
    if (!Array.isArray(coursesData) || coursesData.length === 0) {
      res.status(400);
      throw new Error('Please provide an array of courses');
    }

    let addedCount = 0;
    let skippedCount = 0;
    const errors = [];

    // 2. Loop through each course in the array
    for (const course of coursesData) {
      // Check if course with this name already exists
      const courseExists = await Course.findOne({ name: course.name });

      if (courseExists) {
        skippedCount++;
        errors.push(`Skipped '${course.name}' - Already exists`);
        continue; // Skip this iteration
      }

      // If not exists, create it (Mongoose handles the nested Branches & Subjects automatically!)
      try {
        await Course.create(course);
        addedCount++;
      } catch (err) {
        errors.push(`Failed to add '${course.name}' - ${err.message}`);
      }
    }

    // 3. Return Summary
    res.status(201).json({
      success: true,
      message: `Process complete. Added: ${addedCount}, Skipped: ${skippedCount}`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    next(error);
  }
};