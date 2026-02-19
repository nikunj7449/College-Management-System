import React, { useState, useEffect } from 'react';
import { X, User, Shield, Mail, Phone, Calendar, Lock, Loader2, Save } from 'lucide-react';

const AdminModal = ({ isOpen, onClose, mode, admin, onSubmit }) => {
  const initialFormState = {
    name: '',
    adminId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setFormData(initialFormState);
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
      setFormErrors({});
    }
  }, [isOpen, mode, admin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.adminId.trim()) errors.adminId = 'Admin ID is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
    
    if (mode === 'create') {
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    } else {
      if (formData.password && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

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
    } catch (error) {
      // Error handling is usually done in parent via toast, but we can stop loading here
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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" placeholder="John Doe" />
            </div>
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin ID</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="text" name="adminId" value={formData.adminId} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" placeholder="ADM001" />
            </div>
            {formErrors.adminId && <p className="text-red-500 text-xs mt-1">{formErrors.adminId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" placeholder="admin@college.edu" />
            </div>
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" placeholder="+1 234 567 890" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <select 
                  disabled={mode === 'view'}
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange} 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Joined Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  disabled={mode === 'view'}
                  type="date" 
                  name="joinedDate" 
                  value={formData.joinedDate} 
                  onChange={handleInputChange} 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" 
                />
              </div>
            </div>
          </div>
          {mode !== 'view' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {mode === 'edit' ? 'New Password (Optional)' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="••••••" />
              </div>
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="••••••" />
              </div>
              {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
            </div>
          </div>
          )}
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">{mode === 'view' ? 'Close' : 'Cancel'}</button>
            {mode !== 'view' && (
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center">
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} className="mr-2" /> Save Admin</>}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
