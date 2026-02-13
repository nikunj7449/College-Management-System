import React from 'react';
import { X, Loader, Plus, Trash2, Book } from 'lucide-react';

const CourseFormModal = ({
  isOpen,
  onClose,
  courseForm,
  onChange,
  onSubmit,
  isEditMode,
  submitLoading,
  // Nested form handlers (only for create mode)
  onAddBranch,
  onRemoveBranch,
  onUpdateBranchName,
  onAddSubjectToBranch,
  onUpdateSubject,
  onRemoveSubject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course Name *
              </label>
              <input
                required
                name="name"
                value={courseForm.name}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. B.Tech"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duration (Years)
              </label>
              <input
                type="number"
                name="duration"
                value={courseForm.duration}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. 4"
              />
            </div>
          </div>

          {/* Add Branches Section (Only in Create Mode) */}
          {!isEditMode && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Branches & Subjects (Optional)
                </label>
                <button
                  type="button"
                  onClick={onAddBranch}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add Branch
                </button>
              </div>

              <div className="space-y-4">
                {courseForm.branches?.map((branch, bIdx) => (
                  <div key={bIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-3 mb-3">
                      <input
                        placeholder="Branch Name (e.g. Computer Science)"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        value={branch.name}
                        onChange={(e) => onUpdateBranchName(bIdx, e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveBranch(bIdx)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Subjects */}
                    <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                      {branch.subjects.map((subject, sIdx) => (
                        <div key={sIdx} className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-4">
                            <input
                              placeholder="Subject Name"
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                              value={subject.name}
                              onChange={(e) => onUpdateSubject(bIdx, sIdx, 'name', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              placeholder="Code"
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                              value={subject.code}
                              onChange={(e) => onUpdateSubject(bIdx, sIdx, 'code', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Cr"
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                              value={subject.credits}
                              onChange={(e) => onUpdateSubject(bIdx, sIdx, 'credits', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-span-3">
                            <select
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500"
                              value={subject.semester}
                              onChange={(e) => onUpdateSubject(bIdx, sIdx, 'semester', e.target.value)}
                              required
                            >
                              <option value="">Sem</option>
                              {[...Array(8)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => onRemoveSubject(bIdx, sIdx)}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => onAddSubjectToBranch(bIdx)}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center mt-2"
                      >
                        <Plus size={12} className="mr-1" /> Add Subject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center"
            >
              {submitLoading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" /> Saving...
                </>
              ) : (
                isEditMode ? 'Update Course' : 'Save Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;