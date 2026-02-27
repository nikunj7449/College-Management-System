import React, { useState, useEffect } from 'react';
import {
    Users, BookOpen, Clock, FileText,
    CalendarCheck, UserCheck, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex justify-between items-start z-10 relative">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
        </div>
        <div className={`absolute -right-6 -bottom-6 opacity-5 ${color.replace('bg-', 'text-')} transition-transform group-hover:scale-110`}>
            <Icon size={100} />
        </div>
    </div>
);

const FacultyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/faculty/stats');
                setStats(res.data.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="p-8 text-center text-slate-500">
                Failed to load dashboard data. Please try refreshing.
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Faculty Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="My Students"
                    value={stats.studentCount || 0}
                    icon={Users}
                    color="bg-indigo-600"
                    subtitle="Assigned across your classes"
                />
                <StatCard
                    title="Subjects Taught"
                    value={stats.totalSubjects || 0}
                    icon={BookOpen}
                    color="bg-emerald-600"
                    subtitle="Active curriculum assignments"
                />
                <StatCard
                    title="Classes Conducted"
                    value={stats.totalClassesConducted || 0}
                    icon={Clock}
                    color="bg-blue-600"
                    subtitle="Total recorded sessions"
                />
                <StatCard
                    title="Total Remarks Issued"
                    value={stats.totalRemarks || 0}
                    icon={FileText}
                    color="bg-amber-600"
                    subtitle="Evaluations provided"
                />
            </div>

            {/* Secondary Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Today's Attendance Snapshot */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <CalendarCheck size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Today's Attendance</h3>
                    <p className="text-sm text-slate-500 mb-6 w-3/4">Records marked by you today</p>

                    <div className="grid grid-cols-3 gap-4 w-full px-4">
                        <div className="bg-slate-50 p-3 rounded-xl">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total</p>
                            <p className="text-2xl font-bold text-slate-700">{stats.attendanceToday.totalMarked}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-xl">
                            <p className="text-xs text-emerald-600 uppercase font-semibold mb-1">Present</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.attendanceToday.present}</p>
                        </div>
                        <div className="bg-rose-50 p-3 rounded-xl">
                            <p className="text-xs text-rose-600 uppercase font-semibold mb-1">Absent</p>
                            <p className="text-2xl font-bold text-rose-700">{stats.attendanceToday.absent}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Remarks */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                            <FileText size={20} className="mr-2 text-indigo-500" />
                            Recent Remarks You Issued
                        </h3>
                    </div>

                    {stats.recentRemarks && stats.recentRemarks.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentRemarks.map((remark, idx) => (
                                <div key={idx} className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="h-10 w-10 shrink-0 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mr-4">
                                        {remark.student?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-slate-800 truncate">
                                                {remark.student?.name || 'Unknown Student'}
                                            </p>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                {new Date(remark.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">Roll No: {remark.student?.rollNum || 'N/A'}</p>
                                        <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 line-clamp-2">
                                            {remark.comment}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <AlertCircle className="text-slate-400 mb-3" size={32} />
                            <p className="text-slate-600 font-medium">No recent remarks</p>
                            <p className="text-sm text-slate-500 mt-1">You haven't issued any remarks recently.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
