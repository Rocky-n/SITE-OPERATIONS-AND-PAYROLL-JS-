const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongod = null;
const uriFilePath = path.resolve(__dirname, '../../.mongo_uri');

const connectDB = async () => {
  try {
    // Check process.env.MONGO_URI first (as specified), then fallback to MONGODB_URI
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log(`Connecting to MongoDB at: ${mongoUri.split('@').pop()}`);
      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts) {
        try {
          attempts++;
          await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
          });
          console.log('✓ Successfully connected to live JS Constructions database (js_constructions_db)');
          return;
        } catch (err) {
          console.warn(`Attempt ${attempts}/${maxAttempts} to connect to live DB failed: ${err.message}`);
          if (attempts >= maxAttempts) {
            console.warn('⚠️ Could not connect to live MongoDB Atlas cluster (make sure current IP is whitelisted on MongoDB Atlas). Falling back to in-memory MongoDB so the server remains active...');
            break;
          }
          await new Promise((res) => setTimeout(res, 2000));
        }
      }
    }

    // Check if an existing memory server URI was written
    if (fs.existsSync(uriFilePath)) {
      try {
        const cachedUri = fs.readFileSync(uriFilePath, 'utf8').trim();
        if (cachedUri) {
          await mongoose.connect(cachedUri);
          console.log(`Connected to active in-memory MongoDB at ${cachedUri}`);
          return;
        }
      } catch (err) {
        // Fallback to creating a new one
      }
    }

    // Fallback to spinning up in-memory MongoDB
    console.log('MONGO_URI not provided or empty. Starting in-memory MongoDB server...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    fs.writeFileSync(uriFilePath, memoryUri, 'utf8');

    await mongoose.connect(memoryUri);
    console.log(`In-memory MongoDB started and connected successfully at ${memoryUri}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      if (fs.existsSync(uriFilePath)) {
        fs.unlinkSync(uriFilePath);
      }
    }
  } catch (error) {
    console.error('Error disconnecting DB:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
