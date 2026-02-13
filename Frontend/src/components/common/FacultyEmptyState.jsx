import React from 'react';
import { User } from 'lucide-react';

const FacultyEmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="text-slate-400" size={32} />
      </div>
      <h3 className="text-lg font-medium text-slate-800">No faculty found</h3>
      <p className="text-slate-500">Add a new faculty member to get started.</p>
    </div>
  );
};

export default FacultyEmptyState;