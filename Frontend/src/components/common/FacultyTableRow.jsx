import React from 'react';
import { Edit, Trash2, Eye, Mail, Phone } from 'lucide-react';
import { getShortBranch } from '../../utils/adminUtils/courseUtils';

const FacultyTableRow = ({ faculty, onEdit, onDelete, onView }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&size=32`} 
            alt="" 
            className="w-10 h-10 rounded-full mr-3 object-cover border border-slate-200"
          />
          <span className="font-medium text-slate-900">{faculty.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="font-medium text-slate-700">{faculty.facultyId}</p>
          <p className="text-slate-500 text-xs">{faculty.designation}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="text-slate-700">{faculty.course}</p>
          <p className="text-slate-500 text-xs" title={faculty.branch}>
            {getShortBranch(faculty.branch)}
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-500 space-y-1">
          <div className="flex items-center">
            <Mail size={12} className="mr-1.5 text-slate-400"/> 
            {faculty.personalEmail}
          </div>
          <div className="flex items-center">
            <Phone size={12} className="mr-1.5 text-slate-400"/> 
            {faculty.phone}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {faculty.subject?.slice(0, 2).map((sub, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
            >
              {sub}
            </span>
          ))}
          {faculty.subject?.length > 2 && (
            <span 
              title={faculty.subject?.slice(2).join(', ')} 
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
            >
              +{faculty.subject.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => onView(faculty)} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onEdit(faculty)} 
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(faculty)} 
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

export default FacultyTableRow;