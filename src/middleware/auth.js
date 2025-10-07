const jwt = require('jsonwebtoken');
const User = require('../models/users.mongo');

const authenticateToken = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // If no token in header, check cookies
    const cookieToken = req.cookies?.token;
    const authToken = token || cookieToken;
    
    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add user info to request - CRITICAL: Use 'id' not '_id'
    req.user = {
      id: decoded.id,  // This should be a string ID
      _id: user._id,   // Keep MongoDB ObjectId for compatibility
      role: decoded.role || 'user',
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };
    
    console.log('Auth middleware: User authenticated:', req.user.id);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const cookieToken = req.cookies?.token;
    const authToken = token || cookieToken;
    
    if (authToken) {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = {
          id: decoded.id,
          _id: user._id,
          role: decoded.role || 'user',
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        };
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't fail if token is invalid
    next();
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    if (requests.has(clientId)) {
      const clientRequests = requests.get(clientId);
      const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
      requests.set(clientId, validRequests);
    } else {
      requests.set(clientId, []);
    }
    
    const clientRequests = requests.get(clientId);
    
    if (clientRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
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
  rateLimit
};