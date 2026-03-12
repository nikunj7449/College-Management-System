import React from 'react';

const EventCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse flex flex-col h-full">
      
      {/* Date Badge & Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-slate-200 rounded-xl w-14 h-14 min-w-14"></div>
        <div className="flex-1 pr-8">
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 mb-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-full"></div>
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
        <div className="h-3 bg-slate-200 rounded w-16"></div>
        <div className="h-5 bg-slate-200 rounded w-12"></div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
