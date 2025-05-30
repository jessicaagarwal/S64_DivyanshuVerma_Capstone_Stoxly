const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stonxly_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('MongoDB connected for testing');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const clearDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
    }
  }
};

const closeDB = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

module.exports = {
  connectDB,
  clearDB,
  closeDB
}; 