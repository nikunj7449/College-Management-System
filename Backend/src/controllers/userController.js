const User = require('../models/User');
const Admin = require('../models/Admin');
const Faculty = require('../models/faculty');
const Role = require('../models/Role');

// @desc    Get All Users (Excluding Students)
// @route   GET /api/v1/users
// @access  Private (SuperAdmin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const { search, role, status } = req.query;

        // Base query: Exclude students
        let query = {};
        const studentRole = await Role.findOne({ name: 'STUDENT' });
        if (studentRole) {
            query.role = { $ne: studentRole._id };
        }

        // Strict Filter by Role
        if (role && role !== 'ALL') {
            const filterRole = await Role.findOne({ name: role });
            if (filterRole) {
                query.role = filterRole._id;
            } else {
                // If role name not found, force empty result
                query.role = null;
            }
        }

        // Strict Filter by Status
        if (status && status !== 'ALL') {
            query.status = status;
        }

        // Search by Name or Email
        if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 }).select('-password').populate('role');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle User Status (Active/Inactive)
// @route   PUT /api/v1/users/:id/status
// @access  Private (SuperAdmin)
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('role');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user._id.toString() === req.user.id) {
            res.status(400);
            throw new Error('Cannot change your own status');
        }

        user.status = user.status === 'Active' ? 'Inactive' : 'Active';
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete User and Associated Profiles
// @route   DELETE /api/v1/users/:id
// @access  Private (SuperAdmin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user._id.toString() === req.user.id) {
            res.status(400);
            throw new Error('Cannot delete yourself');
        }

        // Attempt to delete associated profile based on role
        if (user.role?.name === 'ADMIN' || user.role?.name === 'SUPERADMIN') {
            await Admin.findOneAndDelete({ user: user._id });
        } else if (user.role?.name === 'FACULTY') {
            await Faculty.findOneAndDelete({ user: user._id });
            // Optional: you can delete Remarks here or trigger a hook
        }

        // Delete the underlying User Auth account
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted completely from the system'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Detailed Profile for a User (Admin or Faculty)
// @route   GET /api/v1/users/:id/profile
// @access  Private (SuperAdmin)
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('role');
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        let profile = null;
        if (user.role?.name === 'ADMIN' || user.role?.name === 'SUPERADMIN') {
            profile = await Admin.findOne({ user: user._id });
        } else if (user.role?.name === 'FACULTY') {
            profile = await Faculty.findOne({ user: user._id });
        }

        if (!profile) {
            res.status(404);
            throw new Error(`Profile data not found for this ${user.role?.name}`);
        }

        res.status(200).json({
            success: true,
            data: profile,
            userRole: user.role?.name // Handled natively so the frontend knows which modal to launch
        });
    } catch (error) {
        next(error);
    }
};
