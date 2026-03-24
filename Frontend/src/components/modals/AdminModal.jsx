import React, { useState, useEffect } from 'react';
import { X, User, Shield, Mail, Phone, Calendar, Lock, Loader2, Save } from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import CustomDropdown from '../custom/CustomDropdown';

const AdminModal = ({ isOpen, onClose, mode, admin, onSubmit, initialRole }) => {
  const initialFormState = {
    name: '',
    adminId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  const { roles, fetchRoles } = useRoles();
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles once when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, fetchRoles]);

  // Initialize form only when modal opens or admin/mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        const defaultRole = roles.find(r => r.name.toUpperCase() === (initialRole?.toUpperCase() || 'ADMIN'))?.name || (roles.length > 0 ? roles[0].name : '');
        setFormData(prev => ({ ...initialFormState, role: defaultRole || prev.role }));
      } else if (admin) {
        setFormData({
          name: admin.name,
          adminId: admin.adminId || '',
          email: admin.email,
          phone: admin.phone || '',
          password: '',
          confirmPassword: '',
          role: admin.role || 'ADMIN',
          joinedDate: admin.joinedDate ? new Date(admin.joinedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      }
    }
    setFormErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, admin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.adminId.trim()) errors.adminId = 'Admin ID is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (mode === 'create' && !formData.password) errors.password = 'Password is required';
    if (formData.password && formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">
            {mode === 'create' ? 'Add New Admin' : mode === 'edit' ? 'Edit Admin' : 'Admin Details'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin ID</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="text" name="adminId" value={formData.adminId} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="ADM001" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <CustomDropdown
                disabled={mode === 'view'}
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={roles.filter(r => ['ADMIN', 'SUPERADMIN'].includes(r.name.toUpperCase())).map(role => ({ label: role.name, value: role.name }))}
                placeholder="Select Role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joined Date</label>
              <input disabled={mode === 'view'} type="date" name="joinedDate" value={formData.joinedDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" />
            </div>
          </div>
          {mode !== 'view' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="••••••" />
              </div>
            </div>
          )}
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50">{mode === 'view' ? 'Close' : 'Cancel'}</button>
            {mode !== 'view' && (
              <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg flex justify-center items-center">
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} className="mr-2" /> Save</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
