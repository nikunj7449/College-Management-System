import React, { useState } from 'react';
import { X, Loader, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
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
  const [previewImage, setPreviewImage] = useState(null);

  if (!isOpen) return null;

  const handleRemoveFile = (indexToRemove) => {
    const currentDocs = Array.from(formData.documents || []);
    const updatedDocs = currentDocs.filter((_, index) => index !== indexToRemove);
    
    onChange({
      target: {
        name: 'documents',
        files: updatedDocs
      }
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const existingFiles = Array.from(formData.documents || []);
      
      onChange({
        target: {
          name: 'documents',
          files: [...existingFiles, ...newFiles]
        }
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-60">
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
            <div className="relative z-50">
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
            <div className="relative z-40">
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
            <div className="relative z-40">
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
            <div className="relative z-30">
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
            <div className="relative z-30">
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
                {isViewMode ? 'Documents' : 'Upload Documents'}
              </label>
              {!isViewMode && (
                <div className="mt-1 flex flex-col justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 hover:border-indigo-400 transition-all duration-300 relative group">
                  <input 
                    type="file" 
                    name="documents" 
                    multiple 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="space-y-2 text-center relative z-10">
                    <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                      <UploadCloud className="h-8 w-8 text-indigo-600 transition-colors" />
                    </div>
                    <div className="flex flex-col text-sm text-slate-600 justify-center">
                      <span className="font-semibold text-indigo-600 hover:text-indigo-500 text-base">
                        Click to upload documents
                      </span>
                      <p className="text-slate-400 mt-1">or drag and drop files here</p>
                    </div>
                    <p className="text-xs text-slate-400">Supported formats: PNG, JPG, PDF (Max 5MB)</p>
                  </div>
                </div>
              )}

              {/* File Previews */}
              {formData.documents && formData.documents.length > 0 ? (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Selected Files ({formData.documents.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {Array.from(formData.documents).map((file, index) => {
                      const isFileObject = file instanceof File;
                      let fileName = 'Document';
                      let previewUrl = '';
                      let isImage = false;
                      let fileSize = '';

                      if (isFileObject) {
                        fileName = file.name;
                        previewUrl = URL.createObjectURL(file);
                        isImage = file.type.startsWith('image/');
                        fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
                      } else {
                        const urlString = typeof file === 'string' ? file : (file?.url || '');
                        previewUrl = urlString;
                        if (urlString) {
                          const cleanUrl = urlString.split('?')[0].toLowerCase();
                          fileName = decodeURIComponent(urlString.split('/').pop().split('?')[0]) || 'Document';
                          isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(cleanUrl);
                          if (!isImage && !cleanUrl.endsWith('.pdf')) isImage = true;
                        }
                      }

                      return (
                        <div 
                          key={index} 
                          className="group relative bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                          <div 
                            className="aspect-4/3 w-full overflow-hidden bg-slate-100 relative cursor-pointer"
                            onClick={() => isImage ? setPreviewImage(previewUrl) : window.open(previewUrl, '_blank')}
                          >
                            {!isViewMode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(index);
                                }}
                                className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                                title="Remove file"
                              >
                                <X size={14} />
                              </button>
                            )}

                            {isImage ? (
                              <img 
                                src={previewUrl} 
                                alt={fileName} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-400 group-hover:bg-slate-100 transition-colors">
                                <FileText size={32} strokeWidth={1.5} />
                                <span className="text-[10px] font-medium mt-2 uppercase tracking-wider text-slate-500">
                                  {fileName.split('.').pop()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-white">
                            <p className="text-xs font-medium text-slate-700 truncate" title={fileName}>
                              {fileName}
                            </p>
                            {fileSize && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {fileSize}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                isViewMode && (
                  <div className="mt-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500 text-sm italic">
                    No documents uploaded
                  </div>
                )
              )}
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

        {/* Image Preview Modal */}
        {previewImage && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <button 
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyFormModal;