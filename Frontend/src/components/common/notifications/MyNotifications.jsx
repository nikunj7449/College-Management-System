import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import useNotifications from '../../../hooks/useNotifications';
import { Bell, IndianRupee, Award, Clock, CheckCircle, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyNotifications = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const { notifications, loading, markAsRead, markAllAsRead } = useNotifications(isAuthenticated);
    const navigate = useNavigate();

    const getIcon = (type) => {
        switch (type) {
            case 'FEE':
                return <IndianRupee size={20} className="text-amber-600" />;
            case 'EXAM':
                return <Award size={20} className="text-purple-600" />;
            case 'URGENT':
                return <Bell size={20} className="text-rose-600" />;
            default:
                return <Bell size={20} className="text-indigo-600" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'FEE': return 'bg-amber-100';
            case 'EXAM': return 'bg-purple-100';
            case 'URGENT': return 'bg-rose-100';
            default: return 'bg-indigo-100';
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Notifications</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your system updates and alerts</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-bold text-sm"
                    >
                        <CheckCircle size={18} />
                        Mark All as Read
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No Notifications</h3>
                        <p className="text-slate-500 mt-1">You're all caught up! Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`group p-6 transition-all hover:bg-slate-50/50 flex flex-col sm:flex-row gap-5 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                            >
                                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className={`text-lg font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                                                {!notif.isRead && (
                                                    <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                                                )}
                                                {notif.priority === 'HIGH' && (
                                                    <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">High Priority</span>
                                                )}
                                            </div>
                                            <p className={`mt-1.5 text-slate-600 leading-relaxed ${notif.isRead ? 'opacity-80' : ''}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                                <Clock size={14} />
                                                {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notif._id)}
                                                    className="text-indigo-600 hover:text-indigo-700 text-xs font-bold transition-colors"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {notif.link && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => navigate(notif.link)}
                                                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                                            >
                                                {notif.type === 'FEE' ? 'Pay Fees' : 'View Details'}
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyNotifications;
