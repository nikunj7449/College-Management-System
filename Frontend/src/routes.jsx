import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

import AdminDashboard from './components/admin/dashboard/AdminDashboard';

import StudentCardList from './components/admin/StduentCardList';
import AdminStudent from './components/admin/student/AdminStudent';

import FacultyList from './components/admin/FacultyList';
import AdminFaculty from './components/admin/faculty/AdminFaculty';

import CourseList from './components/admin/CourseList';
import AdminCourse from './components/admin/course/AdminCourse';



// Placeholder components
const FacultyDashboard = () => <div className="p-4 text-xl">Faculty Dashboard</div>;
const StudentDashboard = () => <div className="p-4 text-xl">Student Dashboard</div>;
const Unauthorized = () => <div className="p-4 text-xl text-red-500">403 - You are not authorized to view this page.</div>;
const NotFound = () => <div className="p-4 text-xl">404 - Page Not Found</div>;

const AppRoutes = () => {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          }/>
          <Route path="/students" element={
              <ProtectedRoute roles={['ADMIN', 'FACULTY']}><AdminStudent /></ProtectedRoute>
          }/>
          <Route path="/courses" element={
              <ProtectedRoute roles={['ADMIN']}><AdminCourse /></ProtectedRoute>
          }/>
          <Route path="/facultys" element={
              <ProtectedRoute roles={['ADMIN']}><AdminFaculty /></ProtectedRoute>
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
    </>
  );
};

export default AppRoutes;