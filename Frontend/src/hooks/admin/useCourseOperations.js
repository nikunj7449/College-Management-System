import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const INITIAL_COURSE_FORM = {
  name: '',
  duration: '',
  branches: []
};

const INITIAL_SUBJECT_FORM = {
  name: '',
  code: '',
  credits: '',
  semester: ''
};

// Modal types - single source of truth
const MODAL_TYPE = {
  CLOSED: null,
  ADD_COURSE: 'add_course',
  EDIT_COURSE: 'edit_course',
  VIEW_COURSE: 'view_course',
  MANAGE_BRANCHES: 'manage_branches',
  ADD_SUBJECT: 'add_subject',
  EDIT_SUBJECT: 'edit_subject',
  DELETE: 'delete'
};

// Delete config types
const DELETE_TYPE = {
  COURSE: 'course',
  BRANCH: 'branch',
  SUBJECT: 'subject'
};

export const useCourseOperations = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Consolidated modal state
  const [modal, setModal] = useState({
    type: MODAL_TYPE.CLOSED,
    course: null,
    branch: null,
    subject: null
  });
  
  // Form states
  const [courseForm, setCourseForm] = useState(INITIAL_COURSE_FORM);
  const [subjectForm, setSubjectForm] = useState(INITIAL_SUBJECT_FORM);
  
  // Branch management
  const [newBranchName, setNewBranchName] = useState('');
  const [expandedBranch, setExpandedBranch] = useState(null);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editBranchName, setEditBranchName] = useState('');
  
  // Delete config
  const [deleteConfig, setDeleteConfig] = useState({
    type: null,
    id: null,
    name: '',
    parentId: null
  });

  // Fetch Courses
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

  // Filtered courses
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Course Form Handlers
  const handleCourseFormChange = (e) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
  };

  const addBranchToForm = () => {
    setCourseForm(prev => ({
      ...prev,
      branches: [...(prev.branches || []), { name: '', subjects: [] }]
    }));
  };

  const removeBranchFromForm = (index) => {
    setCourseForm(prev => ({
      ...prev,
      branches: prev.branches.filter((_, i) => i !== index)
    }));
  };

  const updateBranchName = (index, value) => {
    const newBranches = [...(courseForm.branches || [])];
    newBranches[index].name = value;
    setCourseForm({ ...courseForm, branches: newBranches });
  };

  const addSubjectToBranch = (branchIndex) => {
    const newBranches = [...(courseForm.branches || [])];
    newBranches[branchIndex].subjects.push({ name: '', code: '', credits: '', semester: '' });
    setCourseForm({ ...courseForm, branches: newBranches });
  };

  const updateSubject = (branchIndex, subjectIndex, field, value) => {
    const newBranches = [...(courseForm.branches || [])];
    newBranches[branchIndex].subjects[subjectIndex][field] = value;
    setCourseForm({ ...courseForm, branches: newBranches });
  };

  const removeSubject = (branchIndex, subjectIndex) => {
    const newBranches = [...(courseForm.branches || [])];
    newBranches[branchIndex].subjects.splice(subjectIndex, 1);
    setCourseForm({ ...courseForm, branches: newBranches });
  };

  // Subject Form Handler
  const handleSubjectFormChange = (e) => {
    setSubjectForm({ ...subjectForm, [e.target.name]: e.target.value });
  };

  // Modal Operations
  const openAddCourseModal = () => {
    setCourseForm(INITIAL_COURSE_FORM);
    setModal({ type: MODAL_TYPE.ADD_COURSE, course: null, branch: null, subject: null });
  };

  const openEditCourseModal = (course) => {
    setCourseForm({ name: course.name, duration: course.duration || '', branches: [] });
    setModal({ type: MODAL_TYPE.EDIT_COURSE, course, branch: null, subject: null });
  };

  const openViewCourseModal = (course) => {
    setCourseForm({ 
      name: course.name, 
      duration: course.duration || '', 
      branches: course.branches ? JSON.parse(JSON.stringify(course.branches)) : [] 
    });
    setModal({ type: MODAL_TYPE.VIEW_COURSE, course, branch: null, subject: null });
  };

  const openManageBranchesModal = (course) => {
    setCourseForm({ name: course.name, duration: course.duration || '' });
    setModal({ type: MODAL_TYPE.MANAGE_BRANCHES, course, branch: null, subject: null });
    setExpandedBranch(null);
    setEditingBranchId(null);
    setNewBranchName('');
  };

  const openAddSubjectModal = (branchId) => {
    setSubjectForm(INITIAL_SUBJECT_FORM);
    setModal(prev => ({ ...prev, type: MODAL_TYPE.ADD_SUBJECT, branch: { _id: branchId }, subject: null }));
  };

  const openEditSubjectModal = (subject, branchId) => {
    setSubjectForm({ 
      name: subject.name, 
      code: subject.code, 
      credits: subject.credits, 
      semester: subject.semester || '' 
    });
    setModal(prev => ({ 
      ...prev, 
      type: MODAL_TYPE.EDIT_SUBJECT, 
      branch: { _id: branchId }, 
      subject 
    }));
  };

  const openDeleteModal = (type, id, name, parentId = null) => {
    setDeleteConfig({ type, id, name, parentId });
    setModal(prev => ({ ...prev, type: MODAL_TYPE.DELETE }));
  };

  const closeModal = () => {
    setModal({ type: MODAL_TYPE.CLOSED, course: null, branch: null, subject: null });
    setCourseForm(INITIAL_COURSE_FORM);
    setSubjectForm(INITIAL_SUBJECT_FORM);
    setDeleteConfig({ type: null, id: null, name: '', parentId: null });
  };

  const closeSubjectModal = () => {
    setModal(prev => ({ ...prev, type: MODAL_TYPE.MANAGE_BRANCHES }));
    setSubjectForm(INITIAL_SUBJECT_FORM);
  };

  // CRUD Operations
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const isEdit = modal.type === MODAL_TYPE.EDIT_COURSE;
      
      if (isEdit) {
        await api.put(`/courses/${modal.course._id}`, courseForm);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses', courseForm);
        toast.success('Course added successfully');
      }
      
      await fetchCourses();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteConfig.type === DELETE_TYPE.COURSE) {
        await api.delete(`/courses/${deleteConfig.id}`);
        toast.success('Course deleted successfully');
        await fetchCourses();
        closeModal();
      } else if (deleteConfig.type === DELETE_TYPE.BRANCH) {
        await api.delete(`/courses/${deleteConfig.parentId}/branches/${deleteConfig.id}`);
        toast.success('Branch deleted successfully');
        
        const response = await api.get('/courses');
        const updatedCourses = response.data.data || [];
        setCourses(updatedCourses);
        
        if (modal.course) {
          const updated = updatedCourses.find(c => c._id === modal.course._id);
          if (updated) setModal(prev => ({ ...prev, course: updated }));
        }
        
        setModal(prev => ({ ...prev, type: MODAL_TYPE.MANAGE_BRANCHES }));
      } else if (deleteConfig.type === DELETE_TYPE.SUBJECT) {
        await api.delete(`/courses/${modal.course._id}/branches/${deleteConfig.parentId}/subjects/${deleteConfig.id}`);
        toast.success('Subject deleted successfully');
        
        const response = await api.get('/courses');
        const updatedCourses = response.data.data || [];
        setCourses(updatedCourses);
        
        if (modal.course) {
          const updated = updatedCourses.find(c => c._id === modal.course._id);
          if (updated) setModal(prev => ({ ...prev, course: updated }));
        }
        
        setModal(prev => ({ ...prev, type: MODAL_TYPE.MANAGE_BRANCHES }));
      }
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleteConfig({ type: null, id: null, name: '', parentId: null });
    }
  };

  // Branch Operations
  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    
    setBranchLoading(true);
    try {
      await api.post(`/courses/${modal.course._id}/branches`, { name: newBranchName });
      toast.success('Branch added successfully');
      setNewBranchName('');
      
      const response = await api.get('/courses');
      const updatedCourses = response.data.data || [];
      setCourses(updatedCourses);
      
      if (modal.course) {
        const updated = updatedCourses.find(c => c._id === modal.course._id);
        if (updated) setModal(prev => ({ ...prev, course: updated }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add branch');
    } finally {
      setBranchLoading(false);
    }
  };

  const startEditingBranch = (branch) => {
    setEditingBranchId(branch._id);
    setEditBranchName(branch.name);
  };

  const handleUpdateBranch = async (branchId) => {
    if (!editBranchName.trim()) return;
    
    try {
      await api.put(`/courses/${modal.course._id}/branches/${branchId}`, { name: editBranchName });
      toast.success('Branch updated successfully');
      setEditingBranchId(null);
      
      const response = await api.get('/courses');
      const updatedCourses = response.data.data || [];
      setCourses(updatedCourses);
      
      if (modal.course) {
        const updated = updatedCourses.find(c => c._id === modal.course._id);
        if (updated) setModal(prev => ({ ...prev, course: updated }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update branch');
    }
  };

  const toggleBranch = (branchId) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  // Subject Operations
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!modal.branch?._id || !modal.course) return;
    
    setSubmitLoading(true);
    try {
      const isEdit = modal.type === MODAL_TYPE.EDIT_SUBJECT;
      
      if (isEdit) {
        await api.put(
          `/courses/${modal.course._id}/branches/${modal.branch._id}/subjects/${modal.subject._id}`,
          subjectForm
        );
        toast.success('Subject updated successfully');
      } else {
        await api.post(
          `/courses/${modal.course._id}/branches/${modal.branch._id}/subjects`,
          subjectForm
        );
        toast.success('Subject added successfully');
      }
      
      const response = await api.get('/courses');
      const updatedCourses = response.data.data || [];
      setCourses(updatedCourses);
      
      if (modal.course) {
        const updated = updatedCourses.find(c => c._id === modal.course._id);
        if (updated) setModal(prev => ({ ...prev, course: updated }));
      }
      
      closeSubjectModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subject');
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    // Data
    courses,
    filteredCourses,
    loading,
    submitLoading,
    branchLoading,
    searchTerm,
    currentPage,
    
    // Forms
    courseForm,
    subjectForm,
    
    // Branch management
    newBranchName,
    expandedBranch,
    editingBranchId,
    editBranchName,
    
    // Delete config
    deleteConfig,
    
    // Modal state
    modal,
    
    // Setters
    setSearchTerm,
    setCurrentPage,
    setNewBranchName,
    setEditBranchName,
    
    // Course form handlers
    handleCourseFormChange,
    addBranchToForm,
    removeBranchFromForm,
    updateBranchName,
    addSubjectToBranch,
    updateSubject,
    removeSubject,
    
    // Subject form handlers
    handleSubjectFormChange,
    
    // Modal operations
    openAddCourseModal,
    openEditCourseModal,
    openViewCourseModal,
    openManageBranchesModal,
    openAddSubjectModal,
    openEditSubjectModal,
    openDeleteModal,
    closeModal,
    closeSubjectModal,
    
    // CRUD operations
    handleCourseSubmit,
    handleDelete,
    
    // Branch operations
    handleAddBranch,
    startEditingBranch,
    handleUpdateBranch,
    toggleBranch,
    
    // Subject operations
    handleSubjectSubmit,
  };
};

// Export constants
export { MODAL_TYPE, DELETE_TYPE };