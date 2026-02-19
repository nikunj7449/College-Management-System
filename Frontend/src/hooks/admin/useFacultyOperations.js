import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { 
  buildQueryParams, 
  formatFacultyForForm,
  validateFileUpload
} from '../../utils/adminUtils/courseUtils';

const INITIAL_FORM_STATE = {
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

const INITIAL_FILTERS = {
  designation: [],
  branch: [],
  course: [],
  sem: [],
  subject: []
};

// Modal types - single source of truth
const MODAL_TYPE = {
  CLOSED: null,
  ADD: 'add',
  EDIT: 'edit',
  VIEW: 'view',
  DELETE: 'delete'
};

export const useFacultyOperations = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Consolidated modal state
  const [modal, setModal] = useState({
    type: MODAL_TYPE.CLOSED,
    faculty: null
  });
  
  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Fetch Faculty
  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const params = buildQueryParams(searchTerm, filters);
      const response = await api.get('/faculty', { params });
      setFacultyList(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses
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
    const timer = setTimeout(fetchFaculty, 500);
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
        const updatedData = { 
          ...prev, 
          [name]: name === 'facultyId' ? value.toUpperCase() : value 
        };

        // Reset dependent fields based on hierarchy
        if (name === 'course') {
          updatedData.branch = '';
          updatedData.sem = [];
          updatedData.subject = [];
        } else if (name === 'branch') {
          updatedData.sem = [];
          updatedData.subject = [];
        } else if (name === 'sem') {
          // Filter subjects based on selected semesters
          const selectedCourse = coursesData.find(c => c.name === prev.course);
          const selectedBranch = selectedCourse?.branches.find(b => b.name === prev.branch);
          if (selectedBranch) {
            const validSubjects = selectedBranch.subjects
              .filter(sub => value.includes(sub.semester?.toString()))
              .map(s => s.name);
            updatedData.subject = prev.subject.filter(s => validSubjects.includes(s));
          }
        }
        return updatedData;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const dataToSend = new FormData();
      const existingDocuments = [];

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
      if (formData.documents && formData.documents.length > 0) {
        Array.from(formData.documents).forEach(file => {
          if (file instanceof File) {
            dataToSend.append('documents', file);
          } else {
            existingDocuments.push(file);
          }
        });
      }

      dataToSend.append('existingDocuments', JSON.stringify(existingDocuments));

      const isEditing = modal.type === MODAL_TYPE.EDIT;

      if (isEditing) {
        await api.put(`/faculty/${modal.faculty._id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Faculty updated successfully');
      } else {
        await api.post('/faculty', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Faculty added successfully');
      }

      closeModal();
      fetchFaculty();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        `Failed to ${isEditing ? 'update' : 'add'} faculty`
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // CRUD Operations
  const handleEdit = (faculty) => {
    const formatted = formatFacultyForForm(faculty);
    setFormData({ ...formatted, documents: faculty.documents || [] });
    setModal({ type: MODAL_TYPE.EDIT, faculty });
  };

  const handleView = (faculty) => {
    const formatted = formatFacultyForForm(faculty);
    setFormData({ ...formatted, documents: faculty.documents || [] });
    setModal({ type: MODAL_TYPE.VIEW, faculty });
  };

  const handleDelete = (faculty) => {
    setModal({ type: MODAL_TYPE.DELETE, faculty });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/faculty/${modal.faculty._id}`);
      toast.success('Faculty deleted successfully');
      fetchFaculty();
      closeModal();
    } catch (error) {
      toast.error('Failed to delete faculty');
    }
  };

  // Modal Controls
  const openAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setModal({ type: MODAL_TYPE.ADD, faculty: null });
  };

  const closeModal = () => {
    setModal({ type: MODAL_TYPE.CLOSED, faculty: null });
    setFormData(INITIAL_FORM_STATE);
  };

  return {
    // Data
    facultyList,
    coursesData,
    loading,
    submitLoading,
    searchTerm,
    filters,
    currentPage,
    formData,
    
    // Modal state
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
    confirmDelete,
    
    // Modal Controls
    openAddModal,
    closeModal,
  };
};

// Export modal types for use in components
export { MODAL_TYPE };