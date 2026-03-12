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
        className={`absolute top-3 right-3 z-10 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1.5 text-slate-600 bg-white/40 hover:bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.05)] rounded-full transition-all duration-300"
        >
          <MoreVertical size={18} />
        </button>

        <div className={`absolute right-0 top-0 bg-white/40 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/80 p-2 flex flex-col gap-1.5 z-20 min-w-[100px] transition-all duration-300 ${showActions ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
          <div className="flex justify-center space-x-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(course)}
                className="p-2 text-blue-600 bg-white/50 hover:bg-blue-50/80 backdrop-blur-sm shadow-sm border border-white/60 rounded-xl transition-all"
                title="Edit"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(course)}
                className="p-2 text-red-600 bg-white/50 hover:bg-red-50/80 backdrop-blur-sm shadow-sm border border-white/60 rounded-xl transition-all"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="flex justify-center space-x-1.5">
            {onView && (
              <button
                onClick={() => onView(course)}
                className="p-2 text-slate-600 bg-white/50 hover:bg-slate-50/80 backdrop-blur-sm shadow-sm border border-white/60 rounded-xl transition-all w-full flex justify-center"
                title="View Details"
              >
                <Eye size={16} />
              </button>
            )}
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
          {onManage && (
            <button
              onClick={() => onManage(course)}
              className="text-indigo-600 font-medium hover:text-indigo-700 text-xs"
            >
              Manage
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;