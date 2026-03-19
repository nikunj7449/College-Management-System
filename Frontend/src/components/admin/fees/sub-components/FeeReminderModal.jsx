import { X, Bell, Mail, Send, AlertCircle, Users, Settings2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import feeService from '../../../../services/feeService';
import { useState } from 'react';
import FeeStudentFilterModal from './FeeStudentFilterModal';

const FeeReminderModal = ({ isOpen, onClose, pendingFees, courses = [], onSuccess }) => {
    const [notificationTypes, setNotificationTypes] = useState(['SYSTEM']);
    const [customMessage, setCustomMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState(pendingFees.map(f => f._id));

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

        try {
            setLoading(true);
            const response = await feeService.sendReminders({
                notificationTypes,
                customMessage: customMessage.trim() || undefined,
                studentFeeIds: selectedIds
            });
            toast.success(response.data.message || 'Reminders sent successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reminders');
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

                    <div className="p-8 space-y-6">
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

                        {/* Notification Type Selection */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Notification Channels</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleToggleType('SYSTEM')}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                        notificationTypes.includes('SYSTEM') 
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
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                        notificationTypes.includes('EMAIL') 
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
                                className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700 resize-none font-medium placeholder:text-slate-300"
                            />
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                            <AlertCircle className="text-amber-500 shrink-0" size={18} />
                            <p className="text-[10px] text-amber-700 leading-tight font-bold italic">
                                Action Logged: Sending to {selectedIds.length} students via {notificationTypes.join(' & ')}
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
                                    <span>Broadcast Reminder</span>
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
