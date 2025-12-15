import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import rubberDuckRoutes from './routes/rubberDucks.js';
import userRoutes from './routes/userRoutes.js'; 

// 1. Load environment variables FIRST
dotenv.config();

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("❌ Fatal Error: MONGO_URI is not defined in .env file");
  process.exit(1); // Stop the app if there is no DB connection string
}

mongoose.connect(mongoURI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 2. Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
console.log('Starting server...');

// 3. Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve static images

// 4. Database Connection
// mongoose.connect("mongodb+srv://miryammazor62_db_user:ZleeIUeIIZTEJ8mL@hackathon_2025_QB.rnzftqh.mongodb.net/", {})//לשנות
//   .then(() => console.log('✅ MongoDB connected successfully'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// 5. Routes
// I kept your Ducks routes as requested
app.use('/ducks', rubberDuckRoutes);
app.use('/users', userRoutes);

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});