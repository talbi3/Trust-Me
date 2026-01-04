import express from 'express';
import multer from 'multer';
import logger from '../utils/logger.js';
 

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    
    cb(null, Date.now() + '-' + safeName);
  }
});
const upload = multer({ storage: storage });


router.post('/profile-picture', upload.single('image'), (req, res) => {
  if (!req.file) {
    logger.error("No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  logger.info(`File uploaded successfully: ${imageUrl}`);
  res.json({ url: imageUrl });
});

export default router;