import React, { useState, useEffect, useCallback } from 'react';
import { X, Check } from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';

const defaultSidebarConfig = [
    { key: 'DASHBOARD', label: 'Dashboard', visible: true, order: 1, children: [] },
    { key: 'STUDENT', label: 'Students', visible: true, order: 2, children: [] },
    { key: 'FACULTY', label: 'Faculty', visible: true, order: 3, children: [] },
    { key: 'USER_MANAGEMENT', label: 'User Management', visible: true, order: 4, children: [
        { key: 'USER_LIST', label: 'All Users', visible: true },
        { key: 'ROLES_PERMISSIONS', label: 'Roles & Permissions', visible: true },
        { key: 'SYSTEM_MODULES', label: 'System Modules', visible: true }
    ] },
    { key: 'COURSE', label: 'Courses', visible: true, order: 5, children: [] },
    { key: 'ATTENDANCE', label: 'Attendance', visible: true, order: 6, children: [] },
    { key: 'PERFORMANCE', label: 'Performance', visible: true, order: 7, children: [] },
    {
        key: 'EVENT', label: 'Events', visible: true, order: 8, children: [
            { key: 'EVENT_VIEW', label: 'View All Events', visible: true },
            { key: 'EVENT_CREATE', label: 'Add Event', visible: true },
            { key: 'EVENT_UPDATE', label: 'Edit Event', visible: true }
        ]
    },
    { key: 'EXAMS', label: 'Exams', visible: true, order: 9, children: [] },
    { key: 'REMARKS', label: 'Remarks', visible: true, order: 10, children: [] }
];

const PermissionRow = React.memo(({ module, idx, canCreate, canRead, canUpdate, canDelete, isEdit, isRoleSystem, roleName, onChange }) => {
    const actions = [
        { name: 'create', isChecked: canCreate },
        { name: 'read', isChecked: canRead },
        { name: 'update', isChecked: canUpdate },
        { name: 'delete', isChecked: canDelete }
    ];

    return (
        <tr className={`text-sm ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/30 transition-colors`}>
            <td className="p-3 border-b border-r border-slate-200 font-medium text-slate-700 whitespace-nowrap">
                {module}
            </td>
            {actions.map(({ name: action, isChecked }) => {
                const isDisabled = false; // Allow SUPERADMIN to be edited
                return (
                    <td key={action} className="p-3 border-b border-slate-200 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={(e) => onChange(module, action, e.target.checked)}
                            />
                            <div className={`w-5 h-5 rounded border ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'} flex items-center justify-center peer-focus:ring-2 peer-focus:ring-blue-500/30 transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                        </label>
                    </td>
                );
            })}
        </tr>
    );
});

const RoleFormModal = ({ isOpen, onClose, role, onSuccess }) => {
    const { createRole, updateRole, loading, systemModules, fetchSystemModules } = useRoles();
    const isEdit = !!role;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: {},
        sidebarConfig: [],
        isSystem: false
    });
    const [activeTab, setActiveTab] = useState('permissions');

    useEffect(() => {
        if (isOpen && systemModules.length === 0) {
            fetchSystemModules();
        }
    }, [isOpen, systemModules.length, fetchSystemModules]);

    useEffect(() => {
        if (isOpen && systemModules.length > 0) {
            setActiveTab('permissions');
            if (isEdit) {
                setFormData({
                    name: role.name,
                    description: role.description || '',
                    permissions: role.permissions || {},
                    sidebarConfig: role.sidebarConfig && role.sidebarConfig.length ? role.sidebarConfig : defaultSidebarConfig,
                    isSystem: role.isSystem || false
                });
            } else {
                // Initialize empty permissions matrix
                const initialPerms = {};
                systemModules.forEach(mod => {
                    initialPerms[mod] = { create: false, read: false, update: false, delete: false };
                });
                setFormData({
                    name: '',
                    description: '',
                    permissions: initialPerms,
                    sidebarConfig: defaultSidebarConfig,
                    isSystem: false
                });
            }
        }
    }, [isOpen, isEdit, role, systemModules]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handlePermissionChange = useCallback((module, action, value) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [module]: {
                    ...(prev.permissions[module] || { create: false, read: false, update: false, delete: false }),
                    [action]: value
                }
            }
        }));
    }, []);

    const handleSidebarChange = (idx, field, value) => {
        setFormData(prev => {
            const newConfig = [...(prev.sidebarConfig || [])];
            newConfig[idx] = { ...newConfig[idx], [field]: value };
            return { ...prev, sidebarConfig: newConfig };
        });
    };

    const handleSidebarChildChange = (parentIdx, childIdx, field, value) => {
        setFormData(prev => {
            const newConfig = [...(prev.sidebarConfig || [])];
            const newChildren = [...(newConfig[parentIdx].children || [])];
            newChildren[childIdx] = { ...newChildren[childIdx], [field]: value };
            newConfig[parentIdx] = { ...newConfig[parentIdx], children: newChildren };
            return { ...prev, sidebarConfig: newConfig };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateRole(role._id, formData);
            } else {
                await createRole(formData);
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            // Error handling is managed by the hook (toast)
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">
                        {isEdit ? 'Edit Role & Permissions' : 'Create New Role'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="roleForm" onSubmit={handleSubmit} className="space-y-6">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isEdit && formData.isSystem}
                                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors uppercase ${isEdit && formData.isSystem ? 'bg-slate-100 text-slate-500' : 'bg-white border-slate-300'}`}
                                    placeholder="e.g., SENIOR_FACULTY"
                                    required
                                />
                                {isEdit && formData.isSystem && (
                                    <p className="text-xs text-amber-600 mt-1">System role names cannot be changed.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                    placeholder="Brief description of this role"
                                />
                            </div>
                        </div>

                        {/* System Role Toggle */}
                        <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isSystem"
                                    disabled={isEdit && role?.name === 'SUPERADMIN'} // SUPERADMIN core status can never be disabled
                                    checked={formData.isSystem}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className={`w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${isEdit && role?.name === 'SUPERADMIN' ? 'opacity-50' : ''}`}></div>
                            </label>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Core System Role</h4>
                                <p className="text-xs text-slate-500">If checked, this role and its name cannot be deleted later.</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-4 border-b border-slate-200 mt-6 pt-2">
                            <button
                                type="button"
                                className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                onClick={() => setActiveTab('permissions')}
                            >
                                Module Permissions
                            </button>
                            <button
                                type="button"
                                className={`pb-2 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sidebar' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                                onClick={() => setActiveTab('sidebar')}
                            >
                                Sidebar Configuration
                            </button>
                        </div>

                        {/* activeTab Content */}
                        {activeTab === 'permissions' ? (
                            <div className="mt-4 border rounded-xl overflow-hidden border-slate-200">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                    <h4 className="font-semibold text-slate-800">Module Permissions</h4>
                                    <p className="text-xs text-slate-500">Enable or disable specific CRUD operations per module.</p>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-600 text-sm">
                                                <th className="p-3 border-b border-r border-slate-200 font-semibold w-1/3">Module</th>
                                                <th className="p-3 border-b border-slate-200 font-semibold text-center w-1/6">Create</th>
                                                <th className="p-3 border-b border-slate-200 font-semibold text-center w-1/6">Read</th>
                                                <th className="p-3 border-b border-slate-200 font-semibold text-center w-1/6">Update</th>
                                                <th className="p-3 border-b border-slate-200 font-semibold text-center w-1/6">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {systemModules.map((module, idx) => (
                                                <PermissionRow
                                                    key={module}
                                                    module={module}
                                                    idx={idx}
                                                    canCreate={!!formData.permissions[module]?.create}
                                                    canRead={!!formData.permissions[module]?.read}
                                                    canUpdate={!!formData.permissions[module]?.update}
                                                    canDelete={!!formData.permissions[module]?.delete}
                                                    isEdit={isEdit}
                                                    isRoleSystem={role?.isSystem}
                                                    roleName={role?.name}
                                                    onChange={handlePermissionChange}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 border rounded-xl overflow-hidden border-slate-200">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                    <h4 className="font-semibold text-slate-800">Sidebar Configuration</h4>
                                    <p className="text-xs text-slate-500">Customize labels, ordering, and visibility for this role's sidebar menu items.</p>
                                </div>
                                <div className="overflow-y-auto w-full max-h-[400px]">
                                    <table className="w-full text-left border-collapse relative">
                                        <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm border-b border-slate-200">
                                            <tr className="text-slate-600 text-sm">
                                                <th className="p-3 border-r border-slate-200 font-semibold w-1/4">Menu Key</th>
                                                <th className="p-3 border-r border-slate-200 font-semibold w-1/3">Display Label</th>
                                                <th className="p-3 border-r border-slate-200 font-semibold text-center w-1/6">Order</th>
                                                <th className="p-3 font-semibold text-center w-1/6">Visible</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...(formData.sidebarConfig || [])].sort((a, b) => a.order - b.order).map((item) => {
                                                const idx = formData.sidebarConfig.findIndex(i => i.key === item.key);
                                                return (
                                                    <React.Fragment key={item.key}>
                                                        <tr className="border-b border-slate-200 hover:bg-slate-50 bg-white">
                                                            <td className="p-3 font-medium text-slate-700 border-r border-slate-200 text-sm">{item.key}</td>
                                                            <td className="p-3 border-r border-slate-200">
                                                                <input type="text" value={item.label} onChange={e => handleSidebarChange(idx, 'label', e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                                            </td>
                                                            <td className="p-3 border-r border-slate-200 text-center">
                                                                <input type="number" value={item.order} onChange={e => handleSidebarChange(idx, 'order', parseInt(e.target.value) || 0)} className="w-20 p-2 border border-slate-300 rounded-md text-sm text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <label className="inline-flex items-center cursor-pointer">
                                                                    <input type="checkbox" checked={item.visible} onChange={e => handleSidebarChange(idx, 'visible', e.target.checked)} className="sr-only peer" />
                                                                    <div className={`w-5 h-5 rounded border ${item.visible ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'} flex items-center justify-center peer-focus:ring-2 peer-focus:ring-blue-500/30 transition-all`}>
                                                                        {item.visible && <Check className="w-3.5 h-3.5" />}
                                                                    </div>
                                                                </label>
                                                            </td>
                                                        </tr>
                                                        {item.children && item.children.map((child, cIdx) => (
                                                            <tr key={child.key} className="border-b border-slate-100 bg-slate-50/50 hover:bg-blue-50/20">
                                                                <td className="p-3 pl-8 text-sm text-slate-500 border-r border-slate-200 flex items-center gap-2">
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" /></svg>
                                                                    {child.key}
                                                                </td>
                                                                <td className="p-3 border-r border-slate-200">
                                                                    <input type="text" value={child.label} onChange={e => handleSidebarChildChange(idx, cIdx, 'label', e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all" />
                                                                </td>
                                                                <td className="p-3 border-r border-slate-200 text-center text-xs font-medium text-slate-400 bg-slate-100/50">Submenu</td>
                                                                <td className="p-3 text-center">
                                                                    <label className="inline-flex items-center cursor-pointer">
                                                                        <input type="checkbox" checked={child.visible} onChange={e => handleSidebarChildChange(idx, cIdx, 'visible', e.target.checked)} className="sr-only peer" />
                                                                        <div className={`w-4 h-4 rounded border ${child.visible ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300'} flex items-center justify-center peer-focus:ring-2 peer-focus:ring-indigo-500/30 transition-all`}>
                                                                            {child.visible && <Check className="w-3 h-3" />}
                                                                        </div>
                                                                    </label>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="roleForm"
                        disabled={loading} // Allow editing of SUPERADMIN
                        className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {isEdit ? 'Save Changes' : 'Create Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleFormModal;
