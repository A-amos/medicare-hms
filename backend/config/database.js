// backend/config/database.js
// MongoDB connection using Mongoose

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options ensure stable connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('   Make sure MongoDB is running and MONGODB_URI in .env is correct');
    process.exit(1);
  }
};

module.exports = connectDB;
