// backend/middleware/auth.js
// JWT verification middleware — protects all API routes

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect - Verifies JWT token from Authorization header or cookie
 * Usage: router.get('/route', protect, handler)
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Fallback: check cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.',
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Check user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or has been deactivated.',
      });
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
};

/**
 * restrictTo - Role-based access control
 * Usage: router.delete('/route', protect, restrictTo('admin'), handler)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
