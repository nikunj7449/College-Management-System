import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Loader2, AlertCircle, CalendarRange, MapPin, CalendarDays, Clock, Users, ArrowRight } from 'lucide-react';
import EventViewModal from '../../modals/EventViewModal';

const StudentEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            if (response.data.success) {
                
                // 1. Filter globally for Student Audience
                const studentEvents = response.data.data.filter(e => {
                     return e.audience && e.audience.some(aud => 
                         aud.toLowerCase() === 'student' || aud.toLowerCase() === 'all' || aud.toLowerCase() === 'students'
                     );
                });

                // 2. Filter for Upcoming Student Events 
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const upcoming = studentEvents.filter(e => {
                     if (!e.date) return false;
                     const eventDate = new Date(e.date);
                     eventDate.setHours(0, 0, 0, 0);
                     return eventDate >= today;
                });
                
                // Temporarily show ALL student events if upcoming is empty
                if (upcoming.length === 0 && studentEvents.length > 0) {
                     setEvents(studentEvents);
                } else {
                     setEvents(upcoming);
                }
                
            } else {
                setError('Failed to fetch events');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading events');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Loading upcoming events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
                    <AlertCircle className="w-8 h-8 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold">Error Loading Events</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">

            {events.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm max-w-2xl mx-auto">
                    <CalendarDays className="w-20 h-20 mx-auto text-slate-300 mb-6" />
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">No Upcoming Events</h3>
                    <p className="text-slate-500 text-lg">Check back later for new activities and fests!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map((event) => {
                        const dateObj = new Date(event.date);
                        const month = dateObj.toLocaleString('default', { month: 'short' });
                        const day = dateObj.getDate();
                        const now = new Date();
                        const start = new Date(`${event.date}T${event.startTime}`);
                        let end = new Date(`${event.date}T${event.endTime || event.startTime}`);
                        let status = 'Upcoming';
                        if (now >= start && now <= end) status = 'Ongoing';
                        if (now > end) status = 'Completed';

                        const statusColors = {
                            'Upcoming': 'bg-blue-100/90 text-blue-700',
                            'Ongoing': 'bg-emerald-100/90 text-emerald-700',
                            'Completed': 'bg-slate-100/90 text-slate-700',
                        };
                        const badgeColor = statusColors[status] || statusColors['Upcoming'];

                        return (
                            <div key={event.id} className="bg-white rounded-2xl border border-slate-200 hover:shadow-lg hover:z-30 transition-all duration-300 group relative flex flex-col h-full overflow-hidden">
                                
                                {/* Banner Image */}
                                <div className="h-36 w-full bg-slate-100 relative">
                                    {event.imageURL ? (
                                        <img src={event.imageURL} alt={event.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                            <CalendarRange className="text-indigo-200" size={40} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm shadow-sm ${badgeColor}`}>
                                            {status}
                                        </span>
                                    </div>

                                    {/* Date Badge */}
                                    <div className="absolute -bottom-6 left-4 bg-white p-1 rounded-xl shadow-md border border-slate-100">
                                        <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-lg w-12 h-12">
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                                            <span className="text-lg font-bold leading-none mt-0.5">{day}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 pt-8 flex flex-col flex-1">
                                    <h3 className="text-base font-bold text-slate-800 line-clamp-2 leading-tight mb-2">{event.title}</h3>

                                    <div className="space-y-2 mb-4 mt-1 flex-1">
                                        <div className="flex items-center text-xs text-slate-600">
                                            <Clock size={14} className="mr-2 text-slate-400 shrink-0" />
                                            <span className="truncate">{event.startTime} - {event.endTime}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-slate-600">
                                            <MapPin size={14} className="mr-2 text-slate-400 shrink-0" />
                                            <span className="truncate">{event.venue || event.location}</span>
                                        </div>
                                        {event.audience && event.audience.length > 0 && (
                                            <div className="flex items-center text-xs text-slate-600">
                                                <Users size={14} className="mr-2 text-slate-400 shrink-0" />
                                                <span className="truncate">{event.audience.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-3 border-t border-slate-100 mt-auto flex flex-col gap-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="text-slate-500 truncate max-w-[60%]">
                                                Org: <span className="font-medium text-slate-700">{event.organizer || "Admin"}</span>
                                            </div>
                                            <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 font-medium whitespace-nowrap">
                                                {event.category || event.type || "General"}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                                            className="flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            Details <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <EventViewModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setSelectedEvent(null); }} 
                event={selectedEvent} 
            />
        </div>
    );
};

export default StudentEvents;
