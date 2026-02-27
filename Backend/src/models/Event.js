const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Event type is required'],
        enum: ['Seminar', 'Workshop', 'Webinar', 'Cultural', 'Sports', 'Conference', 'Guest Lecture', 'Hackathon', 'Other']
    },
    organizer: {
        type: String,
        required: [true, 'Organizer is required'],
        trim: true
    },
    audience: {
        type: [String],
        required: [true, 'Target audience is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'Select at least one target audience'
        }
    },
    capacity: {
        type: Number,
        min: [1, 'Capacity must be a positive number']
    },
    allowRegistration: {
        type: Boolean,
        default: false
    },
    registrationDeadline: {
        type: Date
    },
    meetingLink: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        trim: true
    },
    imageURL: {
        type: String, // Can be a URL or Base64 string from the frontend
        trim: true
    },
    imagePublicId: {
        type: String, // Cloudinary public ID for deletion
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
