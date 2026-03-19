const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get my notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        $or: [
            { recipient: req.user.id },
            { isGlobal: true }
        ]
    }).sort({ createdAt: -1 }).limit(20);

    const unreadCount = await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications
    });
});

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Ensure the notification belongs to the user (if not global)
    if (!notification.isGlobal && notification.recipient.toString() !== req.user.id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user.id, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});
