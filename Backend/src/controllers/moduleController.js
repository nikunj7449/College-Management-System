const Module = require('../models/Module');
const Role = require('../models/Role');

// @desc    Create a new module
// @route   POST /api/v1/modules
// @access  Private (SuperAdmin)
exports.createModule = async (req, res, next) => {
    try {
        const { name, description, isSystem } = req.body;

        if (!name) {
            res.status(400);
            throw new Error('Module name is required');
        }

        const moduleExists = await Module.findOne({ name: name.toUpperCase() });
        if (moduleExists) {
            res.status(400);
            throw new Error('Module already exists');
        }

        const systemModule = await Module.create({
            name: name.toUpperCase(),
            description,
            isSystem: isSystem || false
        });

        // Automatically grant full permissions to SUPERADMIN for the new module
        const superAdminRole = await Role.findOne({ name: 'SUPERADMIN' });
        if (superAdminRole) {
            superAdminRole.permissions.set(systemModule.name, {
                create: true,
                read: true,
                update: true,
                delete: true
            });
            await superAdminRole.save();
        }

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            data: systemModule
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all system modules
// @route   GET /api/v1/modules
// @access  Private (SuperAdmin)
exports.getAllModules = async (req, res, next) => {
    try {
        const modules = await Module.find().sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            count: modules.length,
            data: modules
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a module
// @route   PUT /api/v1/modules/:id
// @access  Private (SuperAdmin)
exports.updateModule = async (req, res, next) => {
    try {
        const systemModule = await Module.findById(req.params.id);

        if (!systemModule) {
            res.status(404);
            throw new Error('Module not found');
        }

        const updateData = { ...req.body };
        const resultingIsSystem = updateData.isSystem !== undefined ? updateData.isSystem : systemModule.isSystem;

        if (resultingIsSystem && updateData.name && updateData.name.toUpperCase() !== systemModule.name) {
            res.status(403);
            throw new Error('Cannot change the name of a core system module');
        }
        // Allow Super Admin to toggle isSystem flag
        if (updateData.isSystem !== undefined) {
            systemModule.isSystem = updateData.isSystem;
        }

        if (updateData.name) {
            systemModule.name = updateData.name.toUpperCase();
        }

        if (updateData.description !== undefined) {
            systemModule.description = updateData.description;
        }

        await systemModule.save();

        res.status(200).json({
            success: true,
            message: 'Module updated successfully',
            data: systemModule
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a module
// @route   DELETE /api/v1/modules/:id
// @access  Private (SuperAdmin)
exports.deleteModule = async (req, res, next) => {
    try {
        const systemModule = await Module.findById(req.params.id);

        if (!systemModule) {
            res.status(404);
            throw new Error('Module not found');
        }

        if (systemModule.isSystem) {
            res.status(403);
            throw new Error(`Cannot delete system default module: ${systemModule.name}`);
        }

        const moduleNameToDelete = systemModule.name;

        // Note: For a robust system, we should ideally go through all roles and remove this module key from their permissions map
        // But for simplicity/speed, often we just leave it and the UI won't render it since the module is gone.
        // We will proactively prune it here though.
        const roles = await Role.find({});
        for (const role of roles) {
            if (role.permissions && role.permissions.has(moduleNameToDelete)) {
                role.permissions.delete(moduleNameToDelete);
                await role.save();
            }
        }

        await systemModule.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
