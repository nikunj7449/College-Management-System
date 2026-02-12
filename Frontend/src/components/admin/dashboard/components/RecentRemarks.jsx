import { MessageSquare } from 'lucide-react';

const RecentRemarks = ({ recentRemarks = [] }) => {
    return(
        <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Recent Remarks</h3>
                    <p className="text-sm text-slate-500 mt-1">Faculty feedback for students</p>
                  </div>
                </div>
                <div className="space-y-5">
                    
                  {recentRemarks.map((remark, index) => (
                    <div key={remark.id} className="flex space-x-4 relative">
                      
                      {index !==recentRemarks.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-linear-to-b from-slate-200 to-transparent"></div>
                      )}
                      
                      <div className="relative z-10">
                        <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shadow-sm">
                          <MessageSquare size={18} />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm text-slate-800 leading-relaxed">
                          <span className="font-semibold">{remark.faculty}</span>
                          <span className="text-slate-500 mx-1">for</span>
                          <span className="font-medium text-slate-700">{remark.student}</span>
                        </p>
                        <p className="text-sm text-slate-600 mt-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 italic">
                          "{remark.remark}"
                        </p>
                        <div className="text-xs text-slate-400 mt-2 flex items-center">
                          <div className="w-1 h-1 bg-slate-400 rounded-full mr-2"></div>
                          {remark.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2.5 text-center text-indigo-600 hover:text-indigo-700 font-medium text-sm border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all">
                  View All Remarks
                </button>
              </div>
              </>
    )
}
export default RecentRemarks;