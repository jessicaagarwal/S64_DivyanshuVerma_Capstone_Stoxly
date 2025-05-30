module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  detectOpenHandles: true,
  maxWorkers: 1,
  maxConcurrency: 1,
  teardownTimeout: 10000,
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
}; 