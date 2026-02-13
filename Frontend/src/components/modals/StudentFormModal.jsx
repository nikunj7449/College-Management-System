import React from 'react';
import { X, Loader, UploadCloud } from 'lucide-react';
import CustomDropdown from '../custom/CustomDropdown';

const StudentFormModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  onChange, 
  onSubmit, 
  isEditMode, 
  isViewMode, 
  submitLoading,
  courseOptions,
  branchOptions,
  semOptions
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
            {isViewMode ? 'Student Details' : (isEditMode ? 'Edit Student' : 'Add New Student')}
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
                placeholder="e.g. John Doe" 
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Student ID *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                name="studentId" 
                value={formData.studentId} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="e.g. S-101" 
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

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Semester *
              </label>
              {isViewMode ? (
                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex items-center">
                  <span className="text-slate-900">
                    {formData.sem ? `Semester ${formData.sem}` : 'N/A'}
                  </span>
                </div>
              ) : (
                <CustomDropdown
                  name="sem"
                  value={formData.sem}
                  onChange={onChange}
                  options={semOptions}
                  placeholder="Select Semester"
                  disabled={!formData.branch}
                />
              )}
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Roll Number *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                name="rollNum" 
                value={formData.rollNum} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="e.g. 15" 
              />
            </div>

            {/* Parent Contact */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Parent Contact *
              </label>
              <input 
                disabled={isViewMode} 
                required 
                name="parentContact" 
                value={formData.parentContact} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="Parent Phone" 
              />
            </div>

            {/* Student Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Student Phone
              </label>
              <input 
                disabled={isViewMode} 
                name="studentPhone" 
                value={formData.studentPhone} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="Student Phone" 
              />
            </div>

            {/* Personal Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Personal Email
              </label>
              <input 
                disabled={isViewMode} 
                type="email" 
                name="personalEmail" 
                value={formData.personalEmail} 
                onChange={onChange} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" 
                placeholder="student@gmail.com" 
              />
            </div>

            {/* Document Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Upload Documents (ID, Marksheet, TC)
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
                  isEditMode ? 'Update Student' : 'Save Student'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentFormModal;