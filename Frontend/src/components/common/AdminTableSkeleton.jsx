import React from 'react';

const AdminTableSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-200 mr-3"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-40 bg-slate-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-slate-200 rounded"></div>
                    <div className="h-8 w-8 bg-slate-200 rounded"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTableSkeleton;