import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Shield, MoreVertical } from 'lucide-react';

const RoleCard = ({ role, onEdit, onDelete }) => {
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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:z-30 transition-all duration-300 relative group">

            {/* Actions Menu */}
            <div
                className={`absolute top-4 right-4 z-10 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
            >
                <div className="flex gap-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-slate-100 p-1">
                    <button
                        onClick={() => onEdit(role)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 bg-white rounded-lg transition-colors"
                        title="Edit Role"
                    >
                        <Edit2 size={16} />
                    </button>
                    {!role.isSystem && onDelete && (
                        <button
                            onClick={() => onDelete(role._id, role.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 bg-white rounded-lg transition-colors"
                            title="Delete Role"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Center Profile/Icon */}
            <div className="flex flex-col items-center text-center mb-4 mt-2">
                <div className="w-16 h-16 rounded-full bg-slate-50 text-blue-600 flex items-center justify-center mb-3 border-4 border-white shadow-sm">
                    <Shield size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{role.name}</h3>
                {role.isSystem ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                        CORE SYSTEM
                    </span>
                ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        CUSTOM ROLE
                    </span>
                )}
            </div>

            {/* Description Block */}
            <div className="text-center p-3 bg-slate-50 rounded-xl mb-4 h-[60px] flex items-center justify-center">
                <p className="text-sm text-slate-600 line-clamp-2">
                    {role.description || 'No description provided.'}
                </p>
            </div>

            <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Modules Configuration</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(role.permissions || {}).map(([module, perms]) => {
                        const hasPerms = perms.create || perms.read || perms.update || perms.delete;
                        if (!hasPerms) return null;

                        // Count active perms
                        const activeCount = [perms.create, perms.read, perms.update, perms.delete].filter(Boolean).length;

                        return (
                            <span key={module} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200 flex items-center gap-1">
                                {module} <span className="bg-white px-1 rounded-sm text-[10px] font-bold text-blue-600">{activeCount}/4</span>
                            </span>
                        );
                    })}
                    {Object.values(role.permissions || {}).every(p => !p.create && !p.read && !p.update && !p.delete) && (
                        <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleCard;
