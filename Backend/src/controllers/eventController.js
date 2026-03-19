const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Role = require('../models/Role');
const cloudinary = require('cloudinary').v2;

// @desc    Get all events
// @route   GET /api/events
// @access  Public (or protected based on your auth logic)
exports.getAllEvents = async (req, res) => {
    try {
        let query = {};
        const userRole = req.user?.role?.name || req.user?.role;

        // Filtering logic based on user role and permissions
        if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
            // Admins can see all events in any status
            query = {};
        } else if (userRole === 'FACULTY') {
            // Faculty can see all 'Approved' events OR events they created themselves (even if Pending/Rejected)
            query = {
                $or: [
                    { status: 'Approved' },
                    { createdBy: req.user._id }
                ]
            };
        } else {
            // Default (Students, Guests etc.) can ONLY see Approved events
            query = { 
                $or: [
                    { status: 'Approved' },
                    { status: { $exists: false } }
                ]
            };
        }

        const events = await Event.find(query)
            .populate('createdBy', 'name email role')
            .sort({ date: 1, startTime: 1 });

        const transformedEvents = events.map(event => {
            const ev = event.toObject();
            ev.id = ev._id.toString();
            if (ev.date) {
                ev.date = ev.date.toISOString().split('T')[0];
            }
            if (ev.registrationDeadline) {
                ev.registrationDeadline = ev.registrationDeadline.toISOString().split('T')[0];
            }
            return ev;
        });

        res.status(200).json({
            success: true,
            count: transformedEvents.length,
            data: transformedEvents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error in fetching events',
            error: error.message
        });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email role');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const ev = event.toObject();
        ev.id = ev._id.toString();
        if (ev.date) ev.date = ev.date.toISOString().split('T')[0];
        if (ev.registrationDeadline) ev.registrationDeadline = ev.registrationDeadline.toISOString().split('T')[0];

        res.status(200).json({
            success: true,
            data: ev
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error in fetching event',
            error: error.message
        });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
    try {
        let eventData = { ...req.body };
        const userRole = req.user?.role?.name || req.user?.role;

        // If Multer processed a file, the Cloudinary URL is in req.file.path
        if (req.file) {
            eventData.imageURL = req.file.path;
            eventData.imagePublicId = req.file.filename;
        }

        // Attach the ID of the logged-in user who represents the creator
        eventData.createdBy = req.user._id;

        // Set initial status based on role
        if (userRole === 'FACULTY') {
            eventData.status = 'Pending';
        } else {
            eventData.status = 'Approved';
        }

        const event = await Event.create(eventData);
        const savedEvent = await Event.findById(event._id).populate('createdBy', 'name email role');

        // Notify Admins if it's a faculty creation
        if (userRole === 'FACULTY') {
            try {
                // Find Admin and Superadmin roles
                const adminRoles = await Role.find({ name: { $in: ['ADMIN', 'SUPERADMIN'] } });
                const adminRoleIds = adminRoles.map(r => r._id);
                
                // Find all Admins/Superadmins
                const admins = await User.find({ role: { $in: adminRoleIds } });

                // Create a notification for each admin
                const notifications = admins.map(admin => ({
                    recipient: admin._id,
                    sender: req.user._id,
                    title: 'New Event Pending Approval',
                    message: `Faculty member ${req.user.name} has created a new event "${event.title}" which requires your approval.`,
                    type: 'EVENT',
                    priority: 'MEDIUM',
                    link: '/events' // Link to events manager
                }));

                await Notification.insertMany(notifications);
            } catch (notifError) {
                console.error('Error sending notifications to admins:', notifError);
            }
        }

        const ev = savedEvent.toObject();
        ev.id = ev._id.toString();

        res.status(201).json({
            success: true,
            data: ev
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error in creating event',
            error: error.message
        });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        let eventData = { ...req.body };

        // Ownership Check: 
        // If the user is FACULTY, they can only update events they created themselves.
        if (req.user.role === 'FACULTY' && event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to modify this event.'
            });
        }

        // If a new image was uploaded via Multer and Cloudinary
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (event.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(event.imagePublicId);
                } catch (err) {
                    console.error('Error deleting old event image from Cloudinary:', err);
                }
            }
            eventData.imageURL = req.file.path;
            eventData.imagePublicId = req.file.filename;
        }

        event = await Event.findByIdAndUpdate(req.params.id, eventData, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name email role');

        const ev = event.toObject();
        ev.id = ev._id.toString();

        res.status(200).json({
            success: true,
            data: ev
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error in updating event',
            error: error.message
        });
    }
};

// @desc    Approve event
// @route   PATCH /api/events/:id/approve
// @access  Private (Admin/Superadmin only)
exports.approveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        event.status = 'Approved';
        await event.save();

        // Notify creator
        try {
            await Notification.create({
                recipient: event.createdBy,
                sender: req.user._id,
                title: 'Event Approved',
                message: `Your event "${event.title}" has been approved and is now visible to the campus.`,
                type: 'EVENT',
                priority: 'HIGH',
                link: '/events'
            });
        } catch (notifError) {
            console.error('Error notifying faculty of approval:', notifError);
        }

        res.status(200).json({
            success: true,
            message: 'Event approved successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error in approving event',
            error: error.message
        });
    }
};

// @desc    Reject event
// @route   PATCH /api/events/:id/reject
// @access  Private (Admin/Superadmin only)
exports.rejectEvent = async (req, res) => {
    try {
        const { reason } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        event.status = 'Rejected';
        await event.save();

        // Notify creator
        try {
            await Notification.create({
                recipient: event.createdBy,
                sender: req.user._id,
                title: 'Event Rejected',
                message: `Your event "${event.title}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
                type: 'EVENT',
                priority: 'HIGH',
                link: '/events'
            });
        } catch (notifError) {
            console.error('Error notifying faculty of rejection:', notifError);
        }

        res.status(200).json({
            success: true,
            message: 'Event rejected successfully',
            data: event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error in rejecting event',
            error: error.message
        });
    }
};
// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const userRole = req.user?.role?.name || req.user?.role;

        // Ownership Check: 
        // If the user is FACULTY, they can only delete events they created themselves.
        if (userRole === 'FACULTY' && event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to delete this event.'
            });
        }

        // Delete image from Cloudinary
        if (event.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(event.imagePublicId);
            } catch (err) {
                console.error('Error deleting event image from Cloudinary:', err);
            }
        }

        await event.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error in deleting event',
            error: error.message
        });
    }
};
