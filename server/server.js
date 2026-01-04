import express from "express";             
import cors from "cors";                    
import path from 'path';
import { fileURLToPath } from 'url';
import morganMiddleware from './middleware/morgan.middleware.js';
import apiRouter from './routes/index.js';
import {connectDB, getDBStatus} from './config/db.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/error-handler.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 

/* ----------------------------- Middlewares ----------------------------- */

app.use(morganMiddleware); // Use Morgan middleware for logging HTTP requests
app.use(express.json()); // Parse incoming JSON bodies and put the result into req.body
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({ origin: config.cors.origin || "*" })); 

/* ------------------------------- Routes -------------------------------- */

// Health check endpoint
app.get("/health", (req, res) => res.json({ ok: true })); 

// Database status endpoint
app.get("/db-status", (req, res) => { res.json({ dbStatus: getDBStatus() }); }); 

// Main API router
app.use('/api', apiRouter);  

// Error handler middleware
app.use(errorHandler);

/* --------------------------- Start DB and Server ------------------------------ */

await connectDB(); 

app.listen(config.port, () => { logger.info(`Server is running on port ${config.port}`);}); 