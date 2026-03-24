const FeeCategory = require('../models/FeeCategory');
const FeeStructure = require('../models/FeeStructure');
const StudentFee = require('../models/StudentFee');
const FeePayment = require('../models/FeePayment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const ScheduledReminder = require('../models/ScheduledReminder');
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');
const { getFeeReminderTemplate } = require('../utils/emailTemplates');
const { sendNotification } = require('../utils/notificationUtils');

// --- 1. Fee Categories ---

// @desc    Create Fee Category
// @route   POST /api/v1/fees/categories
// @access  Private (Admin/SuperAdmin)
exports.createCategory = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    const category = await FeeCategory.create({
        name,
        description,
        status,
        createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: category });
});

// @desc    Bulk Create Fee Categories
// @route   POST /api/v1/fees/categories/bulk
// @access  Private (Admin/SuperAdmin)
exports.bulkCreateCategories = asyncHandler(async (req, res) => {
    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of fee categories');
    }

    const processedCategories = categories.map(c => ({
        ...c,
        createdBy: req.user.id
    }));

    const result = await FeeCategory.insertMany(processedCategories);

    res.status(201).json({
        success: true,
        count: result.length,
        data: result
    });
});

// @desc    Get All Fee Categories
// @route   GET /api/v1/fees/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await FeeCategory.find().populate('createdBy', 'name');
    res.status(200).json({ success: true, count: categories.length, data: categories });
});

// @desc    Update Fee Category
// @route   PATCH /api/v1/fees/categories/:id
// @access  Private (Admin/SuperAdmin)
exports.updateCategory = asyncHandler(async (req, res) => {
    const { name, description, status } = req.body;

    let category = await FeeCategory.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.status = status || category.status;

    await category.save();
    res.status(200).json({ success: true, data: category });
});

// @desc    Delete Fee Category
// @route   DELETE /api/v1/fees/categories/:id
// @access  Private (Admin/SuperAdmin)
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await FeeCategory.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    // Check if category is used in any FeeStructure
    const isUsed = await FeeStructure.findOne({ 'fees.category': req.params.id });
    if (isUsed) {
        res.status(400);
        throw new Error('Cannot delete category. It is being used in one or more fee structures.');
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: 'Category deleted' });
});

// --- 2. Fee Structure ---

// @desc    Create Fee Structure
// @route   POST /api/v1/fees/structures
// @access  Private (Admin/SuperAdmin)
exports.createStructure = asyncHandler(async (req, res) => {
    const { courseId, branchId, semester, fees } = req.body;

    console.log('[FeeController] Creating structure:', { courseId, branchId, semester, feesCount: fees?.length });

    try {
        // Enforce unique categories
        if (fees && fees.length > 0) {
            const categories = fees.map(f => f.categoryId.toString());
            const uniqueCategories = [...new Set(categories)];
            if (categories.length !== uniqueCategories.length) {
                res.status(400);
                throw new Error('Duplicate fee categories are not allowed in the same structure');
            }
        }

        const structure = new FeeStructure({
            courseId,
            branchId,
            semester,
            fees,
            createdBy: req.user.id
        });

        await structure.save();
        res.status(201).json({ success: true, data: structure });
    } catch (error) {
        console.error('[FeeController] Create Error:', error.message);
        res.status(400);
        throw new Error(error.message || 'Failed to create fee structure');
    }
});

// @desc    Bulk Create Fee Structures
// @route   POST /api/v1/fees/structures/bulk
// @access  Private (Admin/SuperAdmin)
exports.bulkCreateStructures = asyncHandler(async (req, res) => {
    const { structures } = req.body;

    if (!Array.isArray(structures) || structures.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of fee structures');
    }

    const processedStructures = structures.map(s => ({
        ...s,
        createdBy: req.user.id
    }));

    const result = await FeeStructure.insertMany(processedStructures);

    res.status(201).json({
        success: true,
        count: result.length,
        data: result
    });
});

// @desc    Update Fee Structure
// @route   PATCH /api/v1/fees/structures/:id
// @access  Private (Admin/SuperAdmin)
exports.updateStructure = asyncHandler(async (req, res) => {
    const { courseId, branchId, semester, fees } = req.body;

    let structure = await FeeStructure.findById(req.params.id);

    if (!structure) {
        res.status(404);
        throw new Error('Fee Structure not found');
    }

    structure.courseId = courseId || structure.courseId;
    structure.branchId = branchId || structure.branchId;
    structure.semester = semester || structure.semester;

    if (fees) {
        // Enforce unique categories
        const categories = fees.map(f => f.categoryId.toString());
        const uniqueCategories = [...new Set(categories)];
        if (categories.length !== uniqueCategories.length) {
            res.status(400);
            throw new Error('Duplicate fee categories are not allowed in the same structure');
        }
        structure.fees = fees;
    }

    await structure.save();

    res.status(200).json({ success: true, data: structure });
});

// @desc    Delete Fee Structure
// @route   DELETE /api/v1/fees/structures/:id
// @access  Private (Admin/SuperAdmin)
exports.deleteStructure = asyncHandler(async (req, res) => {
    const structure = await FeeStructure.findById(req.params.id);

    if (!structure) {
        res.status(404);
        throw new Error('Fee Structure not found');
    }

    // Optional: Check if assigned to any student before deleting
    const isAssigned = await StudentFee.findOne({ feeStructure: req.params.id });
    if (isAssigned) {
        res.status(400);
        throw new Error('Cannot delete structure. It is currently assigned to students.');
    }

    await structure.deleteOne();

    res.status(200).json({ success: true, message: 'Fee Structure deleted' });
});

// @desc    Get All Fee Structures
// @route   GET /api/v1/fees/structures
// @access  Private
exports.getStructures = asyncHandler(async (req, res) => {
    const { courseId, branchId, semester, search } = req.query;

    let query = {};
    if (courseId) query.courseId = courseId;
    if (branchId) query.branchId = branchId;
    if (semester) query.semester = semester;

    if (search) {
        // Find courses or branches matching the search term
        const matchingCourses = await Course.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { "branches.name": { $regex: search, $options: 'i' } }
            ]
        }).select('_id branches');

        const courseIds = [];
        const branchIds = [];

        matchingCourses.forEach(c => {
            // If course name matches, add to course search
            if (new RegExp(search, 'i').test(c.name)) {
                courseIds.push(c._id);
            }
            // Check each branch for a match
            c.branches.forEach(b => {
                if (new RegExp(search, 'i').test(b.name)) {
                    branchIds.push(b._id);
                }
            });
        });

        query.$or = [
            { courseId: { $in: courseIds } },
            { branchId: { $in: branchIds } }
        ];
    }

    const structures = await FeeStructure.find(query)
        .populate('courseId', 'name branches')
        .populate('fees.categoryId', 'name')
        .populate('createdBy', 'name');
    res.status(200).json({ success: true, count: structures.length, data: structures });
});

// --- 3. Assign Fees to Student ---

/**
 * Utility function to automatically assign fee structure to a student
 * Based on their course name, branch name, and semester string
 */
const autoAssignStudentFees = async (student) => {
    if (!student.course || !student.branch || !student.sem) return null;

    // 1. Find course document to get IDs
    const courseDoc = await Course.findOne({
        name: { $regex: new RegExp(`^${student.course}$`, 'i') }
    });
    if (!courseDoc) return null;

    // 2. Find branch ID
    const branchDoc = courseDoc.branches.find(b =>
        new RegExp(`^${student.branch}$`, 'i').test(b.name)
    );
    if (!branchDoc) return null;

    // 3. Find matching FeeStructure
    const semesterNum = parseInt(student.sem);
    const structure = await FeeStructure.findOne({
        courseId: courseDoc._id,
        branchId: branchDoc._id,
        semester: semesterNum
    });

    if (!structure) return null;

    // 4. Check if already assigned
    const existing = await StudentFee.findOne({
        student: student._id,
        semester: semesterNum
    });

    if (existing) return existing;

    // 5. Create new StudentFee record
    return await StudentFee.create({
        student: student._id,
        feeStructure: structure._id,
        semester: semesterNum,
        totalFee: structure.totalAmount,
        pendingAmount: structure.totalAmount
    });
};

// Export the utility for other controllers
exports.autoAssignStudentFees = autoAssignStudentFees;

// @desc    Bulk Assign Fee Structure to Students (by Course and Branch)
// @route   POST /api/v1/fees/assign-bulk
// @access  Private (Admin/SuperAdmin)
exports.assignFeeBulk = asyncHandler(async (req, res) => {
    const { courseId, branchId, structureId } = req.body;

    const structure = await FeeStructure.findById(structureId);
    if (!structure) {
        res.status(404);
        throw new Error('Fee Structure not found');
    }

    // Resolve course and branch names from IDs
    const courseDoc = await Course.findById(courseId);
    if (!courseDoc) {
        res.status(404);
        throw new Error('Course not found');
    }

    const branchDoc = courseDoc.branches.id(branchId);
    const branchName = branchDoc ? branchDoc.name : null;

    if (!branchName) {
        res.status(404);
        throw new Error('Branch not found in this course');
    }

    // Find all active students in that course and branch (using names as Student model stores names)
    const students = await Student.find({ course: courseDoc.name, branch: branchName, isActive: true });

    if (students.length === 0) {
        res.status(404);
        throw new Error(`No students found for ${courseDoc.name} - ${branchName}`);
    }

    let assignedCount = 0;
    let skippedCount = 0;

    for (const student of students) {
        // Check if already assigned for this semester
        const existing = await StudentFee.findOne({
            student: student._id,
            semester: structure.semester
        });

        if (existing) {
            skippedCount++;
            continue;
        }

        await StudentFee.create({
            student: student._id,
            feeStructure: structureId,
            semester: structure.semester,
            totalFee: structure.totalAmount,
            pendingAmount: structure.totalAmount
        });
        assignedCount++;
    }

    res.status(201).json({
        success: true,
        message: `Assigned to ${assignedCount} students. Skipped ${skippedCount} items.`,
        data: { assignedCount, skippedCount }
    });
});

// @desc    Sync All Students with Matching Fee Structures
// @route   POST /api/v1/fees/sync-all
// @access  Private (Admin/SuperAdmin)
exports.syncAllStudentFees = asyncHandler(async (req, res) => {
    const students = await Student.find({ isActive: true });

    let assignedCount = 0;
    let alreadyExistedCount = 0;
    let noMatchCount = 0;

    for (const student of students) {
        const semesterNum = parseInt(student.sem);
        if (isNaN(semesterNum)) {
            noMatchCount++;
            continue;
        }

        // 1. Check if fee record already exists for this semester
        const existing = await StudentFee.findOne({
            student: student._id,
            semester: semesterNum
        });

        if (existing) {
            alreadyExistedCount++;
            continue;
        }

        // 2. Try to auto-assign
        const feeRecord = await autoAssignStudentFees(student);
        if (feeRecord) {
            assignedCount++;
        } else {
            noMatchCount++;
        }
    }

    res.status(200).json({
        success: true,
        message: `Sync complete. Created ${assignedCount} new records.`,
        data: {
            totalStudents: students.length,
            newlyAssigned: assignedCount,
            alreadyExisted: alreadyExistedCount,
            failedToMatch: noMatchCount
        }
    });
});

// --- 4. Fee Payment ---

// @desc    Record Fee Payment
// @route   POST /api/v1/fees/payments
// @access  Private (Admin/SuperAdmin)
exports.recordPayment = asyncHandler(async (req, res) => {
    const { studentFeeId, amount, paymentMode, transactionId, remark } = req.body;

    const studentFee = await StudentFee.findById(studentFeeId);
    if (!studentFee) {
        res.status(404);
        throw new Error('Student Fee record not found');
    }

    if (amount > studentFee.pendingAmount) {
        res.status(400);
        throw new Error(`Payment amount (${amount}) exceeds pending balance (${studentFee.pendingAmount})`);
    }

    // Create Payment Record
    const payment = await FeePayment.create({
        student: studentFee.student,
        studentFee: studentFeeId,
        amount,
        paymentMode,
        transactionId,
        remark,
        recordedBy: req.user.id
    });

    // Update StudentFee balance
    studentFee.paidAmount += amount;
    // The pre-save hook in StudentFee will handle pendingAmount and status updates
    await studentFee.save();

    res.status(201).json({ success: true, data: payment });
});

// --- 5. Extra Fees ---

// @desc    Add Extra Fee to Student
// @route   POST /api/v1/fees/extra
// @access  Private (Admin/SuperAdmin)
exports.addExtraFee = asyncHandler(async (req, res) => {
    const { studentFeeId, amount, remark } = req.body;

    const studentFee = await StudentFee.findById(studentFeeId);
    if (!studentFee) {
        res.status(404);
        throw new Error('Student Fee record not found');
    }

    studentFee.extraFees.push({ amount, remark, date: Date.now() });

    // Save will trigger the hook to update pendingAmount and status
    await studentFee.save();

    res.status(200).json({ success: true, data: studentFee });
});

// --- 6. Student Self-Payment ---

// @desc    Student Pay Their Own Fees (Simulated Online)
// @route   POST /api/v1/fees/pay
// @access  Private (Student)
exports.payMyFees = asyncHandler(async (req, res) => {
    const { studentFeeId, amount, paymentMode, transactionId } = req.body;

    // 1. Get student profile
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    // 2. Find the fee record and ensure it belongs to this student
    const studentFee = await StudentFee.findOne({ _id: studentFeeId, student: student._id });
    if (!studentFee) {
        res.status(404);
        throw new Error('Fee record not found or access denied');
    }

    if (amount > studentFee.pendingAmount) {
        res.status(400);
        throw new Error(`Payment amount (${amount}) exceeds pending balance (${studentFee.pendingAmount})`);
    }

    // 3. Create Payment Record (Recorded by the student user themselves)
    const payment = await FeePayment.create({
        student: student._id,
        studentFee: studentFeeId,
        amount,
        paymentMode,
        transactionId,
        remark: 'Student Online Payment',
        recordedBy: req.user.id
    });

    // 4. Update StudentFee balance
    studentFee.paidAmount += amount;
    await studentFee.save();

    res.status(201).json({ success: true, data: payment });
});

// @desc    Create Stripe Payment Intent
// @route   POST /api/v1/fees/create-payment-intent
// @access  Private (Student)
exports.createPaymentIntent = asyncHandler(async (req, res) => {
    const { amount } = req.body;
    console.log('[Stripe Debug] Creating Intent for Amount:', amount, 'Student:', req.user.id);

    if (!process.env.STRIPE_SECRET_KEY) {
        res.status(500);
        throw new Error('Stripe Secret Key is not configured on server');
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    if (!amount || amount <= 0) {
        res.status(400);
        throw new Error('Valid amount is required');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in paise (for INR)
            currency: 'inr',
            description: `Fee Payment for ${req.user.name || 'Student'} (ID: ${req.user.id})`,
            metadata: {
                userId: req.user.id,
                studentName: req.user.name
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('[Stripe] PaymentIntent Error:', error.message);
        res.status(500);
        throw new Error('Failed to initiate payment. Please try again later.');
    }
});

// --- 7. Dashboard & History ---

// @desc    Get Student Fee Summary
// @route   GET /api/v1/fees/my-fees
// @access  Private (Student)
exports.getMyFees = asyncHandler(async (req, res) => {
    // 1. Get student profile
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    const fees = await StudentFee.find({ student: student._id })
        .populate('student', 'name rollNum studentId course branch sem')
        .populate({
            path: 'feeStructure',
            select: 'courseId branchId semester totalAmount fees',
            populate: [
                {
                    path: 'courseId',
                    select: 'name branches'
                },
                {
                    path: 'fees.categoryId',
                    select: 'name'
                }
            ]
        });

    res.status(200).json({ success: true, data: fees });
});

// @desc    Get Payment History for a specific StudentFee
// @route   GET /api/v1/fees/payments/:studentFeeId
// @access  Private
exports.getPaymentHistory = asyncHandler(async (req, res) => {
    const payments = await FeePayment.find({ studentFee: req.params.studentFeeId })
        .populate('recordedBy', 'name')
        .sort({ paymentDate: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
});

// --- 7. Reports ---

// @desc    Get Fee Reports
// @route   GET /api/v1/fees/reports
// @access  Private (Admin/SuperAdmin)
exports.getFeeReports = asyncHandler(async (req, res) => {
    const { semester, status, course, branch, year, search } = req.query;

    let query = {};
    if (semester) query.semester = semester;
    if (status) query.status = status;
    // Note: year filter currently matches the record's creation year or can be mapped to a specific field if added
    if (year) {
        const start = new Date(`${year}-01-01`);
        const end = new Date(`${year}-12-31T23:59:59.999Z`);
        query.createdAt = { $gte: start, $lte: end };
    }

    // Since course and branch are on the Student model, we may need to find students first or use aggregation
    let studentQuery = {};
    if (course) studentQuery.course = course;
    if (branch) studentQuery.branch = branch;
    if (search) {
        studentQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { rollNum: { $regex: search, $options: 'i' } },
            { studentId: { $regex: search, $options: 'i' } }
        ];
    }

    let records;
    if (Object.keys(studentQuery).length > 0) {
        const students = await Student.find(studentQuery).select('_id');
        const studentIds = students.map(s => s._id);
        query.student = { $in: studentIds };
    }

    records = await StudentFee.find(query)
        .populate('student', 'name rollNum studentId course branch sem')
        .populate('feeStructure', 'totalAmount')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: records.length, data: records });
});

// @desc    Send Internal System Notifications to students with pending fees
// @route   POST /api/v1/fees/reminders
// @access  Private (SuperAdmin)
exports.sendFeeRemainder = asyncHandler(async (req, res) => {
    const { notificationTypes = ['SYSTEM'], customMessage, studentFeeIds } = req.body;

    let query = { pendingAmount: { $gt: 0 } };

    // If specific IDs are provided, filter by them
    if (studentFeeIds && Array.isArray(studentFeeIds) && studentFeeIds.length > 0) {
        query._id = { $in: studentFeeIds };
    }

    // 1. Find the student fee records
    let feesToNotify;
    if (notificationTypes.includes('EMAIL')) {
        feesToNotify = await StudentFee.find(query)
            .populate({
                path: 'student',
                select: 'name user course branch sem email personalEmail',
                populate: {
                    path: 'user',
                    select: 'email'
                }
            });
    } else {
        feesToNotify = await StudentFee.find(query)
            .populate('student', 'name user course branch sem');
    }

    if (!feesToNotify || feesToNotify.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No matching pending fees found. No notifications sent.',
            sentCount: 0
        });
    }

    // Return response immediately so the frontend doesn't hang
    res.status(200).json({
        success: true,
        message: `Processing ${feesToNotify.length} reminders in the background...`,
        data: { totalToProcess: feesToNotify.length }
    });

    // Helper function to delay execution
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Run the batch processing in the background asynchronously
    (async () => {
        let sentCount = 0;
        let emailSentCount = 0;

        // Define batch size (e.g., send to 5 students at once, pause, then do the next 5)
        const BATCH_SIZE = 5;
        const DELAY_BETWEEN_BATCHES_MS = 1500; // 1.5 seconds

        for (let i = 0; i < feesToNotify.length; i += BATCH_SIZE) {
            const batch = feesToNotify.slice(i, i + BATCH_SIZE);

            console.log(`[Fee Reminders] Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(feesToNotify.length / BATCH_SIZE)}`);

            // Process current batch concurrently
            const batchPromises = batch.map(async (record) => {
                const student = record.student;
                if (!student) return;

                const defaultMessage = `Hello ${student.name}, you have a pending fee balance of ₹${record.pendingAmount.toLocaleString()} for Sem ${record.semester || 'N/A'}. Please clear it at the earliest.`;
                const message = customMessage || defaultMessage;

                // 1. System Notification
                if (notificationTypes.includes('SYSTEM') && student.user) {
                    try {
                        await sendNotification({
                            recipient: student.user._id || student.user,
                            sender: req.user.id,
                            title: 'Fee Payment Reminder',
                            message: message,
                            type: 'FEE',
                            priority: 'HIGH',
                            link: '/student/fees'
                        });
                        sentCount++;
                    } catch (error) {
                        console.error(`[Fee Reminder Notification] Failed to send to ${student.name}:`, error.message);
                    }
                }

                // 2. Email Notification
                if (notificationTypes.includes('EMAIL')) {
                    const emailAddress = student.personalEmail;
                    if (emailAddress) {
                        try {
                            console.log(`[Email] Sending to ${student.name}: ${emailAddress}`);
                            await sendEmail({
                                email: emailAddress,
                                subject: 'Fee Payment Reminder',
                                html: `
                                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                                        <h2>Fee Payment Reminder</h2>
                                        <p>${message}</p>
                                        <hr />
                                        <p style="font-size: 0.8em; color: #666;">This is an automated reminder from the College Management System.</p>
                                    </div>
                                `
                            });
                            emailSentCount++;
                        } catch (error) {
                            console.error(`[Fee Reminder Email] Failed to send to ${emailAddress}:`, error.message);
                        }
                    }
                }
            });

            // Wait for the entire batch of 5 to finish sending
            await Promise.all(batchPromises);

            // Imbue a delay between batches (skip delay if this is the last batch)
            if (i + BATCH_SIZE < feesToNotify.length) {
                console.log(`[Fee Reminders] Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000}s before next batch...`);
                await delay(DELAY_BETWEEN_BATCHES_MS);
            }
        }

        console.log(`[Fee Reminders Background Task] Complete. Notifications: ${sentCount}, Emails: ${emailSentCount}`);

        // Notify the admin/user who initiated the request
        try {
            await sendNotification({
                recipient: req.user.id,
                sender: req.user.id, // Or null if you want it explicitly from "System"
                title: 'Bulk Reminders Complete',
                message: `Successfully processed ${feesToNotify.length} pending fee records. Sent ${emailSentCount} emails and ${sentCount} system notifications.`,
                type: 'GENERAL',
                priority: 'MEDIUM',
                link: '/fees/students' // Optional: redirect back to fees page
            });
        } catch (err) {
            console.error('[Bulk Reminders] Failed to notify admin of completion:', err.message);
        }
    })();
});

// @desc    Schedule Internal System Notifications & Emails to students with pending fees
// @route   POST /api/v1/fees/reminders/schedule
// @access  Private (SuperAdmin)
exports.scheduleFeeReminder = asyncHandler(async (req, res) => {
    const { scheduleType, frequency, time, date, daysOfWeek, dayOfMonth, notificationTypes = ['SYSTEM'], customMessage, studentFeeIds } = req.body;

    if (!scheduleType || !['ONE_TIME', 'RECURRING'].includes(scheduleType)) {
        res.status(400);
        throw new Error('Valid scheduleType (ONE_TIME or RECURRING) is required');
    }

    if (!time) {
        res.status(400);
        throw new Error('Time is required');
    }

    if (scheduleType === 'ONE_TIME' && !date) {
        res.status(400);
        throw new Error('Date is required for ONE_TIME schedule');
    }

    if (scheduleType === 'RECURRING') {
        if (!frequency || !['DAILY', 'WEEKLY', 'MONTHLY'].includes(frequency)) {
            res.status(400);
            throw new Error('Valid frequency is required for RECURRING schedule');
        }
        if (frequency === 'WEEKLY' && (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0)) {
            res.status(400);
            throw new Error('daysOfWeek array is required for WEEKLY frequency');
        }
        if (frequency === 'MONTHLY' && !dayOfMonth) {
            res.status(400);
            throw new Error('dayOfMonth is required for MONTHLY frequency');
        }
    }

    const reminder = await ScheduledReminder.create({
        scheduleType,
        frequency: scheduleType === 'RECURRING' ? frequency : undefined,
        time,
        date: scheduleType === 'ONE_TIME' ? date : undefined,
        daysOfWeek: (scheduleType === 'RECURRING' && frequency === 'WEEKLY') ? daysOfWeek : undefined,
        dayOfMonth: (scheduleType === 'RECURRING' && frequency === 'MONTHLY') ? dayOfMonth : undefined,
        notificationTypes,
        customMessage: customMessage || '',
        studentFeeIds: studentFeeIds || [],
        createdBy: req.user.id,
        isActive: true
    });

    res.status(201).json({
        success: true,
        message: 'Fee reminder schedule created successfully',
        data: reminder
    });
});
