const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Employee } = require('../models');
const auth = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').trim().toLowerCase(),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['admin', 'employee']).withMessage('Invalid role specified')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password, role } = req.body;

      // Find user by email
      const user = await Employee.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check role restriction if provided
      if (role && user.role !== role) {
        return res.status(401).json({
          success: false,
          message: `Role mismatch. This account is registered as ${user.role.toUpperCase()}, but you selected Login as ${role.toUpperCase()}.`
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'jenovate_jwt_secret_key',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/forgot-password (ADMIN ONLY)
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Valid admin email is required').trim().toLowerCase()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email } = req.body;

      // Find user by email
      const user = await Employee.findOne({ where: { email } });
      
      if (!user || user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Password reset via verification code is strictly reserved for Admin accounts. Only registered admin emails can request reset codes.'
        });
      }

      // Generate 6-digit numeric OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

      user.reset_code = code;
      user.reset_code_expires = expires;
      await user.save();

      // Send verification code via email service
      await sendVerificationEmail(user.email, code);

      return res.json({
        success: true,
        message: `Verification code sent to ${user.email}. Please check your email inbox.`,
        code: code // Included for instant testing preview during dev/demo
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/verify-reset-code (Verify OTP)
router.post(
  '/verify-reset-code',
  [
    body('email').isEmail().withMessage('Valid email is required').trim().toLowerCase(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('6-digit code is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, code } = req.body;

      const user = await Employee.findOne({ where: { email, role: 'admin' } });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Admin account not found for this email address.'
        });
      }

      if (!user.reset_code || user.reset_code !== code.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code. Please check your code and try again.'
        });
      }

      if (new Date() > new Date(user.reset_code_expires)) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.'
        });
      }

      return res.json({
        success: true,
        message: 'Verification code verified successfully. You may now enter a new password.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/reset-password (Confirm & Change Password)
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Valid email is required').trim().toLowerCase(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('6-digit code is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, code, newPassword } = req.body;

      const user = await Employee.findOne({ where: { email, role: 'admin' } });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Admin account not found for this email address.'
        });
      }

      if (!user.reset_code || user.reset_code !== code.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code.'
        });
      }

      if (new Date() > new Date(user.reset_code_expires)) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.'
        });
      }

      // Update password and clear reset code
      user.password = newPassword;
      user.reset_code = null;
      user.reset_code_expires = null;
      await user.save();

      return res.json({
        success: true,
        message: 'Admin password has been reset successfully! You can now log in with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').trim().toLowerCase(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await Employee.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Create student account
      const user = await Employee.create({
        name,
        email,
        password,
        role: 'student'
      });

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get('/me', auth, async (req, res, next) => {
  try {
    return res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
