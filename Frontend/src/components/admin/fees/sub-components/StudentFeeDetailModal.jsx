import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Hash, Tag, FileText, IndianRupee, Clock, CheckCircle, AlertCircle, History, PlusSquare } from 'lucide-react';
import feeService from '../../../../services/feeService';
import { toast } from 'react-toastify';

const StudentFeeDetailModal = ({ isOpen, onClose, feeRecord }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && feeRecord?._id) {
            fetchPaymentHistory();
        }
    }, [isOpen, feeRecord]);

    const fetchPaymentHistory = async () => {
        try {
            setLoading(true);
            const response = await feeService.getPaymentHistory(feeRecord._id);
            setPayments(response.data.data);
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
            toast.error('Could not load payment history');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !feeRecord) return null;

    const getStatusStyle = (status) => {
        switch(status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'PARTIAL': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-rose-50 text-rose-700 border-rose-100';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-inner" onClick={onClose}></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Fee Statement & History</h2>
                        <p className="text-xs text-slate-500 font-medium">Complete record for <span className="text-indigo-600 font-bold">{feeRecord.student?.name}</span> • {feeRecord.student?.rollNum}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 rounded-3xl p-5 text-white">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Obligation</p>
                            <h3 className="text-2xl font-black font-mono">₹{feeRecord.totalFee.toLocaleString()}</h3>
                        </div>
                        <div className="bg-emerald-600 rounded-3xl p-5 text-white">
                            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-1">Total Paid</p>
                            <h3 className="text-2xl font-black font-mono">₹{feeRecord.paidAmount.toLocaleString()}</h3>
                        </div>
                        <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-100">
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mb-1">Outstanding Balance</p>
                            <h3 className="text-2xl font-black font-mono">₹{feeRecord.pendingAmount.toLocaleString()}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Fee Breakdown */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-indigo-500" size={18} />
                                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Structure Breakdown</h4>
                            </div>
                            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 overflow-hidden text-sm">
                                {feeRecord.structure?.fees?.map((fee, idx) => (
                                    <div key={idx} className="flex justify-between p-3.5 border-b border-slate-200/60 last:border-0 hover:bg-slate-100/50 transition-colors">
                                        <span className="text-slate-600 font-medium">{fee.category?.name || 'Category'}</span>
                                        <span className="text-slate-900 font-bold font-mono">₹{fee.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                {(!feeRecord.structure?.fees || feeRecord.structure.fees.length === 0) && (
                                    <div className="p-6 text-center text-slate-400 italic">No breakdown available</div>
                                )}
                            </div>
                        </section>

                        {/* Extra Fees */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <PlusSquare className="text-amber-500" size={18} />
                                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Fines & Extras</h4>
                            </div>
                            <div className="space-y-3">
                                {feeRecord.extraFees?.map((extra, idx) => (
                                    <div key={idx} className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase mb-0.5">{extra.remark}</p>
                                            <p className="text-[10px] text-slate-400 font-medium italic">{new Date(extra.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 font-mono">₹{extra.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                {(!feeRecord.extraFees || feeRecord.extraFees.length === 0) && (
                                    <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4 text-center text-slate-400 text-xs italic">
                                        No extra fees recorded
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Payment History */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <History className="text-emerald-500" size={18} />
                                <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Transaction History</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(feeRecord.status)}`}>
                                Overall: {feeRecord.status}
                            </span>
                        </div>
                        
                        <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto overflow-y-visible">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none align-middle">Mode</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none align-middle">Date</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none align-middle">Transaction ID</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none align-middle text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-sm">Loading transactions...</td></tr>
                                        ) : payments.length === 0 ? (
                                            <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-sm italic">No payments recorded yet.</td></tr>
                                        ) : payments.map((pay) => (
                                            <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase">
                                                        <CreditCard size={10} />
                                                        {pay.paymentMode}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-600">
                                                    {new Date(pay.paymentDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] font-mono text-slate-500 max-w-[150px] truncate" title={pay.transactionId}>
                                                    {pay.transactionId || '---'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-bold text-emerald-600 font-mono leading-none">₹{pay.amount.toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                        Close Statement
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentFeeDetailModal;
