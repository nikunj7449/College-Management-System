const express = require('express');
const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent
} = require('../controllers/eventController');

const { protect } = require('../middleware/authMiddleware');
const { requirePermission, authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(requirePermission('EVENT', 'read'), getAllEvents)
    .post(requirePermission('EVENT', 'create'), upload.single('imageURL'), createEvent);

router
    .route('/:id/approve')
    .patch(authorize('ADMIN', 'SUPERADMIN'), approveEvent);

router
    .route('/:id/reject')
    .patch(authorize('ADMIN', 'SUPERADMIN'), rejectEvent);

router
    .route('/:id')
    .get(requirePermission('EVENT', 'read'), getEventById)
    .put(requirePermission('EVENT', 'update'), upload.single('imageURL'), updateEvent)
    .delete(requirePermission('EVENT', 'delete'), deleteEvent);

module.exports = router;
