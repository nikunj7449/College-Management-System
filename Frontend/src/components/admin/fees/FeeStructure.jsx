import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, Calculator, BookOpen, Layers, List, ChevronRight, AlertCircle, Search, Filter, ArrowRight, Eye, Edit2, X } from 'lucide-react';
import feeService from '../../../services/feeService';
import api from '../../../services/api';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import Pagination from '../../common/core/Pagination';
import { toast } from 'react-toastify';
import CustomDropdown from '../../custom/CustomDropdown';

const FeeStructure = () => {
    const [structures, setStructures] = useState([]);
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6); // 6 items for grid layout (2 rows of 3)

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        courseId: '',
        branchId: '',
        semester: ''
    });

    const [formData, setFormData] = useState({
        courseId: '',
        branchId: '',
        semester: '',
        fees: [{ categoryId: '', amount: '' }]
    });

    const [editId, setEditId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                search: searchTerm
            };
            const [structRes, catRes, courseRes] = await Promise.all([
                api.get('/fees/structures', { params }),
                feeService.getCategories(),
                api.get('/courses')
            ]);
            setStructures(structRes.data.data);
            setCategories(catRes.data.data.filter(c => c.status === 'ACTIVE'));
            setCourses(courseRes.data.data);
        } catch (error) {
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    // Refetch on filter change with debounce for search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchInitialData();
            setCurrentPage(1); // Reset to first page on filter change
        }, searchTerm ? 500 : 0);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters]);

    const handleAddFeeRow = () => {
        setFormData({
            ...formData,
            fees: [...formData.fees, { categoryId: '', amount: '' }]
        });
    };

    const handleRemoveFeeRow = (index) => {
        const newFees = formData.fees.filter((_, i) => i !== index);
        setFormData({ ...formData, fees: newFees });
    };

    const handleFeeChange = (index, field, value) => {
        const newFees = [...formData.fees];
        newFees[index][field] = value;
        setFormData({ ...formData, fees: newFees });
    };

    const calculateTotal = () => {
        return formData.fees.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.courseId || !formData.semester) {
            return toast.error('Course and Semester are required');
        }

        const validFees = formData.fees.filter(f => f.categoryId && f.amount > 0);
        if (validFees.length === 0) {
            return toast.error('At least one valid fee item is required');
        }

        // Duplicate Check
        const categories = validFees.map(f => f.categoryId);
        const hasDuplicates = new Set(categories).size !== categories.length;
        if (hasDuplicates) {
            return toast.error('Duplicate fee categories are not allowed');
        }

        try {
            const payload = {
                courseId: formData.courseId,
                branchId: formData.branchId,
                semester: Number(formData.semester),
                fees: validFees.map(f => ({
                    categoryId: f.categoryId,
                    amount: Number(f.amount)
                }))
            };

            if (editId) {
                await feeService.updateStructure(editId, payload);
                toast.success('Fee structure updated successfully');
            } else {
                await feeService.createStructure(payload);
                toast.success('Fee structure created successfully');
            }

            setIsCreateMode(false);
            setIsViewMode(false);
            setEditId(null);
            setFormData({ courseId: '', branchId: '', semester: '', fees: [{ categoryId: '', amount: '' }] });
            fetchInitialData();
            setCurrentPage(1); // Reset to first page after save
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save structure');
        }
    };

    const handleEdit = (struct) => {
        setEditId(struct._id);
        setIsViewMode(false);
        setFormData({
            courseId: struct.courseId?._id || struct.courseId,
            branchId: struct.branchId,
            semester: struct.semester,
            fees: struct.fees.map(f => ({
                categoryId: f.categoryId?._id || f.categoryId,
                amount: f.amount
            }))
        });
        setIsCreateMode(true);
    };

    const handleView = (struct) => {
        setEditId(struct._id);
        setIsViewMode(true);
        setFormData({
            courseId: struct.courseId?._id || struct.courseId,
            branchId: struct.branchId,
            semester: struct.semester,
            fees: struct.fees.map(f => ({
                categoryId: f.categoryId?._id || f.categoryId,
                amount: f.amount
            }))
        });
        setIsCreateMode(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await feeService.deleteStructure(deleteId);
            toast.success('Fee structure deleted successfully');
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete structure');
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Fee Structure</h1>
                    <p className="text-slate-500 mt-1">Define semester-wise fee templates for various courses</p>
                </div>
                {!isCreateMode && (
                    <button
                        onClick={() => {
                            setEditId(null);
                            setFormData({ courseId: '', branchId: '', semester: '', fees: [{ categoryId: '', amount: '' }] });
                            setIsCreateMode(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 font-medium whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Define New Structure
                    </button>
                )}
            </div>

            {isCreateMode ? (
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{isViewMode ? 'View Fee Structure' : editId ? 'Edit Fee Structure' : 'Define Fee Structure'}</h2>
                                <p className="text-sm text-slate-500">{isViewMode ? 'Viewing fee categories for this course & semester' : 'Configure multiple fees for a specific course & semester'}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsCreateMode(false);
                                    setIsViewMode(false);
                                    setEditId(null);
                                    setFormData({ courseId: '', branchId: '', semester: '', fees: [{ categoryId: '', amount: '' }] });
                                }}
                                className="text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1"
                            >
                                <X size={20} />
                                {isViewMode ? 'Close' : 'Cancel'}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <BookOpen size={16} className="text-indigo-500" />
                                        Select Course
                                    </label>
                                    <select
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value, branchId: '' })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium disabled:opacity-70 disabled:bg-slate-100"
                                        required
                                        disabled={isViewMode}
                                    >
                                        <option value="">Choose a course...</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Layers size={16} className="text-indigo-500" />
                                        Branch
                                    </label>
                                    <select
                                        value={formData.branchId}
                                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium disabled:opacity-70 disabled:bg-slate-100"
                                        required
                                        disabled={!formData.courseId || isViewMode}
                                    >
                                        <option value="">Select Branch...</option>
                                        {courses.find(c => c._id === formData.courseId)?.branches.map((b, idx) => (
                                            <option key={idx} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                        <Layers size={16} className="text-indigo-500" />
                                        Semester
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 1"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-slate-100"
                                        required
                                        disabled={isViewMode}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-slate-800">Fee Breakdown</h3>
                                    {!isViewMode && (
                                        <button
                                            type="button"
                                            onClick={handleAddFeeRow}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"
                                        >
                                            <Plus size={14} />
                                            Add Item
                                        </button>
                                    )}
                                </div>

                                {formData.fees.map((fee, index) => (
                                    <div key={index} className="flex gap-3 items-end group animate-in slide-in-from-right-2 duration-200">
                                        <div className="flex-1">
                                            {index === 0 && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>}
                                            <select
                                                value={fee.categoryId}
                                                onChange={(e) => handleFeeChange(index, 'categoryId', e.target.value)}
                                                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-70 disabled:bg-slate-100 ${fee.categoryId && formData.fees.filter(f => f.categoryId === fee.categoryId).length > 1
                                                        ? 'border-rose-500 text-rose-600 ring-2 ring-rose-500/10'
                                                        : 'border-slate-200 text-slate-700'
                                                    }`}
                                                required
                                                disabled={isViewMode}
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                            {fee.categoryId && formData.fees.filter(f => f.categoryId === fee.categoryId).length > 1 && (
                                                <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1 flex items-center gap-1">
                                                    <AlertCircle size={10} /> Duplicate Category
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-32 md:w-48">
                                            {index === 0 && <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Amount</label>}
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={fee.amount}
                                                    onChange={(e) => handleFeeChange(index, 'amount', e.target.value)}
                                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono disabled:opacity-70 disabled:bg-slate-100"
                                                    required
                                                    disabled={isViewMode}
                                                />
                                            </div>
                                        </div>
                                        {formData.fees.length > 1 && !isViewMode && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFeeRow(index)}
                                                className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/10 rounded-xl text-white">
                                        <Calculator size={24} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Total</p>
                                        <h3 className="text-white text-3xl font-bold font-mono">₹{calculateTotal().toLocaleString()}</h3>
                                    </div>
                                </div>
                                {!isViewMode && (
                                    <button
                                        type="submit"
                                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20 font-bold"
                                    >
                                        <Save size={20} />
                                        {editId ? 'Update Fee Structure' : 'Save Fee Structure'}
                                    </button>
                                )}
                                {isViewMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreateMode(false);
                                            setIsViewMode(false);
                                            setEditId(null);
                                        }}
                                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl transition-all font-bold"
                                    >
                                        Close Details
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filter Toolbar */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[240px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by course or branch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="w-48">
                                <CustomDropdown
                                    placeholder="All Courses"
                                    options={[{ label: 'All Courses', value: '' }, ...courses.map(c => ({ label: c.name, value: c._id }))]}
                                    value={filters.courseId}
                                    onChange={(e) => setFilters({ ...filters, courseId: e.target.value, branchId: '' })}
                                />
                            </div>

                            <div className="w-48">
                                <CustomDropdown
                                    placeholder="All Branches"
                                    options={[
                                        { label: 'All Branches', value: '' },
                                        ...(filters.courseId ? (courses.find(c => c._id === filters.courseId)?.branches.map(b => ({ label: b.name, value: b._id })) || []) : [])
                                    ]}
                                    value={filters.branchId}
                                    onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
                                    disabled={!filters.courseId}
                                />
                            </div>

                            <div className="w-40">
                                <CustomDropdown
                                    placeholder="Semester"
                                    options={[
                                        { label: 'All Semesters', value: '' },
                                        ...Array.from({ length: 8 }, (_, i) => ({ label: `Sem ${i + 1}`, value: String(i + 1) }))
                                    ]}
                                    value={filters.semester}
                                    onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                                />
                            </div>

                            {(searchTerm || filters.courseId || filters.semester) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilters({ courseId: '', branchId: '', semester: '' });
                                    }}
                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 px-2 py-1"
                                >
                                    <X size={14} /> Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {loading ? (
                            <div className="col-span-full text-center py-20 text-slate-400">Loading structures...</div>
                        ) : structures.length === 0 ? (
                            <div className="col-span-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center py-20 text-slate-400">
                                <Layers size={48} className="mb-4 opacity-20" />
                                <p className="font-medium">No fee structures defined yet.</p>
                                <p className="text-sm mt-1">Define templates to start assigning fees to students.</p>
                            </div>
                        ) : (
                            structures.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((struct) => (
                                <div key={struct._id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase">
                                            Sem {struct.semester}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{struct.courseId?.name || 'Unknown Course'}</h3>
                                    <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
                                        {struct.courseId?.branches?.find(b => b._id === struct.branchId)?.name || 'Unknown Branch'}
                                    </p>
                                    <p className="text-slate-500 text-sm mb-6 flex items-center gap-2">
                                        {struct.fees.length} Fee Categories Included
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        {struct.fees.slice(0, 3).map((fee, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-slate-500">{fee.categoryId?.name || 'Category'}</span>
                                                <span className="text-slate-900 font-semibold">₹{fee.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {struct.fees.length > 3 && (
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">+{struct.fees.length - 3} more items</p>
                                        )}
                                    </div>

                                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                                            <h4 className="text-lg font-black text-slate-900 font-mono italic">₹{struct.totalAmount.toLocaleString()}</h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleView(struct)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(struct)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Structure"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(struct._id)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete Structure"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && structures.length > 0 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(structures.length / itemsPerPage)}
                                totalItems={structures.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                deleteRole="Fee Structure"
            />
        </div>
    );
};

export default FeeStructure;
