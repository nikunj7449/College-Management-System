import React from 'react';
import { Edit, Trash2, Eye, Power, Mail, Phone } from 'lucide-react';
import { getShortBranch } from '../../utils/adminUtils/courseUtils';

const StudentTableRow = ({ student, onEdit, onDelete, onView, onToggleStatus, role }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=32`} 
            alt="" 
            className="w-10 h-10 rounded-full mr-3 object-cover border border-slate-200"
          />
          <span className="font-medium text-slate-900">{student.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="font-medium text-slate-700">{student.studentId}</p>
          <p className="text-slate-500 text-xs">Roll: {student.rollNum}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100" 
          title={student.branch}
        >
          {student.course} {student.branch && `- ${getShortBranch(student.branch)}`} - Sem {student.sem}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-500 space-y-1">
          <div className="flex items-center">
            <Mail size={12} className="mr-1.5 text-slate-400"/> 
            {student.email}
          </div>
          <div className="flex items-center">
            <Phone size={12} className="mr-1.5 text-slate-400"/> 
            {student.parentContact}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span 
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            student.isActive 
              ? 'bg-green-50 text-green-700 border-green-100' 
              : 'bg-red-50 text-red-700 border-red-100'
          }`}
        >
          {student.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => onView(student)} 
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => onEdit(student)} 
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
            title="Edit"
          >
            <Edit size={16} />
          </button>
          { role === "ADMIN" && 
          (
          <>
          <button 
            onClick={() => onToggleStatus(student)} 
            className={`p-2 rounded-lg transition-colors ${
              student.isActive 
                ? 'text-orange-600 hover:bg-orange-50' 
                : 'text-green-600 hover:bg-green-50'
            }`} 
            title={student.isActive ? "Deactivate" : "Activate"}
          >
            <Power size={16} />
          </button>
          <button 
            onClick={() => onDelete(student._id)} 
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
            title="Delete"
          >
            <Trash2 size={16} />
          </button>            
          </>
          )
          }
        </div>
      </td>
    </tr>
  );
};

export default StudentTableRow;