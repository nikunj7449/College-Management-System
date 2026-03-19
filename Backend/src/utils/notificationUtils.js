const Notification = require('../models/Notification');

/**
 * Send a notification to a user or as a global broadcast
 * @param {Object} options - Notification options
 * @param {string} options.recipient - User ID (optional if isGlobal is true)
 * @param {string} options.sender - Sender User ID (optional)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (FEE, EXAM, etc.)
 * @param {string} options.priority - Priority level (LOW, MEDIUM, HIGH, URGENT)
 * @param {string} options.link - Optional path to redirect to
 * @param {boolean} options.isGlobal - Whether this is a global broadcast
 * @param {Date} options.expiresAt - Optional expiration date
 */
exports.sendNotification = async ({
  recipient,
  sender,
  title,
  message,
  type = 'GENERAL',
  priority = 'MEDIUM',
  link,
  isGlobal = false,
  expiresAt
}) => {
  try {
    const notification = await Notification.create({
      recipient: isGlobal ? null : recipient,
      sender,
      title,
      message,
      type,
      priority,
      link,
      isGlobal,
      expiresAt
    });
    return notification;
  } catch (error) {
    console.error('[Notification Utility] Error creating notification:', error.message);
    throw error;
  }
};
