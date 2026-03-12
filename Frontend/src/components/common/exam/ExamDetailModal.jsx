import React from 'react';
import { X, Calendar, Clock, BookOpen, Award, FileText, User, Info, CheckSquare, AlertCircle } from 'lucide-react';

const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Field = ({ icon: Icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-indigo-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Upcoming':  return 'blue';
    case 'Ongoing':   return 'amber';
    case 'Completed': return 'emerald';
    case 'Cancelled': return 'red';
    default:          return 'slate';
  }
};

const ExamDetailModal = ({ isOpen, onClose, exam }) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-t-2xl">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge color={getStatusColor(exam.status)}>{exam.status}</Badge>
              <Badge color="indigo">{exam.type}</Badge>
            </div>
            <h2 className="text-xl font-black leading-tight">{exam.name}</h2>
            {exam.course?.name && (
              <p className="text-indigo-200 text-sm mt-1 font-medium">
                {exam.course.name} {exam.semester ? `· Semester ${exam.semester}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Schedule Section */}
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Schedule</h3>
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <Field
              icon={Calendar}
              label="Date"
              value={exam.date ? new Date(exam.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : null}
            />
            <Field
              icon={Clock}
              label="Time"
              value={exam.startTime && exam.endTime ? `${exam.startTime} – ${exam.endTime}` : null}
            />
            {exam.course?.name && (
              <Field icon={BookOpen} label="Course" value={exam.course.name} />
            )}
            {exam.semester && (
              <Field icon={Info} label="Semester" value={`Semester ${exam.semester}`} />
            )}
          </div>

          {/* Grading Section */}
          {(exam.totalMarks || exam.passingMarks) && (
            <>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Grading</h3>
              <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                <Field icon={CheckSquare} label="Total Marks" value={exam.totalMarks} />
                <Field icon={AlertCircle} label="Passing Marks" value={exam.passingMarks} />
                {exam.totalMarks && exam.passingMarks && (
                  <Field
                    icon={Award}
                    label="Pass Percentage"
                    value={`${Math.round((exam.passingMarks / exam.totalMarks) * 100)}%`}
                  />
                )}
              </div>
            </>
          )}

          {/* Description Section */}
          {exam.description && (
            <>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Instructions</h3>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6">
                <div className="flex gap-3">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 leading-relaxed">{exam.description}</p>
                </div>
              </div>
            </>
          )}

          {/* Meta Section */}
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Meta</h3>
          <div className="bg-slate-50 rounded-2xl p-4">
            <Field
              icon={User}
              label="Created By"
              value={exam.createdBy ? `${exam.createdBy.firstName || ''} ${exam.createdBy.lastName || ''}`.trim() || 'Admin' : 'Admin'}
            />
            <Field
              icon={Calendar}
              label="Created At"
              value={exam.createdAt ? new Date(exam.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamDetailModal;
