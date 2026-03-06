import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Box } from 'lucide-react';

const ModuleCard = ({ mod, onEdit, onDelete }) => {
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
                        onClick={() => onEdit(mod)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 bg-white rounded-lg transition-colors"
                        title="Edit Module"
                    >
                        <Edit2 size={16} />
                    </button>
                    {!mod.isSystem && onDelete && (
                        <button
                            onClick={() => onDelete(mod._id, mod.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 bg-white rounded-lg transition-colors"
                            title="Delete Module"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Center Profile/Icon */}
            <div className="flex flex-col items-center text-center mb-4 mt-2">
                <div className="w-16 h-16 rounded-full bg-slate-50 text-blue-600 flex items-center justify-center mb-3 border-4 border-white shadow-sm">
                    <Box size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{mod.name}</h3>
                {mod.isSystem ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                        CORE SYSTEM
                    </span>
                ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        CUSTOM MODULE
                    </span>
                )}
            </div>

            {/* Description Block */}
            <div className="text-center p-3 bg-slate-50 rounded-xl flex items-center justify-center h-[60px]">
                <p className="text-sm text-slate-600 line-clamp-2">
                    {mod.description || 'No description provided.'}
                </p>
            </div>
        </div>
    );
};

export default ModuleCard;
