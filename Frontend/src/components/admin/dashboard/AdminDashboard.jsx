import { useState} from 'react';

import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Settings, 
  Calendar,
  TrendingUp,
  BookOpen,
  X
} from 'lucide-react';
//custom hook
import { useDashboard } from '../../../hooks/admin/useAdminDashboard';
//sub-component for statcard
import {StatCard} from './sub-components/StatCard';
import AttendanceChart from './sub-components/Attendancechart';
import RecentRemarks from './sub-components/RecentRemarks';


const AdminDashboard = () => {
  const [filter, setFilter] = useState('This Week');
  const { data, loading, error } = useDashboard(filter);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-600 text-sm font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 font-sans text-slate-900">

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
     

        {/* Dashboard Content */}
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h2>
                <p className="text-slate-500 flex items-center">
                  <TrendingUp size={16} className="mr-2 text-green-500" />
                  Here's what's happening in your school today
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all">
                  <Calendar size={16} className="mr-2" />
                  This Week
                </button>
                <button className="hidden md:flex items-center px-4 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-500 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
                  <Settings size={16} className="mr-2" />
                  Customize
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Students" 
                data={data.stats.totalStudents} 
                icon={Users} 
                bgGradient="from-blue-500 to-blue-600" 
              />
              <StatCard 
                title="Total Faculty" 
                data={data.stats.totalFaculty} 
                icon={GraduationCap} 
                bgGradient="from-emerald-500 to-emerald-600" 
              />
              <StatCard 
                title="Present Today" 
                data={data.stats.presentToday} 
                icon={UserCheck} 
                bgGradient="from-violet-500 to-violet-600" 
              />
              <StatCard 
                title="Total Courses" 
                data={data.stats.totalCourses} 
                icon={BookOpen} 
                bgGradient="from-amber-500 to-amber-600" 
              />
            </div>

            {/* Charts and Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Attendance Chart */}
             <AttendanceChart 
                data={data}
                filter={filter}
                setFilter={setFilter}
              />

              {/* Recent Remarks */}
              <RecentRemarks 
                recentRemarks={data.recentRemarks}
              />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;