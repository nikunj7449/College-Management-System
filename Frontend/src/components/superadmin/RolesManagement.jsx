import React, { useEffect, useState } from 'react';
import { useRoles } from '../../hooks/useRoles';
import { Plus, Shield } from 'lucide-react';
import RoleFormModal from '../modals/RoleFormModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import RoleCard from '../common/role/RoleCard';
import RoleCardSkeleton from '../common/role/RoleCardSkeleton';

const RolesManagement = () => {
    const { roles, loading, fetchRoles, deleteRole } = useRoles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

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

    const handleCreate = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleDelete = (id, name) => {
        setRoleToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (roleToDelete) {
            await deleteRole(roleToDelete.id);
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRole(null);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Shield className="text-blue-600" /> Roles & Permissions
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Manage system roles and their access levels</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                >
                    <Plus /> Create Role
                </button>
            </div>

            {loading && roles.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <RoleCardSkeleton key={index} />
                    ))}
                </div>
            ) : roles.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                    <Shield className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No roles found</h3>
                    <p className="text-slate-500 mt-1">Get started by creating a new role.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <RoleCard
                            key={role._id}
                            role={role}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <RoleFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                role={selectedRole}
                onSuccess={fetchRoles}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                deleteRole={`role '${roleToDelete?.name}'`}
            />
        </div>
    );
};

export default RolesManagement;
