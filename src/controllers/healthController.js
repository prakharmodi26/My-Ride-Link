const { sequelize } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const healthController = {
  // Basic health check
  check: async (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
    });
  },

  // Detailed health check with database status
  detailed: async (req, res, next) => {
    try {
      // Check database connection
      await sequelize.authenticate();

      // Get database status
      const dbStatus = {
        connected: true,
        dialect: sequelize.getDialect(),
        database: sequelize.getDatabaseName(),
        host: sequelize.config.host,
        port: sequelize.config.port,
      };

      // Get system information
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      };

      res.status(200).json({
        status: 'success',
        message: 'Detailed health check completed',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        system: systemInfo,
      });
    } catch (error) {
      next(new AppError('Health check failed', 500));
    }
  },

  // Database connection test
  testDatabase: async (req, res, next) => {
    try {
      await sequelize.authenticate();
      res.status(200).json({
        status: 'success',
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(new AppError('Database connection failed', 500));
    }
  },

  // Environment information (for debugging)
  environment: (req, res) => {
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
      },
      // Don't expose sensitive information in production
      ...(process.env.NODE_ENV === 'development' && {
        jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not Set',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ? 'Set' : 'Not Set',
      }),
    };

    res.status(200).json({
      status: 'success',
      message: 'Environment information retrieved',
      data: envInfo,
    });
  },
};

module.exports = healthController; 