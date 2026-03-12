import React, { useState, useEffect, useContext } from 'react';
import { Search, MessageSquare, Calendar, User, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import remarkService from '../../../services/remarkService';
import { AuthContext } from '../../../context/AuthContext';
import DeleteConfirmationModal from '../../modals/DeleteConfirmModal';

const RemarksManager = () => {
    const { user } = useContext(AuthContext);
    const [remarks, setRemarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [remarkToDelete, setRemarkToDelete] = useState(null);

    const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERADMIN';
    const isStudent = user?.role?.name === 'STUDENT';

    useEffect(() => {
        fetchRemarks();
    }, []);

    const fetchRemarks = async () => {
        try {
            setLoading(true);
            const response = await remarkService.getAllRemarks();
            if (response.success) {
                setRemarks(response.remarks);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch remarks'); 
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (remark) => {
        setRemarkToDelete(remark);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!remarkToDelete) return;
        try {
            const response = await remarkService.deleteRemark(remarkToDelete._id);
            if (response.success) {
                toast.success('Remark deleted successfully');
                fetchRemarks(); // Refresh list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete remark');
        } finally {
            setIsDeleteModalOpen(false);
            setRemarkToDelete(null);
        }
    };

    const filteredRemarks = remarks.filter(r => {
        const query = searchTerm.toLowerCase();
        const stdName = r.student?.name?.toLowerCase() || '';
        const stdId = r.student?.studentId?.toLowerCase() || '';
        const facultyName = r.faculty?.name?.toLowerCase() || '';
        const comment = r.comment?.toLowerCase() || '';

        return stdName.includes(query) || stdId.includes(query) || facultyName.includes(query) || comment.includes(query);
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Remarks List</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {isAdmin ? 'View all faculty remarks across the system.' : isStudent ? 'View remarks issued to you by faculty members.' : 'View remarks you have issued to students.'}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Search Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            placeholder={isAdmin ? "Search by student, faculty, or comment..." : isStudent ? "Search by comment or faculty..." : "Search by student or comment..."}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-3 text-slate-400" size={20} />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                    <th className="p-4 font-semibold">{isStudent ? 'Issued By' : 'Student'}</th>
                                    {isAdmin && <th className="p-4 font-semibold">Faculty</th>}
                                    <th className="p-4 font-semibold">Remark</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    {!isStudent && <th className="p-4 font-semibold text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-slate-500">
                                            <div className="flex justify-center items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading remarks...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredRemarks.length > 0 ? (
                                    filteredRemarks.map((r) => (
                                        <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.student?.name || 'Unknown')}&background=random&size=32`}
                                                        alt=""
                                                        className="w-8 h-8 rounded-full border border-slate-200"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-slate-800">
                                                            {isStudent ? (r.faculty?.name || 'Faculty Member') : (r.student?.name || 'Unknown Student')}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            {isStudent ? (r.faculty?.email || 'Faculty') : (r.student?.rollNum || r.student?.studentId || 'N/A')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <User size={14} className="text-slate-400" />
                                                        <span className="font-medium text-slate-700">{r.faculty?.name || 'Unknown Faculty'}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-0.5 ml-5">{r.faculty?.email}</div>
                                                </td>
                                            )}
                                            <td className="p-4 text-slate-600 max-w-md">
                                                <div className="flex items-start gap-2">
                                                    <MessageSquare size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                                                    <p className="line-clamp-2" title={r.comment}>{r.comment}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {new Date(r.date || r.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs mt-0.5 ml-5">
                                                    {new Date(r.date || r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            {!isStudent && (
                                                <td className="p-4 text-center">
                                                    {(isAdmin || r.faculty?._id === user?.id || r.faculty?.id === user?.id) && (
                                                        <button 
                                                            onClick={() => handleDeleteClick(r)}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Remark"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-slate-500">
                                            No remarks found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Remark"
                message="Are you sure you want to delete this remark? This action cannot be undone."
            />
        </div>
    );
};

export default RemarksManager;
