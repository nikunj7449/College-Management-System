const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

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

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'ADMIN'
    });

    // 2. Create Admin (Profile)
    const admin = await Admin.create({
      user: newUser._id,
      name,
      email,
      adminId,
      phone,
      role: role || 'ADMIN',
      joinedDate
    });

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
    if (req.body.role) userUpdates.role = req.body.role;

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