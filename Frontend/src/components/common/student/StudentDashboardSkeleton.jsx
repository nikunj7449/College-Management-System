import React from 'react';

const StudentDashboardSkeleton = () => {
  return (
    <div className="flex bg-slate-50 font-sans text-slate-900 min-h-screen">
      <div className="flex-1 flex flex-col relative p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full animate-pulse">
          
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
          </div>

          {/* Stats Row Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-32 flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-xl flex-shrink-0"></div>
                <div className="space-y-3 w-full">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-6 w-12 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px]">
              <div className="h-6 w-40 bg-slate-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                    <div className="h-6 w-12 bg-slate-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[350px]">
              <div className="h-6 w-32 bg-slate-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl">
                    <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                    <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-200 rounded text-right self-end mt-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardSkeleton;
