const express = require('express');
const router = express.Router();
const { addOtherUser, getAllOtherUsers, updateOtherUser, deleteOtherUser } = require('../controllers/otherUserController');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(requirePermission('USER', 'read'), getAllOtherUsers)
  .post(requirePermission('USER', 'create'), addOtherUser);

router.route('/:id')
  .put(requirePermission('USER', 'update'), updateOtherUser)
  .delete(requirePermission('USER', 'delete'), deleteOtherUser);

module.exports = router;
