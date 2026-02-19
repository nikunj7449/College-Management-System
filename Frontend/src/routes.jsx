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
import EventsManager from './components/admin/event/EventsManager';

// Placeholder components
const FacultyDashboard = () => <div className="p-4 text-xl">Faculty Dashboard</div>;
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
          }/>
          <Route path="/students" element={
              <ProtectedRoute roles={['ADMIN', 'FACULTY', 'SUPERADMIN']}><AdminStudent /></ProtectedRoute>
          }/>
          <Route path="/courses" element={
              <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminCourse /></ProtectedRoute>
          }/>
          <Route path="/facultys" element={
              <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminFaculty /></ProtectedRoute>
          }/>
          <Route path="/admins" element={
              <ProtectedRoute roles={['SUPERADMIN']}><AdminManagement /></ProtectedRoute>
          }/>
          <Route path="/events" element={
              <ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><EventsManager /></ProtectedRoute>
          }/>
          <Route path="/faculty/dashboard" element={
              <ProtectedRoute roles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>
          }/>
          <Route path="/student/dashboard" element={
              <ProtectedRoute roles={['STUDENT']}><StudentDashboard /></ProtectedRoute>
          }/>

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