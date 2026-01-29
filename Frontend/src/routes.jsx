import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

// Placeholder components
const AdminDashboard = () => <div className="p-4 text-xl">Admin Dashboard</div>;
const TeacherDashboard = () => <div className="p-4 text-xl">Teacher Dashboard</div>;
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
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
          }/>
          <Route path="/teacher/dashboard" element={
              <ProtectedRoute roles={['TEACHER', 'FACULTY']}><TeacherDashboard /></ProtectedRoute>
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