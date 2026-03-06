import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Filter, Mail, Phone, Calendar, Shield, Edit2, Eye, Loader2, Trash2, Power, UserPlus, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../common/Pagination';
import api from '../../services/api';
import CustomDropdown from '../custom/CustomDropdown';
import AdminModal from '../modals/AdminModal';
import FacultyFormModal from '../modals/FacultyFormModal';
import { useFacultyOperations, MODAL_TYPE } from '../../hooks/admin/useFacultyOperations';
import {
    FACULTY_DESIGNATIONS,
    getCourseOptions,
    getBranchOptions,
    getSemOptions,
    getSubjectOptions,
} from '../../utils/adminUtils/courseUtils';
import { useRoles } from '../../hooks/useRoles';
import { hasPermission } from '../../utils/permissionUtils';
import { AuthContext } from '../../context/AuthContext';

const AllUsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { roles, fetchRoles } = useRoles();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const { user: loggedInUser, fetchLatestRole: fetchRoleData } = useContext(AuthContext);

    useEffect(() => {
        if (fetchRoleData) {
            fetchRoleData();
        }
    }, [fetchRoleData]);

    // Action States
    const [isFetchingProfile, setIsFetchingProfile] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const addMenuRef = useRef(null);

    // Faculty Modal Hooks (skip list fetch)
    const facultyOps = useFacultyOperations(true);

    // Dropdown Options for Faculty Form
    const courseOptions = getCourseOptions(facultyOps.coursesData);
    const branchOptions = getBranchOptions(facultyOps.coursesData, facultyOps.formData.course);
    const semOptions = getSemOptions(facultyOps.coursesData, facultyOps.formData.course);
    const subjectOptions = getSubjectOptions(facultyOps.coursesData, facultyOps.formData.course, facultyOps.formData.branch, facultyOps.formData.sem);

    // Admin Modal State
    const [adminModalState, setAdminModalState] = useState({
        isOpen: false,
        mode: 'view', // 'view' | 'edit'
        adminData: null
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter, statusFilter, fetchRoles]);

    useEffect(() => {
        // Reset page on search or filter change
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter]);

    // Handle clicking outside of the Add User menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
                setShowAddMenu(false);
            }
        };

        if (showAddMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddMenu]);

    // Prevent background scrolling when any modal is open
    useEffect(() => {
        const isAnyModalOpen = adminModalState.isOpen ||
            [MODAL_TYPE.EDIT, MODAL_TYPE.VIEW, MODAL_TYPE.ADD].includes(facultyOps.modal.type);

        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [adminModalState.isOpen, facultyOps.modal.type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Build query string based on filters
            const params = new URLSearchParams();
            if (roleFilter !== 'ALL') params.append('role', roleFilter);
            if (statusFilter !== 'ALL') params.append('status', statusFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await api.get(`/users?${params.toString()}`);
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load user list');
        } finally {
            setLoading(false);
        }
    };

    // Perform client-side search across name/email to ensure instant responsiveness, 
    // since we fetched all users matching the dropdown filters
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleToggleStatus = async (userId) => {
        try {
            await api.put(`/users/${userId}/status`);
            toast.success("User status updated successfully");
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
            // No need to fetchUsers() again here, as it's called on success.
            // If status update failed, the list should reflect the current state.
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to completely remove this user from the system? This action cannot be undone.")) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success("User deleted completely");
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete user");
        }
    };

    const getRoleBadge = (roleObj) => {
        const role = roleObj?.name || roleObj; // Fallback if it's somehow a string
        if (role === 'SUPERADMIN') return 'bg-purple-100 text-purple-700 border-purple-200';
        if (role === 'ADMIN') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        if (role === 'FACULTY') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        return 'bg-blue-100 text-blue-700 border-blue-200'; // Default custom role badge
    };

    // Handle Fetch Profile for Modals
    const fetchUserProfile = async (userId, action) => {
        setIsFetchingProfile(true);
        try {
            const res = await api.get(`/users/${userId}/profile`);
            if (res.data.success) {
                const profile = res.data.data;
                const role = res.data.userRole;

                if (role === 'ADMIN' || role === 'SUPERADMIN') {
                    setAdminModalState({
                        isOpen: true,
                        mode: action,
                        adminData: profile
                    });
                } else if (role === 'FACULTY') {
                    if (action === 'view') {
                        facultyOps.handleView(profile);
                    } else if (action === 'edit') {
                        facultyOps.handleEdit(profile);
                    }
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load profile details');
        } finally {
            setIsFetchingProfile(false);
        }
    };

    // Admin Submit Handler
    const handleAdminSubmit = async (formData) => {
        try {
            const payload = { ...formData };
            // Ensure passwords are removed in update mode unless actively changing it
            if (!payload.password) delete payload.password;
            delete payload.confirmPassword;

            if (adminModalState.mode === 'create') {
                await api.post(`/admins`, payload);
                toast.success('Admin created successfully');
            } else {
                await api.put(`/admins/${adminModalState.adminData._id}`, payload);
                toast.success('Admin updated successfully');
            }

            fetchUsers();
            setAdminModalState({ isOpen: false, mode: 'view', adminData: null });
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
            throw error;
        }
    };

    // Wrap Faculty Submit to refresh User list after completion
    const handleFacultySubmitWrap = async (e) => {
        await facultyOps.handleSubmit(e);
        fetchUsers(); // Refresh main list in case name changed
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto h-11 items-center">
                    <div className="w-40 z-20 shadow-sm rounded-xl">
                        <CustomDropdown
                            name="roleFilter"
                            options={['ALL', ...roles.map(r => r.name)]}
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            placeholder="All Roles"
                        />
                    </div>

                    <div className="w-40 z-10 shadow-sm rounded-xl">
                        <CustomDropdown
                            name="statusFilter"
                            options={['ALL', 'Active', 'Inactive']}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            placeholder="All Status"
                        />
                    </div>

                    {/* Add User Button */}
                    {hasPermission(loggedInUser, 'USER', 'create') && (
                        <div className="relative z-30 ml-auto md:ml-4" ref={addMenuRef}>
                            <button
                                onClick={() => setShowAddMenu(!showAddMenu)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <UserPlus size={18} />
                                <span className="font-medium">Add User</span>
                            </button>

                            {showAddMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => {
                                            setShowAddMenu(false);
                                            setAdminModalState({ isOpen: true, mode: 'create', adminData: null });
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 transition-colors group"
                                    >
                                        <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                            <Shield size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">Admin User</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddMenu(false);
                                            facultyOps.openAddModal();
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                                    >
                                        <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                            <User size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700">Faculty User</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* List Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800">No users found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {currentUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-xl mr-3 shadow-sm border border-slate-100"
                                                />
                                                <div>
                                                    <div className="font-semibold text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getRoleBadge(user.role)}`}>
                                                {user.role?.name || user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                                                <span className={`text-sm ${user.status === 'Active' ? 'text-slate-700' : 'text-red-500'}`}>
                                                    {user.status || 'Active'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {/* View Button */}
                                                <button
                                                    onClick={() => fetchUserProfile(user._id, 'view')}
                                                    disabled={isFetchingProfile}
                                                    title="View Full Profile"
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <Eye size={18} />
                                                </button>

                                                {/* Edit Button */}
                                                {hasPermission(loggedInUser, 'USER', 'update') && (
                                                    <button
                                                        onClick={() => fetchUserProfile(user._id, 'edit')}
                                                        disabled={isFetchingProfile}
                                                        title="Edit Profile"
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}

                                                {/* Status Toggle Button */}
                                                {hasPermission(loggedInUser, 'USER', 'update') && (
                                                    <button
                                                        onClick={() => handleToggleStatus(user._id)}
                                                        className={`p-2 rounded-lg transition-colors ${user.status === 'Active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                        title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                                    >
                                                        <Power size={18} />
                                                    </button>
                                                )}
                                                {hasPermission(loggedInUser, 'USER', 'delete') && (
                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Delete User completely"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredUsers.length > itemsPerPage && (
                        <div className="p-4 border-t border-slate-100">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredUsers.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Admin Modal Integration */}
            {adminModalState.isOpen && (
                <AdminModal
                    isOpen={adminModalState.isOpen}
                    onClose={() => setAdminModalState({ isOpen: false, mode: 'view', adminData: null })}
                    mode={adminModalState.mode}
                    admin={adminModalState.adminData}
                    onSubmit={handleAdminSubmit}
                />
            )}

            {/* Faculty Modal Integration */}
            {[MODAL_TYPE.EDIT, MODAL_TYPE.VIEW, MODAL_TYPE.ADD].includes(facultyOps.modal.type) && (
                <FacultyFormModal
                    isOpen={true}
                    onClose={facultyOps.closeModal}
                    formData={facultyOps.formData}
                    onChange={facultyOps.handleChange}
                    onSubmit={handleFacultySubmitWrap}
                    isEditMode={facultyOps.modal.type === MODAL_TYPE.EDIT}
                    isViewMode={facultyOps.modal.type === MODAL_TYPE.VIEW}
                    submitLoading={facultyOps.submitLoading}
                    designationOptions={FACULTY_DESIGNATIONS}
                    courseOptions={courseOptions}
                    branchOptions={branchOptions}
                    semOptions={semOptions}
                    subjectOptions={subjectOptions}
                />
            )}

            {/* Full Screen Loading Overlay while fetching profile mapping */}
            {isFetchingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center">
                        <Loader2 className="animate-spin text-indigo-600 w-10 h-10 mb-3" />
                        <p className="font-medium text-slate-700">Loading Profile Details...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllUsersList;
