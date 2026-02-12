import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const AttendanceChart = ({ data, filter, setFilter }) => {
  return (
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Weekly Attendance</h3>
                    <p className="text-sm text-slate-500 mt-1">Student presence tracking</p>
                  </div>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2 outline-none hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    <option>This Week</option>
                    <option>Last Week</option>
                  </select>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%" debounce={300}>
                    <BarChart data={data.attendanceData} barSize={50}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#cbd5e1" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 13 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '12px', 
                          border: '1px solid #e2e8f0', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                        }}
                        itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                        cursor={{ fill: '#f8fafc', radius: 8 }}
                      />
                      <Legend 
                        iconType="circle" 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconSize={10}
                      />
                      <Bar 
                        dataKey="present" 
                        fill="url(#colorPresent)" 
                        radius={[8, 8, 0, 0]} 
                        name="Present"
                      />
                      <Bar 
                        dataKey="absent" 
                        fill="url(#colorAbsent)" 
                        radius={[8, 8, 0, 0]} 
                        name="Absent"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
  );
};

export default AttendanceChart;