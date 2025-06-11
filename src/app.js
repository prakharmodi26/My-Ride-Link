const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { logger } = require('./config/logger');
const validateEnv = require('./config/validateEnv');
const { testConnection, syncModels } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const corsMiddleware = require('./middleware/cors');
const securityMiddleware = require('./middleware/security');
const compressionMiddleware = require('./middleware/compression');
const { apiLimiter } = require('./middleware/rateLimiter');
const { requestLogger, errorLogger } = require('./middleware/logger');
const swagger = require('./docs/swagger');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const rideRoutes = require('./routes/rideRoutes');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notification');
const adminRoutes = require('./routes/admin');
const fareComparisonRoutes = require('./routes/fareComparison');

// Validate environment variables
validateEnv();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Global middleware
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(compressionMiddleware);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(requestLogger);
app.use(apiLimiter);

// Security middleware
app.use(helmet());
app.use(cors());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API Documentation
app.use('/api-docs', swagger.serve, swagger.setup);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/fare-comparison', fareComparisonRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling
app.use(errorLogger);
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const skipDbInit = process.env.DB_TEST_MODE === 'false';
    if (!skipDbInit) {
      // require and initialize DB
      const { sequelize, testConnection, syncModels } = require('./config/database');
    // Test database connection
    await testConnection();
    
    // Sync database models
    await syncModels(process.env.NODE_ENV === 'development');
    }
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

startServer();

module.exports = { app, server, io }; 