import React from 'react';
import { Power } from 'lucide-react';

const StatusToggleModal = ({ isOpen, student, onClose, onConfirm }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
          student.isActive ? 'bg-orange-100' : 'bg-green-100'
        }`}>
          <Power className={student.isActive ? 'text-orange-600' : 'text-green-600'} size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
          {student.isActive ? 'Deactivate Student' : 'Activate Student'}
        </h3>
        <p className="text-slate-500 text-center mb-6">
          Are you sure you want to {student.isActive ? 'deactivate' : 'activate'}{' '}
          <strong>{student.name}</strong>?
          {student.isActive 
            ? ' They will not be able to access the system.' 
            : ' They will regain access to the system.'}
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
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors shadow-lg ${
              student.isActive 
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' 
                : 'bg-green-600 hover:bg-green-700 shadow-green-200'
            }`}
          >
            {student.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusToggleModal;