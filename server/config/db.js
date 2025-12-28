import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

const connectDB = async () => {

  const mongoURI = config.db.uri;

  // Fail fast if the MongoDB URI is missing 
  if (!mongoURI) {
    throw new Error("Fatal Error: MONGODB_URI is not defined in .env file");
  }

  try {
    // Disable mongoose buffering to fail fast if not connected
    mongoose.set("bufferCommands", false);

    // Connect to MongoDB
    // Timeouts:
    // - serverSelectionTimeoutMS: how long to wait for a MongoDB server to be selected
    // - connectTimeoutMS: how long to wait for initial connection
    // - socketTimeoutMS: how long to wait for inactivity on the socket
    await mongoose.connect(mongoURI, {
      dbName: config.db.name,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });

    logger.debug("MongoDB connected successfully");

  } catch (err) {
    logger.error("MongoDB connection error:", err.message);
    throw err;
  }
};


const disconnectDB = async () => {
  await mongoose.disconnect();
};

const getDBStatus = () => {
  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  
  return {
    state: statusMap[mongoose.connection.readyState] || "unknown",
    code: mongoose.connection.readyState
  };
};


// Fired when Mongoose successfully connects to MongoDB
mongoose.connection.on("connected", () =>
  logger.debug("mongoose connected")
);

// Fired when Mongoose disconnects from MongoDB
mongoose.connection.on("disconnected", () =>
  logger.debug("mongoose disconnected")
);

// Fired when Mongoose encounters a connection-level error
mongoose.connection.on("error", (e) =>
  logger.error("mongoose error:", e.message)
);

export { connectDB, getDBStatus, disconnectDB };