import 'dotenv/config';
import express from "express";             
import cors from "cors";                    
import path from 'path';
import { fileURLToPath } from 'url';
import morganMiddleware from './middleware/morgan.middleware.js';
import apiRouter from './routes/index.js';
import {connectDB, getDBStatus} from './config/db.js';
import config from './config/index.js';
import logger from './utils/logger.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // Create the Express application instance

app.use(morganMiddleware); // Use Morgan middleware for logging HTTP requests
app.use(express.json()); // Parse incoming JSON bodies and put the result into req.body
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({ origin: config.cors.origin || "*" })); 


app.get("/health", (req, res) => res.json({ ok: true })); // Simple health endpoint: verifies the server is up
app.get("/db-status", (req, res) => { res.json({ dbStatus: getDBStatus() }); }); // Database status endpoint: returns Mongoose connection state
app.use('/api', apiRouter); // Use the main API router for all `/api` routes

connectDB(); // Connect to MongoDB and start the server

app.listen(config.port, () => { logger.info(`Server is running on port ${config.port}`);}); // Start server
