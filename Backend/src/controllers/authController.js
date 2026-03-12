const User = require('../models/User');
const Faculty = require('../models/faculty');
const Student = require('../models/Student');
const Role = require('../models/Role');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const { getOtpEmailTemplate, getResetLinkEmailTemplate } = require('../utils/emailTemplates');

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public (or Admin only based on middleware)
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role.toUpperCase() || 'STUDENT', // Default to Student if not specified
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please add email and password');
    }

    // Check for user email
    const user = await User.findOne({ email }).populate('role');

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check status
    if (user.status !== 'Active') {
      res.status(403);
      throw new Error('Account is inactive. Please contact admin.');
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    // Check password
    if (comparePassword) {
      res.status(200).json({
        success: true,
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id, user.role.name),
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Forgot Password - Send OTP to authority and reset link to user
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Please provide an email');
    }

    const user = await User.findOne({ email }).populate('role');
    if (!user) {
      res.status(404);
      throw new Error('User not found or email not registered');
    }

    let authorityEmail = process.env.SMTP_EMAIL; // Default fallback
    let authorityName = 'Superadmin';

    // Role-based authority routing
    if (user.role.name === 'STUDENT') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        // Find Senior Professor or Professor in the same branch
        const authority = await Faculty.findOne({
          branch: student.branch,
          designation: { $in: ['Senior Professor'] }
        });

        if (authority) {
          authorityEmail = authority.email || authority.personalEmail;
          authorityName = authority.name;
        }
      }
    } else {
      // Find a Superadmin user email if possible, else use default from .env
      const superadminRole = await Role.findOne({ name: 'SUPERADMIN' });
      if (superadminRole) {
          const superadmin = await User.findOne({ role: superadminRole._id });
          if (superadmin) {
              authorityEmail = superadmin.email;
              authorityName = superadmin.name;
          }
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and Expiry (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    console.log("authority mail id : ",authorityEmail);
    // Send OTP to authority
    try {
      await sendEmail({
        //email: authorityEmail,
        email: "nikunj.rndtechnosoft@gmail.com",
        subject: `Password Reset OTP for ${user.name}`,
        html: getOtpEmailTemplate(otp, user.name)
      });
    } catch (err) {
      console.error('Failed to send OTP to authority:', err);
    }

    // Send Reset Link to user
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?email=${user.email}`;
    console.log("user mail id : ",user.email);
    try {
      await sendEmail({
        //email: user.email,
        email: "nikunj.rndtechnosoft@gmail.com",
        subject: 'Password Reset Request',
        html: getResetLinkEmailTemplate(user.name, resetUrl)
      });
    } catch (err) {
      console.error('Failed to send reset link to user:', err);
      res.status(500);
      throw new Error('Email could not be sent');
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Please contact your HOD/Admin for the OTP.'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      res.status(400);
      throw new Error('Please provide all fields');
    }

    if (password !== confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }

    const user = await User.findOne({ 
      email,
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear OTP fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    next(error);
  }
};// @desc    Get Current User Profile
// @route   GET /api/v1/auth/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('role');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    next(error);
  }
};

