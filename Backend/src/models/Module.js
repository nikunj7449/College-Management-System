const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Module name is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    isSystem: {
        type: Boolean,
        default: false, // E.g., STUDENT, FACULTY, USER, ROLE probably shouldn't be deletable
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Module', moduleSchema);
