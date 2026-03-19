import React, { useState, useEffect, useRef, useContext } from 'react';
import { Search, Filter, Mail, Phone, Calendar, Shield, Edit2, Eye, Loader2, Trash2, Power, UserPlus, User, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../common/core/Pagination';
import api from '../../services/api';
import CustomDropdown from '../custom/CustomDropdown';
import AdminModal from '../modals/AdminModal';
import OtherUserModal from '../modals/OtherUserModal';
import FacultyFormModal from '../modals/FacultyFormModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import MultiSelectDropdown from '../custom/MultiSelectDropdown';
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
    const [roleFilter, setRoleFilter] = useState('ALL Roles');
    const [statusFilter, setStatusFilter] = useState('ALL Status');

    // Faculty specific filters (popover)
    const [facultyFilters, setFacultyFilters] = useState({
        course: [],
        branch: [],
        designation: [],
        sem: []
    });
    const [showFacultyFilters, setShowFacultyFilters] = useState(false);
    const filterRef = useRef(null);

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
        mode: 'view', // 'view' | 'edit' | 'create'
        adminData: null
    });

    const [otherModalState, setOtherModalState] = useState({
        isOpen: false,
        mode: 'view',
        userData: null
    });
    const [initialRole, setInitialRole] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter, statusFilter, facultyFilters, fetchRoles]);

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
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFacultyFilters(false);
            }
        };

        if (showAddMenu || showFacultyFilters) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddMenu, showFacultyFilters]);

    // Prevent background scrolling when any modal is open
    useEffect(() => {
        const isAnyModalOpen = adminModalState.isOpen ||
            otherModalState.isOpen ||
            [MODAL_TYPE.EDIT, MODAL_TYPE.VIEW, MODAL_TYPE.ADD].includes(facultyOps.modal.type) ||
            isDeleteModalOpen;

        if (isAnyModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [adminModalState.isOpen, otherModalState.isOpen, facultyOps.modal.type, isDeleteModalOpen]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Build query string based on filters
            const params = new URLSearchParams();
            if (roleFilter !== 'ALL Roles') params.append('role', roleFilter);
            if (statusFilter !== 'ALL Status') params.append('status', statusFilter);
            
            // Add Faculty-specific filters if role is Faculty
            if (roleFilter === 'FACULTY') {
                if (facultyFilters.course.length > 0) params.append('course', facultyFilters.course.join(','));
                if (facultyFilters.branch.length > 0) params.append('branch', facultyFilters.branch.join(','));
                if (facultyFilters.designation.length > 0) params.append('designation', facultyFilters.designation.join(','));
                if (facultyFilters.sem.length > 0) params.append('sem', facultyFilters.sem.join(','));
            }

            if (searchTerm) params.append('search', searchTerm);
            console.log(params.toString());

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

    const deleteUser = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete._id}`);
            toast.success("User deleted completely");
            fetchUsers();
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
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
                } else {
                    // Custom roles use specialized OtherUserModal
                    setOtherModalState({
                        isOpen: true,
                        mode: action,
                        userData: profile
                    });
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

    // Other User Submit Handler
    const handleOtherSubmit = async (formData) => {
        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            delete payload.confirmPassword;

            if (otherModalState.mode === 'create') {
                await api.post(`/other-users`, payload);
                toast.success('Other user created successfully');
            } else {
                await api.put(`/other-users/${otherModalState.userData._id}`, payload);
                toast.success('Other user updated successfully');
            }

            fetchUsers();
            setOtherModalState({ isOpen: false, mode: 'view', userData: null });
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
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
            {/* Toolbar */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center rounded-t-3xl">
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
                            options={['ALL Roles', ...roles.map(r => r.name)]}
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                if (e.target.value !== 'FACULTY') {
                                    setFacultyFilters({ course: [], branch: [], designation: [], sem: [] });
                                }
                            }}
                            placeholder="ALL Roles"
                        />
                    </div>

                    {roleFilter !== 'FACULTY' && (
                        <div className="w-40 z-10 shadow-sm rounded-xl">
                            <CustomDropdown
                                name="statusFilter"
                                options={['ALL Status', 'Active', 'Inactive']}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                placeholder="ALL Status"
                            />
                        </div>
                    )}

                    {/* Faculty Popover Filter Button */}
                    {roleFilter === 'FACULTY' && (
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setShowFacultyFilters(!showFacultyFilters)}
                                className={`flex items-center justify-center p-2.5 rounded-xl border transition-all ${showFacultyFilters
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm'
                                    }`}
                            >
                                <Filter size={24} />
                            </button>

                            {showFacultyFilters && (
                                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-[100]">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                                Course
                                            </label>
                                            <MultiSelectDropdown
                                                name="course"
                                                value={facultyFilters.course}
                                                onChange={(e) => setFacultyFilters(prev => ({
                                                    ...prev,
                                                    course: e.target.value,
                                                    branch: [], // Reset branch if course changes
                                                    sem: []
                                                }))}
                                                options={courseOptions}
                                                placeholder="Select Courses"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                                Branch
                                            </label>
                                            <MultiSelectDropdown
                                                name="branch"
                                                value={facultyFilters.branch}
                                                onChange={(e) => setFacultyFilters(prev => ({
                                                    ...prev,
                                                    branch: e.target.value,
                                                    sem: []
                                                }))}
                                                options={facultyFilters.course.length > 0 ? Array.from(new Set(
                                                    facultyOps.coursesData
                                                        .filter(c => facultyFilters.course.includes(c.name))
                                                        .flatMap(c => c.branches.map(b => b.name))
                                                )) : []}
                                                placeholder="Select Branches"
                                                disabled={facultyFilters.course.length === 0}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                                Semester
                                            </label>
                                            <MultiSelectDropdown
                                                name="sem"
                                                value={facultyFilters.sem}
                                                onChange={(e) => setFacultyFilters(prev => ({
                                                    ...prev,
                                                    sem: e.target.value
                                                }))}
                                                options={facultyFilters.course.length > 0 ? Array.from({
                                                    length: Math.max(...facultyOps.coursesData
                                                        .filter(c => facultyFilters.course.includes(c.name))
                                                        .map(c => (c.duration || 4) * 2))
                                                }, (_, i) => (i + 1).toString()) : []}
                                                placeholder="Select Semesters"
                                                disabled={facultyFilters.course.length === 0}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                                Designation
                                            </label>
                                            <MultiSelectDropdown
                                                name="designation"
                                                value={facultyFilters.designation}
                                                onChange={(e) => setFacultyFilters(prev => ({
                                                    ...prev,
                                                    designation: e.target.value
                                                }))}
                                                options={FACULTY_DESIGNATIONS}
                                                placeholder="Select Designations"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                                                Status
                                            </label>
                                            <CustomDropdown
                                                name="statusFilter"
                                                options={['ALL Status', 'Active', 'Inactive']}
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                placeholder="ALL Status"
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                setFacultyFilters({ course: [], branch: [], designation: [], sem: [] });
                                                setStatusFilter('ALL Status');
                                                setShowFacultyFilters(false);
                                            }}
                                            className="w-full py-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-dashed border-red-100 mt-2"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Add User Button */}
                    {hasPermission(loggedInUser, 'USER', 'create') && (
                        <div className="relative z-30 ml-auto md:ml-4" ref={addMenuRef}>
                            <button
                                onClick={() => setShowAddMenu(!showAddMenu)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 group font-medium"
                            >
                                <Plus size={20} className={`transition-transform duration-300 ${showAddMenu ? 'rotate-45' : ''}`} />
                                <span className="hidden sm:inline">Add User</span>
                            </button>

                            {showAddMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => {
                                            setShowAddMenu(false);
                                            setInitialRole('ADMIN');
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
                                    <button
                                        onClick={() => {
                                            setShowAddMenu(false);
                                            setInitialRole('OTHER');
                                            setOtherModalState({ isOpen: true, mode: 'create', userData: null });
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors group border-t border-slate-50"
                                    >
                                        <div className="bg-orange-50 p-1.5 rounded-lg text-orange-600 group-hover:bg-orange-100 transition-colors">
                                            <Plus size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-orange-700">Other User</span>
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
                                                        onClick={() => deleteUser(user)}
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
                        <div className="p-4 border-t border-slate-100 bg-slate-50/30 rounded-b-3xl">
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
                    initialRole={initialRole}
                    admin={adminModalState.adminData}
                    onSubmit={handleAdminSubmit}
                />
            )}

            {/* Other User Modal Integration */}
            {otherModalState.isOpen && (
                <OtherUserModal
                    isOpen={otherModalState.isOpen}
                    onClose={() => setOtherModalState({ isOpen: false, mode: 'view', userData: null })}
                    mode={otherModalState.mode}
                    initialRole={initialRole}
                    user={otherModalState.userData}
                    onSubmit={handleOtherSubmit}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                deleteRole={userToDelete?.role?.name || userToDelete?.role || "User"}
            />

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
