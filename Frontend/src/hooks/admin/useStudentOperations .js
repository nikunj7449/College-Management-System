import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  buildQueryParams, 
  formatStudentForForm,
  validateFileUpload 
} from '../../utils/adminUtils/courseUtils';

const INITIAL_FORM_STATE = {
  name: '',
  studentId: '',
  rollNum: '',
  course: '',
  branch: '',
  sem: '',
  parentContact: '',
  studentPhone: '',
  personalEmail: '',
  dob: '',
  documents: null
};

const INITIAL_FILTERS = {
  course: [],
  branch: [],
  sem: [],
  isActive: ''
};

// Modal types - single source of truth
const MODAL_TYPE = {
  CLOSED: null,
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
  DELETE: 'delete',
  STATUS: 'status'
};

export const useStudentOperations = () => {
  const [students, setStudents] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Consolidated modal state - replaces 5 separate states
  const [modal, setModal] = useState({
    type: MODAL_TYPE.CLOSED,
    student: null
  });
  
  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Fetch Students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = buildQueryParams(searchTerm, filters);
      const response = await api.get('/students', { params });
      setStudents(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses - memoized to prevent unnecessary calls
  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCoursesData(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  // Effects
  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(fetchStudents, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchCourses();
  }, []);

  // Form Handlers
  const handleChange = (e) => {
    if (e.target.name === 'documents') {
      const validation = validateFileUpload(e.target.files);
      if (!validation.isValid) {
        toast.error(validation.error);
        e.target.value = '';
        setFormData(prev => ({ ...prev, documents: null }));
        return;
      }
      setFormData(prev => ({ ...prev, documents: e.target.files }));
    } else {
      const { name, value } = e.target;
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        // Reset dependent fields
        if (name === 'course') {
          updated.branch = '';
          updated.sem = '';
        } else if (name === 'branch') {
          updated.sem = '';
        }
        return updated;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'documents') {
          if (formData[key]) {
            Array.from(formData[key]).forEach(file => 
              dataToSend.append('documents', file)
            );
          }
        } else {
          dataToSend.append(key, formData[key]);
        }
      });

      const isEditing = modal.type === MODAL_TYPE.EDIT;

      if (isEditing) {
        await api.put(`/students/${modal.student._id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Student added successfully');
      }

      closeModal();
      fetchStudents();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        `Failed to ${isEditing ? 'update' : 'add'} student`
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // CRUD Operations
  const handleEdit = (student) => {
    setFormData(formatStudentForForm(student));
    setModal({ type: MODAL_TYPE.EDIT, student });
  };

  const handleView = (student) => {
    setFormData(formatStudentForForm(student));
    setModal({ type: MODAL_TYPE.VIEW, student });
  };

  const handleDelete = (student) => {
    setModal({ type: MODAL_TYPE.DELETE, student });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/students/${modal.student._id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
      closeModal();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleToggleStatus = (student) => {
    setModal({ type: MODAL_TYPE.STATUS, student });
  };

  const confirmToggleStatus = async () => {
    try {
      const formData = new FormData();
      formData.append('isActive', !modal.student.isActive);

      await api.put(`/students/${modal.student._id}`, formData);
      toast.success(
        `Student ${!modal.student.isActive ? 'activated' : 'deactivated'} successfully`
      );
      fetchStudents();
      closeModal();
    } catch (error) {
      toast.error('Failed to update student status');
    }
  };

  // Modal Controls
  const openAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setModal({ type: MODAL_TYPE.ADD, student: null });
  };

  const closeModal = () => {
    setModal({ type: MODAL_TYPE.CLOSED, student: null });
    setFormData(INITIAL_FORM_STATE);
  };

  return {
    // Data
    students,
    coursesData,
    loading,
    submitLoading,
    searchTerm,
    filters,
    currentPage,
    formData,
    
    // Modal state (single object instead of 5 separate booleans)
    modal,
    
    // Setters
    setSearchTerm,
    setFilters,
    setCurrentPage,
    
    // Handlers
    handleChange,
    handleSubmit,
    handleEdit,
    handleView,
    handleDelete,
    handleToggleStatus,
    confirmDelete,
    confirmToggleStatus,
    
    // Modal Controls
    openAddModal,
    closeModal,
  };
};

// Export modal types for use in components
export { MODAL_TYPE };