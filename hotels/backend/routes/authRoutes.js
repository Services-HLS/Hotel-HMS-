// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const { authenticate } = require('../middleware/auth');

// // Public routes
// router.post('/login', authController.login);


// // Protected routes
// router.get('/me', authenticate, authController.getCurrentUser);
// router.post('/change-password', authenticate, authController.changePassword);

// module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User'); // Add this import
const EmailService = require('../services/emailService'); // Add this import
const jwt = require('jsonwebtoken'); // Add this import
const bcrypt = require('bcryptjs'); // Add this for password hashing

// IMPORT THE DATABASE POOL
const { pool } = require('../config/database'); 

// Public routes
router.post('/login', authController.login);

// ========== PASSWORD RESET ROUTES ==========

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset - Step 1: Check email
 * @access Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_REQUIRED',
        message: 'Email address is required'
      });
    }

    // Find ALL users with this email
    const users = await User.findAllByEmail(email);
    
    // If no users found - return success for security
    if (!users || users.length === 0) {
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // If only ONE user found, proceed normally
    if (users.length === 1) {
      const user = users[0];
      
      // Generate reset token
      const resetToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          hotel_id: user.hotel_id,
          purpose: 'password_reset'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      // Create reset link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Send email
      await EmailService.sendPasswordResetEmail({
        to: email,
        userName: user.name,
        hotelName: user.hotel_name,
        resetLink: resetLink,
        expiresIn: '1 hour'
      });

      return res.json({
        success: true,
        message: 'Password reset link has been sent to your email'
      });
    }

    // If MULTIPLE users found, return list of hotels
    const hotels = users.map(user => ({
      hotelId: user.hotel_id,
      hotelName: user.hotel_name,
      userName: user.name,
      userRole: user.role,
      status: user.status
    }));

    res.json({
      success: true,
      requiresHotelSelection: true,
      message: 'Multiple accounts found with this email. Please select your hotel.',
      data: {
        email: email,
        hotels: hotels
      }
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to process request'
    });
  }
});

/**
 * @route POST /api/auth/forgot-password-with-hotel
 * @desc Request password reset - Step 2: After hotel selection
 * @access Public
 */
router.post('/forgot-password-with-hotel', async (req, res) => {
  try {
    const { email, hotelId } = req.body;

    if (!email || !hotelId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email and hotel selection are required'
      });
    }

    // Find specific user by email AND hotel_id
    const [rows] = await pool.execute(
      `SELECT u.*, h.name as hotel_name 
       FROM users u
       JOIN hotels h ON u.hotel_id = h.id
       WHERE u.email = ? AND u.hotel_id = ?`,
      [email, hotelId]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found for selected hotel'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        hotel_id: user.hotel_id,
        purpose: 'password_reset'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Create reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email
    await EmailService.sendPasswordResetEmail({
      to: email,
      userName: user.name,
      hotelName: user.hotel_name,
      resetLink: resetLink,
      expiresIn: '1 hour'
    });

    res.json({
      success: true,
      message: `Password reset link sent for ${user.hotel_name}`
    });

  } catch (error) {
    console.error('❌ Forgot password with hotel error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to process request'
    });
  }
});

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'PASSWORD_MISMATCH',
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid reset token'
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const [result] = await pool.execute(
      `UPDATE users SET password = ? WHERE id = ? AND email = ?`,
      [hashedPassword, decoded.userId, decoded.email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Reset link has expired'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to reset password'
    });
  }
});

/**
 * @route POST /api/auth/verify-reset-token
 * @desc Verify if reset token is valid
 * @access Public
 */
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'TOKEN_REQUIRED',
        message: 'Reset token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        email: decoded.email
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Reset link has expired'
      });
    }
    
    res.status(400).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid reset token'
    });
  }
});

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;