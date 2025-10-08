const jwt = require('jsonwebtoken');
const User = require('../models/users.mongo');

/**
 * Authenticate token (required)
 * - Checks token in cookie, Authorization header, or x-auth-token
 * - Validates user and attaches req.user
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Try multiple token sources
    let token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '') ||
      req.headers['x-auth-token'];

    console.log('🔐 Auth check - Token source:', {
      cookies: !!req.cookies?.token,
      authorization: !!req.headers.authorization,
      xAuthToken: !!req.headers['x-auth-token'],
    });

    if (!token) {
      console.log('🚫 No token found in request');
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully for user:', decoded.id);

    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      _id: user._id,
      role: decoded.role || user.role || 'user',
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    console.log('✅ Authenticated user:', req.user.username);
    next();
  } catch (error) {
    console.error('❗ Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

/**
 * Optional Authentication
 * - Allows requests without token
 * - Attaches user if valid token exists
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '') ||
      req.headers['x-auth-token'];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = {
          id: decoded.id,
          _id: user._id,
          role: decoded.role || user.role || 'user',
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {string|string[]} roles - allowed roles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Simple in-memory rate limiter
 * @param {number} windowMs - time window in ms
 * @param {number} max - max requests per window
 */
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Cleanup old requests
    if (requests.has(clientId)) {
      const validRequests = requests
        .get(clientId)
        .filter((timestamp) => timestamp > windowStart);
      requests.set(clientId, validRequests);
    } else {
      requests.set(clientId, []);
    }

    const clientRequests = requests.get(clientId);
    if (clientRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
      });
    }

    clientRequests.push(now);
    requests.set(clientId, clientRequests);
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  rateLimit,
};
