import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Shield, LayoutGrid, List
} from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../common/core/Pagination';
import api from '../../services/api';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import AdminCardSkeleton from '../common/admin/AdminCardSkeleton';
import AdminTableSkeleton from '../common/admin/AdminTableSkeleton';
import AdminCard from '../common/admin/AdminCard';
import AdminTableRow from '../common/admin/AdminTableRow';
import AdminModal from '../modals/AdminModal';
import OtherUserModal from '../modals/OtherUserModal';

const AdminManagement = ({ hideHeader = false }) => {
  // Data State
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL Roles');
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const [viewType, setViewType] = useState('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddUserDropdownOpen, setIsAddUserDropdownOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [initialRole, setInitialRole] = useState(null);

  // --- Effects ---

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isModalOpen || isOtherModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isOtherModalOpen, isDeleteModalOpen]);

  // --- API Handlers (Mocked for now, replace with actual API calls) ---

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const [adminRes, otherRes] = await Promise.all([
        api.get('/admins'),
        api.get('/other-users')
      ]);
      
      const merged = [...adminRes.data.data, ...otherRes.data.data].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAdmins(merged);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
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

  const handleDeleteAdmin = async (id, role) => {
    const isSystem = ['ADMIN', 'SUPERADMIN'].includes(role.toUpperCase());
    const endpoint = isSystem ? `/admins/${id}` : `/other-users/${id}`;
    await api.delete(endpoint);
    await fetchAdmins();
    return { success: true };
  };

  // --- Event Handlers ---

  const handleModalSubmit = async (formData) => {
    try {
      let result;
      if (modalMode === 'create') {
        result = await api.post('/admins', formData);
        if (result.data.success) toast.success('Admin created successfully');
      } else {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        delete payload.confirmPassword;
        result = await api.put(`/admins/${selectedAdmin._id}`, payload);
        if (result.data.success) toast.success('Admin updated successfully');
      }
      await fetchAdmins();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      throw error;
    }
  };

  const handleOtherModalSubmit = async (formData) => {
    try {
      let result;
      if (modalMode === 'create') {
        result = await api.post('/other-users', formData);
        if (result.data.success) toast.success('Other user created successfully');
      } else {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        delete payload.confirmPassword;
        result = await api.put(`/other-users/${selectedAdmin._id}`, payload);
        if (result.data.success) toast.success('Other user updated successfully');
      }
      await fetchAdmins();
      closeOtherModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      throw error;
    }
  };

  const openCreateModal = (role = null) => {
    setModalMode('create');
    setInitialRole(role);
    if (role === 'OTHER') {
      setIsOtherModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const openEditModal = (admin) => {
    setModalMode('edit');
    setSelectedAdmin(admin);
    const isSystem = ['ADMIN', 'SUPERADMIN'].includes(admin.role.toUpperCase());
    if (isSystem) {
      setIsModalOpen(true);
    } else {
      setIsOtherModalOpen(true);
    }
  };

  const openViewModal = (admin) => {
    setModalMode('view');
    setSelectedAdmin(admin);
    const isSystem = ['ADMIN', 'SUPERADMIN'].includes(admin.role.toUpperCase());
    if (isSystem) {
      setIsModalOpen(true);
    } else {
      setIsOtherModalOpen(true);
    }
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAdmin) return;
    try {
      await handleDeleteAdmin(selectedAdmin._id, selectedAdmin.role);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const closeOtherModal = () => {
    setIsOtherModalOpen(false);
    setSelectedAdmin(null);
  };

  // --- Filtering & Pagination ---

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (admin.adminId && admin.adminId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL Roles' || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      {!hideHeader && (
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
                className={`p-2 rounded-lg transition-all ${viewType === 'grid'
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`p-2 rounded-lg transition-all ${viewType === 'table'
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="Table View"
              >
                <List size={20} />
              </button>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${roleFilter !== 'ALL Roles' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Shield size={18} />
                {roleFilter === 'ALL Roles' ? 'ALL Roles' : roleFilter}
              </button>

              {isRoleFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => { setRoleFilter('ALL Roles'); setIsRoleFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${roleFilter === 'ALL Roles' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    ALL Roles
                  </button>
                  {['SUPERADMIN', 'ADMIN'].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setRoleFilter(role);
                        setIsRoleFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-all ${roleFilter === role ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {role === 'ADMIN' ? 'Administrators' : 'Super Admins'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAddUserDropdownOpen(!isAddUserDropdownOpen)}
                className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Plus size={20} className="mr-2" />
                <span className="font-medium text-sm">Add User</span>
              </button>

              {isAddUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                      openCreateModal('ADMIN');
                      setIsAddUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                      <Shield size={16} />
                    </div>
                    Admin User
                  </button>
                  <button
                    onClick={() => {
                      openCreateModal('FACULTY'); 
                      setIsAddUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <List size={16} />
                    </div>
                    Faculty User
                  </button>
                  <button
                    onClick={() => {
                      openCreateModal('OTHER'); // Or null to let user choose
                      setIsAddUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                      <Plus size={16} />
                    </div>
                    Other User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="flex w-full justify-between items-center mb-6 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search admins..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`p-2 rounded-lg transition-all ${viewType === 'table'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
                title="Table View"
              >
                <List size={20} />
              </button>
            </div>

            {/* Add User Dropdown (Synchronized with AllUsersList) */}
            <div className="relative">
              <button
                onClick={() => setIsAddUserDropdownOpen(!isAddUserDropdownOpen)}
                className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus size={20} className="mr-2" />
                <span className="font-medium text-sm">Add User</span>
              </button>

              {isAddUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                      openCreateModal('ADMIN');
                      setIsAddUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                      <Shield size={16} />
                    </div>
                    Admin User
                  </button>
                  <button
                    onClick={() => {
                      openCreateModal('FACULTY'); 
                      setIsAddUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                      <List size={16} />
                    </div>
                    Faculty User
                  </button>
                  <button
                    onClick={() => {
                      openCreateModal('OTHER');
                      setIsAddUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center gap-3"
                  >
                    <div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
                      <Plus size={16} />
                    </div>
                    Other User
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          initialRole={initialRole}
          mode={modalMode}
          admin={selectedAdmin}
          onSubmit={handleModalSubmit}
        />
      )}

      {isOtherModalOpen && (
        <OtherUserModal
          isOpen={isOtherModalOpen}
          onClose={closeOtherModal}
          initialRole={initialRole}
          mode={modalMode}
          user={selectedAdmin}
          onSubmit={handleOtherModalSubmit}
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