import React from 'react';
import { 
  X, Loader, Plus, Trash2, Edit, Check, Book, 
  GitBranch, ChevronDown, ChevronRight 
} from 'lucide-react';

const SubjectFormModal = ({ 
  isOpen, 
  onClose, 
  subjectForm, 
  onChange, 
  onSubmit, 
  submitLoading,
  isEditMode 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {isEditMode ? 'Edit Subject' : 'Add Subject'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Subject Name
            </label>
            <input
              required
              name="name"
              value={subjectForm.name}
              onChange={onChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Data Structures"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Subject Code
              </label>
              <input
                required
                name="code"
                value={subjectForm.code}
                onChange={onChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                placeholder="e.g. CS101"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Credits
              </label>
              <input
                type="number"
                required
                name="credits"
                value={subjectForm.credits}
                onChange={onChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                placeholder="e.g. 4"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Semester
            </label>
            <select
              required
              name="semester"
              value={subjectForm.semester}
              onChange={onChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Semester</option>
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-70"
            >
              {submitLoading ? 'Saving...' : isEditMode ? 'Update Subject' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BranchManageModal = ({
  isOpen,
  onClose,
  course,
  // Branch operations
  newBranchName,
  setNewBranchName,
  onAddBranch,
  branchLoading,
  expandedBranch,
  onToggleBranch,
  editingBranchId,
  editBranchName,
  setEditBranchName,
  onStartEditingBranch,
  onUpdateBranch,
  onCancelEditBranch,
  onDeleteBranch,
  // Subject operations
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  // Subject form modal
  showSubjectModal,
  subjectForm,
  onSubjectFormChange,
  onSubjectSubmit,
  onCloseSubjectModal,
  submitLoading,
  isEditingSubject
}) => {
  if (!isOpen) return null;

  const getSemesterStyle = (sem) => {
    const styles = {
      1: { dot: 'bg-blue-400', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
      2: { dot: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
      3: { dot: 'bg-violet-400', text: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
      4: { dot: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
      5: { dot: 'bg-rose-400', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
      6: { dot: 'bg-cyan-400', text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
      7: { dot: 'bg-fuchsia-400', text: 'text-fuchsia-600', bg: 'bg-fuchsia-50', border: 'border-fuchsia-100' },
      8: { dot: 'bg-indigo-400', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    };
    return styles[sem] || { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-xl font-bold text-slate-800">Manage Branches</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Course Info */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                Selected Course
              </h3>
              <p className="text-lg font-bold text-indigo-900">{course.name}</p>
            </div>

            {/* Add Branch Form */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                <GitBranch size={16} className="mr-2 text-indigo-600" />
                Manage Branches
              </h3>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <form onSubmit={onAddBranch} className="flex gap-2">
                  <input
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="New Branch Name (e.g. CSE)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={branchLoading || !newBranchName.trim()}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {branchLoading ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                </form>
              </div>

              {/* Branch List */}
              <div className="space-y-2">
                {course.branches && course.branches.length > 0 ? (
                  course.branches.map((branch, index) => (
                    <div
                      key={branch._id || index}
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <div
                        className="flex justify-between items-center p-3 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => onToggleBranch(branch._id || index)}
                      >
                        {editingBranchId === (branch._id || index) ? (
                          <div
                            className="flex-1 flex gap-2 items-center mr-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              value={editBranchName}
                              onChange={(e) => setEditBranchName(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={() => onUpdateBranch(branch._id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={onCancelEditBranch}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {expandedBranch === (branch._id || index) ? (
                              <ChevronDown size={16} className="text-slate-400" />
                            ) : (
                              <ChevronRight size={16} className="text-slate-400" />
                            )}
                            <span className="text-sm font-medium text-slate-700">
                              {branch.name}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartEditingBranch(branch);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors ml-1"
                            >
                              <Edit size={12} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSubject(branch._id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Add Subject"
                          >
                            <Plus size={14} />
                          </button>
                          {expandedBranch !== (branch._id || index) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteBranch(branch);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subjects List */}
                      {expandedBranch === (branch._id || index) &&
                        branch.subjects &&
                        branch.subjects.length > 0 && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-100">
                            {Object.entries(
                              branch.subjects.reduce((acc, subject) => {
                                const sem = subject.semester || 'General';
                                if (!acc[sem]) acc[sem] = [];
                                acc[sem].push(subject);
                                return acc;
                              }, {})
                            )
                              .sort((a, b) =>
                                a[0] === 'General' ? 1 : b[0] === 'General' ? -1 : Number(a[0]) - Number(b[0])
                              )
                              .map(([sem, subjects]) => {
                                const style = getSemesterStyle(sem);
                                return (
                                <div key={sem} className="mt-3 first:mt-1">
                                  <div className="flex items-center mb-2">
                                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-2`}></span>
                                    <p className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
                                      {sem === 'General' ? 'General Subjects' : `Semester ${sem}`}
                                    </p>
                                  </div>
                                  <div className={`grid grid-cols-1 gap-1.5 pl-3.5 border-l ml-0.75 ${style.border.replace('border-', 'border-l-')}`}>
                                    {subjects.map((subject, sIdx) => (
                                      <div
                                        key={sIdx}
                                        className={`flex items-center text-xs text-slate-600 p-2 rounded border ${style.bg} ${style.border}`}
                                      >
                                        <Book size={12} className={`mr-2 shrink-0 ${style.text}`} />
                                        <span className="font-medium mr-auto truncate">
                                          {subject.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-400 font-mono text-[10px] bg-white px-1 rounded border border-slate-100">
                                            {subject.code}
                                          </span>
                                          {subject.credits && (
                                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                                              {subject.credits} Cr
                                            </span>
                                          )}
                                          <button
                                            onClick={() => onEditSubject(subject, branch._id)}
                                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit Subject"
                                          >
                                            <Edit size={12} />
                                          </button>
                                          <button
                                            onClick={() => onDeleteSubject(subject, branch._id)}
                                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Subject"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                );
                              })}
                          </div>
                        )}
                      {expandedBranch === (branch._id || index) &&
                        (!branch.subjects || branch.subjects.length === 0) && (
                          <div className="px-3 pb-3 pt-1 border-t border-slate-100 text-xs text-slate-400 italic">
                            No subjects found.
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-400 py-2">
                    No branches added yet.
                  </p>
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

      {/* Subject Form Modal */}
      <SubjectFormModal
        isOpen={showSubjectModal}
        onClose={onCloseSubjectModal}
        subjectForm={subjectForm}
        onChange={onSubjectFormChange}
        onSubmit={onSubjectSubmit}
        submitLoading={submitLoading}
        isEditMode={isEditingSubject}
      />
    </>
  );
};

export default BranchManageModal;