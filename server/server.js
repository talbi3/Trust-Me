import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import rubberDuckRoutes from './routes/rubberDucks.js'; // Import the routes
import userRoutes from './routes/user.js';
import uploadRoutes from "./routes/uploads.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve static images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(cors({
  origin: process.env.CLIENT_URL
}));

// Use the routes file for all `/ducks` routes
app.use('/ducks', rubberDuckRoutes);
// Use the routes file for all `/api/user` routes
app.use('/api/user', userRoutes);
// Use the routes file for all `/api/uploads` routes
app.use("/api/uploads", uploadRoutes);



// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
