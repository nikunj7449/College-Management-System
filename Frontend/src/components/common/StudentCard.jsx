import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Eye, Power, Mail, Phone, MoreVertical } from 'lucide-react';
import { getShortBranch } from '../../utils/adminUtils/courseUtils';

const StudentCard = ({ student, onEdit, onDelete, onView, onToggleStatus }) => {
  const [showActions, setShowActions] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowActions(false);
    }, 600);
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:z-30 transition-all duration-300 group relative"
    >
      
      {/* Card Header / Actions */}
      <div 
        className={`absolute top-4 right-4 z-10 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`} 
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <button 
          onClick={() => setShowActions(!showActions)}
          className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
        >
          <MoreVertical size={20} />
        </button>
        
        <div className={`absolute right-0 top-0 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex flex-col gap-2 z-20 min-w-25 transition-all duration-200 origin-top-right ${showActions ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => onEdit(student)} 
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(student._id)} 
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => onView(student)} 
                className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors" 
                title="View Details"
              >
                <Eye size={16} />
              </button>
              <button 
                onClick={() => onToggleStatus(student)}
                className={`p-2 rounded-lg transition-colors ${
                  student.isActive 
                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                }`}
                title={student.isActive ? "Deactivate" : "Activate"}
              >
                <Power size={16} />
              </button>
            </div>
          </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random&size=128`} 
            alt={student.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm"
          />
          <span 
            className={`absolute bottom-1 right-1 w-4 h-4 border-2 border-white rounded-full ${
              student.isActive ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{student.name}</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
          {student.studentId}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Course</p>
          <p className="font-bold text-slate-700">{student.course}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Branch</p>
          <p className="font-bold text-slate-700" title={student.branch}>
            {getShortBranch(student.branch)}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center text-sm text-slate-600">
          <Mail size={14} className="mr-2 text-slate-400" />
          <span className="truncate">{student.email}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Phone size={14} className="mr-2 text-slate-400" />
          <span className="truncate">{student.parentContact}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;