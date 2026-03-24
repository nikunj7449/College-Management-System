import React, { useState } from 'react';
import {
    Calendar, MapPin, AlignLeft, Loader2, Save, Clock, FileText,
    Image as ImageIcon, Users, Link as LinkIcon, ArrowLeft,
    LayoutTemplate
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

import CustomDropdown from '../../custom/CustomDropdown';

const ALL_AUDIENCES = ['Students', 'Faculty', 'Staff', 'Alumni', 'All'];
const EVENT_TYPES = [
    { value: 'Seminar', label: 'Seminar' },
    { value: 'Workshop', label: 'Workshop' },
    { value: 'Webinar', label: 'Webinar' },
    { value: 'Cultural', label: 'Cultural' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Guest Lecture', label: 'Guest Lecture' },
    { value: 'Hackathon', label: 'Hackathon' },
    { value: 'Other', label: 'Other' }
];

const initialFormState = {
    imageURL: '',
    imageFile: null,
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: '',
    type: 'Seminar',
    organizer: '',
    audience: [],
    capacity: '',
    allowRegistration: false,
    registrationDeadline: '',
    meetingLink: '',
    description: ''
};

const getEventStatus = (dateStr, startStr, endStr) => {
    if (!dateStr || !startStr) return 'Upcoming';
    const now = new Date();
    const start = new Date(`${dateStr}T${startStr}`);
    let end = new Date(`${dateStr}T${endStr || startStr}`);

    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Ongoing';
    return 'Completed';
};

const EventCardPreview = ({ event }) => {
    const dateObj = new Date(event.date || new Date());
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate() || '--';

    const status = getEventStatus(event.date, event.startTime, event.endTime);

    const statusColors = {
        'Upcoming': 'bg-blue-100/90 text-blue-700',
        'Ongoing': 'bg-emerald-100/90 text-emerald-700',
        'Completed': 'bg-slate-100/90 text-slate-700',
    };
    const badgeColor = statusColors[status] || statusColors['Upcoming'];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow hover:shadow-lg flex flex-col h-[400px] overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
            {/* Banner Image */}
            <div className="h-44 w-full bg-slate-100 relative shrink-0">
                {event.imageURL ? (
                    <img src={event.imageURL} alt={event.title || 'Event Preview'} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50/80">
                        <ImageIcon className="text-indigo-200 mb-2" size={32} />
                        <span className="text-indigo-300 text-xs font-medium">No Image Provided</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider backdrop-blur-md shadow-sm border border-white/20 ${badgeColor}`}>
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
                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight mb-3">
                    {event.title || 'Your Event Title'}
                </h3>

                <div className="space-y-2.5 mb-4 mt-1 flex-1">
                    <div className="flex items-center text-sm text-slate-600">
                        <Clock size={16} className="mr-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{event.startTime || '--:--'} - {event.endTime || '--:--'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <MapPin size={16} className="mr-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{event.location || 'Location not set'}</span>
                    </div>
                    {event.audience && event.audience.length > 0 ? (
                        <div className="flex items-center text-sm text-slate-600">
                            <Users size={16} className="mr-3 text-indigo-400 shrink-0" />
                            <span className="truncate">{event.audience.join(', ')}</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-sm text-slate-400 italic">
                            <Users size={16} className="mr-3 text-slate-300 shrink-0" />
                            <span className="truncate">No audience selected</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between text-xs">
                    <div className="text-slate-500 truncate max-w-[60%]">
                        By: <span className="font-medium text-slate-700">{event.organizer || 'Organizer Dept'}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-600 font-medium whitespace-nowrap">
                        {event.type || 'Type'}
                    </span>
                </div>
            </div>
        </div>
    );
};

const AddEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, imageURL: reader.result, imageFile: file });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: '' });
        }
    };

    const handleAudienceToggle = (aud) => {
        let newAudience = [...formData.audience];
        if (aud === 'All') {
            newAudience = newAudience.includes('All') ? [] : ['All'];
        } else {
            if (newAudience.includes('All')) newAudience = newAudience.filter(a => a !== 'All');
            if (newAudience.includes(aud)) {
                newAudience = newAudience.filter(a => a !== aud);
            } else {
                newAudience.push(aud);
            }
        }
        setFormData({ ...formData, audience: newAudience });
        if (formErrors.audience) setFormErrors({ ...formErrors, audience: '' });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        } else if (formData.title.length < 5 || formData.title.length > 100) {
            errors.title = 'Title must be between 5 and 100 characters';
        }

        if (!formData.date) {
            errors.date = 'Date is required';
        } else if (new Date(formData.date) < new Date(new Date().setHours(0, 0, 0, 0))) {
            errors.date = 'Date cannot be in the past';
        }

        if (!formData.startTime) errors.startTime = 'Start time is required';
        if (!formData.endTime) errors.endTime = 'End time is required';

        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                errors.endTime = 'End time must be after start time';
            }
        }

        if (!formData.location.trim()) errors.location = 'Location is required';
        if (!formData.type) errors.type = 'Event type is required';
        if (!formData.organizer.trim()) errors.organizer = 'Organizer is required';

        if (formData.capacity && parseInt(formData.capacity) <= 0) {
            errors.capacity = 'Capacity must be a positive number';
        }
        if (formData.audience.length === 0) {
            errors.audience = 'Select at least one target audience';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            setIsSubmitting(true);

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('date', formData.date);
            submitData.append('startTime', formData.startTime);
            submitData.append('endTime', formData.endTime);
            submitData.append('location', formData.location);
            submitData.append('type', formData.type);
            submitData.append('organizer', formData.organizer);
            submitData.append('capacity', formData.capacity || '');
            submitData.append('allowRegistration', formData.allowRegistration);
            submitData.append('registrationDeadline', formData.registrationDeadline || '');
            submitData.append('meetingLink', formData.meetingLink || '');
            submitData.append('description', formData.description || '');

            // Append array items
            formData.audience.forEach(aud => submitData.append('audience', aud));

            // Append file
            if (formData.imageFile) {
                submitData.append('imageURL', formData.imageFile);
            }

            await api.post('/events', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Event created and published successfully!');
            navigate('/events');
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message || 'Error creating event');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto mb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/events')}
                        className="p-2.5 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors border border-slate-200"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Create New Event</h1>
                        <p className="text-slate-500 text-sm mt-1">Design and publish an event to the campus dashboard</p>
                    </div>
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Left Side: Form */}
                <div className="w-full lg:w-2/3 bg-slate-50/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 relative">
                    <form id="add-event-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Basic Info Section */}
                        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-inner">1</div>
                                <h4 className="font-semibold text-slate-800 text-lg">Basic Information</h4>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full pl-11 pr-4 py-3 text-base border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${formErrors.title ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        placeholder="e.g., Annual Science Fair 2024"
                                    />
                                </div>
                                {formErrors.title && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type <span className="text-red-500">*</span></label>
                                    <CustomDropdown
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        options={EVENT_TYPES}
                                        placeholder="Select Event Type"
                                    />
                                    {formErrors.type && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.type}</p>}
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-slate-700">Banner Image</label>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full px-4 py-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-xl bg-white transition-all cursor-pointer h-[50px] flex items-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${formData.description.length >= 500 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {formData.description.length} / 500
                                    </span>
                                </div>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3.5 top-4 text-slate-400" size={18} />
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        maxLength={500}
                                        className="w-full pl-11 pr-4 py-3.5 text-base border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none bg-white hover:border-slate-300 min-h-[120px]"
                                        placeholder="Provide a detailed overview of what participants can expect..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Schedule Section */}
                        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-inner">2</div>
                                <h4 className="font-semibold text-slate-800 text-lg">Schedule & Timing</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-3 py-3 text-base border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${formErrors.date ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        />
                                    </div>
                                    {formErrors.date && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-3 py-3 text-base border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${formErrors.startTime ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        />
                                    </div>
                                    {formErrors.startTime && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.startTime}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Time <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-3 py-3 text-base border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${formErrors.endTime ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        />
                                    </div>
                                    {formErrors.endTime && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.endTime}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Location & Audience Section */}
                        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-inner">3</div>
                                <h4 className="font-semibold text-slate-800 text-lg">Location & Audience</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location Venue <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-4 py-3 text-base border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${formErrors.location ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                            placeholder="e.g., Main Auditorium, North Campus"
                                        />
                                    </div>
                                    {formErrors.location && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.location}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hosting Organizer <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="organizer"
                                            value={formData.organizer}
                                            onChange={handleInputChange}
                                            className={`w-full pl-11 pr-4 py-3 text-base border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${formErrors.organizer ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                            placeholder="e.g., Computer Science Department"
                                        />
                                    </div>
                                    {formErrors.organizer && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.organizer}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">Target Audience <span className="text-slate-400 font-normal ml-1">(Multi-select)</span> <span className="text-red-500">*</span></label>
                                <div className="flex flex-wrap gap-3">
                                    {ALL_AUDIENCES.map((aud) => (
                                        <button
                                            key={aud}
                                            type="button"
                                            onClick={() => handleAudienceToggle(aud)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border shadow-sm
                        ${formData.audience.includes(aud)
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-1 ring-offset-white'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                        >
                                            {aud}
                                        </button>
                                    ))}
                                </div>
                                {formErrors.audience && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.audience}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Capacity <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                                <div className="relative">
                                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className={`w-full pl-11 pr-4 py-3 text-base border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all ${formErrors.capacity ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        placeholder="e.g., 100"
                                    />
                                </div>
                                {formErrors.capacity && <p className="text-red-500 text-sm mt-2 font-medium">{formErrors.capacity}</p>}
                            </div>
                        </div>

                        {/* 4. Settings Section */}
                        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-inner">4</div>
                                <h4 className="font-semibold text-slate-800 text-lg">Remote Settings & Registration</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Virtual Meeting Link <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="url"
                                            name="meetingLink"
                                            value={formData.meetingLink}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 text-base border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-white hover:border-slate-300"
                                            placeholder="https://meet.google.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center md:justify-center p-4 bg-slate-50 border border-slate-100 rounded-xl mt-6 md:mt-0">
                                    <label className="flex items-center cursor-pointer group w-full justify-between sm:justify-start">
                                        <div className="mr-4 text-base font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Enable Attendee Registration</div>
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="allowRegistration"
                                                checked={formData.allowRegistration}
                                                onChange={handleInputChange}
                                                className="sr-only"
                                            />
                                            <div className={`block w-14 h-8 rounded-full transition-colors ${formData.allowRegistration ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow transition-transform duration-200 ${formData.allowRegistration ? 'transform translate-x-6' : ''}`}></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {formData.allowRegistration && (
                                <div className="pt-5 border-t border-slate-100 mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="md:w-1/2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Cut-off Date</label>
                                        <input
                                            type="date"
                                            name="registrationDeadline"
                                            value={formData.registrationDeadline}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all bg-white hover:border-slate-300"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6 justify-end border-t border-slate-200/60 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/events')}
                                className="px-6 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold shadow-sm text-base"
                            >
                                Cancel Process
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center min-w-[200px] font-bold shadow-md shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-base"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : <><Save size={22} className="mr-2" /> Publish Event</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Live Preview (Sticky on Desktop) */}
                <div className="w-full lg:w-1/3 lg:sticky lg:top-8 bg-slate-50/80 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shadow-inner">
                            <LayoutTemplate size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Live Preview</h3>
                            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5">Real-time Rendering</p>
                        </div>
                    </div>

                    <div className="bg-slate-200/50 rounded-2xl p-4 border-2 border-slate-200 border-dashed relative">
                        {/* The actual preview card */}
                        <EventCardPreview event={formData} />
                    </div>

                    {/* Helpful tips section */}
                    <div className="mt-8 bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100 rounded-bl-full -z-10 opacity-50"></div>
                        <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                            Optimization Tips
                        </h4>
                        <ul className="text-indigo-800/80 text-xs leading-relaxed space-y-2 list-none p-0 mt-3 font-medium">
                            <li>• Use landscape images for the banner (16:9 ratio).</li>
                            <li>• Keep titles under 50 characters for best display.</li>
                            <li>• Double check the schedule to avoid 'Completed' tags.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEvent;
