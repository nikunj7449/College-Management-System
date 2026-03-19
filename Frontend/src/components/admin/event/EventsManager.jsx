import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Plus, Search, Edit, Trash2, X, Calendar, MapPin, AlignLeft,
  Loader2, Save, LayoutGrid, List, MoreVertical, Eye, Clock, FileText,
  Image as ImageIcon, Users, Link as LinkIcon, CheckCircle, XCircle, Info
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../common/core/Pagination';
import DeleteConfirmModal from '../../modals/DeleteConfirmModal';
import EventCardSkeleton from '../../common/event/EventCardSkeleton';
import EventViewModal from '../../modals/EventViewModal';
import { hasPermission } from '../../../utils/permissionUtils';
import { AuthContext } from '../../../context/AuthContext';
import RejectionReasonModal from '../../custom/RejectionReasonModal';

const getEventStatus = (dateStr, startStr, endStr) => {
  if (!dateStr || !startStr) return 'Upcoming';
  const now = new Date();
  const start = new Date(`${dateStr}T${startStr}`);
  let end = new Date(`${dateStr}T${endStr || startStr}`);

  if (now < start) return 'Upcoming';
  if (now >= start && now <= end) return 'Ongoing';
  return 'Completed';
};

// Removed MOCK_EVENTS array

const EventCard = ({ event, onEdit, onDelete, onView, onApprove, onReject, userRole }) => {
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

  const status = getEventStatus(event.date, event.startTime, event.endTime);

  const statusColors = {
    'Upcoming': 'bg-blue-100/90 text-blue-700',
    'Ongoing': 'bg-emerald-100/90 text-emerald-700',
    'Completed': 'bg-slate-100/90 text-slate-700',
  };

  const approvalStatusColors = {
    'Pending': 'bg-amber-100/90 text-amber-700 ring-amber-200/50',
    'Approved': 'bg-emerald-100/90 text-emerald-700 ring-emerald-200/50',
    'Rejected': 'bg-rose-100/90 text-rose-700 ring-rose-200/50',
  };
  const badgeColor = statusColors[status] || statusColors['Upcoming'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:shadow-lg hover:z-30 transition-all duration-300 group relative flex flex-col h-full overflow-hidden">

      {/* Banner Image */}
      <div className="h-36 w-full bg-slate-100 relative">
        {event.imageURL ? (
          <img src={event.imageURL} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-50">
            <Calendar className="text-indigo-200" size={40} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm shadow-sm ${badgeColor}`}>
            {status}
          </span>
          {event.status && event.status !== 'Approved' && (
            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm shadow-sm ring-1 ${approvalStatusColors[event.status]}`}>
              {event.status}
            </span>
          )}
        </div>

        {/* Date Badge */}
        <div className="absolute -bottom-6 left-4 bg-white p-1 rounded-xl shadow-md border border-slate-100">
          <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 rounded-lg w-12 h-12">
            <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
            <span className="text-lg font-bold leading-none mt-0.5">{day}</span>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div
          className={`absolute top-3 right-3 z-10 ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-200`}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          <div className={`absolute right-0 top-0 bg-white/40 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60 p-2 flex flex-col gap-1.5 z-20 min-w-[100px] transition-all duration-300 ${showActions ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
            <div className="flex justify-center space-x-1.5">
              {onEdit && (
                <button onClick={() => onEdit(event)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                  <Edit size={16} />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(event)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') && event.status === 'Pending' && (
              <div className="flex justify-center space-x-1.5 pt-1 border-t border-white/20">
                <button onClick={() => onApprove(event)} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Approve">
                  <CheckCircle size={16} />
                </button>
                <button onClick={() => onReject(event)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="Reject">
                  <XCircle size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-center space-x-1.5">
              <button onClick={() => onView(event)} className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors w-full flex justify-center" title="View Details">
                <Eye size={16} />
              </button>
            </div>
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
            <span className="truncate">{event.location}</span>
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
              Org: <span className="font-medium text-slate-700">{event.organizer}</span>
            </div>
            <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 font-medium whitespace-nowrap">
              {event.type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventsManager = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const { user: loggedInUser, fetchLatestRole } = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  useEffect(() => {
    if (fetchLatestRole) {
      fetchLatestRole();
    }
  }, [fetchLatestRole]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (isModalOpen || isDeleteModalOpen || isRejectionModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isDeleteModalOpen, isRejectionModalOpen]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error fetching events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/events/${selectedEvent.id}`);
      setEvents(events.filter(ev => ev.id !== selectedEvent.id));
      toast.success('Event deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error deleting event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    navigate('/events/add');
  };

  const handleEditClick = (event) => {
    navigate(`/events/edit/${event.id}`, { state: { event } });
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleApprove = async (event) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/events/${event.id}/approve`);
      toast.success('Event approved successfully');
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error approving event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = (event) => {
    setSelectedEvent(event);
    setIsRejectionModalOpen(true);
  };

  const confirmRejection = async (reason) => {
    try {
      setIsSubmitting(true);
      await api.patch(`/events/${selectedEvent.id}/reject`, { reason });
      toast.success('Event rejected successfully');
      setIsRejectionModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rejecting event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && event.status === 'Pending') ||
      (activeTab === 'approved' && (event.status === 'Approved' || !event.status)) ||
      (activeTab === 'rejected' && event.status === 'Rejected');

    return matchesSearch && matchesTab;
  });

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

          <div className="flex bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`p-2 rounded-lg transition-all ${viewType === 'table' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List size={20} />
            </button>
          </div>

          {hasPermission(loggedInUser, 'EVENT', 'create') && (
            <button
              onClick={openCreateModal}
              className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              <Plus size={20} className="mr-2" />
              <span className="font-medium text-sm">Add Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {(loggedInUser?.role?.name === 'ADMIN' || loggedInUser?.role?.name === 'SUPERADMIN' || loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'SUPERADMIN') && (
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`px-6 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="capitalize">{tab}</span>
              {tab === 'pending' && events.filter(e => e.status === 'Pending').length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] rounded-full font-bold">
                  {events.filter(e => e.status === 'Pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => <EventCardSkeleton key={index} />)}
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
              onEdit={hasPermission(loggedInUser, 'EVENT', 'update') ? () => handleEditClick(event) : null}
              onDelete={hasPermission(loggedInUser, 'EVENT', 'delete') ? () => openDeleteModal(event) : null}
              onView={() => {
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              onApprove={handleApprove}
              onReject={handleReject}
              userRole={loggedInUser?.role?.name || loggedInUser?.role}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Details</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type / Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {currentEvents.map((event) => {
                  const status = getEventStatus(event.date, event.startTime, event.endTime);
                  const statusColors = {
                    'Upcoming': 'bg-blue-100 text-blue-700 border-blue-200',
                    'Ongoing': 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    'Completed': 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  const badgeColor = statusColors[status] || statusColors['Upcoming'];

                  return (
                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900 mb-0.5">{event.title}</div>
                        <div className="text-xs text-slate-500 truncate max-w-xs">{event.organizer ? `Org: ${event.organizer}` : 'No organizer'}</div>
                        {event.createdBy && event.createdBy.name && (
                          <div className="text-xs text-indigo-500 truncate max-w-xs mt-1">Creator: {event.createdBy.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{event.startTime} - {event.endTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin size={14} className="mr-1 text-slate-400" />
                          <span className="truncate max-w-[150px]">{event.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-600">
                            {event.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${badgeColor}`}>
                            {status}
                          </span>
                          {event.status && event.status !== 'Approved' && (
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                              event.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                              'bg-rose-100 text-rose-700 border-rose-200'
                            }`}>
                              {event.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {(loggedInUser?.role?.name === 'ADMIN' || loggedInUser?.role?.name === 'SUPERADMIN' || loggedInUser?.role === 'ADMIN' || loggedInUser?.role === 'SUPERADMIN') && event.status === 'Pending' && (
                            <>
                              <button onClick={() => handleApprove(event)} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Approve">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => handleReject(event)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="Reject">
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button onClick={() => {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }} className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                            <Eye size={18} />
                          </button>
                          {hasPermission(loggedInUser, 'EVENT', 'update') && (
                            <button onClick={() => handleEditClick(event)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                              <Edit size={18} />
                            </button>
                          )}
                          {hasPermission(loggedInUser, 'EVENT', 'delete') && (
                            <button onClick={() => openDeleteModal(event)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {
        isDeleteModalOpen && (
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDelete}
            deleteRole="event"
          />
        )
      }

      {
        isModalOpen && (
          <EventViewModal
            isOpen={isModalOpen}
            onClose={closeModal}
            event={selectedEvent}
          />
        )
      }

      {/* Custom Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={isRejectionModalOpen}
        onClose={() => {
          setIsRejectionModalOpen(false);
          setSelectedEvent(null);
        }}
        onConfirm={confirmRejection}
        eventTitle={selectedEvent?.title}
      />
    </div >
  );
};

export default EventsManager;
