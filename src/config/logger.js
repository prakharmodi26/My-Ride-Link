const winston = require('winston');
const { format } = winston;

// Create a minimal logger for test environment
const createTestLogger = () => {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    add: jest.fn()
  };
};

// Create the actual logger for non-test environments
const createLogger = () => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      })
    ]
  });

  // Add file transport in production
  if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }));
    logger.add(new winston.transports.File({ 
      filename: 'combined.log' 
    }));
  }

  return logger;
};

// Export appropriate logger based on environment
module.exports = process.env.NODE_ENV === 'test' ? createTestLogger() : createLogger(); 