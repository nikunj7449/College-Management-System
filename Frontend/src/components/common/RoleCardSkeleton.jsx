import React from 'react';

const RoleCardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse relative">
        {/* Top Right Action Skeleton */}
        <div className="absolute top-4 right-4 w-16 h-8 bg-slate-100 rounded-lg"></div>

        {/* Center Profile/Icon */}
        <div className="flex flex-col items-center mb-4 mt-2">
            <div className="w-16 h-16 rounded-full bg-slate-200 mb-3 border-4 border-white shadow-sm"></div>
            <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-24 bg-slate-200 rounded-full"></div>
        </div>

        {/* Description Block */}
        <div className="bg-slate-50 rounded-xl mb-4 h-[60px] p-3 flex flex-col justify-center items-center gap-2">
            <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
            <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
        </div>

        {/* Modules Configuration */}
        <div className="border-t border-slate-100 pt-4">
            <div className="h-3 w-32 bg-slate-200 rounded mb-3"></div>
            <div className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-slate-200 rounded border border-slate-100"></div>
                <div className="h-6 w-24 bg-slate-200 rounded border border-slate-100"></div>
                <div className="h-6 w-16 bg-slate-200 rounded border border-slate-100"></div>
            </div>
        </div>
    </div>
);

export default RoleCardSkeleton;
