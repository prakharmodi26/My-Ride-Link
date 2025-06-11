const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../middleware/errorHandler');
const { logger } = require('../config/logger');

// Token blacklist (in production, use Redis or similar)
const tokenBlacklist = new Set();

const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    type: 'access'
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    type: 'refresh'
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const verifyAccessToken = (token) => {
  try {
    if (isTokenBlacklisted(token)) {
      throw new AuthenticationError('Token has been invalidated');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'access') {
      throw new AuthenticationError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired');
    }
    throw new AuthenticationError('Invalid token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    if (isTokenBlacklisted(token)) {
      throw new AuthenticationError('Token has been invalidated');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token has expired');
    }
    throw new AuthenticationError('Invalid refresh token');
  }
};

const blacklistToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      tokenBlacklist.add(token);
      
      // Remove from blacklist after expiration
      setTimeout(() => {
        tokenBlacklist.delete(token);
      }, expiresIn * 1000);
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error);
  }
};

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const generateVerificationToken = () => {
  return jwt.sign(
    { type: 'verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'verification') {
      throw new AuthenticationError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Verification token has expired');
    }
    throw new AuthenticationError('Invalid verification token');
  }
};

const generatePasswordResetToken = () => {
  return jwt.sign(
    { type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      throw new AuthenticationError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Password reset token has expired');
    }
    throw new AuthenticationError('Invalid password reset token');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
  generateVerificationToken,
  verifyVerificationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
}; 