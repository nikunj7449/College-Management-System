import React from 'react';
import { X, Loader, UploadCloud } from 'lucide-react';
import CustomDropdown from '../custom/CustomDropdown';
import MultiSelectDropdown from '../custom/MultiSelectDropdown';

const FacultyFormModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  isEditMode, 
  isViewMode, 
  submitLoading,
  designationOptions,
  courseOptions,
  branchOptions,
  semOptions,
  subjectOptions
}) => {
  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {isViewMode ? 'Faculty Details' : (isEditMode ? 'Edit Faculty' : 'Add New Faculty')}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                name="name" 
                value={formData.name} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="e.g. Dr. Sarah Smith" 
              />
            </div>

            {/* Faculty ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Faculty ID *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                name="facultyId" 
                value={formData.facultyId} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="e.g. FAC001" 
              />
            </div>

            {/* Personal Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Personal Email *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                type="email" 
                name="personalEmail" 
                value={formData.personalEmail} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                name="phone" 
                value={formData.phone} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Birth *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                type="date" 
                name="dob" 
                value={formData.dob} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Qualification *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                name="qualification" 
                value={formData.qualification} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="e.g. M.Sc, PhD" 
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Designation *
              </label>
              {isViewMode ? (
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex items-center">
                  <span className="text-slate-900">{formData.designation || 'N/A'}</span>
                </div>
              ) : (
                <CustomDropdown
                  name="designation"
                  value={formData.designation}
                  onChange={onChange}
                  options={designationOptions}
                  placeholder="Select Designation"
                />
              )}
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Salary
              </label>
              <input 
                disabled={isViewMode} 
                type="number" 
                name="salary" 
                value={formData.salary} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="e.g. 50000" 
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Joining Date
              </label>
              <input 
                disabled={isViewMode} 
                type="date" 
                name="joiningDate" 
                value={formData.joiningDate} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course *
              </label>
              {isViewMode ? (
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex items-center">
                  <span className="text-slate-900">{formData.course || 'N/A'}</span>
                </div>
              ) : (
                <CustomDropdown
                  name="course"
                  value={formData.course}
                  onChange={onChange}
                  options={courseOptions}
                  placeholder="Select Course"
                />
              )}
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Branch *
              </label>
              {isViewMode ? (
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex items-center">
                  <span className="text-slate-900">{formData.branch || 'N/A'}</span>
                </div>
              ) : (
                <CustomDropdown
                  name="branch"
                  value={formData.branch}
                  onChange={onChange}
                  options={branchOptions}
                  placeholder="Select Branch"
                  disabled={!formData.course}
                />
              )}
            </div>

            {/* Semesters */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Semesters *
              </label>
              {isViewMode ? (
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex flex-wrap gap-2">
                  {formData.sem?.length > 0 ? (
                    formData.sem.map((s, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        Sem {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">No semesters assigned</span>
                  )}
                </div>
              ) : (
                <MultiSelectDropdown
                  name="sem"
                  value={formData.sem}
                  onChange={onChange}
                  options={semOptions}
                  placeholder="Select Semesters"
                  disabled={!formData.branch}
                />
              )}
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subjects *
              </label>
              {isViewMode ? (
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex flex-wrap gap-2">
                  {formData.subject?.length > 0 ? (
                    formData.subject.map((s, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">No subjects assigned</span>
                  )}
                </div>
              ) : (
                <MultiSelectDropdown
                  name="subject"
                  value={formData.subject}
                  onChange={onChange}
                  options={subjectOptions}
                  placeholder="Select Subjects"
                  disabled={formData.sem.length === 0}
                />
              )}
            </div>

            {/* Document Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Upload Documents
              </label>
              <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl ${
                !isViewMode ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60'
              } transition-colors relative`}>
                <input 
                  disabled={isViewMode}
                  type="file" 
                  name="documents" 
                  multiple 
                  onChange={onChange} 
                  className={`absolute inset-0 w-full h-full opacity-0 ${
                    !isViewMode ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <span className="font-medium text-indigo-600 hover:text-indigo-500">
                      Upload files
                    </span>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                  {formData.documents && formData.documents.length > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      {formData.documents.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button 
                type="submit" 
                disabled={submitLoading} 
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading ? (
                  <>
                    <Loader size={18} className="animate-spin mr-2" /> 
                    Saving...
                  </>
                ) : (
                  isEditMode ? 'Update Faculty' : 'Save Faculty'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyFormModal;