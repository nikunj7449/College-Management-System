import api from './api';

const performanceService = {
    // Get all performance records
    getAllPerformance: async () => {
        const response = await api.get('/performance');
        return response.data;
    },

    // Get performance records by student ID
    getStudentPerformance: async (studentId) => {
        const response = await api.get(`/performance/student/${studentId}`);
        return response.data;
    },

    // Add a new performance record
    addPerformance: async (performanceData) => {
        const response = await api.post('/performance', performanceData);
        return response.data;
    },

    // Update an existing performance record
    updatePerformance: async (id, performanceData) => {
        const response = await api.put(`/performance/${id}`, performanceData);
        return response.data;
    },

    // Delete a performance record
    deletePerformance: async (id) => {
        const response = await api.delete(`/performance/${id}`);
        return response.data;
    }
};

export default performanceService;
