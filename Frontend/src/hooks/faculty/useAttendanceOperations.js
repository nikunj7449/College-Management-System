import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const useAttendanceOperations = () => {
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Create a new attendance record or update an existing one
    const markAttendance = async (attendanceData) => {
        try {
            setSubmitLoading(true);
            const response = await api.post('/attendance', attendanceData);
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to mark attendance');
            return null;
        } finally {
            setSubmitLoading(false);
        }
    };

    // Bulk create/update attendance records
    const markBulkAttendance = async (attendanceRecords) => {
        try {
            setSubmitLoading(true);
            const response = await api.post('/attendance/student/bulk', attendanceRecords);
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save bulk attendance');
            throw error;
        } finally {
            setSubmitLoading(false);
        }
    };

    // Get the attendance history for a single student
    const getStudentAttendance = async (studentId) => {
        try {
            setLoading(true);
            const response = await api.get(`/attendance/student/${studentId}`);
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch student attendance');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Get attendance records for an entire class on a specific date
    const getClassAttendance = async (date, course, sem) => {
        try {
            setLoading(true);
            const response = await api.get('/attendance/history', {
                params: { date, course, sem }
            });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch class attendance');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        submitLoading,
        markAttendance,
        markBulkAttendance,
        getStudentAttendance,
        getClassAttendance
    };
};
