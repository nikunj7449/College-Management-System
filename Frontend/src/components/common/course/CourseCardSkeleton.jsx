import React from 'react';

const CourseCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse relative flex flex-col h-full overflow-hidden">

      {/* Absolute Header Action Menu Placeholder */}
      <div className="absolute top-3 right-3 z-10 flex">
        <div className="w-[30px] h-[30px] bg-slate-200 rounded-full" />
      </div>

      <div className="flex justify-between items-start mb-4">
        {/* Course Main Icon Placeholder */}
        <div className="p-3 bg-slate-100 rounded-xl w-12 h-12"></div>
      </div>

      {/* Course Title Placeholder */}
      <div className="h-6 w-3/4 bg-slate-200 rounded mb-2"></div>

      {/* Course Duration Pill Placeholder */}
      <div className="bg-slate-100 w-24 h-[22px] rounded-md mb-3 flex items-center px-2 py-1">
        <div className="w-3.5 h-3.5 bg-slate-200 rounded-full mr-1.5 flex-shrink-0" />
        <div className="h-2 w-12 bg-slate-200 rounded" />
      </div>

      {/* Footer / Branch Placeholder */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-slate-200 rounded mr-2 shrink-0"></div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="h-4 w-12 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;