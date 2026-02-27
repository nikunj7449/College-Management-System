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
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router
    .route('/')
    .get(getAllEvents)
    .post(protect, upload.single('imageURL'), createEvent); // Only logged in users can create

router
    .route('/:id')
    .get(getEventById)
    .put(protect, upload.single('imageURL'), updateEvent) // Only logged in users can update
    .delete(protect, deleteEvent); // Only logged in users can delete

module.exports = router;
