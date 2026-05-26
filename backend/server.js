// backend/server.js
// MediCare HMS — Main Express Server

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express  = require('express');
const path     = require('path');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ─── Routes ───────────────────────────────
const authRoutes        = require('./routes/auth');
const patientRoutes     = require('./routes/patients');
const doctorRoutes      = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');

// ─── Initialize App ───────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Connect Database ─────────────────────
connectDB();

// ─── Security Middleware ──────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Strict rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

// ─── Standard Middleware ──────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Serve Static Frontend ────────────────
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// ─── API Routes ───────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// ─── Health Check ─────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediCare HMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── SPA Fallback: serve index.html for non-API routes ───
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// ─── Error Handling ───────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────
const server = app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🏥 MediCare HMS Server Started`);
  console.log(`  📡 Port      : ${PORT}`);
  console.log(`  🌍 Env       : ${process.env.NODE_ENV}`);
  console.log(`  🔗 URL       : http://localhost:${PORT}`);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `  🔑 Dev Login : ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`
    );
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('👋 Server closed gracefully');
    process.exit(0);
  });
});

module.exports = app;
