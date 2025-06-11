process.env.NODE_ENV = 'development';
require('dotenv').config();
const app = require('./src/app');
const { testConnection, syncModels } = require('./src/config/database');
const { logger } = require('./src/config/logger');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    logger.info('Starting server initialization...');

    // Test database connection
    logger.info('Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    // Sync database models
    logger.info('Synchronizing database models...');
    const isSynced = await syncModels();
    if (!isSynced) {
      throw new Error('Database model synchronization failed');
    }

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`✅ API Documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      try {
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        logger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during server shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Promise Rejection:', error);
      logger.error('Error stack:', error && error.stack);
      logger.error('UNHANDLED REJECTION 🔥:', error && (error.stack || error.message || error));
      shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      logger.error('Error stack:', error && error.stack);
      logger.error('UNCAUGHT EXCEPTION 🔥:', error && (error.stack || error.message || error));
      shutdown();
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    logger.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Start the server
startServer(); 