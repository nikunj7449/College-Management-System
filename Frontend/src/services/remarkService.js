import api from './api';

const remarkService = {
  // Add a Remark (Faculty)
  addRemark: async (data) => {
    const response = await api.post('/remarks', data);
    return response.data;
  },

  // Get All Remarks (Dynamic for Admin/Faculty)
  getAllRemarks: async () => {
    const response = await api.get('/remarks');
    return response.data;
  },

  // Get Remarks for a specific student (Faculty/Admin)
  getStudentRemarks: async (studentId) => {
    const response = await api.get(`/remarks/student/${studentId}`);
    return response.data;
  },

  // Get a Faculty's Remark Work Log (Admin)
  getFacultyWorkLog: async (facultyId) => {
    const response = await api.get(`/remarks/faculty-log/${facultyId}`);
    return response.data;
  },

  // Delete a Remark
  deleteRemark: async (remarkId) => {
    const response = await api.delete(`/remarks/${remarkId}`);
    return response.data;
  }
};

export default remarkService;
