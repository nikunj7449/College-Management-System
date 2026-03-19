const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null indicates a global broadcast
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  type: {
    type: String,
    enum: ['FEE', 'EXAM', 'ATTENDANCE', 'EVENT', 'GENERAL'],
    default: 'GENERAL'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  link: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ isGlobal: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
