const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    const userRole = req.user.role?.name || req.user.role;

    if (!roles.includes(userRole)) {
      res.status(403);
      throw new Error(`User role ${userRole} is not authorized to access this route`);
    }
    next();
  };
};

/**
 * Middleware to check if the authenticated user has a specific permission.
 * Assumes req.user is populated and includes the role object with a permissions map.
 * 
 * @param {String} moduleName - The name of the module (e.g., 'STUDENT', 'FACULTY')
 * @param {String} action - The action to perform ('create', 'read', 'update', 'delete')
 */
const requirePermission = (moduleName, action) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(401);
      throw new Error('User not authenticated or role not found');
    }

    // SUPERADMIN inherently has all permissions on all modules
    const roleName = req.user.role?.name || req.user.role;
    if (roleName === 'SUPERADMIN') {
      return next();
    }

    const permissions = req.user.role.permissions;
    if (!permissions) {
      res.status(403);
      throw new Error('No permissions defined for this role');
    }

    // Check if the module exists in the permissions map
    const modulePermissions = permissions.get ? permissions.get(moduleName) : permissions[moduleName];

    if (!modulePermissions) {
      res.status(403);
      throw new Error(`Permission denied: Module '${moduleName}' not found or unauthorized`);
    }

    // Check if the specific action flag is true
    if (modulePermissions[action] !== true) {
      res.status(403);
      throw new Error(`Permission denied: Unauthorized to '${action}' on '${moduleName}'`);
    }

    next();
  };
};

module.exports = { authorize, requirePermission };