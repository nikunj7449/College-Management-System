import React from 'react';
import { X, Clock, GitBranch, Book } from 'lucide-react';

const CourseViewModal = ({ isOpen, onClose, courseForm }) => {
  if (!isOpen) return null;

  const getSemesterStyle = (sem) => {
    const styles = {
      1: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
      2: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
      3: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
      4: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
      5: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-700' },
      6: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700' },
      7: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', badge: 'bg-fuchsia-100 text-fuchsia-700' },
      8: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
    };
    return styles[sem] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">Course Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Course Info */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Course Name
              </h3>
              <p className="text-xl font-bold text-slate-800">{courseForm.name}</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Duration
              </h3>
              <div className="flex items-center justify-end text-slate-700 font-semibold">
                <Clock size={16} className="mr-1.5 text-indigo-500" />
                {courseForm.duration} Years
              </div>
            </div>
          </div>

          {/* Branches & Subjects */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
              <GitBranch size={18} className="mr-2 text-indigo-600" />
              Branches & Subjects
            </h3>

            <div className="space-y-3">
              {courseForm.branches && courseForm.branches.length > 0 ? (
                courseForm.branches.map((branch, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <span className="font-semibold text-slate-700 text-sm">
                        {branch.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                        {branch.subjects?.length || 0} Subjects
                      </span>
                    </div>

                    {branch.subjects && branch.subjects.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {branch.subjects.map((subject, sIdx) => {
                          const style = getSemesterStyle(subject.semester);
                          return (
                          <div
                            key={sIdx}
                            className={`px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors border-l-2 ${style.border}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded ${style.bg} ${style.text}`}>
                                <Book size={14} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {subject.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded border border-slate-200">
                                    {subject.code}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${style.badge}`}>
                                    Sem {subject.semester}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-medium text-slate-500">
                              {subject.credits} Cr
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 italic bg-white">
                        No subjects added.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">
                    No branches defined for this course.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseViewModal;