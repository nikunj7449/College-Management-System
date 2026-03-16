import api from './api';

const feeService = {
    // Categories
    getCategories: () => api.get('/fees/categories'),
    createCategory: (data) => api.post('/fees/categories', data),
    bulkCreateCategories: (data) => api.post('/fees/categories/bulk', data),
    updateCategory: (id, data) => api.patch(`/fees/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/fees/categories/${id}`),

    // Structures
    getStructures: () => api.get('/fees/structures'),
    createStructure: (data) => api.post('/fees/structures', data),
    bulkCreateStructures: (data) => api.post('/fees/structures/bulk', data),
    updateStructure: (id, data) => api.patch(`/fees/structures/${id}`, data),
    deleteStructure: (id) => api.delete(`/fees/structures/${id}`),

    // Assignments
    assignFee: (data) => api.post('/fees/assign-bulk', data),

    // Student Fees (Admin view & Reports)
    getFeeReports: (params) => api.get('/fees/reports', { params }),
    addExtraFee: (data) => api.post('/fees/extra', data),

    // Payments
    recordPayment: (data) => api.post('/fees/payments', data),
    getPaymentHistory: (studentFeeId) => api.get(`/fees/payments/${studentFeeId}`),
    payMyFees: (data) => api.post('/fees/pay', data),
    createPaymentIntent: (data) => api.post('/fees/create-payment-intent', data),

    // Student Specific
    getMyFees: () => api.get('/fees/my-fees'),
};

export default feeService;
