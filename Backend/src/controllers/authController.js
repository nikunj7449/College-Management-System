const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

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
    const user = await User.findOne({ email });

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
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    next(error);
  }
};


// @desc    Get Current User Profile
// @route   GET /api/v1/auth/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
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

