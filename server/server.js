import express from "express";              // Express: web framework for building HTTP APIs
import mongoose from "mongoose";           
import cors from "cors";                    
import dotenv from "dotenv";     
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

import apiRouter from './routes/index.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env into process.env
dotenv.config();

// Create the Express application instance
const app = express();
app.use(morgan('dev')); // HTTP request logger

// Parse incoming JSON bodies and put the result into req.body
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Use the main API router for all `/api` routes
app.use('/api', apiRouter);

// Connect to MongoDB and start the server
connectDB();

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});