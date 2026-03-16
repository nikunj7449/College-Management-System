const User = require('../models/User');
const Admin = require('../models/Admin');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const { getWelcomeEmailTemplate } = require('../utils/emailTemplates');

// @desc    Add a new Admin
// @route   POST /api/v1/admins
// @access  Private (SuperAdmin)
exports.addAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, adminId, joinedDate } = req.body;

    if (!name || !email || !password || !adminId) {
      res.status(400);
      throw new Error('Please fill all required fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const adminIdExists = await Admin.findOne({ adminId });
    if (adminIdExists) {
      res.status(400);
      throw new Error('Admin ID already exists');
    }

    // 1. Create User (Auth)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const roleName = role || 'ADMIN';
    const roleDoc = await Role.findOne({ name: roleName });
    if (!roleDoc) {
      res.status(400);
      throw new Error(`Role ${roleName} not found in database. Cannot create admin.`);
    }

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: roleDoc._id
    });

    // 2. Create Admin (Profile)
    const admin = await Admin.create({
      user: newUser._id,
      name,
      email,
      adminId,
      phone,
      role: roleName,
      joinedDate
    });

    // 3. Send Welcome Email
    try {
      const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173/login';
      const emailHtml = getWelcomeEmailTemplate(
        name,
        roleName === 'SUPERADMIN' ? 'Super Admin' : 'Administrator',
        email,
        password,
        loginUrl
      );

      await sendEmail({
        email: email,
        subject: `Welcome to ${process.env.COLLEGE_NAME || 'College'} Admin Panel`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error(`Failed to send welcome email to admin ${adminId}:`, emailError);
    }

    res.status(201).json({
      success: true,
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Admins
// @route   GET /api/v1/admins
// @access  Private (SuperAdmin)
exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Admin
// @route   PUT /api/v1/admins/:id
// @access  Private (SuperAdmin)
exports.updateAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    // 1. Update User (Auth) if sensitive fields change
    const userUpdates = {};
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      userUpdates.password = await bcrypt.hash(req.body.password, salt);
    }
    if (req.body.name) userUpdates.name = req.body.name;
    if (req.body.email) userUpdates.email = req.body.email;
    if (req.body.role) {
      const newRoleDoc = await Role.findOne({ name: req.body.role });
      if (newRoleDoc) {
        userUpdates.role = newRoleDoc._id;
      } else {
        res.status(400);
        throw new Error(`Role ${req.body.role} not found in database.`);
      }
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(admin.user, userUpdates);
    }

    // 2. Update Admin (Profile)
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Admin
// @route   DELETE /api/v1/admins/:id
// @access  Private (SuperAdmin)
exports.deleteAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    if (admin.user.toString() === req.user.id) {
      res.status(400);
      throw new Error('Cannot delete yourself');
    }

    await User.findByIdAndDelete(admin.user);
    await admin.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admin deleted'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in Admin/Superadmin profile
// @route   GET /api/v1/admins/profile/me
// @access  Private (Admin/SuperAdmin)
exports.getMyProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ user: req.user.id });

    if (!admin) {
      res.status(404);
      throw new Error('Admin profile not found');
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged in Admin/Superadmin profile
// @route   PUT /api/v1/admins/profile/me
// @access  Private (Admin/SuperAdmin)
exports.updateMyProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findOne({ user: req.user.id });

    if (!admin) {
      res.status(404);
      throw new Error('Admin profile not found');
    }

    // Only allow updating specific personal fields
    const allowedUpdates = {};
    if (req.body.phone) allowedUpdates.phone = req.body.phone;
    if (req.body.name) allowedUpdates.name = req.body.name; // In Admin case, name is in profile too

    const updatedAdmin = await Admin.findByIdAndUpdate(
      admin._id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    // If name changed, update the User model too
    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAdmin
    });
  } catch (error) {
    next(error);
  }
};