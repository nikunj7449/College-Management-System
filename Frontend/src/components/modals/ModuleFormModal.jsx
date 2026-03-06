import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModules } from '../../hooks/useModules';

const ModuleFormModal = ({ isOpen, onClose, systemModule, onSuccess }) => {
    const { createModule, updateModule, loading } = useModules();
    const isEdit = !!systemModule;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isSystem: false
    });

    useEffect(() => {
        if (isOpen) {
            if (isEdit) {
                setFormData({
                    name: systemModule.name,
                    description: systemModule.description || '',
                    isSystem: systemModule.isSystem || false
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    isSystem: false
                });
            }
        }
    }, [isOpen, isEdit, systemModule]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateModule(systemModule._id, formData);
            } else {
                await createModule(formData);
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
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-800">
                        {isEdit ? 'Edit System Module' : 'Create New Module'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="moduleForm" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Module Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isEdit && formData.isSystem}
                                className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors uppercase ${isEdit && formData.isSystem ? 'bg-slate-100 text-slate-500' : 'bg-white border-slate-300'}`}
                                placeholder="e.g., LIBRARY"
                                required
                            />
                            {isEdit && formData.isSystem && (
                                <p className="text-xs text-amber-600 mt-1">System core module names cannot be changed.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white resize-none"
                                placeholder="Brief description of this module's purpose"
                            />
                        </div>
                        <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isSystem"
                                    checked={formData.isSystem}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Core System Module</h4>
                                <p className="text-xs text-slate-500">If checked, this module cannot be deleted later.</p>
                            </div>
                        </div>
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
                        form="moduleForm"
                        disabled={loading}
                        className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {isEdit ? 'Save Changes' : 'Create Module'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModuleFormModal;
