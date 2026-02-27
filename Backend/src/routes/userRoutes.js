const express = require('express');
const {
    getAllUsers,
    deleteUser,
    toggleUserStatus,
    getUserProfile
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require SUPERADMIN access
router.use(protect);
router.use(authorize('SUPERADMIN'));

router.get('/', getAllUsers);
// Route to fetch underlying Admin or Faculty profile specifically
router.get('/:id/profile', getUserProfile);

// Route to Toggle User Status
router.put('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
