const express = require('express');
const router = express.Router();
const { addAdmin, getAllAdmins, updateAdmin, deleteAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('SUPERADMIN'));

router.route('/')
  .get(getAllAdmins)
  .post(addAdmin);

router.route('/:id')
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;