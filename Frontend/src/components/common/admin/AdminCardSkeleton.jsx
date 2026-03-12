import React from 'react';

const AdminCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
    <div className="flex flex-col items-center mb-4">
      <div className="w-20 h-20 rounded-full bg-slate-200 mb-3"></div>
      <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
      <div className="h-4 w-20 bg-slate-200 rounded"></div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-slate-50 p-2 rounded-lg h-14"></div>
      <div className="bg-slate-50 p-2 rounded-lg h-14"></div>
    </div>
    <div className="space-y-2 border-t border-slate-100 pt-4">
      <div className="h-4 w-full bg-slate-200 rounded"></div>
      <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
    </div>
  </div>
);

export default AdminCardSkeleton;