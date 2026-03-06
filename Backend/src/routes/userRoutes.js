const express = require('express');
const {
    getAllUsers,
    deleteUser,
    toggleUserStatus,
    getUserProfile
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require SUPERADMIN access OR specific USER permissions
router.use(protect);

router.get('/', requirePermission('USER', 'read'), getAllUsers);
// Route to fetch underlying Admin or Faculty profile specifically
router.get('/:id/profile', requirePermission('USER', 'read'), getUserProfile);

// Route to Toggle User Status
router.put('/:id/status', requirePermission('USER', 'update'), toggleUserStatus);
router.delete('/:id', requirePermission('USER', 'delete'), deleteUser);

module.exports = router;
