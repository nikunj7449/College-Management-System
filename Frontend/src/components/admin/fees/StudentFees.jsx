import React, { useState, useEffect } from 'react';
import { Search, UserPlus, FileText, CreditCard, PlusCircle, AlertCircle, CheckCircle, Clock, Layers } from 'lucide-react';
import feeService from '../../../services/feeService';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import CustomDropdown from '../../custom/CustomDropdown';
import FeePaymentModal from './sub-components/FeePaymentModal';
import ExtraFeeModal from './sub-components/ExtraFeeModal';
import StudentFeeDetailModal from './sub-components/StudentFeeDetailModal';
import FeeAssignmentMatrixModal from './sub-components/FeeAssignmentMatrixModal';
import Pagination from '../../common/core/Pagination';
import { Bell } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import FeeReminderModal from './sub-components/FeeReminderModal';

const StudentFees = () => {
    const [studentFees, setStudentFees] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter States
    const [courseFilter, setCourseFilter] = useState('ALL');
    const [branchFilter, setBranchFilter] = useState('ALL');
    const [semesterFilter, setSemesterFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Assignment Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [courses, setCourses] = useState([]);
    const [assignData, setAssignData] = useState({ courseId: '', branchId: '', structureId: '' });
    
    // Payment/Extra Modal State
    const [selectedFee, setSelectedFee] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [sendingReminders, setSendingReminders] = useState(false);
    
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchData();
    }, []);

    // Reset pagination to first page when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, courseFilter, branchFilter, semesterFilter, statusFilter]);

    useEffect(() => {
        setBranchFilter('ALL');
    }, [courseFilter]);

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (isAssignModalOpen || isPaymentModalOpen || isExtraModalOpen || isDetailModalOpen || isMatrixModalOpen || isReminderModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isAssignModalOpen, isPaymentModalOpen, isExtraModalOpen, isDetailModalOpen, isMatrixModalOpen, isReminderModalOpen]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reportRes, courseRes, structRes] = await Promise.all([
                feeService.getFeeReports(),
                api.get('/courses'),
                feeService.getStructures()
            ]);
            setStudentFees(reportRes.data.data);
            setCourses(courseRes.data.data);
            setStructures(structRes.data.data);
        } catch (error) {
            toast.error('Failed to load fee data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignFee = async (e) => {
        e.preventDefault();
        try {
            const response = await feeService.assignFee(assignData);
            toast.success(response.data.message || 'Fees assigned successfully');
            setIsAssignModalOpen(false);
            setAssignData({ courseId: '', branchId: '', structureId: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to assign fee');
        }
    };

    const handleSendReminders = async () => {
        const pendingCount = studentFees.filter(f => f.pendingAmount > 0).length;
        
        if (pendingCount === 0) {
            toast.info("No students with pending fees found.");
            return;
        }

        setIsReminderModalOpen(true);
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'PARTIAL': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-rose-50 text-rose-700 border-rose-100';
        }
    };

    const filteredFees = studentFees.filter(record => {
        const matchesSearch = record.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            record.student?.rollNum.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCourse = courseFilter === 'ALL' || record.student?.course === courseFilter;
        const matchesBranch = branchFilter === 'ALL' || record.student?.branch === branchFilter;
        const matchesSemester = semesterFilter === 'ALL' || record.semester.toString() === semesterFilter;
        const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;

        return matchesSearch && matchesCourse && matchesBranch && matchesSemester && matchesStatus;
    });

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Student Fees</h1>
                    <p className="text-slate-500 mt-1">Monitor payments, assign structures, and manage student accounts</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {user?.role?.name === 'SUPERADMIN' && (
                        <button 
                            onClick={handleSendReminders}
                            disabled={sendingReminders}
                            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-100 font-medium whitespace-nowrap"
                        >
                            <Bell size={20} />
                            {sendingReminders ? 'Opening...' : 'Reminder'}
                        </button>
                    )}
                    <button 
                        onClick={() => setIsMatrixModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium whitespace-nowrap"
                    >
                        <Layers size={20} className="text-indigo-500" />
                        Assignment Matrix
                    </button>
                    <button 
                        onClick={() => setIsAssignModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 font-medium whitespace-nowrap"
                    >
                        <UserPlus size={20} />
                        Assign Fee to Student
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 font-medium"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Course</label>
                        <CustomDropdown
                            options={['ALL', ...courses.map(c => c.name)]}
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            placeholder="ALL Courses"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Branch</label>
                        <CustomDropdown
                            options={['ALL', ...(courses.find(c => c.name === courseFilter)?.branches.map(b => b.name) || [])]}
                            value={branchFilter}
                            disabled={courseFilter === 'ALL'}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            placeholder="ALL Branches"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Semester</label>
                        <CustomDropdown
                            options={['ALL', '1', '2', '3', '4', '5', '6', '7', '8']}
                            value={semesterFilter}
                            onChange={(e) => setSemesterFilter(e.target.value)}
                            placeholder="ALL Semesters"
                            renderLabel={(opt) => opt === 'ALL' ? 'ALL Semesters' : `Sem ${opt}`}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Status</label>
                        <CustomDropdown
                            options={['ALL', 'PAID', 'PARTIAL', 'UNPAID']}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            placeholder="ALL Status"
                        />
                    </div>
                </div>
            </div>

            {/* Fees Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Semester</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fee Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Total Obligation</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Amount Pending</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">Loading records...</td></tr>
                            ) : filteredFees.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-lg">No fee records found.</td></tr>
                            ) : filteredFees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((record) => (
                                <tr key={record._id} className="hover:bg-slate-50/30 transition-all duration-200">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{record.student?.name}</div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{record.student?.rollNum}</span>
                                            <span>•</span>
                                            <span>{record.student?.course}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-700">Sem {record.semester}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusStyle(record.status)}`}>
                                            {record.status === 'PAID' && <CheckCircle size={12} />}
                                            {record.status === 'PARTIAL' && <Clock size={12} />}
                                            {record.status === 'UNPAID' && <AlertCircle size={12} />}
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">₹{record.totalFee.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-mono font-bold text-rose-600 italic">₹{record.pendingAmount.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Paid: ₹{record.paidAmount.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-slate-400">
                                            <button 
                                                onClick={() => { setSelectedFee(record); setIsPaymentModalOpen(true); }}
                                                className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                                                title="Record Payment"
                                            >
                                                <CreditCard size={18} />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedFee(record); setIsExtraModalOpen(true); }}
                                                className="p-2 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all" 
                                                title="Add Extra Fee"
                                            >
                                                <PlusCircle size={18} />
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedFee(record); setIsDetailModalOpen(true); }}
                                                className="p-2 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" 
                                                title="View Details"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && filteredFees.length > itemsPerPage && (
                <div className="mt-6">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredFees.length / itemsPerPage)}
                        totalItems={filteredFees.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Assign Fee Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">Assign Fee Structure</h2>
                            <p className="text-sm text-slate-500">Link a student to a defined fee template</p>
                        </div>
                        <form onSubmit={handleAssignFee} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Course</label>
                                <CustomDropdown
                                    value={assignData.courseId}
                                    onChange={(e) => setAssignData({ ...assignData, courseId: e.target.value, branchId: '', structureId: '' })}
                                    options={courses.map(c => ({ label: c.name, value: c._id }))}
                                    placeholder="Choose Course..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Branch</label>
                                <CustomDropdown
                                    disabled={!assignData.courseId}
                                    value={assignData.branchId}
                                    onChange={(e) => setAssignData({ ...assignData, branchId: e.target.value, structureId: '' })}
                                    options={courses.find(c => c._id === assignData.courseId)?.branches.map(b => ({ label: b.name, value: b._id })) || []}
                                    placeholder="Choose Branch..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Fee Structure</label>
                                <CustomDropdown
                                    disabled={!assignData.branchId}
                                    value={assignData.structureId}
                                    onChange={(e) => setAssignData({ ...assignData, structureId: e.target.value })}
                                    options={structures
                                        .filter(s => s.courseId?._id === assignData.courseId && s.branchId === assignData.branchId)
                                        .map(st => ({ label: `Sem ${st.semester} (₹${st.totalAmount})`, value: st._id }))
                                    }
                                    placeholder="Select Structure..."
                                />
                                {assignData.branchId && structures.filter(s => s.courseId?._id === assignData.courseId && s.branchId === assignData.branchId).length === 0 && (
                                    <p className="text-xs text-rose-500 mt-1">No structures found for this selection.</p>
                                )}
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 italic">Run Bulk Assignment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <FeePaymentModal 
                    isOpen={isPaymentModalOpen} 
                    onClose={() => setIsPaymentModalOpen(false)} 
                    feeRecord={selectedFee}
                    onSuccess={fetchData} 
                />
            )}

            {/* Extra Fee Modal */}
            {isExtraModalOpen && (
                <ExtraFeeModal 
                    isOpen={isExtraModalOpen} 
                    onClose={() => setIsExtraModalOpen(false)} 
                    feeRecord={selectedFee}
                    onSuccess={fetchData} 
                />
            )}

            {/* View Detail Modal */}
            {isDetailModalOpen && (
                <StudentFeeDetailModal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    feeRecord={selectedFee} 
                />
            )}

            {/* Assignment Matrix Modal */}
            {isMatrixModalOpen && (
                <FeeAssignmentMatrixModal 
                    isOpen={isMatrixModalOpen}
                    onClose={() => setIsMatrixModalOpen(false)}
                    courses={courses}
                    structures={structures}
                />
            )}

            {/* Fee Reminder Modal */}
            {isReminderModalOpen && (
                <FeeReminderModal 
                    isOpen={isReminderModalOpen}
                    onClose={() => setIsReminderModalOpen(false)}
                    pendingFees={studentFees.filter(f => f.pendingAmount > 0)}
                    courses={courses}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
};

export default StudentFees;
