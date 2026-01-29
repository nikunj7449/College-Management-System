const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, enrollmentId, department } = req.body;

    if (!fullName || !email || !password || !role || !enrollmentId || !department) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { enrollmentId }] });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email or ID');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name: fullName,
      email,
      enrollmentId,
      department,
      password: hashedPassword,
      role: role.toUpperCase(),
    });

    if (user) {
      res.status(201).json({
        success: true,
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
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
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

    // Check password
    if (await comparePassword(password, user.password)) {
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

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logout
};