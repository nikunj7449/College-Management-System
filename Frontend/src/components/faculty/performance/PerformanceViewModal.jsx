import React from 'react';
import { X, User, BookOpen, Award, Calendar, FileText } from 'lucide-react';

const PerformanceViewModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const totalObtained = data.subjects?.reduce((sum, s) => sum + (parseFloat(s.marksObtained) || 0), 0) || 0;
    const overallMax = data.subjects?.reduce((sum, s) => sum + (parseFloat(s.totalMarks) || 0), 0) || 0;
    const percentage = overallMax > 0 ? ((totalObtained / overallMax) * 100).toFixed(2) : 0;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">Performance Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-6">

                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-start gap-4">
                            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Student</p>
                                <p className="text-lg font-bold text-slate-800">{data.student?.name || `${data.student?.firstName || ''} ${data.student?.lastName || ''}`.trim() || 'Unknown Student'}</p>
                                <p className="text-xs text-slate-600 mt-0.5">Roll No: {data.student?.rollNum || data.student?.rollNo || data.student?.studentId || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">Exam</p>
                                <p className="text-lg font-bold text-slate-800">{data.exam?.name || 'N/A'}</p>
                                <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                                    <Calendar size={12} /> {new Date(data.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        {data.faculty && (
                            <div className="md:col-span-2 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-500">Evaluated By</span>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800">{data.faculty?.name || 'Unknown'}</p>
                                    <p className="text-xs text-slate-500">{data.faculty?.email}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subjects Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-slate-500" /> Subjects Breakdown
                            </h3>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Obtained</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.subjects?.map((sub, idx) => {
                                    const subPercent = sub.totalMarks > 0 ? ((sub.marksObtained / sub.totalMarks) * 100).toFixed(1) : 0;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-700">{sub.subjectName}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600 text-right">{sub.marksObtained}</td>
                                            <td className="px-4 py-3 text-sm text-slate-500 text-right">{sub.totalMarks}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-right text-indigo-600">{subPercent}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-800">Grand Total</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">{totalObtained}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-slate-800 text-right">{overallMax}</td>
                                    <td className="px-4 py-3 text-sm font-bold text-indigo-700 text-right">{percentage}%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Grade and Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-2 shadow-inner border-4
                                ${data.grade === 'A' ? 'bg-green-100 text-green-600 border-green-200' :
                                    data.grade === 'B' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                        data.grade === 'C' ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                            data.grade === 'D' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                                data.grade === 'F' ? 'bg-red-100 text-red-600 border-red-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }
                            `}>
                                {data.grade || '-'}
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Final Grade</span>
                        </div>

                        <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                                <Award size={14} /> Faculty Remarks
                            </h4>
                            {data.feedback ? (
                                <p className="text-sm text-slate-700 italic leading-relaxed border-l-4 border-indigo-300 pl-3">
                                    "{data.feedback}"
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No feedback provided.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 text-white bg-slate-800 rounded-xl hover:bg-slate-900 font-medium transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PerformanceViewModal;
