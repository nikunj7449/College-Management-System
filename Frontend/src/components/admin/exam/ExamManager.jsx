import React, { useState, useEffect, useContext } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContext';
import { hasPermission } from '../../../utils/permissionUtils';
import examService from '../../../services/examService';
import ExamFormModal from '../../common/exam/ExamFormModal';
import ExamDetailModal from '../../common/exam/ExamDetailModal';
import DeleteConfirmationModal from '../../modals/DeleteConfirmModal';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

const ExamManager = () => {
    const { user } = useContext(AuthContext);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentExam, setCurrentExam] = useState(null);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await examService.getExams();
            if (response.success) {
                setExams(response.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleAdd = () => {
        setCurrentExam(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (exam) => {
        setCurrentExam(exam);
        setIsFormModalOpen(true);
    };

    const handleView = (exam) => {
        setCurrentExam(exam);
        setIsDetailModalOpen(true);
    };

    const handleDeleteClick = (exam) => {
        setCurrentExam(exam);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await examService.deleteExam(currentExam._id);
            if (response.success) {
                toast.success('Exam deleted successfully');
                setExams(exams.filter(e => e._id !== currentExam._id));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete exam');
        } finally {
            setIsDeleteModalOpen(false);
            setCurrentExam(null);
        }
    };

    const handleSave = (savedExam) => {
        if (currentExam) {
            setExams(exams.map(e => e._id === savedExam._id ? savedExam : e));
        } else {
            setExams([savedExam, ...exams]);
        }
        setIsFormModalOpen(false);
    };

    const filteredExams = exams.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Ongoing': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Exam Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and view all customized exams</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            placeholder="Search exams by name or type..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-3 text-slate-400" size={20} />
                    </div>

                    {hasPermission(user, 'EXAM', 'create') && (
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium w-full sm:w-auto justify-center"
                        >
                            <Plus size={20} />
                            Create New Exam
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                    <th className="p-4 font-semibold">Exam Name</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-center w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
                                            <div className="flex justify-center items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading exams...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredExams.length > 0 ? (
                                    filteredExams.map((exam) => (
                                        <tr key={exam._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-800">{exam.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{exam.description || 'No description'}</div>
                                            </td>
                                            <td className="p-4 text-slate-600">{formatDate(exam.date)}</td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg whitespace-nowrap border border-slate-200 text-xs font-medium">
                                                    {exam.type}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyle(exam.status)}`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => handleView(exam)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                                                        <Eye size={16} />
                                                    </button>
                                                    {hasPermission(user, 'EXAM', 'update') && (
                                                        <button onClick={() => handleEdit(exam)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    {hasPermission(user, 'EXAM', 'delete') && (
                                                        <button onClick={() => handleDeleteClick(exam)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-500">
                                            No exams found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isFormModalOpen && (
                    <ExamFormModal
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        exam={currentExam}
                        onSave={handleSave}
                    />
                )}

                <ExamDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => { setIsDetailModalOpen(false); setCurrentExam(null); }}
                    exam={currentExam}
                />

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    itemName={currentExam?.name || 'this exam'}
                />
            </div>
        </div>
    );
};

export default ExamManager;
