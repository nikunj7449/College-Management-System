const express = require('express');
const router = express.Router();
const {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getSystemModules
} = require('../controllers/roleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/modules', getSystemModules);

router.route('/')
    .post(authorize('SUPERADMIN'),createRole)
    .get(authorize('SUPERADMIN', 'ADMIN'),getAllRoles); // Allowed ADMIN to fetch roles for dropdowns

router.route('/:id')
    .get(getRoleById)
    .put(authorize('SUPERADMIN'),updateRole)
    .delete(authorize('SUPERADMIN'),deleteRole);

module.exports = router;
