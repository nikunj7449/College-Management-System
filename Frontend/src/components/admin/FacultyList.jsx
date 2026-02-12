import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, X, Loader, Edit, Trash2, AlertTriangle, BookOpen, GraduationCap, Briefcase, User, GitBranch, Layers, Eye, LayoutGrid, List, Filter, UploadCloud, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CustomDropdown = ({ options, value, onChange, name, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`block truncate ${value ? 'text-slate-900' : 'text-slate-500'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={20} className="text-slate-400 shrink-0" />
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange({ target: { name, value: opt } });
                setIsOpen(false);
              }}
              className="px-4 py-2.5 hover:bg-indigo-50 text-slate-700 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-0"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MultiSelectDropdown = ({ options, value = [], onChange, name, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(item => item !== option)
      : [...value, option];
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`block truncate ${value.length > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
          {value.length > 0 ? `${value.length} selected` : placeholder}
        </span>
        <ChevronDown size={20} className="text-slate-400 shrink-0" />
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => toggleOption(opt)}
              className="px-4 py-2.5 hover:bg-indigo-50 text-slate-700 cursor-pointer text-sm transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between"
            >
              <span>{opt}</span>
              {value.includes(opt) && <Check size={16} className="text-indigo-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FacultyList = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ designation: [], branch: [], course: [], sem: [], subject: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [pageInput, setPageInput] = useState('');

  const initialFormState = {
    name: '',
    facultyId: '',
    personalEmail: '',
    phone: '',
    dob: '',
    qualification: '',
    designation: '',
    salary: '',
    course: '',
    joiningDate: '',
    subject: [],
    branch: '', 
    sem: [],
    documents: null
  };
  const faculty_designations = [
  "Adjunct Professor",
  "Assistant Professor",
  "Associate Professor",
  "Guest Faculty",
  "Lecturer",
  "Postdoctoral Fellow",
  "Professor",
  "Research Assistant",
  "Research Associate",
  "Research Professor",
  "Senior Assistant Professor",
  "Senior Lecturer",
  "Senior Professor",
  "Teaching Assistant",
  "Visiting Professor"
]

  const [formData, setFormData] = useState(initialFormState);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const params = { search: searchTerm };
      if (filters.designation.length > 0) params.designation = filters.designation.join(',');
      if (filters.branch.length > 0) params.branch = filters.branch.join(',');
      if (filters.course.length > 0) params.course = filters.course.join(',');
      if (filters.sem.length > 0) params.sem = filters.sem.join(',');
      if (filters.subject.length > 0) params.subject = filters.subject.join(',');
      const response = await api.get('/faculty', { params });
      setFacultyList(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCoursesData(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(fetchFaculty, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'documents') {
      if (e.target.files.length > 3) {
        toast.error('You can select a maximum of 3 documents.');
        e.target.value = ''; // Clear the file input
        setFormData({ ...formData, documents: null });
        return;
      }
      setFormData({ ...formData, documents: e.target.files });
    } else {
      const { name, value } = e.target;
      
      setFormData(prev => {
        const updatedData = { ...prev, [name]: name === 'facultyId' ? value.toUpperCase() : value };

        if (name === 'course') {
          updatedData.branch = '';
          updatedData.sem = [];
          updatedData.subject = [];
        } else if (name === 'branch') {
          updatedData.sem = [];
          updatedData.subject = [];
        } else if (name === 'sem') {
          const selectedCourse = coursesData.find(c => c.name === prev.course);
          const selectedBranch = selectedCourse?.branches.find(b => b.name === prev.branch);
          if (selectedBranch) {
            const validSubjects = selectedBranch.subjects.filter(sub => value.includes(sub.semester?.toString())).map(s => s.name);
            updatedData.subject = prev.subject.filter(s => validSubjects.includes(s));
          }
        }
        return updatedData;
      });
    }
  };

  const handleEdit = (faculty) => {
    setFormData({
      name: faculty.name,
      facultyId: faculty.facultyId || '',
      personalEmail: faculty.personalEmail || '',
      phone: faculty.phone,
      dob: faculty.dob ? new Date(faculty.dob).toISOString().split('T')[0] : '',
      qualification: faculty.qualification,
      designation: faculty.designation,
      salary: faculty.salary || '',
      joiningDate: faculty.joiningDate ? new Date(faculty.joiningDate).toISOString().split('T')[0] : '',
      course: faculty.course,
      subject: faculty.subject || [],
      branch: faculty.branch || '',
      sem: faculty.sem || [],
      documents: null
    });
    setIsEditMode(true);
    setIsViewMode(false);
    setEditingId(faculty._id);
    setIsModalOpen(true);
  };

  const handleView = (faculty) => {
    setFormData({
      name: faculty.name,
      facultyId: faculty.facultyId || '',
      personalEmail: faculty.personalEmail || '',
      phone: faculty.phone,
      dob: faculty.dob ? new Date(faculty.dob).toISOString().split('T')[0] : '',
      qualification: faculty.qualification,
      designation: faculty.designation,
      salary: faculty.salary || '',
      joiningDate: faculty.joiningDate ? new Date(faculty.joiningDate).toISOString().split('T')[0] : '',
      course: faculty.course,
      subject: faculty.subject || [],
      branch: faculty.branch || '',
      sem: faculty.sem || [],
      documents: null
    });
    setIsViewMode(true);
    setIsEditMode(false);
    setEditingId(faculty._id);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setFacultyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/faculty/${facultyToDelete}`);
      toast.success('Faculty deleted successfully');
      fetchFaculty();
      setIsDeleteModalOpen(false);
      setFacultyToDelete(null);
    } catch (error) {
      toast.error('Failed to delete faculty');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const dataToSend = new FormData();

      // Append all simple key-value pairs
      for (const key in formData) {
        if (key !== 'documents' && key !== 'subject' && key !== 'sem') {
          dataToSend.append(key, formData[key]);
        }
      }

      // Append subjects as separate fields for the array
      if (Array.isArray(formData.subject)) {
        formData.subject.forEach(sub => dataToSend.append('subject', sub));
      } else if (formData.subject) {
        formData.subject.split(',').map(item => item.trim()).filter(i => i).forEach(sub => {
          dataToSend.append('subject', sub);
        });
      }

      // Append sems as separate fields for the array
      if (Array.isArray(formData.sem)) {
        formData.sem.forEach(s => dataToSend.append('sem', s));
      } else if (formData.sem) {
        formData.sem.split(',').map(item => item.trim()).filter(i => i).forEach(s => {
          dataToSend.append('sem', s);
        });
      }

      // Append files
      if (formData.documents) {
        Array.from(formData.documents).forEach(file => {
          dataToSend.append('documents', file);
        });
      }

      if (isEditMode) {
        await api.put(`/faculty/${editingId}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Faculty updated successfully');
      } else {
        await api.post('/faculty', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Faculty added successfully');
      }

      setIsModalOpen(false);
      setFormData(initialFormState);
      setIsEditMode(false);
      setIsViewMode(false);
      setEditingId(null);
      fetchFaculty();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} faculty`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getShortBranch = (name) => {
    if (!name) return '';
    // If it's already short, return as is
    if (name.length <= 10) return name.toUpperCase();
    
    // Dynamic acronym generation
    const stopWords = ['of', 'and', '&', 'in', 'the', 'for'];
    return name
      .replace(/[\(\)]/g, '') // Remove parentheses
      .trim()
      .split(/[\s-]+/)
      .filter(word => !stopWords.includes(word.toLowerCase()) && word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Derived Options for Dropdowns
  const getCourseOptions = () => coursesData.map(c => c.name);
  
  const getBranchOptions = () => {
    const selectedCourse = coursesData.find(c => c.name === formData.course);
    return selectedCourse ? selectedCourse.branches.map(b => b.name) : [];
  };

  const getSemOptions = () => {
    const selectedCourse = coursesData.find(c => c.name === formData.course);
    if (!selectedCourse) return [];
    const totalSems = (selectedCourse.duration || 4) * 2;
    return Array.from({ length: totalSems }, (_, i) => (i + 1).toString());
  };

  const getSubjectOptions = () => {
    const selectedCourse = coursesData.find(c => c.name === formData.course);
    if (!selectedCourse) return [];
    const selectedBranch = selectedCourse.branches.find(b => b.name === formData.branch);
    if (!selectedBranch) return [];
    
    // Filter subjects based on selected semesters
    // If no semester selected, show nothing (or all? Prompt says "sem then subject")
    if (!formData.sem || formData.sem.length === 0) return [];

    const relevantSubjects = selectedBranch.subjects.filter(sub => 
      formData.sem.includes(sub.semester?.toString())
    );
    
    return relevantSubjects.map(s => s.name);
  };

  // Filter Options Helpers
  const getFilterBranchOptions = () => {
    if (filters.course.length === 0) return [];
    const selectedCourses = coursesData.filter(c => filters.course.includes(c.name));
    return Array.from(new Set(selectedCourses.flatMap(c => c.branches.map(b => b.name))));
  };

  const getFilterSemOptions = () => {
    if (filters.course.length === 0) return [];
    const selectedCourses = coursesData.filter(c => filters.course.includes(c.name));
    // Find max duration to cover all possible semesters
    const maxDuration = Math.max(...selectedCourses.map(c => c.duration || 4));
    const totalSems = maxDuration * 2;
    return Array.from({ length: totalSems }, (_, i) => (i + 1).toString());
  };

  const getFilterSubjectOptions = () => {
    if (filters.course.length === 0 || filters.branch.length === 0 || filters.sem.length === 0) return [];
    
    const selectedCourses = coursesData.filter(c => filters.course.includes(c.name));
    
    // Get branches that match selected branches
    const relevantBranches = selectedCourses.flatMap(c => c.branches).filter(b => filters.branch.includes(b.name));
    
    // Get subjects from those branches that match selected semesters
    const relevantSubjects = relevantBranches.flatMap(b => b.subjects).filter(sub => 
      filters.sem.includes(sub.semester?.toString())
    );
    
    return Array.from(new Set(relevantSubjects.map(s => s.name)));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // value is array from MultiSelectDropdown
    
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'course') {
        newFilters.branch = []; newFilters.sem = []; newFilters.subject = [];
      } else if (name === 'branch') {
        newFilters.sem = []; newFilters.subject = [];
      } else if (name === 'sem') {
        newFilters.subject = [];
      }
      return newFilters;
    });
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = facultyList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(facultyList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePageSearch = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput('');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage teaching staff and details</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search faculty..." 
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
          
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center px-4 py-2.5 border rounded-xl transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter size={20} />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-20">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Designation</label>
                    <MultiSelectDropdown
                      name="designation"
                      value={filters.designation} 
                      onChange={handleFilterChange}
                      options={faculty_designations}
                      placeholder="Select Designations"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Course</label>
                    <MultiSelectDropdown
                      name="course"
                      value={filters.course} 
                      onChange={handleFilterChange}
                      options={getCourseOptions()}
                      placeholder="Select Courses"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Branch</label>
                    <MultiSelectDropdown
                      name="branch"
                      value={filters.branch} 
                      onChange={handleFilterChange}
                      options={getFilterBranchOptions()}
                      placeholder="Select Branches"
                      disabled={filters.course.length === 0}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Semester</label>
                    <MultiSelectDropdown
                      name="sem"
                      value={filters.sem} 
                      onChange={handleFilterChange}
                      options={getFilterSemOptions()}
                      placeholder="Select Semesters"
                      disabled={filters.branch.length === 0}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Subject</label>
                    <MultiSelectDropdown
                      name="subject"
                      value={filters.subject} 
                      onChange={handleFilterChange}
                      options={getFilterSubjectOptions()}
                      placeholder="Select Subjects"
                      disabled={filters.sem.length === 0}
                    />
                  </div>
                  {(filters.designation.length > 0 || filters.branch.length > 0 || filters.course.length > 0 || filters.sem.length > 0 || filters.subject.length > 0) && (
                    <button 
                      onClick={() => setFilters({ designation: [], branch: [], course: [], sem: [], subject: [] })}
                      className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => { setIsModalOpen(true); setIsEditMode(false); setIsViewMode(false); setFormData(initialFormState); }}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-medium text-sm">Add Faculty</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Grid Layout */}
      {!loading && viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((faculty) => (
            <div key={faculty._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow duration-300 group relative">
              
              {/* Actions */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(faculty)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(faculty._id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleView(faculty)} className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&size=128`} 
                    alt={faculty.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{faculty.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium border border-indigo-100">
                  {faculty.designation}
                </span>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex items-center text-slate-600">
                  <GraduationCap size={16} className="mr-2 text-slate-400" />
                  <span className="truncate">{faculty.course}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <GitBranch size={16} className="mr-2 text-slate-400" />
                  <span className="truncate" title={faculty.branch}>{getShortBranch(faculty.branch)}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <Layers size={16} className="mr-2 text-slate-400" />
                  <span className="truncate">Sem: {faculty.sem?.join(', ')}</span>
                </div>
                <div className="flex items-center text-slate-600">
                  <BookOpen size={16} className="mr-2 text-slate-400" />
                  <span className="truncate" title={faculty.subject?.join(', ')}>{faculty.subject?.join(', ')}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail size={14} className="mr-2 text-slate-400" />
                  <span className="truncate">{faculty.personalEmail}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone size={14} className="mr-2 text-slate-400" />
                  <span className="truncate">{faculty.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Layout */}
      {!loading && viewType === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID & Designation</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((faculty) => (
                  <tr key={faculty._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(faculty.name)}&background=random&size=32`} 
                          alt="" 
                          className="w-10 h-10 rounded-full mr-3 object-cover border border-slate-200"
                        />
                        <span className="font-medium text-slate-900">{faculty.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-slate-700">{faculty.facultyId}</p>
                        <p className="text-slate-500 text-xs">{faculty.designation}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-700">{faculty.course}</p>
                        <p className="text-slate-500 text-xs" title={faculty.branch}>{getShortBranch(faculty.branch)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 space-y-1">
                        <div className="flex items-center"><Mail size={12} className="mr-1.5 text-slate-400"/> {faculty.personalEmail}</div>
                        <div className="flex items-center"><Phone size={12} className="mr-1.5 text-slate-400"/> {faculty.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {faculty.subject?.slice(0, 2).map((sub, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {sub}
                          </span>
                        ))}
                        {faculty.subject?.length > 2 && (
                          <span title={faculty.subject?.slice(2, faculty.subject?.length)} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            +{faculty.subject.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleView(faculty)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(faculty)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(faculty._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
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
      {!loading && facultyList.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-6 rounded-xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, facultyList.length)}</span> of{' '}
                <span className="font-medium">{facultyList.length}</span> results
              </p>
            </div>
            <form onSubmit={handlePageSearch} className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Go to page:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="w-16 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="#"
              />
            </form>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {(() => {
                  const pages = [];
                  if (totalPages <= 7) {
                     for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                     if (currentPage <= 4) {
                        pages.push(1, 2, 3, 4, 5, '...', totalPages);
                     } else if (currentPage >= totalPages - 3) {
                        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                     } else {
                        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                     }
                  }
                  return pages.map((page, idx) => (
                    <button
                      key={idx}
                      onClick={() => typeof page === 'number' ? paginate(page) : null}
                      disabled={page === '...'}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
                      } ${page === '...' ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {page}
                    </button>
                  ));
                })()}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {!loading && facultyList.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-800">No faculty found</h3>
          <p className="text-slate-500">Add a new faculty member to get started.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-800">{isViewMode ? 'Faculty Details' : (isEditMode ? 'Edit Faculty' : 'Add New Faculty')}</h2>
                    <button onClick={() => { setIsModalOpen(false); setFormData(initialFormState); setIsEditMode(false); setIsViewMode(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input disabled={isViewMode} required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" placeholder="e.g. Dr. Sarah Smith" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Faculty ID *</label>
                            <input disabled={isViewMode} required name="facultyId" value={formData.facultyId} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" placeholder="e.g. FAC001" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Personal Email *</label>
                            <input disabled={isViewMode} required type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                            <input disabled={isViewMode} required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                            <input disabled={isViewMode} required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Qualification *</label>
                            <input disabled={isViewMode} required name="qualification" value={formData.qualification} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" placeholder="e.g. M.Sc, PhD" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Designation *</label>
                            <CustomDropdown
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                options={faculty_designations}
                                placeholder="Select Designation"
                                disabled={isViewMode}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                            <input disabled={isViewMode} type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" placeholder="e.g. 50000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
                            <input disabled={isViewMode} type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Course *</label>
                            <CustomDropdown
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                options={getCourseOptions()}
                                placeholder="Select Course"
                                disabled={isViewMode}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Branch *</label>
                            <CustomDropdown
                                name="branch"
                                value={formData.branch}
                                onChange={handleChange}
                                options={getBranchOptions()}
                                placeholder="Select Branch"
                                disabled={isViewMode || !formData.course}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Semesters *</label>
                            {isViewMode ? (
                                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex flex-wrap gap-2">
                                    {formData.sem?.length > 0 ? (
                                        formData.sem.map((s, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                Sem {s}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 text-sm">No semesters assigned</span>
                                    )}
                                </div>
                            ) : (
                                <MultiSelectDropdown
                                    name="sem"
                                    value={formData.sem}
                                    onChange={handleChange}
                                    options={getSemOptions()}
                                    placeholder="Select Semesters"
                                    disabled={!formData.branch}
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subjects *</label>
                            {isViewMode ? (
                                <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-11.5 flex flex-wrap gap-2">
                                    {formData.subject?.length > 0 ? (
                                        formData.subject.map((s, idx) => (
                                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {s}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-500 text-sm">No subjects assigned</span>
                                    )}
                                </div>
                            ) : (
                                <MultiSelectDropdown
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    options={getSubjectOptions()}
                                    placeholder="Select Subjects"
                                    disabled={formData.sem.length === 0}
                                />
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Documents</label>
                            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl ${!isViewMode ? 'hover:bg-slate-50' : 'bg-slate-50 opacity-60'} transition-colors relative`}>
                                <input 
                                    disabled={isViewMode}
                                    type="file" 
                                    name="documents" 
                                    multiple 
                                    onChange={handleChange} 
                                    className={`absolute inset-0 w-full h-full opacity-0 ${!isViewMode ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                    <div className="flex text-sm text-slate-600 justify-center">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload files</span>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">PNG, JPG, PDF up to 5MB</p>
                                    {formData.documents && formData.documents.length > 0 && <p className="text-sm text-green-600 font-medium mt-2">{formData.documents.length} file(s) selected</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                        <button type="button" onClick={() => { setIsModalOpen(false); setFormData(initialFormState); setIsEditMode(false); setIsViewMode(false); }} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">{isViewMode ? 'Close' : 'Cancel'}</button>
                        {!isViewMode && (
                            <button type="submit" disabled={submitLoading} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center">
                                {submitLoading ? <><Loader size={18} className="animate-spin mr-2" /> Saving...</> : (isEditMode ? 'Update Faculty' : 'Save Faculty')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Confirm Delete</h3>
            <p className="text-slate-500 text-center mb-6">
              Are you sure you want to delete this faculty member? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Delete Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyList;