import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, X, Loader, 
  BookOpen, GitBranch, LayoutGrid, List, 
  AlertTriangle, GraduationCap, Clock, Book, ChevronDown, ChevronRight, Check, Eye
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import CourseCardSkeleton from '../common/CourseCardSkeleton';
import CourseViewModal from '../modals/CourseViewModal';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('grid');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ type: 'course', id: null, name: '', parentId: null });
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const initialFormState = { name: '', duration: '', branches: [] };
  const [formData, setFormData] = useState(initialFormState);
  
  // Branch management
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newBranch, setNewBranch] = useState('');
  const [branchLoading, setBranchLoading] = useState(false);
  const [expandedBranch, setExpandedBranch] = useState(null);

  // Subject management
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({ name: '', code: '', credits: '', semester: '' });
  const [activeBranchId, setActiveBranchId] = useState(null);
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  // Branch Edit State
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editBranchName, setEditBranchName] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses');
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Form Handlers for Nested Branches/Subjects (Create Mode) ---
  const addBranchToForm = () => {
    setFormData(prev => ({
      ...prev,
      branches: [...(prev.branches || []), { name: '', subjects: [] }]
    }));
  };

  const removeBranchFromForm = (index) => {
    setFormData(prev => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index)
    }));
  };

  const updateBranchName = (index, value) => {
    const newBranches = [...(formData.branches || [])];
    newBranches[index].name = value;
    setFormData({ ...formData, branches: newBranches });
  };

  const addSubjectToBranch = (branchIndex) => {
    const newBranches = [...(formData.branches || [])];
    newBranches[branchIndex].subjects.push({ name: '', code: '', credits: '', semester: '' });
    setFormData({ ...formData, branches: newBranches });
  };

  const updateSubject = (branchIndex, subjectIndex, field, value) => {
    const newBranches = [...(formData.branches || [])];
    newBranches[branchIndex].subjects[subjectIndex][field] = value;
    setFormData({ ...formData, branches: newBranches });
  };

  const removeSubject = (branchIndex, subjectIndex) => {
    const newBranches = [...(formData.branches || [])];
    newBranches[branchIndex].subjects.splice(subjectIndex, 1);
    setFormData({ ...formData, branches: newBranches });
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsManageMode(false);
    setIsViewMode(false);
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setFormData({ name: course.name, duration: course.duration || '' });
    setIsEditMode(true);
    setIsManageMode(false);
    setIsViewMode(false);
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const openManageModal = (course) => {
    setFormData({ name: course.name, duration: course.duration || '' });
    setIsEditMode(true);
    setIsManageMode(true);
    setIsViewMode(false);
    setSelectedCourse(course);
    setExpandedBranch(null);
    setEditingBranchId(null);
    setIsModalOpen(true);
  };

  const openViewModal = (course) => {
    setFormData({ 
      name: course.name, 
      duration: course.duration || '', 
      branches: course.branches ? JSON.parse(JSON.stringify(course.branches)) : [] 
    });
    setIsEditMode(false);
    setIsManageMode(false);
    setIsViewMode(true);
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const openDeleteModal = (type, id, name, parentId = null) => {
    setDeleteConfig({ type, id, name, parentId });
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/courses/${selectedCourse._id}`, formData);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses', formData);
        toast.success('Course added successfully');
      }
      await fetchCourses();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteConfig.type === 'course') {
        await api.delete(`/courses/${deleteConfig.id}`);
        toast.success('Course deleted successfully');
        await fetchCourses();
      } else if (deleteConfig.type === 'branch') {
        await api.delete(`/courses/${deleteConfig.parentId}/branches/${deleteConfig.id}`);
        toast.success('Branch deleted successfully');
        
        // Refresh data
        const response = await api.get('/courses');
        const updatedCourses = response.data.data || [];
        setCourses(updatedCourses);
        
        // Update selected course in modal if open
        if (selectedCourse) {
          const updated = updatedCourses.find(c => c._id === selectedCourse._id);
          if (updated) setSelectedCourse(updated);
        }
      } else if (deleteConfig.type === 'subject') {
        await api.delete(`/courses/${selectedCourse._id}/branches/${deleteConfig.parentId}/subjects/${deleteConfig.id}`);
        toast.success('Subject deleted successfully');
        
        const response = await api.get('/courses');
        const updatedCourses = response.data.data || [];
        setCourses(updatedCourses);
        
        if (selectedCourse) {
          const updated = updatedCourses.find(c => c._id === selectedCourse._id);
          if (updated) setSelectedCourse(updated);
        }
      }
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranch.trim()) return;
    setBranchLoading(true);
    try {
      await api.post(`/courses/${selectedCourse._id}/branches`, { name: newBranch });
      toast.success('Branch added successfully');
      setNewBranch('');
      
      const response = await api.get('/courses');
      const updatedCourses = response.data.data || [];
      setCourses(updatedCourses);
      
      if (selectedCourse) {
        const updated = updatedCourses.find(c => c._id === selectedCourse._id);
        if (updated) setSelectedCourse(updated);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add branch');
    } finally {
      setBranchLoading(false);
    }
  };

  const toggleBranch = (branchId) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  const startEditingBranch = (branch) => {
    setEditingBranchId(branch._id);
    setEditBranchName(branch.name);
  };

  const handleUpdateBranch = async (branchId) => {
    if (!editBranchName.trim()) return;
    try {
      await api.put(`/courses/${selectedCourse._id}/branches/${branchId}`, { name: editBranchName });
      toast.success('Branch updated successfully');
      setEditingBranchId(null);
      
      const response = await api.get('/courses');
      const updatedCourses = response.data.data || [];
      setCourses(updatedCourses);
      
      if (selectedCourse) {
        const updated = updatedCourses.find(c => c._id === selectedCourse._id);
        if (updated) setSelectedCourse(updated);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    }
  };

  const openAddSubjectModal = (branchId) => {
    setSubjectFormData({ name: '', code: '', credits: '', semester: '' });
    setActiveBranchId(branchId);
    setEditingSubjectId(null);
    setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subject, branchId) => {
    setSubjectFormData({ name: subject.name, code: subject.code, credits: subject.credits, semester: subject.semester || '' });
    setActiveBranchId(branchId);
    setEditingSubjectId(subject._id);
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!activeBranchId || !selectedCourse) return;
    
    setSubmitLoading(true);
    try {
      if (editingSubjectId) {
        await api.put(`/courses/${selectedCourse._id}/branches/${activeBranchId}/subjects/${editingSubjectId}`, subjectFormData);
        toast.success('Subject updated successfully');
      } else {
        await api.post(`/courses/${selectedCourse._id}/branches/${activeBranchId}/subjects`, subjectFormData);
        toast.success('Subject added successfully');
      }
      
      const response = await api.get('/courses');
      const updatedCourses = response.data.data || [];
      setCourses(updatedCourses);
      
      if (selectedCourse) {
        const updated = updatedCourses.find(c => c._id === selectedCourse._id);
        if (updated) setSelectedCourse(updated);
      }
      setIsSubjectModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subject');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage courses, branches, and subjects</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search courses..." 
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

          <button 
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            <span className="font-medium text-sm">Add Course</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )
      )}

      {/* Grid Layout */}
      {!loading && viewType === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow duration-300 group relative flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                  <GraduationCap size={24} />
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openViewModal(course)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => openEditModal(course)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => openDeleteModal('course', course._id, course.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1">{course.name}</h3>
              <div className="flex items-center text-xs text-slate-500 mb-3 bg-slate-50 w-fit px-2 py-1 rounded-md">
                <Clock size={14} className="mr-1.5" />
                <span>{course.duration ? `${course.duration} Years` : 'N/A'}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center">
                    <GitBranch size={16} className="mr-2 text-slate-400" />
                    <span>{course.branches?.length || 0} Branches</span>
                  </div>
                  <button onClick={() => openManageModal(course)} className="text-indigo-600 font-medium hover:text-indigo-700 text-xs">
                    Manage
                  </button>
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Branches</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Subjects</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mr-3">
                          <GraduationCap size={18} />
                        </div>
                        <span className="font-medium text-slate-900">{course.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{course.duration ? `${course.duration} Years` : '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {course.branches?.length || 0} Branches
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-slate-600">
                        {course.branches?.reduce((acc, branch) => acc + (branch.subjects?.length || 0), 0) || 0} Subjects
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openManageModal(course)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Manage Branches"><GitBranch size={16} /></button>
                        <button onClick={() => openViewModal(course)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => openEditModal(course)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => openDeleteModal('course', course._id, course.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-800">No courses found</h3>
          <p className="text-slate-500">Add a new course to get started.</p>
        </div>
      )}

      {/* View Modal */}
      <CourseViewModal 
        isOpen={isModalOpen && isViewMode}
        onClose={() => setIsModalOpen(false)}
        courseForm={formData}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && !isViewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{isManageMode ? 'Manage Branches' : (isViewMode ? 'Course Details' : (isEditMode ? 'Edit Course' : 'Add New Course'))}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {!isManageMode && (
              <form id="courseForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course Name *</label>
                  <input 
                    required 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                    placeholder="e.g. B.Tech" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Years)</label>
                  <input 
                    type="number" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                    placeholder="e.g. 4" 
                  />
                </div>
                </div>

                {/* Add Branches Section (Only in Create Mode) */}
                {!isEditMode && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-slate-700">Branches & Subjects (Optional)</label>
                      <button type="button" onClick={addBranchToForm} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                        <Plus size={16} className="mr-1"/> Add Branch
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.branches?.map((branch, bIdx) => (
                        <div key={bIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex gap-3 mb-3">
                            <input
                              placeholder="Branch Name (e.g. Computer Science)"
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                              value={branch.name}
                              onChange={(e) => updateBranchName(bIdx, e.target.value)}
                              required
                            />
                            <button type="button" onClick={() => removeBranchFromForm(bIdx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          {/* Subjects */}
                          <div className="pl-4 border-l-2 border-slate-200 space-y-3">
                            {branch.subjects.map((subject, sIdx) => (
                              <div key={sIdx} className="grid grid-cols-12 gap-2 items-start">
                                <div className="col-span-4"><input placeholder="Subject Name" className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500" value={subject.name} onChange={(e) => updateSubject(bIdx, sIdx, 'name', e.target.value)} required /></div>
                                <div className="col-span-2"><input placeholder="Code" className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500" value={subject.code} onChange={(e) => updateSubject(bIdx, sIdx, 'code', e.target.value)} required /></div>
                                <div className="col-span-2"><input type="number" placeholder="Cr" className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500" value={subject.credits} onChange={(e) => updateSubject(bIdx, sIdx, 'credits', e.target.value)} required /></div>
                                <div className="col-span-3"><select className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-500" value={subject.semester} onChange={(e) => updateSubject(bIdx, sIdx, 'semester', e.target.value)} required><option value="">Sem</option>{[...Array(8)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select></div>
                                <div className="col-span-1 flex justify-center"><button type="button" onClick={() => removeSubject(bIdx, sIdx)} className="p-1 text-slate-400 hover:text-red-500"><X size={14}/></button></div>
                              </div>
                            ))}
                            <button type="button" onClick={() => addSubjectToBranch(bIdx)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center mt-2">
                              <Plus size={12} className="mr-1"/> Add Subject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
              )}

              {/* Branch Management Section (Only in Edit Mode) */}
              {isManageMode && selectedCourse && (
                <div>
                  <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Selected Course</h3>
                    <p className="text-lg font-bold text-indigo-900">{selectedCourse.name}</p>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                    <GitBranch size={16} className="mr-2 text-indigo-600" />
                    Manage Branches
                  </h3>
                  
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <form onSubmit={handleAddBranch} className="flex gap-2">
                      <input 
                        value={newBranch}
                        onChange={(e) => setNewBranch(e.target.value)}
                        placeholder="New Branch Name (e.g. CSE)"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        type="submit" 
                        disabled={branchLoading || !newBranch.trim()}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        {branchLoading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                      </button>
                    </form>
                  </div>

                  <div className="space-y-2">
                    {selectedCourse.branches && selectedCourse.branches.length > 0 ? (
                      selectedCourse.branches.map((branch, index) => (
                        <div key={branch._id || index} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                          <div 
                            className="flex justify-between items-center p-3 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => toggleBranch(branch._id || index)}
                          >
                            {editingBranchId === (branch._id || index) ? (
                              <div className="flex-1 flex gap-2 items-center mr-2" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  value={editBranchName}
                                  onChange={(e) => setEditBranchName(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button onClick={() => handleUpdateBranch(branch._id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16}/></button>
                                <button onClick={() => setEditingBranchId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X size={16}/></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {expandedBranch === (branch._id || index) ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
                                <span className="text-sm font-medium text-slate-700">{branch.name}</span>
                                <button onClick={(e) => { e.stopPropagation(); startEditingBranch(branch); }} className="p-1 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors ml-1">
                                  <Edit size={12} />
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddSubjectModal(branch._id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Add Subject"
                            >
                              <Plus size={14} />
                            </button>
                            {expandedBranch !== (branch._id || index) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal('branch', branch._id, branch.name, selectedCourse._id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                            )}
                            </div>
                          </div>
                          {expandedBranch === (branch._id || index) && branch.subjects && branch.subjects.length > 0 && (
                            <div className="px-3 pb-3 pt-1 border-t border-slate-100">
                              {Object.entries(
                                branch.subjects.reduce((acc, subject) => {
                                  const sem = subject.semester || 'General';
                                  if (!acc[sem]) acc[sem] = [];
                                  acc[sem].push(subject);
                                  return acc;
                                }, {})
                              ).sort((a, b) => (a[0] === 'General' ? 1 : b[0] === 'General' ? -1 : Number(a[0]) - Number(b[0])))
                              .map(([sem, subjects]) => (
                                <div key={sem} className="mt-3 first:mt-1">
                                  <div className="flex items-center mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2"></span>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{sem === 'General' ? 'General Subjects' : `Semester ${sem}`}</p>
                                  </div>
                                  <div className="grid grid-cols-1 gap-1.5 pl-3.5 border-l border-slate-100 ml-0.75">
                                    {subjects.map((subject, sIdx) => (
                                      <div key={sIdx} className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                        <Book size={12} className="mr-2 text-indigo-400 shrink-0"/>
                                        <span className="font-medium mr-auto truncate">{subject.name}</span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-slate-400 font-mono text-[10px] bg-white px-1 rounded border border-slate-100">{subject.code}</span>
                                          {subject.credits && <span className="text-[10px] text-slate-400 hidden sm:inline">{subject.credits} Cr</span>}
                                          <button 
                                            onClick={() => openEditSubjectModal(subject, branch._id)}
                                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit Subject"
                                          >
                                            <Edit size={12} />
                                          </button>
                                          <button 
                                            onClick={() => openDeleteModal('subject', subject._id, subject.name, branch._id)}
                                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Subject"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {expandedBranch === (branch._id || index) && (!branch.subjects || branch.subjects.length === 0) && (
                            <div className="px-3 pb-3 pt-1 border-t border-slate-100 text-xs text-slate-400 italic">No subjects found.</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-slate-400 py-2">No branches added yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50/50 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                {isManageMode ? 'Close' : 'Cancel'}
              </button>
              {!isManageMode && (
              <button 
                type="submit" 
                form="courseForm"
                disabled={submitLoading} 
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center"
              >
                {submitLoading ? <><Loader size={18} className="animate-spin mr-2" /> Saving...</> : (isEditMode ? 'Update Course' : 'Save Course')}
              </button>
              )}
            </div>
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
              Are you sure you want to delete <strong>{deleteConfig.name}</strong>? 
              {deleteConfig.type === 'course' && ' This will also delete all associated branches and subjects.'}
              <br/>This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">{editingSubjectId ? 'Edit Subject' : 'Add Subject'}</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleSubjectSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Subject Name</label>
                <input 
                  required
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData({...subjectFormData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Subject Code</label>
                  <input 
                    required
                    value={subjectFormData.code}
                    onChange={(e) => setSubjectFormData({...subjectFormData, code: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. CS101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Credits</label>
                  <input 
                    type="number"
                    required
                    value={subjectFormData.credits}
                    onChange={(e) => setSubjectFormData({...subjectFormData, credits: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 4"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Semester</label>
                <select 
                  required
                  value={subjectFormData.semester}
                  onChange={(e) => setSubjectFormData({...subjectFormData, semester: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => <option key={i+1} value={i+1}>Semester {i+1}</option>)}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-70"
                >
                  {submitLoading ? 'Saving...' : (editingSubjectId ? 'Update Subject' : 'Add Subject')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;