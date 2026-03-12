import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, Users, CheckSquare } from 'lucide-react';
import examService from '../../../services/examService';
import api from '../../../services/api';
import { toast } from 'react-toastify';
import CustomDropdown from '../../custom/CustomDropdown';

const ExamFormModal = ({ isOpen, onClose, exam = null, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        course: '',
        semester: '',
        type: 'Midterm',
        date: '',
        startTime: '',
        endTime: '',
        totalMarks: '',
        passingMarks: '',
        description: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
            if (exam) {
                setFormData({
                    name: exam.name,
                    course: exam.course?._id || exam.course,
                    semester: exam.semester,
                    type: exam.type,
                    date: new Date(exam.date).toISOString().split('T')[0],
                    startTime: exam.startTime,
                    endTime: exam.endTime,
                    totalMarks: exam.totalMarks,
                    passingMarks: exam.passingMarks,
                    description: exam.description || ''
                });
            } else {
                setFormData({
                    name: '',
                    course: '',
                    semester: '',
                    type: 'Midterm',
                    date: '',
                    startTime: '',
                    endTime: '',
                    totalMarks: '',
                    passingMarks: '',
                    description: ''
                });
            }
        }
    }, [isOpen, exam]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (parseInt(formData.passingMarks) >= parseInt(formData.totalMarks)) {
            toast.error('Passing marks must be less than total marks');
            return;
        }

        const start = `2000-01-01T${formData.startTime}`;
        const end = `2000-01-01T${formData.endTime}`;
        if (new Date(start) >= new Date(end)) {
            toast.error('End time must be after start time');
            return;
        }

        try {
            setLoading(true);
            let savedExam;
            if (exam) {
                const res = await examService.updateExam(exam._id, formData);
                savedExam = res.data;
                toast.success('Exam updated successfully');
            } else {
                const res = await examService.addExam(formData);
                savedExam = res.data;
                toast.success('Exam created successfully');
            }
            onSave(savedExam);
            onClose();
        } catch (error) {
            console.error('Error saving exam:', error);
            toast.error(error.response?.data?.message || 'Failed to save exam');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {exam ? 'Edit Exam' : 'Schedule New Exam'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {exam ? 'Update exam details and timing' : 'Add a new exam to the academic calendar'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="examForm" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Basic Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Exam Title</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Mid Sem Examination 2024"
                                        className="w-full pl-3 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                     <label className="text-sm font-medium text-slate-700">Course</label>
                                     <CustomDropdown
                                         name="course"
                                         value={formData.course}
                                         onChange={handleChange}
                                         placeholder="Select Course"
                                         searchable
                                         options={courses.map(c => ({ label: c.name, value: c._id }))}
                                     />
                                 </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Semester</label>
                                    <CustomDropdown
                                        name="semester"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        placeholder="Select Semester"
                                        options={[1, 2, 3, 4, 5, 6, 7, 8].map(num => ({ label: `Semester ${num}`, value: num }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Timing Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Schedule & Timing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2 text-red-500">
                                    <label className="text-sm font-medium text-slate-700">Date</label>
                                    <div className="relative text-red-500">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Start Time</label>
                                    <div className="relative text-red-500">
                                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">End Time</label>
                                    <div className="relative text-red-500">
                                        <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Marks & Type */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Grading Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Exam Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none"
                                        required
                                    >
                                        <option value="Midterm">Midterm</option>
                                        <option value="Final">Final</option>
                                        <option value="Practical">Practical</option>
                                        <option value="Viva">Viva</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Total Marks</label>
                                    <div className="relative">
                                        <CheckSquare size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            name="totalMarks"
                                            value={formData.totalMarks}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Passing Marks</label>
                                    <div className="relative">
                                        <AlertCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            name="passingMarks"
                                            value={formData.passingMarks}
                                            onChange={handleChange}
                                            min="1"
                                            max={formData.totalMarks}
                                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Instructions / Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Enter any specific instructions for the students..."
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                            ></textarea>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="examForm"
                        disabled={loading}
                        className="relative flex items-center justify-center min-w-[120px] px-5 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-indigo-500 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span>{exam ? 'Save Changes' : 'Schedule Exam'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamFormModal;
