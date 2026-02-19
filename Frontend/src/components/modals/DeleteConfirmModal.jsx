import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, deleteRole }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
          Confirm Delete
        </h3>
        <p className="text-slate-500 text-center mb-6">
          {`Are you sure you want to delete this ${deleteRole}? This action cannot be undone and will remove all associated data.`}
        </p>
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            {`Delete ${deleteRole}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;