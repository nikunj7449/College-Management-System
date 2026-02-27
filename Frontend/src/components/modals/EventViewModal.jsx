import React from 'react';
import { X, Calendar, MapPin, Clock, Users, AlignLeft, Target, Globe } from 'lucide-react';

const EventViewModal = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) return null;

    const dateObj = new Date(event.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header Image/Banner */}
                <div className="h-48 w-full bg-slate-100 relative shrink-0">
                    {event.imageURL ? (
                        <img src={event.imageURL} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                            <Calendar className="text-indigo-200" size={64} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm">
                                {event.type}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white leading-tight shadow-sm">
                            {event.title}
                        </h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Left Column - Main Details */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                                    <AlignLeft size={18} className="mr-2 text-indigo-600" />
                                    About Event
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {event.description || "No description provided."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                                        <Users size={14} className="mr-1.5" />
                                        Target Audience
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {event.audience && event.audience.length > 0 ? (
                                            event.audience.map((aud, i) => (
                                                <span key={i} className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                                    {aud}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-500 text-sm">Everyone</span>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                                        <Target size={14} className="mr-1.5" />
                                        Capacity
                                    </h4>
                                    <div className="text-slate-800 font-semibold text-sm">
                                        {event.capacity ? `${event.capacity} Attendees` : 'Unlimited'}
                                    </div>
                                </div>
                                {event.createdBy && event.createdBy.name && (
                                    <div className="flex items-center gap-3 mt-5 p-3 px-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 inline-flex">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {event.createdBy.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Created By</span>
                                            <span className="text-sm font-bold text-slate-800">{event.createdBy.name}</span>
                                        </div>
                                    </div>
                                )}  
                            </div>
                        </div>

                        {/* Right Column - Schedule & Settings */}
                        <div className="space-y-4">
                            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                        <Calendar size={14} className="mr-1.5" />
                                        Date
                                    </h4>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {formattedDate}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                        <Clock size={14} className="mr-1.5" />
                                        Time
                                    </h4>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {event.startTime} - {event.endTime}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                        <MapPin size={14} className="mr-1.5" />
                                        Location
                                    </h4>
                                    <p className="font-semibold text-slate-800 text-sm">
                                        {event.location}
                                    </p>
                                </div>

                                {event.meetingLink && (
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                            <Globe size={14} className="mr-1.5" />
                                            Meeting Link
                                        </h4>
                                        <a
                                            href={event.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-indigo-600 hover:text-indigo-800 text-sm truncate block"
                                        >
                                            {event.meetingLink}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Registration
                                </h4>
                                {event.allowRegistration ? (
                                    <div className="space-y-2">
                                        <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold tracking-wider">
                                            REQUIRED
                                        </span>
                                        {event.registrationDeadline && (
                                            <div className="text-xs text-slate-500">
                                                Deadline: <span className="font-medium text-slate-700">{new Date(event.registrationDeadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-600 rounded-md text-xs font-bold tracking-wider">
                                        NOT REQUIRED
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500 flex flex-col gap-1">
                        <div>
                            Organized by: <span className="font-semibold text-slate-700">{event.organizer}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventViewModal;
