import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatTimeAgo } from '../../utils/adminUtils/dashboardUtils';

export const useDashboard = (filter) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const filterParam = filter === 'Last Week' ? 'last_week' : 'this_week';
        const response = await api.get(`/dashboard/admin/stats?filter=${filterParam}`);
        const backendData = response.data.data;
        const formattedData = {
          stats: {
            totalStudents: { value: backendData.totalStudents, trend: 'Total', isPositive: true },
            totalFaculty: { value: backendData.totalFaculty, trend: 'Active', isPositive: true },
            presentToday: { value: backendData.presentToday, trend: 'Today', isPositive: true },
            totalCourses: { value: backendData.totalCourses, trend: 'Offered', isPositive: true }
          },
          attendanceData: backendData.attendanceData,
          recentRemarks: backendData.recentRemarks.map(r => ({
            id: r.id,
            faculty: r.faculty,
            student: r.student,
            remark: r.remark,
            time: formatTimeAgo(r.time)
          }))
        };

        setData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
        setLoading(false);
      }
    };
    fetchData();
  }, [filter]);

  return { data, loading, error };
};