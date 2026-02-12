const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getProfile 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.post('/register', registerUser); // Open for initial setup, later protect this
//router.post('/register', protect, authorize('Admin'), registerUser); // 2. Register is now Protected (Only Admin can create new users)
router.post('/login', loginUser);

// Private Routes
router.get('/me', protect, getProfile);

module.exports = router;