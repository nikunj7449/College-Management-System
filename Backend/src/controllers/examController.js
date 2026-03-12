const Exam = require('../models/Exam');
const Student = require('../models/Student');

// @desc    Get all exams
// @route   GET /api/v1/exams
// @access  Private (Admin, SuperAdmin or Faculty via EXAM read perm)
exports.getExams = async (req, res, next) => {
    try {
        const exams = await Exam.find()
            .populate('createdBy', 'firstName lastName')
            .populate('course', 'name')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single exam
// @route   GET /api/v1/exams/:id
// @access  Private 
exports.getExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('createdBy', 'firstName lastName');

        if (!exam) {
            res.status(404);
            throw new Error('Exam not found');
        }

        res.status(200).json({
            success: true,
            data: exam
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new exam
// @route   POST /api/v1/exams
// @access  Private (Admin/SuperAdmin via EXAM create perm)
exports.createExam = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.createdBy = req.user.id;

        const exam = await Exam.create(req.body);

        res.status(201).json({
            success: true,
            data: exam,
            message: 'Exam created successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update exam
// @route   PUT /api/v1/exams/:id
// @access  Private 
exports.updateExam = async (req, res, next) => {
    try {
        let exam = await Exam.findById(req.params.id);

        if (!exam) {
            res.status(404);
            throw new Error('Exam not found');
        }

        exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: exam,
            message: 'Exam updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete exam
// @route   DELETE /api/v1/exams/:id
// @access  Private
exports.deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            res.status(404);
            throw new Error('Exam not found');
        }

        await exam.deleteOne();

        res.status(200).json({
            success: true,
            data: {},
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get My Exams (Student Only)
// @route   GET /api/v1/exams/my-exams
// @access  Private (Student)
exports.getMyExams = async (req, res, next) => {
    try {
        const studentUser = req.user.id;
        
        // 1. Get student details
        const student = await Student.findOne({ user: studentUser });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        // 2. Fetch upcoming exams for this student's course/branch/sem
        // Note: The Exam model might not currently have branch/sem fields. If it doesn't,
        // we return all exams. Ideally, Exams should be linked to Course/Sem.
        // Assuming Exam model just returns all for now, but sorting by date.
        
        // For a more robust app, the Exam model should have `course`, `branch`, `sem` 
        // to filter exactly. Let's return all upcoming exams for now, sorted by date.
        // Filter by status instead of raw date to avoid timezone/midnight edge-cases
        // This also catches same-day exams which `$gte: new Date()` would miss
        const exams = await Exam.find({ status: { $in: ['Upcoming', 'Ongoing'] } })
            .populate('course', 'name')
            .select('name date type startTime endTime description status semester totalMarks passingMarks course')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            data: exams
        });
    } catch (error) {
        next(error);
    }
};
