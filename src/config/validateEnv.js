const { logger } = require('./logger');

const requiredEnvVars = {
  // Server
  PORT: 'Server port number',
  
  // Database
  DB_USER: 'Database username',
  DB_PASS: 'Database password',
  DB_NAME: 'Database name',
  DB_HOST: 'Database host',
  DB_PORT: 'Database port',
  
  // JWT
  JWT_SECRET: 'JWT secret key',
  JWT_REFRESH_SECRET: 'JWT refresh secret key',
  JWT_EXPIRES_IN: 'JWT token expiration time (e.g., 1h, 7d)',
  JWT_REFRESH_EXPIRES_IN: 'JWT refresh token expiration time (e.g., 7d, 30d)',
  
  // Uber API
  UBER_CLIENT_ID: 'Uber API client ID',
  UBER_CLIENT_SECRET: 'Uber API client secret',
  UBER_SERVER_TOKEN: 'Uber API server token',
  
  // Lyft API
  LYFT_CLIENT_ID: 'Lyft API client ID',
  LYFT_CLIENT_SECRET: 'Lyft API client secret',
  
  // Email
  EMAIL_HOST: 'SMTP host',
  EMAIL_PORT: 'SMTP port',
  EMAIL_USER: 'SMTP username',
  EMAIL_PASS: 'SMTP password',
  EMAIL_FROM: 'Sender email address',
  
  // Payment
  STRIPE_SECRET_KEY: 'Stripe secret key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret',
  
  // Frontend
  FRONTEND_URL: 'Frontend application URL',
  
  // Redis
  REDIS_URL: 'Redis connection URL'
};

function validateEnv() {
  const missingVars = [];
  
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missingVars.push({ key, description });
    }
  }
  
  if (missingVars.length > 0) {
    const errorMessage = 'Missing required environment variables:\n' +
      missingVars.map(({ key, description }) => `- ${key}: ${description}`).join('\n');
    
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  // Validate specific format requirements
  if (process.env.NODE_ENV && !['development', 'test', 'production'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV must be one of: development, test, production');
  }
  
  if (process.env.DB_PORT && isNaN(parseInt(process.env.DB_PORT))) {
    throw new Error('DB_PORT must be a number');
  }
  
  if (process.env.EMAIL_PORT && isNaN(parseInt(process.env.EMAIL_PORT))) {
    throw new Error('EMAIL_PORT must be a number');
  }
  
  logger.info('Environment variables validated successfully');
}

module.exports = validateEnv; 