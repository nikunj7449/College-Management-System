const Event = require('../models/Event');
const cloudinary = require('cloudinary').v2;

// @desc    Get all events
// @route   GET /api/events
// @access  Public (or protected based on your auth logic)
exports.getAllEvents = async (req, res) => {
    try {
        // Find all events, sort by date ascending (closest first)
        const events = await Event.find()
            .populate('createdBy', 'name email role')
            .sort({ date: 1, startTime: 1 });

        // Transform the '_id' to 'id' to match frontend expectations
        const transformedEvents = events.map(event => {
            const ev = event.toObject();
            ev.id = ev._id.toString();
            // Optional: Format dates to YYYY-MM-DD strings to match frontend state if needed
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

        // If Multer processed a file, the Cloudinary URL is in req.file.path
        if (req.file) {
            eventData.imageURL = req.file.path;
            eventData.imagePublicId = req.file.filename;
        }

        // Attach the ID of the logged-in user who represents the creator
        eventData.createdBy = req.user._id;

        const event = await Event.create(eventData);
        const savedEvent = await Event.findById(event._id).populate('createdBy', 'name email role');

        const ev = savedEvent.toObject();
        ev.id = ev._id.toString();

        res.status(201).json({
            success: true,
            data: ev
        });
    } catch (error) {
        // Handle Mongoose validation errors nicely
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

        // Ownership Check: 
        // If the user is FACULTY, they can only delete events they created themselves.
        if (req.user.role === 'FACULTY' && event.createdBy.toString() !== req.user._id.toString()) {
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
