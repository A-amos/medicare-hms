// backend/middleware/errorHandler.js
// Centralized error handling middleware

/**
 * errorHandler — catches all errors and sends consistent JSON responses
 * Must be the LAST middleware (4 params)
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // --- Mongoose: Invalid ObjectId ---
  if (err.name === 'CastError') {
    error.message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message: error.message });
  }

  // --- Mongoose: Duplicate field ---
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value: ${field} already exists.`;
    return res.status(400).json({ success: false, message: error.message });
  }

  // --- Mongoose: Validation error ---
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  // --- JWT errors ---
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  // --- Default ---
  res.status(err.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

/**
 * notFound — 404 handler for unknown routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
