const express = require('express');
const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/eventController');

// You can add your authentication middleware here if needed
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(requirePermission('EVENT', 'read'), getAllEvents)
    .post(requirePermission('EVENT', 'create'), upload.single('imageURL'), createEvent);

router
    .route('/:id')
    .get(requirePermission('EVENT', 'read'), getEventById)
    .put(requirePermission('EVENT', 'update'), upload.single('imageURL'), updateEvent)
    .delete(requirePermission('EVENT', 'delete'), deleteEvent);

module.exports = router;
