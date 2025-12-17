import express from "express";              // Express: web framework for building HTTP APIs
import mongoose from "mongoose";           
import cors from "cors";                    
import dotenv from "dotenv";              

import userRoutes from "./routes/userRoutes.js"; // Import the users router (handles /users endpoints)

// Load environment variables from .env into process.env
dotenv.config();

// Create the Express application instance
const app = express();

// Parse incoming JSON bodies and put the result into req.body
app.use(express.json());

// Enable CORS for the client origin (or allow all origins if CLIENT_URL is not set)
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

// Simple health endpoint: verifies the server is up
app.get("/health", (req, res) => res.json({ ok: true }));

// Database status endpoint: returns Mongoose connection state
app.get("/db-status", (req, res) => {
  res.json({
    mongooseState: mongoose.connection.readyState,
  });
});

// Mount the user routes under /users
app.use("/users", userRoutes);

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

/* =========================
   Server Startup
   ========================= */

const PORT = process.env.PORT || 5000;

// Main startup function: connect to MongoDB first, then start the HTTP server
async function startServer() {
  // Read MongoDB connection string from environment variables
  const mongoURI = process.env.MONGODB_URI;

  // Fail fast if the MongoDB URI is missing 
  if (!mongoURI) {
    console.error("❌ Fatal Error: MONGODB_URI is not defined in .env file");
    process.exit(1); // Exit with error code
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

    // Start listening for HTTP requests only AFTER DB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    // If DB connection fails, log the error and exit
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

startServer();
