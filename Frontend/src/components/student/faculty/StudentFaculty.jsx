import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Loader2, AlertCircle, Users, Mail, Phone, BookOpen, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import Pagination from '../../common/core/Pagination';
import FacultyViewModal from '../../modals/FacultyViewModal';

const StudentFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination stats
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchMyFaculty();
  }, []);

    // Lock body scroll when any modal is open
    useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
  
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isModalOpen]);

  const fetchMyFaculty = async () => {
    setLoading(true);
    try {
      const response = await api.get('/faculty/my-faculty');
      if (response.data.success) {
        setFacultyList(response.data.data);
      } else {
        setError('Failed to load faculty details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading department faculty...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Error Loading Faculty</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (facultyList.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <Users className="w-20 h-20 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">No Faculty Found</h2>
        <p className="text-slate-500 mt-2 max-w-md">There are currently no faculty members assigned to your branch. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <GraduationCap className="text-indigo-600 w-8 h-8" /> Department Faculty
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          View all instructing faculty members teaching within your current branch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {facultyList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((faculty) => (
          <div key={faculty._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative">
            
            {/* Header / Avatar Area */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 flex flex-col items-center justify-center relative overflow-hidden h-32">
               {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none">
                <Users size={120} className="text-white -mr-10 -mt-10" />
              </div>

               <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=ffffff&color=4f46e5&size=128&bold=true`}
                  alt={faculty.name}
                  className="w-20 h-20 rounded-2xl ring-4 ring-white shadow-lg z-10 translate-y-8 bg-white"
                />
            </div>

            {/* Profile Content */}
            <div className="pt-12 px-6 pb-6 flex flex-col flex-1">
              <div className="text-center mb-5">
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                  {faculty.name}
                </h3>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-600">
                  <Briefcase className="w-4 h-4" /> {faculty.designation}
                </div>
                
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                  ID: {faculty.facultyId}
                </div>
              </div>

              <div className="space-y-4 flex-1">
                 {/* Qualification */}
                <div className="flex items-start gap-3 text-sm">
                  <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-700 font-medium">{faculty.qualification || 'N/A'}</p>
                    <p className="text-slate-400 text-xs">Qualification</p>
                  </div>
                </div>

                {/* Subects */}
                <div className="flex items-start gap-3 text-sm">
                  <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                     <div className="flex flex-wrap gap-1 mt-1">
                        {faculty.subject && faculty.subject.length > 0 ? (
                            faculty.subject.map(sub => (
                                <span key={sub} className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                                    {sub}
                                </span>
                            ))
                        ) : (
                             <span className="text-slate-500 italic">No Subjects</span>
                        )}
                    </div>
                    <p className="text-slate-400 text-xs mt-1">Specializations</p>
                  </div>
                </div>
                
              </div>

              {/* Contact Footer & Actions */}
              <div className="pt-4 mt-5 border-t border-slate-100 flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                     <div className="flex items-center gap-2 text-slate-500 overflow-hidden" title={faculty.personalEmail || faculty.email}>
                        <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="truncate">{faculty.personalEmail || faculty.email}</span>
                     </div>
                     {faculty.phone && (
                         <div className="flex items-center justify-end gap-2 text-slate-500">
                            <span className="truncate">{faculty.phone}</span>
                            <Phone className="w-4 h-4 shrink-0 text-slate-400" />
                         </div>
                     )}
                  </div>
                  
                  <button 
                      onClick={() => { setSelectedFaculty(faculty); setIsModalOpen(true); }}
                      className="w-full mt-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white"
                  >
                      View Full Profile <ChevronRight className="w-4 h-4" />
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      {facultyList.length > itemsPerPage && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(facultyList.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <FacultyViewModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedFaculty(null); }} 
        faculty={selectedFaculty} 
      />
    </div>
  );
};

export default StudentFaculty;
