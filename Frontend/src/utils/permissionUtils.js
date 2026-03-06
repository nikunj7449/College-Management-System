/**
 * Utility functions for checking role-based permissions on the frontend.
 */

/**
 * Checks if the given user has the specified permission for a module.
 * 
 * @param {Object} user - The logged-in user object containing user.role.permissions.
 * @param {string} moduleName - The name of the module (e.g., 'STUDENT', 'FACULTY'). Case-insensitive.
 * @param {string} action - The action to check ('create', 'read', 'update', 'delete').
 * @returns {boolean} True if the user has the permission, false otherwise.
 */
export const hasPermission = (user, moduleName, action) => {
    if (!user || !user.role || !user.role.permissions) {
        return false;
    }

    const moduleKey = moduleName.toUpperCase();
    const modulePermissions = user.role.permissions[moduleKey];

    if (!modulePermissions) {
        return false;
    }

    return !!modulePermissions[action];
};
