import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Shield, LayoutGrid, List
} from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../common/Pagination';
import api from '../../services/api';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import AdminCardSkeleton from '../common/AdminCardSkeleton';
import AdminTableSkeleton from '../common/AdminTableSkeleton';
import AdminCard from '../common/AdminCard';
import AdminTableRow from '../common/AdminTableRow';
import AdminModal from '../modals/AdminModal';

const AdminManagement = () => {
  // Data State
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('grid');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // --- Effects ---

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- API Handlers (Mocked for now, replace with actual API calls) ---

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admins');
      setAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (data) => {
    await api.post('/admins', data);
    await fetchAdmins();
    return { success: true };
  };

  const handleUpdateAdmin = async (id, data) => {
    const payload = { ...data };
    if (!payload.password) delete payload.password;
    delete payload.confirmPassword;
    await api.put(`/admins/${id}`, payload);
    await fetchAdmins();
    return { success: true };
  };

  const handleDeleteAdmin = async (id) => {
    await api.delete(`/admins/${id}`);
    await fetchAdmins();
    return { success: true };
  };

  // --- Event Handlers ---

  const handleModalSubmit = async (formData) => {
    try {
      let result;
      if (modalMode === 'create') {
        result = await handleCreateAdmin(formData);
        if (result.success) toast.success('Admin created successfully');
      } else {
        result = await handleUpdateAdmin(selectedAdmin._id, formData);
        if (result.success) toast.success('Admin updated successfully');
      }
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      throw error; // Re-throw to let modal handle loading state if needed
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setModalMode('edit');
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const openViewModal = (admin) => {
    setModalMode('view');
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;
    try {
      await handleDeleteAdmin(selectedAdmin._id);
      toast.success('Admin deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete admin');
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  // --- Filtering & Pagination ---

  const filteredAdmins = admins.filter(admin => 
    (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.adminId && admin.adminId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage system administrators and permissions</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search admins..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'grid' 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewType('table')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'table' 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List size={20} />
            </button>
          </div>

          {/* Add Admin Button */}
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-medium text-sm">Add Admin</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <AdminCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <AdminTableSkeleton />
        )
      ) : filteredAdmins.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-800">No admins found</h3>
          <p className="text-slate-500">Try adjusting your search or add a new admin.</p>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentAdmins.map((admin) => (
            <AdminCard 
              key={admin._id} 
              admin={admin} 
              onEdit={openEditModal} 
              onDelete={openDeleteModal} 
              onView={openViewModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentAdmins.map((admin) => (
                  <AdminTableRow 
                    key={admin._id} 
                    admin={admin} 
                    onEdit={openEditModal} 
                    onDelete={openDeleteModal} 
                    onView={openViewModal} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredAdmins.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAdmins.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <AdminModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          mode={modalMode} 
          admin={selectedAdmin} 
          onSubmit={handleModalSubmit} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          deleteRole={selectedAdmin.role.toLowerCase()}
          />
      )}
    </div>
  );
};

export default AdminManagement;