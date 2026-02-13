import React from 'react';

const CourseCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        {/* Icon Placeholder */}
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        {/* Actions Placeholder */}
        <div className="flex space-x-1">
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
        </div>
      </div>

      {/* Title & Duration Placeholders */}
      <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>
      <div className="h-5 w-24 bg-slate-200 rounded mb-4"></div>

      {/* Footer Placeholder */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-200 rounded mr-2"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="h-4 w-12 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;