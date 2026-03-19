import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContext';
import performanceService from '../../../services/performanceService';
import api from '../../../services/api';
import PerformanceFormModal from './PerformanceFormModal';
import PerformanceViewModal from './PerformanceViewModal';
import { useFacultyOperations } from '../../../hooks/faculty/useFacultyOperations';
import { hasPermission } from '../../../utils/permissionUtils';

const FacultyPerformance = () => {
    const { user } = useContext(AuthContext);
    const [performances, setPerformances] = useState([]);

    // Fetch filtered students and faculty profile via custom hook
    const { students, facultyProfile } = useFacultyOperations();

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals state
    const [formModal, setFormModal] = useState({ isOpen: false, data: null, isEdit: false });
    const [viewModal, setViewModal] = useState({ isOpen: false, data: null });

    const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPERADMIN';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch performances
            const perfResponse = await performanceService.getAllPerformance();
            if (perfResponse.success) {
                setPerformances(perfResponse.records);
            }
            // Students are now fetched automatically by useFacultyOperations
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormModal({ isOpen: true, data: null, isEdit: false });
    };

    const handleEdit = (perf) => {
        setFormModal({ isOpen: true, data: perf, isEdit: true });
    };

    const handleView = (perf) => {
        setViewModal({ isOpen: true, data: perf });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this performance record?')) {
            try {
                const response = await performanceService.deletePerformance(id);
                if (response.success) {
                    toast.success('Performance deleted successfully');
                    setPerformances(performances.filter(p => p._id !== id));
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting performance');
            }
        }
    };

    const onFormSave = async (savedData) => {
        if (formModal.isEdit) {
            setPerformances(performances.map(p => p._id === savedData._id ? savedData : p));
        } else {
            setPerformances([savedData, ...performances]);
        }
        setFormModal({ isOpen: false, data: null, isEdit: false });
    };

    const filteredPerformances = performances.filter(perf => {
        const query = searchTerm.toLowerCase();
        const stdName = perf.student?.name || `${perf.student?.firstName || ''} ${perf.student?.lastName || ''}`.trim() || 'Unknown';
        return (
            stdName.toLowerCase().includes(query) ||
            perf.exam?.name?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Student Performance</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and evaluate student academic performance.</p>
                </div>

                <div className="flex w-full md:w-auto gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search student or exam..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {hasPermission(user, 'PERFORMANCE', 'create') && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Performance</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                                {isAdmin && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</th>}
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects Count</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider max-w-[200px]">Feedback</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                        Loading performance data...
                                    </td>
                                </tr>
                            ) : filteredPerformances.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? "8" : "7"} className="px-6 py-8 text-center text-slate-500">
                                        No performance records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPerformances.map((perf) => (
                                    <tr key={perf._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-800">
                                                {perf.student?.name || `${perf.student?.firstName || ''} ${perf.student?.lastName || ''}`.trim() || 'Unknown Student'}
                                            </div>
                                            <div className="text-xs text-slate-500">{perf.student?.rollNum || perf.student?.rollNo || perf.student?.studentId || 'N/A'}</div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-800">{perf.faculty?.name || 'N/A'}</div>
                                                <div className="text-xs text-slate-500">{perf.faculty?.email}</div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">{perf.exam?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{perf.subjects?.length || 0}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${perf.grade === 'A' ? 'bg-green-100 text-green-700' :
                                                perf.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                    perf.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                                        perf.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-red-100 text-red-700'
                                                }`}>
                                                {perf.grade || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={perf.feedback}>
                                            {perf.feedback || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(perf.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleView(perf)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                                                    <Eye size={18} />
                                                </button>
                                                {hasPermission(user, 'PERFORMANCE', 'update') && (
                                                    <button onClick={() => handleEdit(perf)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit Record">
                                                        <Edit size={18} />
                                                    </button>
                                                )}
                                                {hasPermission(user, 'PERFORMANCE', 'delete') && (
                                                    <button onClick={() => handleDelete(perf._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors" title="Delete Record">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {formModal.isOpen && (
                <PerformanceFormModal
                    isOpen={formModal.isOpen}
                    onClose={() => setFormModal({ isOpen: false, data: null, isEdit: false })}
                    initialData={formModal.data}
                    isEdit={formModal.isEdit}
                    students={students}
                    facultyProfile={facultyProfile}
                    onSave={onFormSave}
                />
            )}

            {viewModal.isOpen && (
                <PerformanceViewModal
                    isOpen={viewModal.isOpen}
                    onClose={() => setViewModal({ isOpen: false, data: null })}
                    data={viewModal.data}
                />
            )}
        </div>
    );
};

export default FacultyPerformance;
