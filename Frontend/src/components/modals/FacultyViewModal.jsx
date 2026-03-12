import React from 'react';
import { X, User, Mail, Phone, Calendar as CalendarIcon, BookOpen, GraduationCap, Briefcase, MapPin, Award } from 'lucide-react';

const FacultyViewModal = ({ isOpen, onClose, faculty }) => {
    if (!isOpen || !faculty) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-6 relative z-10">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=ffffff&color=4f46e5&size=128&bold=true`}
                            alt={faculty.name}
                            className="w-24 h-24 rounded-2xl ring-4 ring-white/20 shadow-lg object-cover bg-white"
                        />
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-1 shadow-sm">{faculty.name}</h2>
                            <div className="flex items-center gap-2 text-indigo-100 mb-2">
                                <Briefcase size={16} />
                                <span className="font-medium">{faculty.designation || 'Faculty Member'}</span>
                            </div>
                            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-md text-xs font-bold tracking-wider uppercase">
                                ID: {faculty.facultyId}
                            </span>
                        </div>
                    </div>
                    
                    {/* Decorative Background */}
                    <User className="absolute -bottom-10 -right-10 text-white opacity-10" size={180} />
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">Contact Details</h3>
                            
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                    <Mail className="text-indigo-600" size={18} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-400 font-medium">Email Address</p>
                                    <p className="text-sm font-semibold text-slate-700 truncate" title={faculty.personalEmail || faculty.email}>
                                        {faculty.personalEmail || faculty.email}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                    <Phone className="text-emerald-600" size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                                    <p className="text-sm font-semibold text-slate-700">{faculty.phone || 'N/A'}</p>
                                </div>
                            </div>

                            
                        </div>

                        {/* Academic Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">Academic Portfolio</h3>

                            <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <GraduationCap className="text-blue-600" size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Qualifications</p>
                                    <p className="text-sm font-semibold text-slate-700">{faculty.qualification || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                    <MapPin className="text-purple-600" size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Department Assignment</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold border border-slate-200">
                                            {faculty.course}
                                        </span>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-bold border border-slate-200">
                                            {faculty.branch}
                                        </span>
                                    </div>
                                    {faculty.sem && faculty.sem.length > 0 && (
                                         <p className="text-xs text-slate-500 mt-1">Sems: {faculty.sem.join(', ')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                    <BookOpen className="text-rose-600" size={18} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-medium mb-1">Teaching Subjects</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {faculty.subject && faculty.subject.length > 0 ? (
                                            faculty.subject.map((sub, i) => (
                                                <span key={i} className="px-2 py-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                                    {sub}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-500 italic">No assigned subjects</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                         <Award size={14} className="text-slate-400"/>
                         Joined: <span className="font-semibold text-slate-700">{formatDate(faculty.joiningDate)}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 focus:outline-[none] focus:ring-2 focus:ring-indigo-400"
                    >
                        Close Profile
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FacultyViewModal;
