import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
    buildQueryParams,
    formatStudentForForm,
    validateFileUpload
} from '../../utils/adminUtils/courseUtils';
import { MODAL_TYPE } from '../admin/useStudentOperations '; // Keep Modal enum common

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
    documents: ''
};

const INITIAL_FILTERS = {
    course: [],
    branch: [],
    sem: [],
    isActive: ''
};


export const useFacultyOperations = () => {
    const [students, setStudents] = useState([]);
    const [coursesData, setCoursesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);

    const [modal, setModal] = useState({
        type: MODAL_TYPE.CLOSED,
        student: null
    });

    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // To get faculty user details for filtering:
    const user = JSON.parse(localStorage.getItem('user'));

    const fetchStudents = async () => {
        try {
            setLoading(true);
            // Let's get the faculty details to filter their students
            const facultyRes = await api.get(`/auth/me`); // Or fetch from context if available, assume /auth/me returns the faculty profile.
            let authUser = facultyRes.data.data;

            // If we don't have faculty specific info, we might need to fetch faculty by user ID
            // But typically user.course/branch might be returned or we query `/faculty` matching email.
            // We will rely on getting faculty profile list and matching email, OR better, let's just fetch all faculty and find ours.
            const flist = await api.get('/faculty');
            const meFaculty = flist.data.data.find(f => f.user === user._id || f.email === user.email);

            let params = buildQueryParams(searchTerm, filters);

            // Override course and branch if faculty is found to restrict view
            if (meFaculty) {
                params.course = meFaculty.course;
                params.branch = meFaculty.branch;
            }

            const response = await api.get('/students', { params });
            setStudents(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch students');
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
        const timer = setTimeout(fetchStudents, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filters]);

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        if (e.target.name === 'documents') {
            const validation = validateFileUpload(e.target.files);
            if (!validation.isValid) {
                toast.error(validation.error);
                e.target.value = '';
                return;
            }
            setFormData(prev => ({ ...prev, documents: e.target.files }));
        } else {
            const { name, value } = e.target;
            setFormData(prev => {
                const updated = { ...prev, [name]: value };
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
            const existingDocuments = [];
            Object.keys(formData).forEach(key => {
                if (key === 'documents') {
                    if (formData[key]) {
                        Array.from(formData[key]).forEach(file => {
                            if (file instanceof File) {
                                dataToSend.append('documents', file);
                            } else {
                                existingDocuments.push(file);
                            }
                        });
                    }
                } else {
                    dataToSend.append(key, formData[key]);
                }
            });
            dataToSend.append('existingDocuments', JSON.stringify(existingDocuments));
            const isEditing = modal.type === MODAL_TYPE.EDIT;

            if (isEditing) {
                await api.put(`/students/${modal.student._id}`, dataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Student updated successfully');
            }
            closeModal();
            fetchStudents();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                `Failed to update student`
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (student) => {
        setFormData(formatStudentForForm(student));
        setModal({ type: MODAL_TYPE.EDIT, student });
    };

    const handleView = (student) => {
        setFormData(formatStudentForForm(student));
        setModal({ type: MODAL_TYPE.VIEW, student });
    };

    const handleViewCourse = (course) => {
        setFormData(course);
        setModal({ type: 'VIEW_COURSE', course });
    };

    const closeModal = () => {
        setModal({ type: MODAL_TYPE.CLOSED, student: null, course: null });
        setFormData(INITIAL_FORM_STATE);
    };

    // Derived states useful for FacultyCourse list view:
    const filteredCourses = coursesData.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        // Students Data
        students,
        coursesData,
        filteredCourses,
        loading,
        submitLoading,
        searchTerm,
        filters,
        currentPage,
        formData,
        modal,

        // Actions
        setSearchTerm,
        setFilters,
        setCurrentPage,
        handleChange,
        handleSubmit,
        handleEdit,
        handleView,
        handleViewCourse,
        closeModal,
    };
};
