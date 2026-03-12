const StudentTableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID & Roll</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Info</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200 mr-3"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-3 w-16 bg-slate-200 rounded"></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-6 w-40 bg-slate-200 rounded-full"></div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-slate-200 rounded"></div>
                  <div className="h-3 w-24 bg-slate-200 rounded"></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                  <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
export default StudentTableSkeleton;