const mongoose = require('mongoose');

const scheduledReminderSchema = new mongoose.Schema({
    scheduleType: {
        type: String,
        enum: ['ONE_TIME', 'RECURRING'],
        required: true
    },
    frequency: {
        type: String,
        enum: ['DAILY', 'WEEKLY', 'MONTHLY']
    },
    time: {
        type: String, // format HH:mm
        required: true
    },
    date: {
        type: Date // Used for ONE_TIME
    },
    daysOfWeek: [{
        type: Number, // 0 = Sunday, ..., 6 = Saturday (Used for WEEKLY)
        min: 0,
        max: 6
    }],
    dayOfMonth: {
        type: Number, // 1 to 31 (Used for MONTHLY)
        min: 1,
        max: 31
    },
    notificationTypes: [{
        type: String,
        enum: ['SYSTEM', 'EMAIL']
    }],
    customMessage: {
        type: String
    },
    studentFeeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentFee'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastRunAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledReminder', scheduledReminderSchema);
