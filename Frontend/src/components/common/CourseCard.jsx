import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Eye, GraduationCap, Clock, GitBranch, MoreVertical } from 'lucide-react';

const CourseCard = ({ course, onEdit, onDelete, onView, onManage }) => {
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:z-30 transition-all duration-300 group relative flex flex-col h-full">
      
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
                onClick={() => onEdit(course)} 
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(course)} 
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => onView(course)} 
                className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors" 
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          <GraduationCap size={24} />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-1">{course.name}</h3>
      <div className="flex items-center text-xs text-slate-500 mb-3 bg-slate-50 w-fit px-2 py-1 rounded-md">
        <Clock size={14} className="mr-1.5" />
        <span>{course.duration ? `${course.duration} Years` : 'N/A'}</span>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center">
            <GitBranch size={16} className="mr-2 text-slate-400" />
            <span>{course.branches?.length || 0} Branches</span>
          </div>
          <button 
            onClick={() => onManage(course)} 
            className="text-indigo-600 font-medium hover:text-indigo-700 text-xs"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;