import React, { useState } from 'react';
import { useStudentDashboard } from '../../../hooks/student/useStudentDashboard';
import { BookOpen, UserCheck, CalendarDays, MessageSquare, Award, ArrowRight, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import StudentDashboardSkeleton from '../../common/student/StudentDashboardSkeleton';
import PerformanceDetailModal from '../exams/PerformanceDetailModal';

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, accentColor, subtext, badge }) => (
  <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative flex flex-col`}>
    
    <div className="p-6 flex-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {badge && (
          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${accentColor} text-white uppercase tracking-wide`}>
            {badge}
          </span>
        )}
      </div>

      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
      <h3 className="text-4xl font-black text-slate-800 leading-none mb-2">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 font-medium">{subtext}</p>}
    </div>

    {/* Decorative bg circle */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${iconBg} opacity-30 pointer-events-none group-hover:scale-125 transition-transform duration-500`} />
  </div>
);

const StudentDashboard = () => {
  const { data, loading, error } = useStudentDashboard();
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewPerformance = (perf) => {
    setSelectedPerformance(perf);
    setIsModalOpen(true);
  };

  if (loading) return <StudentDashboardSkeleton />;

  if (error) return (
    <div className="flex bg-slate-50 min-h-screen p-8 justify-center items-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 shadow-sm max-w-lg text-center">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    </div>
  );

  if (!data) return null;

  const { profile, attendance, recentPerformances, recentRemarks } = data;

  return (
    <div className="flex bg-slate-50 font-sans text-slate-900 min-h-screen">
      <div className="flex-1 flex flex-col relative">
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="mb-8 p-8 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-3xl shadow-lg border border-indigo-400/30 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome back, {profile.name}! 👋</h1>
                  <p className="text-indigo-100 font-medium">Ready to conquer another day of learning?</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
                  <div className="text-sm text-indigo-100 font-semibold mb-1 w-full text-center">Student Details</div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-white/20 px-2 py-1 rounded-md font-mono">{profile.rollNum}</span>
                    <span className="font-medium">{profile.course} - {profile.branch} (Sem {profile.sem})</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-[0.05] rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-10 -mb-10 w-32 h-32 bg-indigo-900 opacity-[0.2] rounded-full blur-xl pointer-events-none"></div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Overall Attendance" 
                value={`${attendance.percentage}%`} 
                icon={UserCheck} 
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                accentColor="bg-gradient-to-r from-emerald-400 to-teal-500"
                subtext={`${attendance.presentClasses} / ${attendance.totalClasses} classes attended`}
                badge={attendance.percentage >= 75 ? '✓ Good' : 'Low'}
              />
              <StatCard 
                title="Classes Present" 
                value={attendance.presentClasses} 
                icon={CalendarDays} 
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                accentColor="bg-gradient-to-r from-blue-400 to-indigo-500"
                subtext={`Out of ${attendance.totalClasses} total`}
              />
              <StatCard 
                title="Faculty Remarks" 
                value={recentRemarks?.length || 0} 
                icon={MessageSquare} 
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                accentColor="bg-gradient-to-r from-amber-400 to-orange-500"
                subtext="Latest academic feedback"
              />
              <StatCard 
                title="Pending Fees" 
                value={`₹${(data.totalPendingFees || 0).toLocaleString()}`} 
                icon={IndianRupee} 
                iconBg="bg-rose-50"
                iconColor="text-rose-600"
                accentColor="bg-gradient-to-r from-rose-400 to-pink-500"
                subtext="Total outstanding balance"
                badge={data.totalPendingFees > 0 ? 'Due' : 'Cleared'}
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 border-t border-slate-200/60 pt-8">
              
              {/* Recent Performance Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Award size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Recent Exam Results</h3>
                </div>
                
                {recentPerformances && recentPerformances.length > 0 ? (
                  <div className="space-y-4">
                    {recentPerformances.map((perf) => (
                      <div 
                        key={perf._id} 
                        onClick={() => handleViewPerformance(perf)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-colors cursor-pointer group/item"
                      >
                        <div>
                          <p className="font-semibold text-slate-800 group-hover/item:text-indigo-600 transition-colors">{perf.exam?.name || 'Unknown Exam'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{new Date(perf.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium text-slate-600">Subjects: <span className="font-bold">{perf.subjects?.length || 0}</span></p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm ${
                            perf.grade === 'A' ? 'bg-green-100 text-green-700 border border-green-200' :
                            perf.grade === 'B' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            perf.grade === 'C' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            perf.grade === 'D' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {perf.grade || '-'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium text-sm">No exam records found yet.</p>
                  </div>
                )}
              </div>

              {/* Recent Remarks Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Faculty Remarks</h3>
                </div>

                {recentRemarks && recentRemarks.length > 0 ? (
                  <>
                    <div className="space-y-4 flex-1">
                      {recentRemarks.slice(0, 3).map((remark) => (
                        <div key={remark._id} className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100 hover:bg-amber-50/60 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {remark.faculty?.name?.charAt(0) || '?'}
                              </div>
                              <span className="font-semibold text-sm text-slate-700">{remark.faculty?.name || 'Faculty Member'}</span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                              {new Date(remark.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed pl-8 line-clamp-2">
                            "{remark.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                    {recentRemarks.length > 3 && (
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <Link 
                          to="/student/remarks" 
                          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                        >
                          Show All Remarks <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 px-4 flex-1 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium text-sm">No recent remarks from faculty.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Detail Modal */}
      <PerformanceDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedPerformance}
      />
    </div>
  );
};

export default StudentDashboard;
