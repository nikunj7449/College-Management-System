import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const ProtectedRoute = ({ children, roles, requireModule, requireAction = 'read' }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRoleName = user?.role?.name || user?.role || '';

  // 1. SUPERADMIN always bypasses all checks.
  if (userRoleName.toUpperCase() === 'SUPERADMIN') {
    return children;
  }

  // 2. Dynamic permission check if requiredModule is provided
  if (requireModule) {
    const permissions = user?.role?.permissions || {};
    const modulePerms = permissions[requireModule];

    // Check if the user has the required action permission on the module
    if (!modulePerms || !modulePerms[requireAction]) {
      return <Navigate to="/unauthorized" replace />;
    }
    return children;
  }

  // 3. Fallback to hardcoded role checks if valid roles array is passed
  if (roles && roles.length > 0) {
    if (!roles.some(role => userRoleName.toUpperCase() === role.toUpperCase())) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;