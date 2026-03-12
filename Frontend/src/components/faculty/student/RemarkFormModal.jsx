import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';
import { toast } from 'react-toastify';
import remarkService from '../../../services/remarkService';

const RemarkFormModal = ({ isOpen, onClose, student }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !student) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!comment.trim()) {
            toast.error("Please enter a remark.");
            return;
        }

        try {
            setLoading(true);
            const response = await remarkService.addRemark({
                studentId: student._id || student.id,
                comment: comment.trim()
            });
            
            if (response.success) {
                toast.success('Remark sent successfully!');
                setComment('');
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send remark...');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                {/* Backdrop component */}
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                    onClick={onClose} 
                    aria-hidden="true" 
                />

                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100">
                    {/* Header */}
                    <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Send size={20} className="text-indigo-200" />
                                Give Remark
                            </h3>
                            <p className="text-indigo-200 text-sm mt-1">Add a discipline or performance remark</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-indigo-500/50 hover:bg-indigo-500 rounded-full p-2 text-white transition-colors border border-indigo-400/30"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        {/* Student Info Card */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center border border-slate-200 text-indigo-600 overflow-hidden shadow-sm">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=48`}
                                    alt={student.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{student.name}</h4>
                                <div className="text-sm text-slate-500 font-medium">Roll: {student.rollNum || student.rollNo}</div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Remark Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write your remark here..."
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-32 text-slate-700"
                                    required
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !comment.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Submit Remark
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemarkFormModal;
