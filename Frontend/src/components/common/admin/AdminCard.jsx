import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Trash2, Eye, Mail, Phone } from 'lucide-react';

const AdminCard = ({ admin, onEdit, onDelete, onView }) => {
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

      {/* Actions */}
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
            <button
              onClick={() => onEdit(admin)}
              className="p-2 text-blue-600 bg-white/50 hover:bg-blue-50/80 backdrop-blur-sm shadow-sm border border-white/60 rounded-xl transition-all"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(admin)}
              className="p-2 text-red-600 bg-white/50 hover:bg-red-50/80 backdrop-blur-sm shadow-sm border border-white/60 rounded-xl transition-all"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="flex justify-center space-x-1.5">
            <button
              onClick={() => onView(admin)}
              className="p-2 text-slate-600 bg-white/50 hover:bg-slate-50/80 backdrop-blur-sm shadow-sm border border-white/60 rounded-xl transition-all w-full flex justify-center"
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
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=random&size=128`}
            alt={admin.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm"
          />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{admin.name}</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
          {admin.adminId}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Role</p>
          <p className="font-bold text-slate-700">{admin.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase font-semibold">Joined</p>
          <p className="font-bold text-slate-700">
            {new Date(admin.joinedDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center text-sm text-slate-600">
          <Mail size={14} className="mr-2 text-slate-400" />
          <span className="truncate">{admin.email}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Phone size={14} className="mr-2 text-slate-400" />
          <span className="truncate">{admin.phone || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
