import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Loader2, AlertCircle, Calendar, CalendarCheck, CalendarX, Clock, CalendarDays, UserSquare2 } from 'lucide-react';
import Pagination from '../../common/core/Pagination';

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, leave: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/my-attendance');
      if (response.data.success) {
        const records = response.data.data;
        setAttendanceData(records);
        calculateStats(records);
      } else {
        setError('Failed to load attendance');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const total = records.length;
    let p = 0, a = 0, l = 0, le = 0;
    
    records.forEach(record => {
      const s = record.status.toLowerCase();
      if (s === 'present') p++;
      else if (s === 'absent') a++;
      else if (s === 'late') l++;
      else if (s === 'leave') le++;
    });

    const percentage = total === 0 ? 0 : Math.round((p / total) * 100);
    setStats({ present: p, absent: a, late: l, leave: le, total, percentage });
  };

  const currentRecords = attendanceData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const StatusIcon = ({ status }) => {
    switch (status.toLowerCase()) {
      case 'present': return <CalendarCheck className="w-5 h-5 text-emerald-500" />;
      case 'absent': return <CalendarX className="w-5 h-5 text-rose-500" />;
      case 'late': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'leave': return <CalendarDays className="w-5 h-5 text-blue-500" />;
      default: return <Calendar className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'present': return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'absent': return 'bg-rose-50 text-rose-700 ring-rose-600/20';
      case 'late': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      case 'leave': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      default: return 'bg-slate-50 text-slate-700 ring-slate-600/20';
    }
  };


  if (loading) {
     return (
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Loading attendance records...</p>
        </div>
      );
  }

  if (error) {
     return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold">Error Loading Attendance</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <CalendarDays className="text-indigo-600" /> My Attendance History
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Review your exact day-to-day presence track record.
        </p>
      </div>

       {/* Top Metrics Row */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {/* Present */}
         <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <CalendarCheck size={80} className="text-emerald-500 -mr-6 -mt-6" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Present</p>
            <div className="flex items-baseline gap-2 mt-2">
               <h2 className="text-4xl font-black text-emerald-600">{stats.present}</h2>
               <span className="text-sm text-slate-400 font-medium">days</span>
            </div>
         </div>
         {/* Absent */}
         <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <CalendarX size={80} className="text-rose-500 -mr-6 -mt-6" />
            </div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Absent</p>
            <div className="flex items-baseline gap-2 mt-2">
               <h2 className="text-4xl font-black text-rose-600">{stats.absent}</h2>
               <span className="text-sm text-slate-400 font-medium">days</span>
            </div>
         </div>
         {/* Percentage */}
         <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden lg:col-span-2 flex items-center justify-between">
            <div>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Aggregate Attendance</p>
               <h2 className={`text-5xl font-black mt-1 ${stats.percentage >= 75 ? 'text-indigo-600' : stats.percentage >= 50 ? 'text-amber-500' : 'text-rose-600'}`}>
                   {stats.percentage}%
               </h2>
               <p className="text-xs text-slate-400 font-medium mt-1">Total Classes: {stats.total}</p>
            </div>
             <div className="w-24 h-24 flex items-center justify-center relative shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-indigo-50"></circle>
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="10" fill="transparent"
                            strokeDasharray={`${(stats.percentage / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                            className={`transition-all duration-700 ${stats.percentage >= 75 ? 'text-indigo-500' : stats.percentage >= 50 ? 'text-amber-400' : 'text-rose-500'}`}></circle>
                </svg>
                <span className={`absolute text-xs font-black ${stats.percentage >= 75 ? 'text-indigo-600' : stats.percentage >= 50 ? 'text-amber-500' : 'text-rose-600'}`}>
                  {stats.percentage}%
                </span>
             </div>
         </div>
       </div>

       {/* Detailed Log Table */}
       <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
           <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <h3 className="text-lg font-bold text-slate-800">Attendance Log</h3>
             <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wide">
                Showing {currentRecords.length} of {attendanceData.length} records
             </span>
           </div>

           {attendanceData.length === 0 ? (
               <div className="p-12 text-center text-slate-500">
                  <CalendarDays className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="font-semibold text-lg text-slate-700">No Check-ins Found</p>
                  <p className="text-sm mt-1">Faculty hasn't marked attendance for you yet.</p>
               </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluator</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentRecords.map((record) => (
                            <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                            {new Date(record.date).getDate()}
                                       </div>
                                       <div>
                                            <div className="font-bold text-slate-800">
                                                {new Date(record.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium">
                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                            </div>
                                       </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" title={record.subject}>
                                    <span className="text-sm font-semibold text-slate-700">{record.subject}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getStatusStyle(record.status)}`}>
                                        <StatusIcon status={record.status} /> {record.status}
                                     </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                        <UserSquare2 className="w-4 h-4 text-slate-400" />
                                        {record.markedBy?.name || 'Unknown Faculty'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
           )}

           {/* Pagination */}
           {attendanceData.length > itemsPerPage && (
             <div className="p-6 border-t border-slate-100 flex justify-center bg-white">
                 <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(attendanceData.length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                 />
             </div>
           )}
       </div>

    </div>
  );
};

export default StudentAttendance;
