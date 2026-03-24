const cron = require('node-cron');
const ScheduledReminder = require('../models/ScheduledReminder');
const StudentFee = require('../models/StudentFee');
const sendEmail = require('./sendEmail');
const { sendNotification } = require('./notificationUtils');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const initCronJobs = () => {
    // Run EVERY MINUTE to check for precisely scheduled reminders
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const currentDayOfWeek = now.getDay(); // 0(Sun) to 6(Sat)
            const currentDate = now.getDate();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
            const currentFullDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            // Find all active reminders
            const activeReminders = await ScheduledReminder.find({ isActive: true });

            for (const reminder of activeReminders) {
                // 1. First check if the time matches
                if (reminder.time !== currentTime) continue;

                let shouldRun = false;

                if (reminder.scheduleType === 'ONE_TIME') {
                    // Check if date matches (comparing only the date part)
                    const reminderDate = new Date(reminder.date);
                    const reminderFullDate = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate()).getTime();

                    if (currentFullDate === reminderFullDate) {
                        shouldRun = true;
                    }
                } else if (reminder.scheduleType === 'RECURRING') {
                    switch (reminder.frequency) {
                        case 'DAILY':
                            shouldRun = true;
                            break;
                        case 'WEEKLY':
                            shouldRun = reminder.daysOfWeek && reminder.daysOfWeek.includes(currentDayOfWeek);
                            break;
                        case 'MONTHLY':
                            shouldRun = (currentDate === reminder.dayOfMonth);
                            break;
                    }
                }

                if (!shouldRun) continue;

                // Process this reminder
                console.log(`[Cron] Processing Reminder: ${reminder._id} - Type: ${reminder.scheduleType}`);

                const query = { pendingAmount: { $gt: 0 }, _id: { $in: reminder.studentFeeIds } };

                let feesToNotify;
                if (reminder.notificationTypes.includes('EMAIL')) {
                    feesToNotify = await StudentFee.find(query)
                        .populate({
                            path: 'student',
                            select: 'name user course branch sem personalEmail isActive',
                            populate: {
                                path: 'user',
                                select: 'email'
                            }
                        });
                } else {
                    feesToNotify = await StudentFee.find(query)
                        .populate('student', 'name user course branch sem isActive');
                }

                // Filter out inactive students
                feesToNotify = feesToNotify.filter(record => record.student && record.student.isActive);

                if (feesToNotify.length > 0) {
                    // Batch processing
                    const BATCH_SIZE = 5;
                    const DELAY_BETWEEN_BATCHES_MS = 1500;

                    for (let i = 0; i < feesToNotify.length; i += BATCH_SIZE) {
                        const batch = feesToNotify.slice(i, i + BATCH_SIZE);
                        const batchPromises = batch.map(async (record) => {
                            const student = record.student;
                            if (!student) return;

                            const defaultMessage = `Hello ${student.name}, you have a pending fee balance of ₹${record.pendingAmount.toLocaleString()} for Sem ${record.semester || 'N/A'}. Please clear it at the earliest.`;
                            const message = reminder.customMessage || defaultMessage;

                            // System Notification
                            if (reminder.notificationTypes.includes('SYSTEM') && student.user) {
                                try {
                                    await sendNotification({
                                        recipient: student.user._id || student.user,
                                        sender: reminder.createdBy,
                                        title: 'Fee Payment Reminder',
                                        message: message,
                                        type: 'FEE',
                                        priority: 'HIGH',
                                        link: '/student/fees'
                                    });
                                } catch (error) {
                                    console.error(`[Cron Fee System] Failed to send to ${student.name}:`, error.message);
                                }
                            }

                            // Email Notification
                            if (reminder.notificationTypes.includes('EMAIL')) {
                                const emailAddress = student.personalEmail;
                                if (emailAddress) {
                                    try {
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
                                    } catch (error) {
                                        console.error(`[Cron Fee Email] Failed to send to ${emailAddress}:`, error.message);
                                    }
                                }
                            }
                        });

                        await Promise.all(batchPromises);

                        if (i + BATCH_SIZE < feesToNotify.length) {
                            await delay(DELAY_BETWEEN_BATCHES_MS);
                        }
                    }
                }

                // Update lastRunAt
                reminder.lastRunAt = now;

                // If it was a ONE_TIME job, deactivate it
                if (reminder.scheduleType === 'ONE_TIME') {
                    reminder.isActive = false;
                }

                await reminder.save();
            }
        } catch (error) {
            console.error('[Cron] Fee Reminder Job Error:', error);
        }
    });

    console.log('[Cron] Fee Reminders Job (Minute-Polling) initialized.');
};

module.exports = { initCronJobs };
