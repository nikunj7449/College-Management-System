import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { Calendar, Users, Save, CheckCircle2, XCircle, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { useStudentOperations } from '../../../hooks/admin/useStudentOperations ';
import { useAttendanceOperations } from '../../../hooks/faculty/useAttendanceOperations';
import api from '../../../services/api';
import CustomDropdown from '../../custom/CustomDropdown';
import { hasPermission } from '../../../utils/permissionUtils';

const FacultyAttendance = () => {
    const { user, fetchLatestRole } = useContext(AuthContext); // user contains login info, we might need to fetch full Faculty profile
    const [facultyProfile, setFacultyProfile] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    useEffect(() => {
        if (fetchLatestRole) {
            fetchLatestRole();
        }
    }, [fetchLatestRole]);

    const canUpdateAttendance = user ? (hasPermission(user, 'ATTENDANCE', 'update') || hasPermission(user, 'ATTENDANCE', 'create')) : false;

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSem, setSelectedSem] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'Present' | 'Absent' }
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    // Replace direct API service with hook
    const {
        students: hookStudents,
        setFilters,
        loading: isHookLoading
    } = useStudentOperations();

    const {
        loading: isAttendanceLoading,
        submitLoading: isAttendanceSaving,
        getClassAttendance,
        markBulkAttendance
    } = useAttendanceOperations();

    // Automatically sync hook filters when Faculty makes dropdown selections
    useEffect(() => {
        if (facultyProfile && selectedSem) {
            setFilters(prev => ({
                ...prev,
                course: [facultyProfile.course],
                sem: [selectedSem]
            }));
        }
    }, [facultyProfile, selectedSem, setFilters]);

    // 1. Fetch Faculty Profile to get their assigned course and semesters
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Find faculty based on their user email/id
                // Since we don't have a direct /auth/me for faculty profile, we search all faculty by their login email
                const res = await api.get('/faculty');
                if (res.data && res.data.success) {
                    const myProfile = res.data.data.find(f => f.user === user._id || f.email === user.email);
                    if (myProfile) {
                        setFacultyProfile(myProfile);
                        if (myProfile.sem && myProfile.sem.length > 0) {
                            setSelectedSem(myProfile.sem[0]); // Default to first semester
                        }
                        if (myProfile.subject && myProfile.subject.length > 0) {
                            setSelectedSubject(myProfile.subject[0]); // Default to first subject
                        }
                    } else {
                        toast.error('Faculty profile not found.');
                    }
                }
            } catch (error) {
                toast.error('Failed to load faculty profile');
                console.error(error);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (user) fetchProfile();
    }, [user]);

    // Handle Fetching Students and their existing attendance for the selected date
    const handleFetchStudents = async () => {
        if (!facultyProfile) return;
        if (!selectedSem) {
            toast.warning('Please select a semester');
            return;
        }
        if (!selectedSubject) {
            toast.warning('Please select a subject');
            return;
        }

        if (isHookLoading) {
            toast.info('Loading student data in the background, please try again in a moment...');
            return;
        }

        setIsLoadingStudents(true);
        try {
            // 1. Use natively synced students from useStudentOperations Hook
            const loadedStudents = hookStudents;
            setStudents(loadedStudents);

            // 2. Fetch existing attendance for this Date, Course, Sem, Subject
            const attendanceRes = await getClassAttendance(date, facultyProfile.course, selectedSem, selectedSubject);
            console.log(date, facultyProfile.course, selectedSem, selectedSubject)
            console.log(attendanceRes)

            // 3. Merge data
            const newAttendanceData = {};

            // Default everyone to 'Present' initially if no records exist
            loadedStudents.forEach(st => {
                newAttendanceData[st._id] = 'Present';
            });

            // Override with existing records from backend
            if (attendanceRes && attendanceRes.success && attendanceRes.data) {
                attendanceRes.data.forEach(record => {
                    // Only allow Present or Absent mapped states
                    let st = record.status;
                    if (st !== 'Present' && st !== 'Absent') {
                        st = 'Present'; // Fallback mapping 
                    }
                    newAttendanceData[record.student._id || record.student] = st;
                });
            }

            setAttendanceData(newAttendanceData);

            if (loadedStudents.length === 0) {
                toast.info(`No students found in ${facultyProfile.course} Semester ${selectedSem}`);
            }

        } catch (error) {
            console.error(error);
            toast.error('Error fetching students or attendance');
        } finally {
            setIsLoadingStudents(false);
        }
    };

    const handleStatusChange = (studentId, newStatus) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: newStatus
        }));
    };

    const handleMarkAll = (status) => {
        const updated = {};
        students.forEach(s => {
            updated[s._id] = status;
        });
        setAttendanceData(updated);
    };

    const handleSaveAttendance = async () => {
        if (students.length === 0) return;

        try {
            // Prepare payload
            const payload = students.map(student => ({
                studentId: student._id,
                date: date,
                status: attendanceData[student._id],
                facultyId: user._id, // The markedBy ref expects a User ID
                subject: selectedSubject
            }));

            const res = await markBulkAttendance(payload);
            if (res && res.success) {
                toast.success('Attendance saved successfully!');
            }
        } catch (error) {
            console.error(error);
            // Error toast is already handled by the hook
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!facultyProfile) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
                Failed to load faculty assignments. Please contact the administrator.
            </div>
        )
    }

    // Calculate stats
    const presentCount = Object.values(attendanceData).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(s => s === 'Absent').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mark Attendance</h1>
                    <p className="text-slate-500 mt-1">Manage daily attendance for your assigned classes</p>
                </div>
            </div>

            {/* Controls Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Course (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subject/Course</label>
                        <div className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
                            {facultyProfile.course}
                            {facultyProfile.branch ? ` - ${facultyProfile.branch}` : ''}
                        </div>
                    </div>

                    {/* Semester (Dropdown from assigned sems) */}
                    <div className="relative z-10 w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                        <CustomDropdown
                            name="selectedSem"
                            options={facultyProfile?.sem?.map(s => `Semester ${s}`) || []}
                            value={selectedSem ? `Semester ${selectedSem}` : ''}
                            onChange={(e) => {
                                const matchedNum = e.target.value.replace('Semester ', '');
                                setSelectedSem(matchedNum);
                            }}
                            placeholder="Select Sem"
                        />
                    </div>

                    {/* Subject (Dropdown) */}
                    <div className="relative z-10 w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                        <CustomDropdown
                            name="selectedSubject"
                            options={facultyProfile?.subject || []}
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            placeholder="Select Subject"
                        />
                    </div>

                    {/* Date Picker */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                max={new Date().toLocaleDateString('en-CA')}
                            />
                        </div>
                    </div>

                    <div className="flex items-end lg:col-span-2">
                        <button
                            onClick={handleFetchStudents}
                            disabled={isLoadingStudents || isHookLoading || !selectedSem || !selectedSubject}
                            className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center font-medium transition-all ${isLoadingStudents || isHookLoading || !selectedSem || !selectedSubject
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30'
                                }`}
                        >
                            {isLoadingStudents || isHookLoading ? 'Loading...' : (
                                <>
                                    <Search size={18} className="mr-2" />
                                    Fetch Students
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            {students.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* List Header & Stats */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center text-slate-600">
                                <Users size={20} className="mr-2 text-indigo-500" />
                                <span className="font-semibold text-slate-800">{students.length}</span>
                                <span className="ml-1 text-sm">Students</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <CheckCircle2 size={20} className="mr-2 text-emerald-500" />
                                <span className="font-semibold text-emerald-600">{presentCount}</span>
                                <span className="ml-1 text-sm text-emerald-600">Present</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                                <XCircle size={20} className="mr-2 text-red-500" />
                                <span className="font-semibold text-red-600">{absentCount}</span>
                                <span className="ml-1 text-sm text-red-600">Absent</span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            {canUpdateAttendance && (
                                <>
                                    <button
                                        onClick={() => handleMarkAll('Present')}
                                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Mark All Present
                                    </button>
                                    <button
                                        onClick={() => handleMarkAll('Absent')}
                                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Mark All Absent
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-white border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Roll No</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                            {student.rollNum}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center space-x-3">

                                                {/* Present Button */}
                                                <button
                                                    onClick={() => canUpdateAttendance && handleStatusChange(student._id, 'Present')}
                                                    disabled={!canUpdateAttendance}
                                                    className={`
                            px-4 py-2 rounded-xl border flex items-center justify-center font-medium transition-all w-28
                            ${attendanceData[student._id] === 'Present'
                                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                                            : 'bg-white border-slate-200 text-slate-500'}
                            ${canUpdateAttendance && attendanceData[student._id] !== 'Present' ? 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer' : ''}
                            ${!canUpdateAttendance && attendanceData[student._id] !== 'Present' ? 'cursor-not-allowed opacity-60' : ''}
                          `}
                                                >
                                                    {attendanceData[student._id] === 'Present' && <CheckCircle2 size={16} className="mr-1.5" />}
                                                    Present
                                                </button>

                                                {/* Absent Button */}
                                                <button
                                                    onClick={() => canUpdateAttendance && handleStatusChange(student._id, 'Absent')}
                                                    disabled={!canUpdateAttendance}
                                                    className={`
                            px-4 py-2 rounded-xl border flex items-center justify-center font-medium transition-all w-28
                            ${attendanceData[student._id] === 'Absent'
                                                            ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                                                            : 'bg-white border-slate-200 text-slate-500'}
                            ${canUpdateAttendance && attendanceData[student._id] !== 'Absent' ? 'hover:border-red-300 hover:bg-red-50 hover:text-red-600 cursor-pointer' : ''}
                            ${!canUpdateAttendance && attendanceData[student._id] !== 'Absent' ? 'cursor-not-allowed opacity-60' : ''}
                          `}
                                                >
                                                    {attendanceData[student._id] === 'Absent' && <XCircle size={16} className="mr-1.5" />}
                                                    Absent
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Save Button */}
                    {canUpdateAttendance && (
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button
                                onClick={handleSaveAttendance}
                                disabled={isAttendanceSaving}
                                className={`
                    px-6 py-3 rounded-xl flex items-center font-medium shadow-sm transition-all
                    ${isAttendanceSaving
                                        ? 'bg-indigo-400 text-white cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}
                `}
                            >
                                {isAttendanceSaving ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save size={18} className="mr-2" />
                                        Save Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FacultyAttendance;
