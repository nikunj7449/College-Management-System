import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Loader2, AlertCircle, User, Mail, Phone, GraduationCap, Building, Book, Users, Edit2, Check, X, Camera, Save, Calendar, BadgeCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const FacultyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      phone: '',
      personalEmail: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/faculty/profile/me');
      if (response.data.success) {
        const facultyData = response.data.data;
        setProfile(facultyData);
        setEditForm({
            phone: facultyData.phone || '',
            personalEmail: facultyData.personalEmail || '',
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
          const response = await api.put('/faculty/profile/me', editForm);
          if (response.data.success) {
              setProfile(response.data.data);
              setIsEditing(false);
              toast.success('Profile updated successfully!');
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
        phone: profile.phone || '',
        personalEmail: profile.personalEmail || '',
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                <User className="text-indigo-600 w-8 h-8" /> Faculty Profile
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                Manage your professional identity and contact settings
                </p>
            </div>
            
            {!isEditing ? (
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl flex items-center gap-2 transition-colors border border-indigo-200/50 shadow-sm"
                 >
                     <Edit2 className="w-4 h-4" /> Edit Contact Info
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
                    <div className="h-32 bg-gradient-to-br from-indigo-500 to-indigo-700 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>
                    </div>

                    {/* Avatar Container */}
                    <div className="px-6 flex flex-col items-center relative -mt-16 text-center">
                        <div className="relative group">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=ffffff&color=4f46e5&size=150&bold=true`}
                                alt={profile.name}
                                className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                            />
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mt-5">{profile.name}</h2>
                        
                        <div className="mt-3 inline-flex items-center justify-center px-4 py-1.5 bg-indigo-50 text-indigo-700 font-black text-sm uppercase tracking-wider rounded-lg border border-indigo-100">
                             FACULTY ID: {profile.facultyId}
                        </div>
                        <p className="mt-2 text-indigo-600 font-bold text-sm bg-indigo-50/50 px-3 py-1 rounded-full">{profile.designation}</p>
                    </div>

                    <div className="p-6 mt-2 space-y-4">
                        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</p>
                                 <p className="text-slate-800 font-bold truncate px-1" title={Array.isArray(profile.subject) ? profile.subject.join(', ') : profile.subject}>
                                    {Array.isArray(profile.subject) ? profile.subject[0] : profile.subject}
                                 </p>
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Joined</p>
                                 <p className="text-slate-800 font-bold">{new Date(profile.joiningDate || profile.createdAt).getFullYear()}</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Qualification Card */}
                <div className="mt-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-indigo-500" /> Qualification
                    </h3>
                    <p className="text-slate-800 font-bold leading-relaxed">{profile.qualification}</p>
                </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Academic Context block */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                         <Building className="w-5 h-5 text-indigo-500" /> Professional Assignment
                         <span className="ml-auto text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold italic border border-slate-200">System Managed</span>
                     </h3>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         
                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                 <Building className="text-indigo-600 w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Branch</p>
                                 <p className="text-lg font-black text-slate-800 mt-0.5">{profile.branch}</p>
                             </div>
                         </div>

                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                 <Book className="text-indigo-600 w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Dept</p>
                                 <p className="text-lg font-black text-slate-800 mt-0.5">{profile.course}</p>
                             </div>
                         </div>
                         
                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                 <Calendar className="text-indigo-600 w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semesters Taught</p>
                                 <p className="text-lg font-black text-slate-800 mt-0.5">
                                     {Array.isArray(profile.sem) ? profile.sem.join(', ') : profile.sem}
                                 </p>
                             </div>
                         </div>

                         <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                                 <Mail className="text-slate-500 w-5 h-5" />
                             </div>
                             <div className="overflow-hidden">
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Email (Login)</p>
                                 <p className="text-[15px] font-bold text-slate-700 mt-0.5 truncate" title={profile.email}>{profile.email}</p>
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
                        <div className="flex flex-col gap-1.5 ">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Mobile Phone <span className="text-red-400">*</span></label>
                            {isEditing ? (
                                <input 
                                    name="phone"
                                    value={editForm.phone}
                                    onChange={handleEditChange}
                                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 px-4 shadow-sm" 
                                    placeholder="Enter your mobile number"
                                />
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 px-4 text-slate-800 font-bold text-[15px]">
                                    {profile.phone || 'Not provided'}
                                </div>
                            )}
                        </div>
                        
                        {/* Personal Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Personal Email <span className="text-red-400">*</span></label>
                            {isEditing ? (
                                <input 
                                    type="email"
                                    name="personalEmail"
                                    value={editForm.personalEmail}
                                    onChange={handleEditChange}
                                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-3 px-4 shadow-sm" 
                                    placeholder="Enter your personal email"
                                />
                            ) : (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 px-4 text-slate-800 font-bold text-[15px] truncate" title={profile.personalEmail}>
                                    {profile.personalEmail || 'Not provided'}
                                </div>
                            )}
                        </div>
                     </div>
                     {isEditing && (
                         <div className="mt-6 flex items-start gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                             <BadgeCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                             <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                Updating these contact details will ensure you receive institutional communications, salary slips, and emergency alerts on your verified personal channels.
                             </p>
                         </div>
                     )}
                </div>

            </div>
        </div>
    </div>
  );
};

export default FacultyProfile;
