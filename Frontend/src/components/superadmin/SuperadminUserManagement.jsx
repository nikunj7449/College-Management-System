import React from 'react';
import { Users } from 'lucide-react';
import AllUsersList from './AllUsersList';

const SuperadminUserManagement = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                    <Users size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage system administrators, teaching staff, and their access</p>
                </div>
            </div>

            {/* Unified User List */}
            <div className="animate-in fade-in duration-300">
                <AllUsersList />
            </div>
        </div>
    );
};

export default SuperadminUserManagement;
