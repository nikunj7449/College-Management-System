import React from 'react';
import { 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const StatCard = React.memo(({ title, data, icon: Icon, colorClass, bgGradient }) => (
  <div className={`relative overflow-hidden bg-linear-to-br ${bgGradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-white/20`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/20 rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-semibold px-2.5 py-1 rounded-full ${data.isPositive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
          <span>{data.trend}</span>
          {data.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </div>
      </div>
      <div>
        <h3 className="text-4xl font-bold text-white mb-1">{data.value}</h3>
        <p className="text-white/80 text-sm font-medium">{title}</p>
      </div>
    </div>
  </div>
));

export { StatCard };