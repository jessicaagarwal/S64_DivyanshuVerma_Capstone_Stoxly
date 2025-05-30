const mongoose = require('mongoose');

// Import Jest globals
const { beforeAll, afterAll, afterEach } = require('@jest/globals');
const { connectDB, clearDB, closeDB } = require('./db');
const { startServer, stopServer } = require('./testServer');

// Start server and connect to database before all tests
beforeAll(async () => {
  // Ensure we're disconnected before connecting
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await connectDB();
  startServer();
});

// Clear all collections after each test
afterEach(async () => {
  await clearDB();
});

// Close database connection and server after all tests
afterAll(async () => {
  try {
    await closeDB();
    await stopServer();
    
    // Force close any remaining connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Add a delay to ensure connections are closed
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}); 