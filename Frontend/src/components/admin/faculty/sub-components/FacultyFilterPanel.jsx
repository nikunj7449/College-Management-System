import React from 'react';
import MultiSelectDropdown from '../../../custom/MultiSelectDropdown';

const FacultyFilterPanel = ({ 
  filters, 
  onFilterChange, 
  designationOptions,
  courseOptions, 
  branchOptions, 
  semOptions,
  subjectOptions
}) => {
  const hasActiveFilters = 
    filters.designation.length > 0 ||
    filters.course.length > 0 || 
    filters.branch.length > 0 || 
    filters.sem.length > 0 ||
    filters.subject.length > 0;

  const handleClearFilters = () => {
    onFilterChange({ designation: [], course: [], branch: [], sem: [], subject: [] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const newFilters = { ...filters, [name]: value };
    
    // Reset dependent filters
    if (name === 'course') {
      newFilters.branch = [];
      newFilters.sem = [];
      newFilters.subject = [];
    } else if (name === 'branch') {
      newFilters.sem = [];
      newFilters.subject = [];
    } else if (name === 'sem') {
      newFilters.subject = [];
    }
    
    onFilterChange(newFilters);
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-20">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
            Designation
          </label>
          <MultiSelectDropdown
            name="designation"
            value={filters.designation} 
            onChange={handleChange}
            options={designationOptions}
            placeholder="Select Designations"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
            Course
          </label>
          <MultiSelectDropdown
            name="course"
            value={filters.course} 
            onChange={handleChange}
            options={courseOptions}
            placeholder="Select Courses"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
            Branch
          </label>
          <MultiSelectDropdown
            name="branch"
            value={filters.branch} 
            onChange={handleChange}
            options={branchOptions}
            placeholder="Select Branches"
            disabled={filters.course.length === 0}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
            Semester
          </label>
          <MultiSelectDropdown
            name="sem"
            value={filters.sem} 
            onChange={handleChange}
            options={semOptions}
            placeholder="Select Semesters"
            disabled={filters.branch.length === 0}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
            Subject
          </label>
          <MultiSelectDropdown
            name="subject"
            value={filters.subject} 
            onChange={handleChange}
            options={subjectOptions}
            placeholder="Select Subjects"
            disabled={filters.sem.length === 0}
          />
        </div>

        {hasActiveFilters && (
          <button 
            onClick={handleClearFilters}
            className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FacultyFilterPanel;