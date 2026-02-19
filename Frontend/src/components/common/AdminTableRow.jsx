import React from 'react';
import { Edit, Trash2, Eye, Mail, Phone, Shield } from 'lucide-react';

const AdminTableRow = ({ admin, onEdit, onDelete, onView }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {admin.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-slate-900">{admin.name}</div>
            <div className="text-xs text-slate-500">ID: {admin.adminId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-sm text-slate-600">
            <Mail size={14} className="mr-2 text-slate-400" />
            {admin.email}
          </div>
          {admin.phone && (
            <div className="flex items-center text-sm text-slate-600">
              <Phone size={14} className="mr-2 text-slate-400" />
              {admin.phone}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
          <Shield size={12} className="mr-1" />
          {admin.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
        {new Date(admin.joinedDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => onView(admin)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="View"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => onEdit(admin)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => onDelete(admin)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminTableRow;
