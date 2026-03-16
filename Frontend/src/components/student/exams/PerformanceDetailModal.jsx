import React from 'react';
import { X, BookOpen, Award, Calendar, FileText, UserSquare2 } from 'lucide-react';

const PerformanceDetailModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    // Handle both Map-like and Array structures for subjects
    let subjectsArray = [];
    if (data.subjects) {
        if (Array.isArray(data.subjects)) {
            subjectsArray = data.subjects;
        } else if (typeof data.subjects === 'object') {
            subjectsArray = Object.entries(data.subjects).map(([name, marks]) => ({
                subjectName: name,
                marksObtained: marks,
                totalMarks: data.totalMarks / Object.keys(data.subjects).length || 100 // Fallback if totalMarks per subject isn't clear
            }));
        }
    }

    const totalObtained = subjectsArray.reduce((sum, s) => sum + (parseFloat(s.marksObtained) || 0), 0) || 0;
    const overallMax = subjectsArray.reduce((sum, s) => sum + (parseFloat(s.totalMarks) || 0), 0) || 0;
    const percentage = overallMax > 0 ? ((totalObtained / overallMax) * 100).toFixed(2) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans transition-opacity duration-200">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 transition-all duration-200 transform">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Exam Results Detail</h2>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">{data.exam?.name || 'Academic Assessment'}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 hover:bg-slate-200/70 rounded-2xl text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                            <div className="bg-indigo-100 p-3.5 rounded-2xl text-indigo-600 shadow-sm">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assessment Type</p>
                                <p className="text-lg font-bold text-slate-800 leading-tight">{data.exam?.type || 'Examination'}</p>
                                <div className="flex items-center gap-1.5 mt-1.5 text-indigo-600 font-bold text-xs uppercase">
                                    <Calendar size={12} /> {new Date(data.createdAt || data.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </div>
                            </div>
                        </div>
                        <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/50 flex items-start gap-4">
                            <div className="bg-emerald-100 p-3.5 rounded-2xl text-emerald-600 shadow-sm">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Final Performance</p>
                                <p className="text-lg font-bold text-slate-800 leading-tight">Grade: <span className="text-emerald-600">{data.grade || 'N/A'}</span></p>
                                <p className="text-xs font-bold text-emerald-600/70 mt-1">{percentage}% Aggregate Score</p>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Table */}
                    <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2.5">
                                <FileText size={20} className="text-indigo-500" /> Subject Breakdown
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Obtained</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Total</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {subjectsArray.length > 0 ? subjectsArray.map((sub, idx) => {
                                        const subPercent = sub.totalMarks > 0 ? (sub.marksObtained / sub.totalMarks) * 100 : 0;
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{sub.subjectName}</td>
                                                <td className="px-6 py-4 text-sm font-black text-indigo-600 text-right">{sub.marksObtained}</td>
                                                <td className="px-6 py-4 text-sm text-slate-400 text-right">{sub.totalMarks}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                                                        subPercent >= 40 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                    }`}>
                                                        {subPercent >= 40 ? 'PASS' : 'FAIL'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic text-sm">No detailed subject breakdown available.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-50/50 border-t border-slate-100 font-bold">
                                    <tr>
                                        <td className="px-6 py-4 text-sm text-slate-800">Grand Total</td>
                                        <td className="px-6 py-4 text-sm text-indigo-700 text-right font-black">{totalObtained}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 text-right font-black">{overallMax}</td>
                                        <td className="px-6 py-4 text-right text-indigo-700 font-black">{percentage}%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Evaluator & Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-sm">
                                <UserSquare2 size={32} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Evaluated By</span>
                            <p className="font-bold text-slate-800 tracking-tight">{data.faculty?.name || 'Internal Faculty'}</p>
                        </div>

                        <div className="md:col-span-2 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl p-6 relative">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Award size={14} className="text-amber-500" /> Faculty Feedback
                            </h4>
                            <div className="relative">
                                <span className="absolute -top-4 -left-2 text-4xl text-slate-200 font-serif">"</span>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic pr-4 pl-4">
                                    {data.feedback ? data.feedback : "Excellent work! Keep improving your understanding of core concepts for even better results in the future assessments."}
                                </p>
                                <span className="absolute -bottom-4 right-0 text-4xl text-slate-200 font-serif">"</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-8 py-3 text-white bg-slate-800 rounded-2xl hover:bg-slate-900 font-bold text-sm transition-all shadow-md active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PerformanceDetailModal;
