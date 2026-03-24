const express = require('express');
const router = express.Router();
const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
    bulkCreateCategories,
    createStructure,
    getStructures,
    assignFee,
    recordPayment,
    addExtraFee,
    getMyFees,
    getPaymentHistory,
    getFeeReports,
    updateStructure,
    deleteStructure,
    assignFeeBulk,
    bulkCreateStructures,
    payMyFees,
    createPaymentIntent,
    syncAllStudentFees,
    sendFeeRemainder,
    scheduleFeeReminder
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/roleMiddleware');

router.use(protect);

// Fee Categories
router.route('/categories')
    .post(requirePermission('FEE', 'create'), createCategory)
    .get(requirePermission('FEE', 'read'), getCategories);

router.post('/categories/bulk', requirePermission('FEE', 'create'), bulkCreateCategories);

router.route('/categories/:id')
    .patch(requirePermission('FEE', 'update'), updateCategory)
    .delete(requirePermission('FEE', 'delete'), deleteCategory);

// Fee Structures
router.route('/structures')
    .post(requirePermission('FEE', 'create'), createStructure)
    .get(requirePermission('FEE', 'read'), getStructures);

router.post('/structures/bulk', requirePermission('FEE', 'create'), bulkCreateStructures);

router.route('/structures/:id')
    .patch(requirePermission('FEE', 'update'), updateStructure)
    .delete(requirePermission('FEE', 'delete'), deleteStructure);

// Assignments
router.post('/assign-bulk', requirePermission('FEE', 'create'), assignFeeBulk);
router.post('/sync-all', requirePermission('FEE', 'create'), syncAllStudentFees);

// Payments
router.post('/payments', requirePermission('FEE', 'create'), recordPayment);
router.get('/payments/:studentFeeId', requirePermission('FEE', 'read'), getPaymentHistory);

// Extra Fees
router.post('/extra', requirePermission('FEE', 'update'), addExtraFee);

// Student Specific
router.get('/my-fees', requirePermission('FEE', 'read'), getMyFees);
router.post('/pay', requirePermission('FEE', 'read'), payMyFees);
router.post('/create-payment-intent', requirePermission('FEE', 'read'), createPaymentIntent);

// Reports
router.get('/reports', requirePermission('FEE', 'read'), getFeeReports);

// Reminders
router.post('/reminders', requirePermission('FEE', 'update'), sendFeeRemainder);
router.post('/reminders/schedule', requirePermission('FEE', 'update'), scheduleFeeReminder);

module.exports = router;
