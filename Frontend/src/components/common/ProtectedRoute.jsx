import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.some(role => user.role.toUpperCase() === role.toUpperCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;