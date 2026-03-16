import React, { useState } from 'react';
import { X, AlertTriangle, MessageSquare, Plus } from 'lucide-react';
import feeService from '../../../../services/feeService';
import { toast } from 'react-toastify';

const ExtraFeeModal = ({ isOpen, onClose, feeRecord, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        remark: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.amount <= 0) return toast.error('Amount must be greater than 0');
        if (!formData.remark) return toast.error('Remark is required');

        try {
            setLoading(true);
            await feeService.addExtraFee({
                studentFeeId: feeRecord._id,
                ...formData
            });
            toast.success('Extra fee added successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add extra fee');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !feeRecord) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-slate-100 bg-amber-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Add Extra Fee</h2>
                        <p className="text-xs text-slate-500 font-medium">Fines or ad-hoc additions for <span className="text-amber-600 font-bold">{feeRecord.student?.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="bg-amber-100/50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-6">
                        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Adding an extra fee will increase the student's total obligation and pending balance immediately.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                <Plus size={14} className="text-amber-500" />
                                Extra Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input 
                                    type="number"
                                    required
                                    placeholder="e.g. 500"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                <MessageSquare size={14} className="text-amber-500" />
                                Reason / Remark
                            </label>
                            <textarea 
                                required
                                rows="3"
                                placeholder="e.g. Library Late Fine, Damage Recovery..."
                                value={formData.remark}
                                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Plus size={18} />
                                        Append Fee
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExtraFeeModal;
