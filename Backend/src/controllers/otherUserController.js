const User = require('../models/User');
const OtherUser = require('../models/OtherUser');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const { getWelcomeEmailTemplate } = require('../utils/emailTemplates');

// @desc    Add a new Other User (Custom Role)
// @route   POST /api/v1/other-users
// @access  Private (SuperAdmin)
exports.addOtherUser = async (req, res, next) => {
  try {
    const { name, personalEmail, phone, password, role, staffId, joinedDate, metadata } = req.body;

    if (!name || !personalEmail || !password || !staffId || !role) {
      res.status(400);
      throw new Error('Please fill all required fields');
    }

    const collegeEmail = `${staffId}@school.com`.toLowerCase();

    const userExists = await User.findOne({ email: collegeEmail });
    if (userExists) {
      res.status(400);
      throw new Error('Staff ID already exists as a user');
    }

    const staffIdExists = await OtherUser.findOne({ staffId });
    if (staffIdExists) {
      res.status(400);
      throw new Error('Staff ID already exists');
    }

    // 1. Create User (Auth)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const roleDoc = await Role.findOne({ name: role });
    if (!roleDoc) {
      res.status(400);
      throw new Error(`Role ${role} not found in database.`);
    }

    const newUser = await User.create({
      name,
      email: collegeEmail,
      password: hashedPassword,
      role: roleDoc._id
    });

    // 2. Create OtherUser (Profile)
    const profile = await OtherUser.create({
      user: newUser._id,
      name,
      personalEmail,
      collegeEmail,
      staffId,
      phone,
      role,
      metadata: metadata || {},
      joinedDate
    });

    // 3. Send Welcome Email
    try {
      const loginUrl = process.env.CLIENT_URL || 'http://localhost:5173/login';
      const emailHtml = getWelcomeEmailTemplate(
        name,
        role,
        collegeEmail,
        password,
        loginUrl
      );

      await sendEmail({
        email: personalEmail,
        subject: `Welcome to ${process.env.COLLEGE_NAME || 'College'} Panel`,
        html: emailHtml
      });
    } catch (emailError) {
      console.error(`Failed to send welcome email to staff ${staffId}:`, emailError);
    }

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Other Users
// @route   GET /api/v1/other-users
// @access  Private (SuperAdmin)
exports.getAllOtherUsers = async (req, res, next) => {
  try {
    const users = await OtherUser.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Other User
// @route   PUT /api/v1/other-users/:id
// @access  Private (SuperAdmin)
exports.updateOtherUser = async (req, res, next) => {
  try {
    const profile = await OtherUser.findById(req.params.id);
    if (!profile) {
      res.status(404);
      throw new Error('User profile not found');
    }

    // 1. Update User (Auth) if sensitive fields change
    const userUpdates = {};
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      userUpdates.password = await bcrypt.hash(req.body.password, salt);
    }
    if (req.body.name) userUpdates.name = req.body.name;
    
    // If Staff ID or personal email changes
    if (req.body.staffId) {
      const newStaffId = req.body.staffId.trim();
      if (newStaffId !== profile.staffId) {
        userUpdates.email = `${newStaffId}@school.com`.toLowerCase();
        req.body.collegeEmail = userUpdates.email;
      }
    }

    if (req.body.role) {
      const newRoleDoc = await Role.findOne({ name: req.body.role });
      if (newRoleDoc) {
        userUpdates.role = newRoleDoc._id;
      }
    }

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(profile.user, userUpdates);
    }

    // 2. Update Profile
    const updatedProfile = await OtherUser.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Other User
// @route   DELETE /api/v1/other-users/:id
// @access  Private (SuperAdmin)
exports.deleteOtherUser = async (req, res, next) => {
  try {
    const profile = await OtherUser.findById(req.params.id);
    if (!profile) {
      res.status(404);
      throw new Error('User profile not found');
    }

    await User.findByIdAndDelete(profile.user);
    await profile.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    next(error);
  }
};
