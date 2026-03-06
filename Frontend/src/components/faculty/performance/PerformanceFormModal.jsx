import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import performanceService from '../../../services/performanceService';
import CustomDropdown from '../../custom/CustomDropdown';

const PerformanceFormModal = ({ isOpen, onClose, initialData, isEdit, students, onSave }) => {
    const [formData, setFormData] = useState({
        studentId: '',
        examName: '',
        subjects: [{ subjectName: '', marksObtained: '', totalMarks: '' }],
        grade: '',
        feedback: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && initialData) {
            setFormData({
                studentId: initialData.student?._id || initialData.student,
                examName: initialData.examName || '',
                subjects: initialData.subjects?.length > 0 ? initialData.subjects : [{ subjectName: '', marksObtained: '', totalMarks: '' }],
                grade: initialData.grade || '',
                feedback: initialData.feedback || ''
            });
        }
    }, [initialData, isEdit]);

    // Auto calculate percentage and suggest grade
    useEffect(() => {
        let totalObtained = 0;
        let totalMax = 0;
        let validSubjects = 0;

        formData.subjects.forEach(sub => {
            const obv = parseFloat(sub.marksObtained);
            const tot = parseFloat(sub.totalMarks);
            if (!isNaN(obv) && !isNaN(tot) && tot > 0) {
                totalObtained += obv;
                totalMax += tot;
                validSubjects++;
            }
        });

        // Optional: Auto-suggest grade based on percentage if editing wasn't manual.
        // We'll leave it manual as per requirements, but we can show basic stats.
    }, [formData.subjects]);

    const handleSubjectChange = (index, field, value) => {
        const newSubjects = [...formData.subjects];
        newSubjects[index][field] = value;
        setFormData({ ...formData, subjects: newSubjects });
    };

    const addSubject = () => {
        setFormData({
            ...formData,
            subjects: [...formData.subjects, { subjectName: '', marksObtained: '', totalMarks: '' }]
        });
    };

    const removeSubject = (index) => {
        const newSubjects = formData.subjects.filter((_, i) => i !== index);
        setFormData({ ...formData, subjects: newSubjects });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validate
            if (!formData.studentId || !formData.examName) {
                toast.error("Student and Exam Name are required!");
                setLoading(false);
                return;
            }

            // Clean subjects
            const cleanSubjects = formData.subjects.filter(s => s.subjectName.trim() !== '' && s.marksObtained !== '' && s.totalMarks !== '');
            if (cleanSubjects.length === 0) {
                toast.error("At least one valid subject is required!");
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                subjects: cleanSubjects
            };

            let response;
            if (isEdit) {
                response = await performanceService.updatePerformance(initialData._id, payload);
            } else {
                response = await performanceService.addPerformance(payload);
            }

            if (response.success) {
                toast.success(`Performance ${isEdit ? 'updated' : 'added'} successfully`);
                // Needs populated student data for table refresh, just close and let parent refetch or optimistically update.
                // Re-fetch parent to simply get populated nested student.
                // For simplicity we just return the saved data and let parent handle it.
                // Our backend might not populate immediately on return, but let parent decide.
                onSave(response.performance);
            }

        } catch (error) {
            toast.error(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'adding'} performance`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Calculate totals for UI display
    const totalObtained = formData.subjects.reduce((sum, s) => sum + (parseFloat(s.marksObtained) || 0), 0);
    const overallMax = formData.subjects.reduce((sum, s) => sum + (parseFloat(s.totalMarks) || 0), 0);
    const percentage = overallMax > 0 ? ((totalObtained / overallMax) * 100).toFixed(2) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Performance' : 'Add Performance'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    <form id="performance-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Student Dropdown & Exam Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Student <span className="text-red-500">*</span></label>
                                <CustomDropdown
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    options={students.map(s => {
                                        const nameStr = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
                                        const rollStr = s.rollNum || s.rollNo || s.studentId || 'N/A';
                                        return {
                                            label: `${nameStr} (${rollStr})`,
                                            value: s._id
                                        };
                                    })}
                                    placeholder="-- Select Student --"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Exam Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mid Term 2026"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={formData.examName}
                                    onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Subjects Section */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800">Subjects & Marks</h3>
                                <button type="button" onClick={addSubject} className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                                    <Plus size={16} /> Add Subject
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.subjects.map((sub, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <div className="flex-1 w-full">
                                            <input type="text" placeholder="Subject Name" required
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={sub.subjectName} onChange={(e) => handleSubjectChange(idx, 'subjectName', e.target.value)} />
                                        </div>
                                        <div className="w-full sm:w-32">
                                            <input type="number" placeholder="Marks" required min="0"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={sub.marksObtained} onChange={(e) => handleSubjectChange(idx, 'marksObtained', e.target.value)} />
                                        </div>
                                        <div className="w-full sm:w-32">
                                            <input type="number" placeholder="Total" required min="1"
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={sub.totalMarks} onChange={(e) => handleSubjectChange(idx, 'totalMarks', e.target.value)} />
                                        </div>
                                        {formData.subjects.length > 1 && (
                                            <button type="button" onClick={() => removeSubject(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ms-auto">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Auto Calculate Display */}
                            <div className="flex justify-end pt-2 text-sm text-slate-600">
                                <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm flex items-center gap-4">
                                    <span>Total: <strong className="text-slate-800">{totalObtained} / {overallMax}</strong></span>
                                    <span className="w-px h-4 bg-slate-300"></span>
                                    <span>Percentage: <strong className="text-slate-800">{percentage}%</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Grade & Feedback */}
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Grade</label>
                                <div className="w-full md:w-1/2">
                                    <CustomDropdown
                                        name="grade"
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                        options={[
                                            { label: 'A (Excellent)', value: 'A' },
                                            { label: 'B (Good)', value: 'B' },
                                            { label: 'C (Average)', value: 'C' },
                                            { label: 'D (Pass)', value: 'D' },
                                            { label: 'F (Fail)', value: 'F' }
                                        ]}
                                        placeholder="-- Select Grade --"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Faculty Feedback / Comments</label>
                                <textarea
                                    rows="3"
                                    placeholder='e.g. "Student has good understanding of the subject but needs improvement in assignments."'
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                    value={formData.feedback}
                                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 font-medium transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="performance-form"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm font-medium"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Performance</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PerformanceFormModal;
