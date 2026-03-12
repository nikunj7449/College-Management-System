const AdminDashboardSkeleton = () => {
    
    return (
    <div className="flex bg-slate-50 font-sans text-slate-900 min-h-screen">
      <div className="flex-1 flex flex-col relative">
        <div className="p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-pulse">
            
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <div>
                <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-64 bg-slate-200 rounded"></div>
              </div>
              <div className="flex space-x-3">
                <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
                <div className="hidden md:block h-10 w-32 bg-slate-200 rounded-xl"></div>
              </div>
            </div>

            {/* Stats Row Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-32">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 w-full">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      <div className="h-8 w-16 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-12 w-12 bg-slate-200 rounded-xl flex-shrink-0"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts and Activity Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Chart Skeleton */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 w-40 bg-slate-200 rounded"></div>
                  <div className="h-8 w-24 bg-slate-200 rounded"></div>
                </div>
                <div className="h-[300px] bg-slate-100 rounded-xl"></div>
              </div>

              {/* Recent Remarks Skeleton */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
                <div className="h-6 w-32 bg-slate-200 rounded mb-6"></div>
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-slate-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 w-24 bg-slate-200 rounded"></div>
                          <div className="h-3 w-12 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded"></div>
                        <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
};

export default AdminDashboardSkeleton;