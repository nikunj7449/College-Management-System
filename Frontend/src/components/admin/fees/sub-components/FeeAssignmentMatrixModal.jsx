import React from 'react';
import { X, CheckCircle, AlertCircle, Layers, BookOpen } from 'lucide-react';

const FeeAssignmentMatrixModal = ({ isOpen, onClose, courses, structures }) => {
    if (!isOpen) return null;

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

    // Helper to find structure for a specific combination
    const getStructure = (courseId, branchId, semester) => {
        return structures.find(s =>
            (s.courseId?._id === courseId || s.courseId === courseId) &&
            s.branchId === branchId &&
            s.semester === semester
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Fee Assignment Matrix</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Visualization of Course-Branch-Semester Mappings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-auto flex-1 custom-scrollbar">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full border-separate border-spacing-0">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-10 bg-white px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-r border-slate-100 rounded-tl-2xl">Course & Branch</th>
                                    {semesters.map(sem => (
                                        <th key={sem} className="px-4 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Sem {sem}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {courses.map((course) => (
                                    course.branches.map((branch, branchIdx) => (
                                        <tr key={`${course._id}-${branch._id}`} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/50 px-6 py-4 border-r border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen size={14} className="text-indigo-400" />
                                                    <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{course.name}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase ml-5">{branch.name}</div>
                                            </td>
                                            {semesters.map(sem => {
                                                const structure = getStructure(course._id, branch._id, sem);
                                                return (
                                                    <td key={sem} className="px-4 py-4 text-center">
                                                        {structure ? (
                                                            <div className="flex flex-col items-center gap-1 group/item">
                                                                <CheckCircle size={16} className="text-emerald-500 animate-in zoom-in duration-300" />
                                                                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover/item:text-emerald-600 transition-colors">₹{structure.totalAmount.toLocaleString()}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                                <AlertCircle size={16} className="text-rose-300" />
                                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Missing</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Defined</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="text-rose-300" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Not Defined</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm"
                    >
                        Close Matrix
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeeAssignmentMatrixModal;
