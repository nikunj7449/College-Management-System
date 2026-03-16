import React from 'react';
import { XCircle, FileText, Circle } from 'lucide-react';

const FeeStructureDetailModal = ({ isOpen, onClose, feeRecord }) => {
    if (!isOpen || !feeRecord) return null;

    const { feeStructure, semester, totalFee, extraFees } = feeRecord;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Fee Structure Details</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Semester {semester} Breakdown</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all hover:rotate-90 duration-300"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-6">
                        {/* Course Info Summary */}
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mb-6">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Assigned Course</p>
                            <p className="text-sm font-bold text-slate-800">{feeStructure?.courseId?.name || feeStructure?.course || 'Academic Fees'}</p>
                        </div>

                        {/* Itemized List */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Component Breakdown</h4>
                            <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-100">
                                {feeStructure?.fees?.map((item, idx) => (
                                    <div key={idx} className="p-4 flex justify-between items-center hover:bg-white transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-xs group-hover:scale-110 transition-transform">
                                                <Circle size={8} fill="currentColor" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{item.categoryId?.name || 'Academic Component'}</span>
                                        </div>
                                        <span className="font-mono font-bold text-slate-900">₹{item.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Footer in Modal */}
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl text-white shadow-xl shadow-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Semester Fee</p>
                                    <p className="text-xs text-slate-500 italic">Excluding extra fines/adjustments</p>
                                </div>
                                <p className="text-2xl font-black font-mono">₹{totalFee.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeStructureDetailModal;
