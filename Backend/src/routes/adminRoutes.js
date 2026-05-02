const express = require('express');
const router = express.Router();
const { addAdmin, getAllAdmins, updateAdmin, deleteAdmin, getMyProfile, updateMyProfile } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');

//router.use(protect);

router.route('/profile/me')
  .get(getMyProfile)
  .put(updateMyProfile);

router.route('/')
  .get(requirePermission('ADMIN', 'read'), getAllAdmins)
  .post(requirePermission('ADMIN', 'create'), addAdmin);

router.route('/:id')
  .put(requirePermission('ADMIN', 'update'), updateAdmin)
  .delete(requirePermission('ADMIN', 'delete'), deleteAdmin);

module.exports = router;