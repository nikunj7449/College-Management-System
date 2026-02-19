import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit, Trash2, X, Calendar, MapPin, AlignLeft,
  Loader2, Save, LayoutGrid, List, MoreVertical, Eye, Clock, FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../../common/Pagination';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import EventCardSkeleton from '../../common/EventCardSkeleton';

// Mock initial data
const MOCK_EVENTS = [
  { id: 1, title: 'Project Kickoff', date: '2024-01-15', location: 'Conference Room A', description: 'Initial meeting with the stakeholders to discuss project roadmap and deliverables.' },
  { id: 2, title: 'Design Review', date: '2024-01-20', location: 'Online (Zoom)', description: 'Reviewing the new UI mockups with the design team.' },
  { id: 3, title: 'Annual Hackathon', date: '2024-03-10', location: 'Innovation Hub', description: '24-hour coding challenge for all students. Great prizes to be won!' },
  { id: 4, title: 'Guest Lecture: AI Future', date: '2024-02-05', location: 'Auditorium', description: 'Dr. Smith discusses the future of Artificial Intelligence.' },
];

const EventCard = ({ event, onEdit, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowActions(false);
    }, 600);
  };

  const dateObj = new Date(event.date);
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:z-30 transition-all duration-300 group relative flex flex-col h-full">
      
      {/* Actions */}
      <div 
        className={`absolute top-4 right-4 z-10 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`} 
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        <button 
          onClick={() => setShowActions(!showActions)}
          className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
        >
          <MoreVertical size={20} />
        </button>
        
        <div className={`absolute right-0 top-0 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex flex-col gap-2 z-20 min-w-25 transition-all duration-200 origin-top-right ${showActions ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => onEdit(event)} 
                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => onDelete(event)} 
                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" 
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => onView(event)} 
                className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors" 
                title="View Details"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>
      </div>

      {/* Date Badge & Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-xl w-14 h-14 min-w-14 border border-indigo-100">
          <span className="text-xs font-bold uppercase">{month}</span>
          <span className="text-xl font-bold">{day}</span>
        </div>
        <div className="flex-1 pr-8">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-tight mb-1">{event.title}</h3>
          <div className="flex items-center text-xs text-slate-500 mt-1">
            <MapPin size={12} className="mr-1" />
            <span className="truncate">{event.location || 'No location'}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex-1 mb-4">
        <p className="text-sm text-slate-600 line-clamp-3">
          {event.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center">
          <Clock size={12} className="mr-1" />
          <span>All Day</span>
        </div>
        <span className="px-2 py-1 bg-slate-100 rounded-md text-slate-600">Event</span>
      </div>
    </div>
  );
};

const EventsManager = () => {
  // Data State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('grid');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'view'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // --- Effects ---

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- Handlers ---

  const fetchEvents = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEvents(MOCK_EVENTS);
      setLoading(false);
    }, 800);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.date) errors.date = 'Date is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (modalMode === 'create') {
        const newEvent = { ...formData, id: Date.now() };
        setEvents([...events, newEvent]);
        toast.success('Event created successfully');
      } else if (modalMode === 'edit' && selectedEvent) {
        setEvents(events.map(ev => ev.id === selectedEvent.id ? { ...formData, id: selectedEvent.id } : ev));
        toast.success('Event updated successfully');
      }
      setIsSubmitting(false);
      closeModal();
    }, 600);
  };

  const confirmDelete = () => {
    if (!selectedEvent) return;
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      setEvents(events.filter(ev => ev.id !== selectedEvent.id));
      toast.success('Event deleted successfully');
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
    }, 600);
  };

  // --- Modal Openers ---

  const openCreateModal = () => {
    setModalMode('create');
    setFormData(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setModalMode('edit');
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      location: event.location || '',
      description: event.description || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (event) => {
    setModalMode('view');
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      location: event.location || '',
      description: event.description || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFormData(initialFormState);
  };

  // --- Filtering & Pagination ---

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Events Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Schedule and manage upcoming events</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'grid' 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewType('table')}
              className={`p-2 rounded-lg transition-all ${
                viewType === 'table' 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List size={20} />
            </button>
          </div>

          {/* Add Button */}
          <button 
            onClick={openCreateModal}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-medium text-sm">Add Event</span>
          </button>
        </div>
      </div>
      
      {/* Content */}
      {loading ? (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        )
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-800">No events found</h3>
          <p className="text-slate-500">Try adjusting your search or add a new event.</p>
        </div>
      ) : viewType === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onEdit={openEditModal} 
              onDelete={openDeleteModal} 
              onView={openViewModal}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{event.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{event.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1 text-slate-400" />
                        {event.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => openViewModal(event)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => openEditModal(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(event)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredEvents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEvents.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit/View Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalMode === 'create' ? 'Add New Event' : modalMode === 'edit' ? 'Edit Event' : 'Event Details'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    disabled={modalMode === 'view'} 
                    type="text" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" 
                    placeholder="e.g., Annual Science Fair" 
                  />
                </div>
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      disabled={modalMode === 'view'} 
                      type="date" 
                      name="date" 
                      value={formData.date} 
                      onChange={handleInputChange} 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                  {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      disabled={modalMode === 'view'} 
                      type="text" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange} 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500" 
                      placeholder="e.g., Main Hall" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    disabled={modalMode === 'view'} 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500 resize-none" 
                    rows="4" 
                    placeholder="Details about the event..." 
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} className="mr-2" /> Save Event</>}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          deleteRole="event"
        />
      )}
    </div>
  );
};

export default EventsManager;
