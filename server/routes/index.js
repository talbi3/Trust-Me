import express from 'express';
import userRoutes from './user.js';
import authRoutes from './auth.js';
import chatRoutes from '../routes/chatRoutes.js';
import multer from 'multer';
import path from 'path';
 

const apiRouter = express.Router();


apiRouter.use('/user', userRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/chat', chatRoutes);




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


apiRouter.post('/uploads/profile-picture', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

export default apiRouter;