import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { BookOpen, AlertCircle, Library, User, Loader2, Calendar } from 'lucide-react';
import CustomDropdown from '../../custom/CustomDropdown';

const StudentCourse = () => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('');

  const fetchMyCourses = async (sem = '') => {
    setLoading(true);
    try {
      const url = sem ? `/courses/my-courses?semester=${sem}` : '/courses/my-courses';
      const response = await api.get(url);
      if (response.data.success) {
        setCourseData(response.data.data);
        if (!sem && response.data.data.currentSemester) {
          // set default on first load
          setSelectedSemester(response.data.data.currentSemester.toString());
        }
      } else {
        setError('Failed to load courses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses(selectedSemester);
  }, [selectedSemester]);

  // Semester options for the dropdown
  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
    label: `Semester ${i + 1}`,
    value: String(i + 1)
  }));

  if (loading && !courseData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error && !courseData) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold">Error Loading Curriculum</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-indigo-600" /> My Curriculum
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {courseData ? (
              <>Viewing assigned subjects for <span className="text-indigo-600 font-bold">{courseData.course}</span> - <span className="text-indigo-600 font-bold">{courseData.branch}</span></>
            ) : (
              'Curriculum details'
            )}
          </p>
        </div>

        {/* Semester Filter */}
        <div className="w-full md:w-64 z-20">
            <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Semester</span>
            </div>
            <CustomDropdown
                options={semesterOptions}
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                placeholder="Choose Semester"
                name="semesterFilter"
            />
        </div>
      </div>

      {loading && courseData && (
          <div className="flex justify-center py-10 opacity-50">
               <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
      )}

      {!loading && (!courseData || !courseData.subjects?.length) ? (
        <div className="flex flex-col items-center justify-center text-center mt-20 p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <Library className="w-20 h-20 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">No Subjects Found</h2>
          <p className="text-slate-500 mt-2 max-w-md text-sm">No subjects are currently assigned to Semester {selectedSemester || courseData?.semester}.</p>
        </div>
      ) : (!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {courseData.subjects.map((sub, idx) => (
            <div key={sub._id || idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Library size={80} className="text-indigo-900 -mr-6 -mt-6 transform rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-wide">
                    {sub.code}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    {sub.credits} Credits
                  </span>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-6 leading-tight group-hover:text-indigo-700 transition-colors">
                  {sub.name}
                </h3>
                
                <div className="border-t border-slate-100 pt-5 mt-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Course Instructor</p>
                      {sub.faculty ? (
                        <p className="text-sm font-bold text-slate-700 truncate">{sub.faculty.name}</p>
                      ) : (
                        <p className="text-xs sm:text-sm font-medium text-amber-500 italic">Pending Assignment</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default StudentCourse;
