const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { ValidationError, AuthenticationError } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');
const { sendEmail } = require('../utils/emailUtils');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenUtils');
const { NotFoundError } = require('../utils/errors');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber
    });

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      status: 'success',
      data: {
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Generate new tokens
    const token = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      status: 'success',
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
exports.logout = async (req, res, next) => {
  try {
    // In a real application, you might want to blacklist the token
    // or clear refresh tokens from the database
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save reset token to user
    await user.update({ resetToken });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Please click the following link to reset your password: ${resetUrl}`
    });

    res.json({
      status: 'success',
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update password
    await user.update({
      password,
      resetToken: null
    });

    res.json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
}; 