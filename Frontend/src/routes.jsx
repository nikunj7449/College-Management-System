import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import AdminDashboard from './components/admin/dashboard/AdminDashboard';
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
import FacultyDashboard from './components/faculty/dashboard/FacultyDashboard';
import FacultyStudent from './components/faculty/student/FacultyStudent';
import FacultyCourse from './components/faculty/course/FacultyCourse';
import FacultyAttendance from './components/faculty/attendance/FacultyAttendance';
import FacultyPerformance from './components/faculty/performance/FacultyPerformance';

// Placeholder components
const StudentDashboard = () => <div className="p-4 text-xl">Student Dashboard</div>;
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
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/superadmin/dashboard" element={
            <ProtectedRoute roles={['SUPERADMIN']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/students" element={
            <ProtectedRoute roles={['ADMIN', 'FACULTY', 'SUPERADMIN']}><AdminStudent /></ProtectedRoute>
          } />
          <Route path="/courses" element={
            <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminCourse /></ProtectedRoute>
          } />
          <Route path="/facultys" element={
            <ProtectedRoute roles={['ADMIN']}><AdminFaculty /></ProtectedRoute>
          } />
          <Route path="/admins" element={
            <ProtectedRoute roles={[]}><AdminManagement /></ProtectedRoute> // Kept for reference, but superadmins use user-management
          } />
          <Route path="/user-management" element={
            <ProtectedRoute roles={['SUPERADMIN']}><SuperadminUserManagement /></ProtectedRoute>
          } />
          <Route path="/superadmin/roles" element={
            <ProtectedRoute roles={['SUPERADMIN']}><RolesManagement /></ProtectedRoute>
          } />
          <Route path="/superadmin/modules" element={
            <ProtectedRoute roles={['SUPERADMIN']}><ModulesManagement /></ProtectedRoute>
          } />
          <Route path="/events/add" element={
            <ProtectedRoute roles={['ADMIN', 'SUPERADMIN', 'FACULTY']}><AddEvent /></ProtectedRoute>
          } />
          <Route path="/events/edit/:id" element={
            <ProtectedRoute roles={['ADMIN', 'SUPERADMIN', 'FACULTY']}><EditEvent /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute roles={['ADMIN', 'SUPERADMIN', 'FACULTY']}><EventsManager /></ProtectedRoute>
          } />
          <Route path="/faculty/dashboard" element={
            <ProtectedRoute roles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>
          } />
          <Route path="/faculty/students" element={
            <ProtectedRoute roles={['FACULTY']}><FacultyStudent /></ProtectedRoute>
          } />
          <Route path="/faculty/courses" element={
            <ProtectedRoute roles={['FACULTY']}><FacultyCourse /></ProtectedRoute>
          } />
          <Route path="/faculty/attendance" element={
            <ProtectedRoute roles={['FACULTY']}><FacultyAttendance /></ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute roles={['FACULTY']}><FacultyPerformance /></ProtectedRoute>
          } />
          <Route path="/student/dashboard" element={
            <ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
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