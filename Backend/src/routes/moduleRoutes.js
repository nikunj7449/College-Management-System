const express = require('express');
const router = express.Router();
const {
    createModule,
    getAllModules,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('SUPERADMIN'));

router.route('/')
    .post(createModule)
    .get(getAllModules);

router.route('/:id')
    .put(updateModule)
    .delete(deleteModule);

module.exports = router;
