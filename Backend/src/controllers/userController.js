const User = require('../models/User');
const Admin = require('../models/Admin');
const Faculty = require('../models/faculty');
const OtherUser = require('../models/OtherUser');
const Role = require('../models/Role');

// @desc    Get All Users (Excluding Students)
// @route   GET /api/v1/users
// @access  Private (SuperAdmin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const { search, role, status, course, branch, designation, sem, subject } = req.query;

        // Base query: Exclude students (unless specifically requested by role filter if needed, but default is exclude)
        let query = {};
        const studentRole = await Role.findOne({ name: 'STUDENT' });
        if (studentRole && (role !== 'STUDENT')) {
            query.role = { $ne: studentRole._id };
        }

        // 1. Strict Filter by Role
        if (role && role !== 'ALL' && role !== 'ALL Roles') {
            const filterRole = await Role.findOne({ name: role });
            if (filterRole) {
                query.role = filterRole._id;
            } else {
                query.role = null;
            }
        }

        // 2. Faculty Specific Filters (Course, Branch, Designation, etc.)
        // These filters only make sense if the role is Faculty or ALL Staff
        if (course || branch || designation || sem || subject) {
            const facultyQuery = {};
            
            const addMultiFilter = (field, value) => {
                if (!value) return;
                if (Array.isArray(value)) {
                    facultyQuery[field] = { $in: value };
                } else if (typeof value === 'string' && value.includes(',')) {
                    facultyQuery[field] = { $in: value.split(',') };
                } else {
                    facultyQuery[field] = value;
                }
            };

            addMultiFilter('course', course);
            addMultiFilter('branch', branch);
            addMultiFilter('designation', designation);
            addMultiFilter('sem', sem);
            addMultiFilter('subject', subject);

            const matchingFaculty = await Faculty.find(facultyQuery).select('user');
            const matchingUserIds = matchingFaculty.map(f => f.user);
            
            // Add to main query
            if (query._id) {
                query._id = { $and: [{ _id: query._id }, { _id: { $in: matchingUserIds } }] };
            } else {
                query._id = { $in: matchingUserIds };
            }
        }

        // 3. Strict Filter by Status
        if (status && status !== 'ALL' && status !== 'ALL Status') {
            query.status = status;
        }

        // 4. Search by Name or Email
        if (search && search.trim() !== '') {
            query.$and = [
                ...(query.$and || []),
                {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } }
                    ]
                }
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
        } else {
            // For custom roles
            await OtherUser.findOneAndDelete({ user: user._id });
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
        } else {
            // Check for custom/other role profiles
            profile = await OtherUser.findOne({ user: user._id });
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
