import React, { useState } from 'react';
import { X, CreditCard, Calendar, Hash, Tag, Save } from 'lucide-react';
import feeService from '../../../../services/feeService';
import { toast } from 'react-toastify';
import CustomDropdown from '../../../custom/CustomDropdown';

const FeePaymentModal = ({ isOpen, onClose, feeRecord, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: feeRecord?.pendingAmount || 0,
        paymentMode: 'UPI',
        transactionId: '',
        remark: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.amount <= 0) return toast.error('Amount must be greater than 0');
        if (formData.amount > feeRecord.pendingAmount) return toast.error('Amount cannot exceed pending balance');

        try {
            setLoading(true);
            await feeService.recordPayment({
                studentFeeId: feeRecord._id,
                ...formData
            });
            toast.success('Payment recorded successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !feeRecord) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-inner" onClick={onClose}></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Record Fee Payment</h2>
                        <p className="text-xs text-slate-500 font-medium">Updating account for <span className="text-indigo-600 font-bold">{feeRecord.student?.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white mb-8 flex items-center justify-between shadow-lg shadow-indigo-200">
                        <div>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Current Pending Balance</p>
                            <h3 className="text-3xl font-black font-mono tracking-tighter">₹{feeRecord.pendingAmount.toLocaleString()}</h3>
                        </div>
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                            <CreditCard size={24} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <Tag size={14} className="text-indigo-500" />
                                    Amount to Pay
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input 
                                        type="number"
                                        required
                                        max={feeRecord.pendingAmount}
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                    <CreditCard size={14} className="text-indigo-500" />
                                    Mode
                                </label>
                                <CustomDropdown
                                    value={formData.paymentMode}
                                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                                    options={[
                                        { label: 'UPI / GPay', value: 'UPI' },
                                        { label: 'Cash', value: 'Cash' },
                                        { label: 'Debit/Credit Card', value: 'Card' },
                                        { label: 'Net Banking', value: 'Net Banking' }
                                    ]}
                                    placeholder="Select Mode"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                <Hash size={14} className="text-indigo-500" />
                                Transaction ID / Ref No.
                            </label>
                            <input 
                                type="text"
                                placeholder="Enter reference number (optional)"
                                value={formData.transactionId}
                                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                                <Calendar size={14} className="text-indigo-500" />
                                Payment Date
                            </label>
                            <input 
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none font-medium text-slate-600"
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <Save size={20} />
                                        Confirm Payment & Generate Receipt
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

export default FeePaymentModal;
