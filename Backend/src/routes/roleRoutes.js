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
    .get(authorize('SUPERADMIN'),getAllRoles); // Note: Depending on frontend dropdowns, we might need to open GET to 'ADMIN' later, but SUPERADMIN works for now.

router.route('/:id')
    .get(getRoleById)
    .put(authorize('SUPERADMIN'),updateRole)
    .delete(authorize('SUPERADMIN'),deleteRole);

module.exports = router;
