import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Eye, Mail, Phone, BookOpen, MoreVertical } from 'lucide-react';
import { getShortBranch } from '../../utils/adminUtils/courseUtils';

const FacultyCard = ({ faculty, onEdit, onDelete, onView }) => {
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:z-30 transition-all duration-300 group relative">
      
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
                onClick={() => onEdit(faculty)} 
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(faculty._id)} 
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => onView(faculty)} 
                className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors" 
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&size=128`} 
            alt={faculty.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm"
          />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{faculty.name}</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
          {faculty.facultyId}
        </span>
        <p className="text-sm text-slate-500 mt-1">{faculty.designation}</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Course</p>
          <p className="font-bold text-slate-700">{faculty.course}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Branch</p>
          <p className="font-bold text-slate-700" title={faculty.branch}>
            {getShortBranch(faculty.branch)}
          </p>
        </div>
      </div>

      {/* Subjects */}
      {faculty.subject && faculty.subject.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <BookOpen size={14} className="text-slate-400" />
            <p className="text-xs text-slate-500 uppercase font-semibold">Subjects</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {faculty.subject.slice(0, 2).map((sub, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700"
              >
                {sub}
              </span>
            ))}
            {faculty.subject.length > 2 && (
              <span 
                title={faculty.subject.slice(2).join(', ')}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600"
              >
                +{faculty.subject.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center text-sm text-slate-600">
          <Mail size={14} className="mr-2 text-slate-400" />
          <span className="truncate">{faculty.personalEmail}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Phone size={14} className="mr-2 text-slate-400" />
          <span className="truncate">{faculty.phone}</span>
        </div>
      </div>
    </div>
  );
};

export default FacultyCard;