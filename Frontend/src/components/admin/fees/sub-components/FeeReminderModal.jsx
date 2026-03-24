import { X, Bell, Mail, Send, AlertCircle, Users, Settings2, ArrowRight, Clock, Calendar, Repeat, CalendarDays } from 'lucide-react';
import { toast } from 'react-toastify';
import feeService from '../../../../services/feeService';
import { useState } from 'react';
import FeeStudentFilterModal from './FeeStudentFilterModal';

const DAYS_OF_WEEK = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' }
];

const RECURRING_FREQUENCIES = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
];

const FeeReminderModal = ({ isOpen, onClose, pendingFees, courses = [], onSuccess }) => {
    const [notificationTypes, setNotificationTypes] = useState(['SYSTEM']);
    const [customMessage, setCustomMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState(pendingFees.map(f => f._id));

    // Scheduling States
    const [mode, setMode] = useState('SEND_NOW'); // SEND_NOW or SCHEDULE
    const [scheduleType, setScheduleType] = useState('RECURRING'); // ONE_TIME or RECURRING
    const [frequency, setFrequency] = useState('DAILY');
    const [sendTime, setSendTime] = useState('09:00');
    const [sendDate, setSendDate] = useState(new Date().toISOString().split('T')[0]);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [dayOfMonth, setDayOfMonth] = useState(1);

    const toggleDay = (dayVal) => {
        if (daysOfWeek.includes(dayVal)) {
            setDaysOfWeek(daysOfWeek.filter(d => d !== dayVal));
        } else {
            setDaysOfWeek([...daysOfWeek, dayVal]);
        }
    };

    if (!isOpen) return null;

    const handleToggleType = (type) => {
        if (notificationTypes.includes(type)) {
            if (notificationTypes.length > 1) {
                setNotificationTypes(notificationTypes.filter(t => t !== type));
            } else {
                toast.warning("Select at least one notification type");
            }
        } else {
            setNotificationTypes([...notificationTypes, type]);
        }
    };

    const handleSend = async () => {
        if (selectedIds.length === 0) {
            toast.warning("Please select at least one student");
            return;
        }

        if (mode === 'SCHEDULE') {
            const now = new Date();
            const [hours, minutes] = sendTime.split(':').map(Number);

            if (scheduleType === 'ONE_TIME') {
                if (!sendDate) {
                    toast.warning("Please select a date for the one-time reminder");
                    return;
                }

                const selectedDate = new Date(sendDate);
                selectedDate.setHours(hours, minutes, 0, 0);

                if (selectedDate < now) {
                    toast.error("Cannot schedule reminders for a past date/time");
                    return;
                }
            }

            if (scheduleType === 'RECURRING') {
                if (frequency === 'WEEKLY' && daysOfWeek.length === 0) {
                    toast.warning("Please select at least one day for weekly scheduling");
                    return;
                }
                if (frequency === 'MONTHLY' && (dayOfMonth < 1 || dayOfMonth > 31)) {
                    toast.warning("Please enter a valid day of the month (1-31)");
                    return;
                }
            }
        }

        try {
            setLoading(true);

            let response;
            if (mode === 'SCHEDULE') {
                response = await feeService.scheduleReminders({
                    scheduleType,
                    frequency: scheduleType === 'RECURRING' ? frequency : undefined,
                    time: sendTime,
                    date: scheduleType === 'ONE_TIME' ? sendDate : undefined,
                    daysOfWeek: (scheduleType === 'RECURRING' && frequency === 'WEEKLY') ? daysOfWeek : undefined,
                    dayOfMonth: (scheduleType === 'RECURRING' && frequency === 'MONTHLY') ? dayOfMonth : undefined,
                    notificationTypes,
                    customMessage: customMessage.trim() || undefined,
                    studentFeeIds: selectedIds
                });
            } else {
                response = await feeService.sendReminders({
                    notificationTypes,
                    customMessage: customMessage.trim() || undefined,
                    studentFeeIds: selectedIds
                });
            }

            toast.success(response?.data?.message || (mode === 'SCHEDULE' ? 'Reminders scheduled!' : 'Reminders sent successfully!'));
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={onClose}
                ></div>

                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-100">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Fee Payment Reminder</h2>
                                <p className="text-xs text-slate-500 font-medium">Configure notification options</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Student Selection Summary */}
                        <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Recipients</p>
                                    <h4 className="text-lg font-bold text-indigo-900 leading-none">
                                        {selectedIds.length} <span className="text-sm font-medium text-indigo-600/70">Students Selected</span>
                                    </h4>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsFilterModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
                            >
                                <Settings2 size={14} />
                                Change Selection
                            </button>
                        </div>

                        {/* Delivery Mode Selection */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Delivery Method</label>
                            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setMode('SEND_NOW')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${mode === 'SEND_NOW'
                                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <Send size={16} /> Send Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('SCHEDULE')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${mode === 'SCHEDULE'
                                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <Clock size={16} /> Schedule
                                </button>
                            </div>
                        </div>

                        {/* Scheduling Options */}
                        {mode === 'SCHEDULE' && (
                            <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-5 space-y-5 animate-in fade-in duration-200">
                                {/* Type Selector */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Schedule Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setScheduleType('ONE_TIME')}
                                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${scheduleType === 'ONE_TIME'
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white text-slate-600 border border-slate-200'
                                                }`}
                                        >
                                            <CalendarDays size={14} /> One-Time
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setScheduleType('RECURRING')}
                                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${scheduleType === 'RECURRING'
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : 'bg-white text-slate-600 border border-slate-200'
                                                }`}
                                        >
                                            <Repeat size={14} /> Recurring
                                        </button>
                                    </div>
                                </div>

                                {scheduleType === 'ONE_TIME' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                            <input
                                                type="date"
                                                value={sendDate}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => setSendDate(e.target.value)}
                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
                                            <input
                                                type="time"
                                                value={sendTime}
                                                onChange={(e) => setSendTime(e.target.value)}
                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">Frequency</label>
                                            <div className="flex gap-2">
                                                {RECURRING_FREQUENCIES.map(freq => (
                                                    <button
                                                        key={freq.value}
                                                        type="button"
                                                        onClick={() => setFrequency(freq.value)}
                                                        className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${frequency === freq.value
                                                            ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm'
                                                            : 'bg-slate-50/50 text-slate-400 border-transparent grayscale italic'
                                                            }`}
                                                    >
                                                        {freq.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {frequency === 'MONTHLY' && (
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Day of Month</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="31"
                                                        value={dayOfMonth}
                                                        onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    />
                                                </div>
                                            )}
                                            {frequency === 'DAILY' && (
                                                <div className="space-y-1.5 opacity-50 cursor-not-allowed">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recurrence</label>
                                                    <div className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 flex items-center gap-2">
                                                        <Repeat size={14} /> Every Day
                                                    </div>
                                                </div>
                                            )}
                                            {frequency === 'WEEKLY' && (
                                                <div className="space-y-1.5">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recurrence</label>
                                                    <div className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 flex items-center gap-2">
                                                        <Calendar size={14} /> Weekly Selection
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-1.5">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Send Time</label>
                                                <input
                                                    type="time"
                                                    value={sendTime}
                                                    onChange={(e) => setSendTime(e.target.value)}
                                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700"
                                                />
                                            </div>
                                        </div>

                                        {frequency === 'WEEKLY' && (
                                            <div className="pt-2 border-t border-indigo-100/50">
                                                <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Repeat on</label>
                                                <div className="flex justify-between">
                                                    {DAYS_OF_WEEK.map(day => (
                                                        <button
                                                            key={day.value}
                                                            type="button"
                                                            onClick={() => toggleDay(day.value)}
                                                            className={`w-9 h-9 rounded-full text-[10px] font-black transition-all flex items-center justify-center border-2 ${daysOfWeek.includes(day.value)
                                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                                                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                                                }`}
                                                        >
                                                            {day.label.charAt(0)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notification Type Selection */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Notification Channels</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleToggleType('SYSTEM')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${notificationTypes.includes('SYSTEM')
                                        ? 'border-indigo-600 bg-white text-indigo-700 shadow-lg shadow-indigo-50'
                                        : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl transition-colors ${notificationTypes.includes('SYSTEM') ? 'bg-indigo-600 text-white' : 'bg-slate-200/50 text-slate-400'}`}>
                                        <Bell size={18} />
                                    </div>
                                    <span className="font-bold text-sm">System Push</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleToggleType('EMAIL')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${notificationTypes.includes('EMAIL')
                                        ? 'border-indigo-600 bg-white text-indigo-700 shadow-lg shadow-indigo-50'
                                        : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-xl transition-colors ${notificationTypes.includes('EMAIL') ? 'bg-indigo-600 text-white' : 'bg-slate-200/50 text-slate-400'}`}>
                                        <Mail size={18} />
                                    </div>
                                    <span className="font-bold text-sm">Email Alert</span>
                                </button>
                            </div>
                        </div>

                        {/* Custom Message */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between ml-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Custom Message</label>
                                <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase">Optional</span>
                            </div>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Type a professional reminder message... (e.g. Please clear your pending dues by the end of this month)"
                                className="w-full h-24 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700 resize-none font-medium placeholder:text-slate-300"
                            />
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                            <AlertCircle className="text-amber-500 shrink-0" size={18} />
                            <p className="text-[10px] text-amber-700 leading-tight font-bold italic">
                                Action Logged: {mode === 'SCHEDULE' ? 'Scheduling' : 'Sending'} to {selectedIds.length} students via {notificationTypes.join(' & ')}
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 font-black uppercase tracking-widest rounded-2xl hover:bg-white hover:text-slate-700 transition-all text-[10px]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={loading || selectedIds.length === 0}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 text-[10px] ${loading || selectedIds.length === 0 ? 'opacity-70 cursor-not-allowed shadow-none' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    <span>{mode === 'SCHEDULE' ? 'Set Schedule Reminders' : 'Broadcast Reminder'}</span>
                                    <ArrowRight size={14} className="opacity-50" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <FeeStudentFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                pendingFees={pendingFees}
                courses={courses}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
            />
        </>
    );
};

export default FeeReminderModal;
