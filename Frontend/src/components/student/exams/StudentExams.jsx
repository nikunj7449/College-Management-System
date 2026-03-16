import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Loader2, AlertCircle, FileText, Calendar, Clock, Award, Bookmark, BookOpen, UserSquare2, TrendingUp, ChevronRight } from 'lucide-react';
import Pagination from '../../common/core/Pagination';
import PerformanceDetailModal from './PerformanceDetailModal';


const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'results'
  const [selectedPerformance, setSelectedPerformance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchData();
  }, []);

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

  // Reset pagination when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsRes, perfRes] = await Promise.all([
        api.get('/exams/my-exams'),
        api.get('/performance/my-performance')
      ]);

      if (examsRes.data.success && perfRes.data.success) {
        setExams(examsRes.data.data);
        setPerformance(perfRes.data.data);
      } else {
        setError('Failed to load exam data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedPerformance(record);
    setIsModalOpen(true);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'O': case 'A+': case 'A': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'B+': case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'F': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const currentData = activeTab === 'upcoming' 
    ? exams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) 
    : performance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
  const totalPages = Math.ceil((activeTab === 'upcoming' ? exams.length : performance.length) / itemsPerPage);

  if (loading) {
     return (
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Loading assessments...</p>
        </div>
      );
  }

  if (error) {
     return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold">Error Loading Exams</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <FileText className="text-indigo-600 w-8 h-8" /> Exams & Results
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Keep track of your upcoming assessments and previous performance records.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Calendar size={100} className="text-white -mr-8 -mt-8" />
            </div>
            <p className="text-indigo-100 font-medium uppercase tracking-wider text-sm mb-1">Upcoming Exams</p>
            <h2 className="text-4xl font-black">{exams.length}</h2>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <Award size={100} className="text-emerald-500 -mr-8 -mt-8" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">Declared Results</p>
            <h2 className="text-4xl font-black text-slate-800">{performance.length}</h2>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-center">
            <div className="flex items-center gap-3 text-slate-600 mb-2">
               <TrendingUp className="text-indigo-500" />
               <span className="font-bold text-sm uppercase tracking-wider">Overall Status</span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
               Consistently review your performance and upcoming schedule to stay on top of your curriculum.
            </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none ${
            activeTab === 'upcoming' 
              ? 'bg-white text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          Upcoming Exams
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all focus:outline-none flex items-center gap-2 ${
            activeTab === 'results' 
              ? 'bg-white text-indigo-700 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          My Results {performance.length > 0 && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{performance.length}</span>}
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {exams.length === 0 ? (
             <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">No Upcoming Exams</h3>
                <p className="text-slate-500 mt-2">You currently have no scheduled exams in your calendar.</p>
             </div>
          ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentData.map(exam => (
                    <div key={exam._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                               {exam.type}
                            </span>
                            {exam.status && (
                              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border w-fit ${
                                exam.status === 'Ongoing' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {exam.status === 'Ongoing' ? '🟢 Ongoing' : '⏳ Upcoming'}
                              </span>
                            )}
                          </div>
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shrink-0">
                               <span className="text-xs font-bold text-slate-400 leading-none">{new Date(exam.date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase()}</span>
                               <span className="text-lg font-black text-indigo-600 leading-tight">{new Date(exam.date).getDate()}</span>
                          </div>
                       </div>
                       
                       <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{exam.name}</h3>
                       
                       {exam.description && (
                         <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                           {exam.description}
                         </p>
                       )}
                       
                       <div className="space-y-3 mt-auto pt-4 border-t border-slate-100 shrink-0">
                           {(exam.course?.name || exam.semester) && (
                             <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                               <BookOpen className="w-4 h-4 text-slate-400" />
                               {exam.course?.name}{exam.course?.name && exam.semester ? ' · ' : ''}{exam.semester ? `Sem ${exam.semester}` : ''}
                             </div>
                           )}
                           <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {exam.startTime && exam.endTime ? `${exam.startTime} - ${exam.endTime}` : 'Time TBD'}
                           </div>
                           <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {new Date(exam.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                           </div>
                           {exam.totalMarks && (
                             <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                               <Award className="w-4 h-4 text-slate-400" />
                               Total: <span className="font-bold text-slate-800">{exam.totalMarks}</span>
                               {exam.passingMarks && <span className="text-slate-400">· Pass: {exam.passingMarks}</span>}
                             </div>
                           )}
                        </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
            </>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-6">
          {performance.length === 0 ? (
             <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <Award className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">No Results Declared</h3>
                <p className="text-slate-500 mt-2">Your performance results have not been published yet.</p>
             </div>
          ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentData.map(record => (
                    <div key={record._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                       {/* Result Header */}
                       <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-start justify-between relative">
                          <div>
                             <h3 className="font-bold text-slate-800 max-w-[200px] truncate" title={record.exam?.name}>{record.exam?.name || 'Unknown Exam'}</h3>
                             <p className="text-xs text-slate-500 mt-1 font-medium bg-white px-2 py-0.5 rounded border inline-block uppercase">{record.exam?.type || 'Assessment'}</p>
                          </div>
                          
                          <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 shadow-sm shrink-0 ${getGradeColor(record.grade)}`}>
                             <span className="text-xl font-black leading-none">{record.grade}</span>
                          </div>
                       </div>
                       
                       <div className="p-6 flex-1 flex flex-col">
                           {/* Subjects Map - Simplified Breakdown */}
                           <div className="mb-6 flex-1">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                 <BookOpen className="w-4 h-4" /> Subject Breakdown
                              </h4>
                              {record.subjects && record.subjects.length > 0 ? (
                                 <div className="space-y-2">
                                   {record.subjects.slice(0, 3).map((sub, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                         <span className="text-sm font-semibold text-slate-700 truncate pr-4">{sub.subjectName}</span>
                                         <span className="text-sm font-black text-indigo-600 shrink-0">{sub.marksObtained}</span>
                                      </div>
                                   ))}
                                   {record.subjects.length > 3 && (
                                     <p className="text-[10px] text-center text-slate-400 font-bold uppercase mt-1">+{record.subjects.length - 3} More Subjects</p>
                                   )}
                                 </div>
                              ) : (
                                  <p className="text-sm text-slate-500 italic">No detailed breakdown provided.</p>
                              )}
                           </div>
                           
                           {/* Action & Meta */}
                           <div className="pt-4 border-t border-slate-100 space-y-4 shrink-0">
                               <button 
                                 onClick={() => handleViewDetails(record)}
                                 className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors group/btn"
                               >
                                  View Detailed Report <ChevronRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
                               </button>

                               <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                   <UserSquare2 className="w-4 h-4" /> 
                                   Evaluator: {record.faculty?.name || 'Unknown'}
                               </div>
                           </div>
                       </div>
                    </div>
                  ))}
                </div>
                 {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <PerformanceDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedPerformance}
      />
    </div>
  );
};

export default StudentExams;
