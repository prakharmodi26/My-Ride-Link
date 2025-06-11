require('dotenv').config({ path: '.env.test' });

const { sequelize } = require('../src/models');
const logger = require('../src/config/logger');
const { User, Vehicle, Ride, Payment, Review, Notification, Location } = require('../src/models');

// Global setup - runs once before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  if (process.env.DB_TEST_MODE !== 'false') {
    // Connect to test database
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: true });
      logger.info('Test database connected and synced');
    } catch (error) {
      logger.error('Test database connection failed:', error);
      throw error;
    }
  }
});

// Global teardown - runs once after all tests
afterAll(async () => {
  if (process.env.DB_TEST_MODE !== 'false') {
    // Close database connection
    await sequelize.close();
  }
});

// Clean up database after each test
afterEach(async () => {
  if (process.env.DB_TEST_MODE !== 'false') {
    await Promise.all([
      User && User.destroy ? User.destroy({ where: {}, force: true }) : Promise.resolve(),
      Vehicle && Vehicle.destroy ? Vehicle.destroy({ where: {}, force: true }) : Promise.resolve(),
      Ride && Ride.destroy ? Ride.destroy({ where: {}, force: true }) : Promise.resolve(),
      Payment && Payment.destroy ? Payment.destroy({ where: {}, force: true }) : Promise.resolve(),
      Review && Review.destroy ? Review.destroy({ where: {}, force: true }) : Promise.resolve(),
      Notification && Notification.destroy ? Notification.destroy({ where: {}, force: true }) : Promise.resolve(),
      Location && Location.destroy ? Location.destroy({ where: {}, force: true }) : Promise.resolve(),
    ]);
  }
});

// Mock console methods to keep test output clean
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Mock winston logger
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock external services
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  messaging: () => ({
    send: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({ clientSecret: 'test-secret' }),
      confirm: jest.fn().mockResolvedValue({ status: 'succeeded' })
    }
  }));
});

// Mock logger for tests
jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  add: jest.fn()
}));

// Global test timeout
jest.setTimeout(10000);

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
}); 