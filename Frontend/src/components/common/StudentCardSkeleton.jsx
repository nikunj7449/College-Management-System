const StudentCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
    <div className="flex flex-col items-center mb-4">
      <div className="w-20 h-20 rounded-full bg-slate-200 mb-3"></div>
      <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
      <div className="h-4 w-24 bg-slate-200 rounded"></div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-slate-50 p-2 rounded-lg h-16"></div>
      <div className="bg-slate-50 p-2 rounded-lg h-16"></div>
    </div>
    <div className="space-y-2 border-t border-slate-100 pt-4">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded bg-slate-200 mr-2"></div>
        <div className="h-3 w-full bg-slate-200 rounded"></div>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded bg-slate-200 mr-2"></div>
        <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default StudentCardSkeleton;