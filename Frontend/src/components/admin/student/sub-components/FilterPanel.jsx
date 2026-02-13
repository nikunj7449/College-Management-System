import React from 'react';
import MultiSelectDropdown from '../../../custom/MultiSelectDropdown';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  courseOptions, 
  branchOptions, 
  semOptions 
}) => {
  const hasActiveFilters = 
    filters.course.length > 0 || 
    filters.branch.length > 0 || 
    filters.sem.length > 0 || 
    filters.isActive;

  const handleClearFilters = () => {
    onFilterChange({ course: [], branch: [], sem: [], isActive: '' });
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-20">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
            Course
          </label>
          <MultiSelectDropdown
            name="course"
            value={filters.course} 
            onChange={(e) => onFilterChange({ ...filters, [e.target.name]: e.target.value, branch: [], sem: [] })}
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
            onChange={(e) => onFilterChange({ ...filters, [e.target.name]: e.target.value, sem: [] })}
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
            onChange={(e) => onFilterChange({ ...filters, [e.target.name]: e.target.value })}
            options={semOptions}
            placeholder="Select Semesters"
            disabled={filters.branch.length === 0}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">
            Status
          </label>
          <select 
            value={filters.isActive} 
            onChange={(e) => onFilterChange({ ...filters, isActive: e.target.value })}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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

export default FilterPanel;