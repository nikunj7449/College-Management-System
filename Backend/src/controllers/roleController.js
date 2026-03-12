const Role = require('../models/Role');
const User = require('../models/User');
const Module = require('../models/Module');

// @desc    Create a new role
// @route   POST /api/v1/roles
// @access  Private (SuperAdmin)
exports.createRole = async (req, res, next) => {
    try {
        const { name, description, permissions, sidebarConfig, isSystem } = req.body;

        if (!name) {
            res.status(400);
            throw new Error('Role name is required');
        }

        const roleExists = await Role.findOne({ name: name.toUpperCase() });
        if (roleExists) {
            res.status(400);
            throw new Error('Role already exists');
        }

        const role = await Role.create({
            name: name.toUpperCase(),
            description,
            permissions,
            sidebarConfig,
            isSystem: isSystem || false
        });

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: role
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all roles
// @route   GET /api/v1/roles
// @access  Private (SuperAdmin, potentially others to fetch dropdown options)
exports.getAllRoles = async (req, res, next) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single role
// @route   GET /api/v1/roles/:id
// @access  Private (SuperAdmin)
exports.getRoleById = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            res.status(404);
            throw new Error('Role not found');
        }

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a role (permissions or description)
// @route   PUT /api/v1/roles/:id
// @access  Private (SuperAdmin)
exports.updateRole = async (req, res, next) => {
    try {
        let role = await Role.findById(req.params.id);

        if (!role) {
            res.status(404);
            throw new Error('Role not found');
        }

        const updateData = { ...req.body };
        const resultingIsSystem = updateData.isSystem !== undefined ? updateData.isSystem : role.isSystem;

        // Protect system roles from name changes
        if (resultingIsSystem && updateData.name && updateData.name.toUpperCase() !== role.name) {
            res.status(403);
            throw new Error('Cannot change the name of a core system role');
        }

        if (updateData.name) {
            role.name = updateData.name.toUpperCase();
        }

        if (updateData.description !== undefined) {
            role.description = updateData.description;
        }

        if (updateData.permissions) {
            // Because permissions is a Mongoose Map, we should use .set()
            for (const [moduleName, perms] of Object.entries(updateData.permissions)) {
                role.permissions.set(moduleName, perms);
            }
            role.markModified('permissions');
        }

        if (updateData.sidebarConfig !== undefined) {
            role.sidebarConfig = updateData.sidebarConfig;
        }

        if (updateData.isSystem !== undefined && role.name !== 'SUPERADMIN') {
            role.isSystem = updateData.isSystem;
        }

        await role.save();

        res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: role
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a role
// @route   DELETE /api/v1/roles/:id
// @access  Private (SuperAdmin)
exports.deleteRole = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            res.status(404);
            throw new Error('Role not found');
        }

        // 1. Prevent deletion of System roles
        if (role.isSystem) {
            res.status(403);
            throw new Error(`Cannot delete system default role: ${role.name}`);
        }

        // 2. Prevent deletion if role is currently assigned to users
        const usersWithRole = await User.countDocuments({ role: role.name });

        if (usersWithRole > 0) {
            res.status(400);
            throw new Error(`Cannot delete role. It is currently assigned to ${usersWithRole} user(s). Reassign them first.`);
        }

        await role.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all system modules available for permissions
// @route   GET /api/v1/roles/modules
// @access  Private (SuperAdmin)
exports.getSystemModules = async (req, res, next) => {
    try {
        const modulesDocs = await Module.find().sort({ createdAt: 1 });
        const modules = modulesDocs.map(m => m.name);

        res.status(200).json({
            success: true,
            data: modules
        });
    } catch (error) {
        next(error);
    }
};
