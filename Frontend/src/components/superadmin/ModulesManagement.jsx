import React, { useEffect, useState } from 'react';
import { useModules } from '../../hooks/useModules';
import { Plus, Box } from 'lucide-react';
import ModuleFormModal from '../modals/ModuleFormModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import ModuleCard from '../common/module/ModuleCard';
import ModuleCardSkeleton from '../common/module/ModuleCardSkeleton';

const ModulesManagement = () => {
    const { modules, loading, fetchModules, deleteModule } = useModules();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState(null);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

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
        setSelectedModule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (mod) => {
        setSelectedModule(mod);
        setIsModalOpen(true);
    };

    const handleDelete = (id, name) => {
        setModuleToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (moduleToDelete) {
            await deleteModule(moduleToDelete.id);
            setIsDeleteModalOpen(false);
            setModuleToDelete(null);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedModule(null);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Box className="text-blue-600" /> System Modules
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Manage dynamic system modules available for permissions control</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                >
                    <Plus /> Create Module
                </button>
            </div>

            {loading && modules.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <ModuleCardSkeleton key={index} />
                    ))}
                </div>
            ) : modules.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                    <Box className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No modules found</h3>
                    <p className="text-slate-500 mt-1">Get started by creating a new module.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {modules.map((mod) => (
                        <ModuleCard
                            key={mod._id}
                            mod={mod}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <ModuleFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                systemModule={selectedModule}
                onSuccess={fetchModules}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                deleteRole={`module '${moduleToDelete?.name}'`}
            />
        </div>
    );
};

export default ModulesManagement;
