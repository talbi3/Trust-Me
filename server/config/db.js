import mongoose from 'mongoose';

const connectDB = async () => {
  // Read MongoDB connection string from environment variables
  const mongoURI = process.env.MONGODB_URI;


  // Fail fast if the MongoDB URI is missing 
  if (!mongoURI) {
    throw new Error("❌ Fatal Error: MONGODB_URI is not defined in .env file");
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
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });

    // the DB connection succeeded
    console.log("✅ MongoDB connected successfully");

  } catch (err) {
    // If DB connection fails, log the error and exit
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

// Fired when Mongoose successfully connects to MongoDB
mongoose.connection.on("connected", () =>
  console.log("🟢 mongoose connected (event)")
);

// Fired when Mongoose disconnects from MongoDB
mongoose.connection.on("disconnected", () =>
  console.log("🟠 mongoose disconnected (event)")
);

// Fired when Mongoose encounters a connection-level error
mongoose.connection.on("error", (e) =>
  console.log("🔴 mongoose error (event):", e.message)
);

export default connectDB;