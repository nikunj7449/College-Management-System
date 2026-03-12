const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Exam name is required'],
        trim: true,
        maxlength: [100, 'Exam name cannot exceed 100 characters']
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    },
    semester: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Exam date is required']
    },
    startTime: {
        type: String,
        trim: true
    },
    endTime: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Exam type is required'],
        enum: ['Midterm', 'Final', 'Quiz', 'Practical', 'Unit Test', 'Other']
    },
    status: {
        type: String,
        required: true,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    totalMarks: {
        type: Number
    },
    passingMarks: {
        type: Number
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);
