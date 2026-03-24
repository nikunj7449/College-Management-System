import React, { useState, useEffect } from 'react';
import { X, User, Shield, Mail, Phone, Calendar, Lock, Loader2, Save, Plus } from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import CustomDropdown from '../custom/CustomDropdown';

const OtherUserModal = ({ isOpen, onClose, mode, user, onSubmit, initialRole }) => {
  const initialFormState = {
    name: '',
    staffId: '',
    personalEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    joinedDate: new Date().toISOString().split('T')[0],
    metadata: {}
  };

  const { roles, fetchRoles } = useRoles();
  const [formData, setFormData] = useState(initialFormState);
  const [metadataList, setMetadataList] = useState([]); // [{ key: '', value: '' }]
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles once when component mounts or search/filter changes in hook
  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, fetchRoles]);

  // Initialize form only when modal opens or user/mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'create') {
        setFormData(prev => ({
          ...initialFormState,
          role: roles.find(r => !['ADMIN', 'SUPERADMIN', 'FACULTY'].includes(r.name.toUpperCase()))?.name || prev.role || ''
        }));
        setMetadataList([]);
      } else if (user) {
        setFormData({
          name: user.name,
          staffId: user.staffId || '',
          personalEmail: user.personalEmail || user.email || '',
          phone: user.phone || '',
          password: '',
          confirmPassword: '',
          role: user.role || '',
          joinedDate: user.joinedDate ? new Date(user.joinedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });

        if (user.metadata) {
          const list = Object.entries(user.metadata).map(([key, value]) => ({ key, value }));
          setMetadataList(list);
        } else {
          setMetadataList([]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, user]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMetadataChange = (index, field, value) => {
    const updatedList = [...metadataList];
    updatedList[index][field] = value;
    setMetadataList(updatedList);
  };

  const addMetadataField = () => setMetadataList([...metadataList, { key: '', value: '' }]);
  const removeMetadataField = (index) => setMetadataList(metadataList.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const metadata = {};
      metadataList.forEach(item => {
        if (item.key.trim()) metadata[item.key.trim()] = item.value;
      });
      await onSubmit({ ...formData, metadata });
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
            {mode === 'create' ? 'Add Other User' : mode === 'edit' ? 'Edit Other User' : 'Details'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Staff ID</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="text" name="staffId" value={formData.staffId} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none" placeholder="STF001" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Personal Email ID</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input disabled={mode === 'view'} type="email" name="personalEmail" value={formData.personalEmail} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <CustomDropdown
                disabled={mode === 'view'}
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={roles.filter(r => !['ADMIN', 'SUPERADMIN', 'FACULTY'].includes(r.name.toUpperCase())).map(role => ({ label: role.name, value: role.name }))}
                placeholder="Select Role"
              />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700">Extra Information</label>
              {mode !== 'view' && (
                <button type="button" onClick={addMetadataField} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  <Plus size={14} /> Add More Info
                </button>
              )}
            </div>
            <div className="space-y-2">
              {metadataList.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input disabled={mode === 'view'} type="text" className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm" placeholder="Field" value={item.key} onChange={(e) => handleMetadataChange(index, 'key', e.target.value)} />
                  <input disabled={mode === 'view'} type="text" className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm" placeholder="Value" value={item.value} onChange={(e) => handleMetadataChange(index, 'value', e.target.value)} />
                  {mode !== 'view' && <button type="button" onClick={() => removeMetadataField(index)} className="p-2 text-rose-500"><X size={16} /></button>}
                </div>
              ))}
            </div>
          </div>

          {mode !== 'view' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg" placeholder="••••••" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg" placeholder="••••••" />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg">{mode === 'view' ? 'Close' : 'Cancel'}</button>
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

export default OtherUserModal;
