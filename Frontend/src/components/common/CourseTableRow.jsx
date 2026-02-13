import React from 'react';
import { Edit, Trash2, Eye, GraduationCap, GitBranch } from 'lucide-react';

const CourseTableRow = ({ course, onEdit, onDelete, onView, onManage }) => {
  const totalSubjects = course.branches?.reduce(
    (acc, branch) => acc + (branch.subjects?.length || 0), 
    0
  ) || 0;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mr-3">
            <GraduationCap size={18} />
          </div>
          <span className="font-medium text-slate-900">{course.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-600">
          {course.duration ? `${course.duration} Years` : '-'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {course.branches?.length || 0} Branches
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-slate-600">
          {totalSubjects} Subjects
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => onManage(course)} 
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" 
            title="Manage Branches"
          >
            <GitBranch size={16} />
          </button>
          <button 
            onClick={() => onView(course)} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onEdit(course)} 
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(course)} 
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CourseTableRow;