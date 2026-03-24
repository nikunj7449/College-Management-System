import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import feeService from '../../../services/feeService';
import { toast } from 'react-toastify';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import CustomDropdown from '../../custom/CustomDropdown';

const FeeCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', status: 'ACTIVE' });

    const [editId, setEditId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Lock body scroll when any modal is open
    useEffect(() => {
        if (isModalOpen || isDeleteModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen, isDeleteModalOpen]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await feeService.getCategories();
            setCategories(response.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await feeService.updateCategory(editId, formData);
                toast.success('Category updated successfully');
            } else {
                await feeService.createCategory(formData);
                toast.success('Category created successfully');
            }
            setIsModalOpen(false);
            setEditId(null);
            setFormData({ name: '', description: '', status: 'ACTIVE' });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async () => {
        try {
            await feeService.deleteCategory(deleteId);
            toast.success('Category deleted successfully');
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete category');
        }
    };

    const filteredCategories = categories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || cat.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Fee Categories</h1>
                    <p className="text-slate-500 mt-1">Manage and define dynamic fee types for the institution</p>
                </div>
                <button 
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', description: '', status: 'ACTIVE' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 font-medium whitespace-nowrap"
                >
                    <Plus size={20} />
                    Add New Category
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto relative">
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${statusFilter !== 'ALL' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={18} />
                        {statusFilter === 'ALL' ? 'Filter' : statusFilter === 'ACTIVE' ? 'Status: Active' : 'Status: Inactive'}
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-10 animate-in fade-in zoom-in-95 duration-200">
                            {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setIsFilterOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === status ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {status === 'ALL' ? 'All Categories' : status === 'ACTIVE' ? 'Active Only' : 'Inactive Only'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Category Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Created By</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">Loading categories...</td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400">No categories found matching your search.</td>
                                </tr>
                            ) : filteredCategories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{cat.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-500 text-sm max-w-xs truncate">{cat.description || 'No description'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {cat.status === 'ACTIVE' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <CheckCircle size={12} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                                    <XCircle size={12} />
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 font-medium">{cat.createdBy?.name || 'Unknown'}</div>
                                        <div className="text-[11px] text-slate-400 uppercase font-bold tracking-tighter">
                                            {new Date(cat.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => {
                                                setFormData({ name: cat.name, description: cat.description || '', status: cat.status });
                                                setEditId(cat._id);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setDeleteId(cat._id);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all ml-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editId ? 'Edit Fee Category' : 'Add Fee Category'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {editId ? 'Modify existing type of fee category' : 'Create a new type of fee category'}
                            </p>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category Name</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Tuition Fee"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (Optional)</label>
                                <textarea 
                                    rows="3"
                                    placeholder="Brief details about the fee..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Initial Status</label>
                                <CustomDropdown
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    placeholder="Select Status"
                                    options={[
                                        { label: 'Active', value: 'ACTIVE' },
                                        { label: 'Inactive', value: 'INACTIVE' }
                                    ]}
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    {editId ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                deleteRole="Fee Category"
            />
        </div>
    );
};

export default FeeCategories;
