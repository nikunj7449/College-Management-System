import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/common/core/ProtectedRoute';
import Navbar from './components/common/core/Navbar';
import Footer from './components/common/core/Footer';

import AdminDashboard from './components/admin/dashboard/AdminDashboard';
import AdminProfile from './components/admin/profile/AdminProfile';
import AdminStudent from './components/admin/student/AdminStudent';
import AdminFaculty from './components/admin/faculty/AdminFaculty';
import AdminCourse from './components/admin/course/AdminCourse';
import AdminManagement from './components/admin/AdminManagement';
import SuperadminUserManagement from './components/superadmin/SuperadminUserManagement';
import RolesManagement from './components/superadmin/RolesManagement';
import ModulesManagement from './components/superadmin/ModulesManagement';
import EventsManager from './components/admin/event/EventsManager';
import AddEvent from './components/admin/event/AddEvent';
import EditEvent from './components/admin/event/EditEvent';
import ExamManager from './components/admin/exam/ExamManager';
import FacultyDashboard from './components/faculty/dashboard/FacultyDashboard';
import FacultyStudent from './components/faculty/student/FacultyStudent';
import FacultyCourse from './components/faculty/course/FacultyCourse';
import FacultyAttendance from './components/faculty/attendance/FacultyAttendance';
import FacultyPerformance from './components/faculty/performance/FacultyPerformance';
import FacultyProfile from './components/faculty/profile/FacultyProfile';
import RemarksManager from './components/common/remark/RemarksManager';
import StudentDashboard from './components/student/dashboard/StudentDashboard';
import StudentCourse from './components/student/course/StudentCourse';
import StudentFaculty from './components/student/faculty/StudentFaculty';
import StudentAttendance from './components/student/attendance/StudentAttendance';
import StudentExams from './components/student/exams/StudentExams';
import StudentEvents from './components/student/events/StudentEvents';
import StudentProfile from './components/student/profile/StudentProfile';
import FeeCategories from './components/admin/fees/FeeCategories';
import FeeStructure from './components/admin/fees/FeeStructure';
import StudentFees from './components/admin/fees/StudentFees';
import FeeReports from './components/admin/fees/FeeReports';
import StudentMyFees from './components/student/fees/StudentMyFees';
import MyNotifications from './components/common/notifications/MyNotifications';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Placeholder components
const Unauthorized = () => <div className="p-4 text-xl text-red-500">403 - You are not authorized to view this page.</div>;
const NotFound = () => <div className="p-4 text-xl">404 - Page Not Found</div>;

const AppRoutes = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <Navbar />
      <main className="container mx-auto px-4 flex-1 py-6">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/superadmin/dashboard" element={
            <ProtectedRoute roles={['SUPERADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminProfile /></ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute requireModule="STUDENT" requireAction="read"><AdminStudent /></ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute requireModule="COURSE" requireAction="read"><AdminCourse /></ProtectedRoute>
          } />
          <Route path="/facultys" element={
            <ProtectedRoute requireModule="FACULTY" requireAction="read"><AdminFaculty /></ProtectedRoute>
          } />
          <Route path="/admins" element={
            <ProtectedRoute roles={[]}><AdminManagement /></ProtectedRoute> // Kept for reference, but superadmins use user-management
          } />
          <Route path="/user-management" element={
            <ProtectedRoute requireModule="USER" requireAction="read"><SuperadminUserManagement /></ProtectedRoute>
          } />
          <Route path="/superadmin/roles" element={
            <ProtectedRoute requireModule="ROLE" requireAction="read"><RolesManagement /></ProtectedRoute>
          } />
          <Route path="/superadmin/modules" element={
            <ProtectedRoute roles={['SUPERADMIN']}><ModulesManagement /></ProtectedRoute>
          } />
          <Route path="/exams" element={
            <ProtectedRoute requireModule="EXAM" requireAction="read"><ExamManager /></ProtectedRoute>
          } />
          <Route path="/events/add" element={
            <ProtectedRoute requireModule="EVENT" requireAction="create"><AddEvent /></ProtectedRoute>
          } />
          <Route path="/events/edit/:id" element={
            <ProtectedRoute requireModule="EVENT" requireAction="update"><EditEvent /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute requireModule="EVENT" requireAction="read"><EventsManager /></ProtectedRoute>
          } />
          <Route path="/faculty/dashboard" element={
            <ProtectedRoute roles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>
          } />
          <Route path="/faculty/students" element={
            <ProtectedRoute requireModule="STUDENT" requireAction="read"><FacultyStudent /></ProtectedRoute>
          } />
          <Route path="/faculty/courses" element={
            <ProtectedRoute requireModule="COURSE" requireAction="read"><FacultyCourse /></ProtectedRoute>
          } />
          <Route path="/faculty/attendance" element={
            <ProtectedRoute requireModule="ATTENDANCE" requireAction="read"><FacultyAttendance /></ProtectedRoute>
          } />
          <Route path="/faculty/profile" element={
            <ProtectedRoute roles={['FACULTY']}><FacultyProfile /></ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute requireModule="PERFORMANCE" requireAction="read"><FacultyPerformance /></ProtectedRoute>
          } />
          <Route path="/remarks" element={
            <ProtectedRoute requireModule="REMARK" requireAction="read"><RemarksManager /></ProtectedRoute>
          } />
          
          {/* Fee Management Routes */}
          <Route path="/fees/categories" element={
            <ProtectedRoute requireModule="FEE" requireAction="read"><FeeCategories /></ProtectedRoute>
          } />
          <Route path="/fees/structures" element={
            <ProtectedRoute requireModule="FEE" requireAction="read"><FeeStructure /></ProtectedRoute>
          } />
          <Route path="/fees/students" element={
            <ProtectedRoute requireModule="FEE" requireAction="read"><StudentFees /></ProtectedRoute>
          } />
          <Route path="/fees/reports" element={
            <ProtectedRoute requireModule="FEE" requireAction="read"><FeeReports /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><MyNotifications /></ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/courses" element={
            <ProtectedRoute roles={['STUDENT']}><StudentCourse /></ProtectedRoute>
          } />
          <Route path="/student/faculties" element={
            <ProtectedRoute roles={['STUDENT']}><StudentFaculty /></ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute roles={['STUDENT']}><StudentAttendance /></ProtectedRoute>
          } />
          <Route path="/student/exams" element={
            <ProtectedRoute roles={['STUDENT']}><StudentExams /></ProtectedRoute>
          } />
          <Route path="/student/events" element={
            <ProtectedRoute roles={['STUDENT']}><StudentEvents /></ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute roles={['STUDENT']}><StudentProfile /></ProtectedRoute>
          } />
          <Route path="/student/fees" element={
            <ProtectedRoute roles={['STUDENT']}><StudentMyFees /></ProtectedRoute>
          } />
          <Route path="/student/remarks" element={
            <ProtectedRoute roles={['STUDENT']}><RemarksManager /></ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;