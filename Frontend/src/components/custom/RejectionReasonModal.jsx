import React, { useState, useEffect } from 'react';
import { X, AlertCircle, FileText, Send } from 'lucide-react';

const RejectionReasonModal = ({ isOpen, onClose, onConfirm, eventTitle }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }
        onConfirm(reason);
        setReason('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Reject Event</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Please specify the reason</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-indigo-50 border border-indigo-100/50 rounded-xl p-3 mb-2 text-sm text-indigo-700 font-medium">
                        Event: <span className="font-bold opacity-80">{eventTitle}</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText size={16} className="text-slate-400" />
                            Rejection Reason
                        </label>
                        <textarea
                            autoFocus
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="Example: Missing venue details, incorrect date format, etc."
                            className={`w-full min-h-[120px] p-4 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                                error ? 'border-rose-300 focus:ring-rose-500/20 shadow-sm' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                            }`}
                        />
                        {error && (
                            <p className="text-xs font-medium text-rose-500 pl-1 animate-pulse">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                        >
                            <Send size={16} />
                            Confirm Reject
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectionReasonModal;
