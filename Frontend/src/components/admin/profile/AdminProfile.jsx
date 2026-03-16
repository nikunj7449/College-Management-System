import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Loader2, AlertCircle, User, Mail, Phone, Shield, ShieldCheck, Edit2, X, Save, Calendar, BadgeCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      name: '',
      phone: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admins/profile/me');
      if (response.data.success) {
        const adminData = response.data.data;
        setProfile(adminData);
        setEditForm({
            name: adminData.name || '',
            phone: adminData.phone || '',
        });
      } else {
        setError('Failed to load profile details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
      setEditForm({
          ...editForm,
          [e.target.name]: e.target.value
      });
  };

  const handleSaveProfile = async () => {
      setSaving(true);
      try {
          const response = await api.put('/admins/profile/me', editForm);
          if (response.data.success) {
              setProfile(response.data.data);
              setIsEditing(false);
              toast.success('Profile updated successfully!');
              // Note: If name changed, we might need to refresh global state if name is stored there
              // but for now, the local state is updated.
          }
      } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to update profile');
      } finally {
          setSaving(false);
      }
  };

  const cancelEdit = () => {
      setIsEditing(false);
      setEditForm({
        name: profile.name || '',
        phone: profile.phone || '',
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Error Loading Profile</h3>
            <p className="text-sm">{error || "Profile data missing."}</p>
          </div>
          <button onClick={fetchProfile} className="ml-auto px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold transition-colors">
              Retry
          </button>
        </div>
      </div>
    );
  }

  const isSuperAdmin = profile.role === 'SUPERADMIN';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <Shield className="text-indigo-600 w-8 h-8" /> {isSuperAdmin ? 'Superadmin' : 'Admin'} Profile
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                Manage your administrative account and security settings
                </p>
            </div>
            
            {!isEditing ? (
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center gap-2 transition-colors border border-indigo-200/50 shadow-sm"
                 >
                     <Edit2 className="w-4 h-4" /> Edit Profile
                 </button>
            ) : (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={cancelEdit}
                        disabled={saving}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-colors border border-slate-200"
                    >
                        <X className="w-4 h-4" /> Cancel
                    </button>
                    <button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - ID Card */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
                    {/* Header Gradient */}
                    <div className={`h-32 bg-gradient-to-br ${isSuperAdmin ? 'from-purple-600 to-indigo-700' : 'from-indigo-500 to-indigo-700'} relative`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>
                    </div>

                    {/* Avatar Container */}
                    <div className="px-6 flex flex-col items-center relative -mt-16 text-center">
                        <div className="relative group">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=ffffff&color=${isSuperAdmin ? '7c3aed' : '4f46e5'}&size=150&bold=true`}
                                alt={profile.name}
                                className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                            />
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mt-5">{profile.name}</h2>
                        
                        <div className={`mt-3 inline-flex items-center justify-center px-4 py-1.5 ${isSuperAdmin ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'} font-black text-sm uppercase tracking-wider rounded-lg border`}>
                             ADMIN ID: {profile.adminId}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                            <ShieldCheck className={`w-4 h-4 ${isSuperAdmin ? 'text-purple-600' : 'text-indigo-600'}`} />
                            {profile.role} Account
                        </div>
                    </div>

                    <div className="p-6 mt-2 space-y-4">
                        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-4 text-center">
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Created</p>
                                 <p className="text-slate-800 font-bold">{new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* System Permissions Card */}
                <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-indigo-500" /> Administrative Access
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> User Management
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Configuration
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Security Logs
                        </div>
                        {isSuperAdmin && (
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                               <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Role & Permission Master
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Account details block */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Shield className="w-5 h-5 text-indigo-500" /> Account Information
                         <span className="ml-auto text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold italic border border-slate-200">Official Profile</span>
                     </h3>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         
                        {/* Official Name */}
                        <div className="flex flex-col gap-1.5 ">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Display Name <span className="text-red-400">*</span></label>
                            {isEditing ? (
                                <input 
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 px-4 shadow-sm" 
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 px-4 text-slate-800 font-bold text-[15px]">
                                    {profile.name}
                                </div>
                            )}
                        </div>

                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                 <Mail className="text-indigo-600 w-5 h-5" />
                             </div>
                             <div className="overflow-hidden">
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Email (Login)</p>
                                 <p className="text-[15px] font-bold text-slate-700 mt-0.5 truncate" title={profile.email}>{profile.email}</p>
                             </div>
                         </div>

                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                 <Calendar className="text-indigo-600 w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</p>
                                 <p className="text-lg font-black text-slate-800 mt-0.5">
                                    {profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'N/A'}
                                 </p>
                             </div>
                         </div>
                         
                     </div>
                </div>

                {/* Editable Contact block */}
                <div className={`bg-white rounded-3xl border ${isEditing ? 'border-indigo-400 shadow-md ring-2 ring-indigo-50' : 'border-slate-200 shadow-sm'} p-6 md:p-8 transition-all duration-300`}>
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Phone className={`w-5 h-5 ${isEditing ? 'text-indigo-600' : 'text-slate-400'}`} /> Contact Information
                         {isEditing && <span className="ml-auto text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-black uppercase tracking-widest animate-pulse">Edit Mode</span>}
                     </h3>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Mobile */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2 max-w-sm">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 font-sans">Contact Phone Number</label>
                            {isEditing ? (
                                <input 
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 px-4 shadow-sm" 
                                    placeholder="Enter your phone number"
                                />
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 px-4 text-slate-800 font-bold text-[15px]">
                                    {profile.phone || 'Not provided'}
                                </div>
                            )}
                        </div>
                     </div>
                     {isEditing && (
                         <div className="mt-6 flex items-start gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                             <Shield className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                             <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                Maintaining accurate contact information is vital for security verification, multi-factor authentication (MFA) requests, and critical system alerts.
                             </p>
                         </div>
                     )}
                </div>

            </div>
        </div>
    </div>
  );
};

export default AdminProfile;
