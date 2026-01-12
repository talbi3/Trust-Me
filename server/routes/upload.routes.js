import express from "express";
import multer from "multer";
import logger from "../utils/logger.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// multer in-memory (no local uploads folder)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (increased for larger images)
  fileFilter: (req, file, cb) => {
    // Extended format support including GIF, AVIF, HEIC
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif"];
    if (!allowed.includes(file.mimetype)) {
      logger.error(`Rejected file type: ${file.mimetype} (${file.originalname})`);
      return cb(new Error(`File type ${file.mimetype} not allowed. Supported: JPG, PNG, WEBP, GIF, AVIF, HEIC`));
    }
    cb(null, true);
  },
});

// Wrapper to catch multer errors properly
const uploadWithErrorHandling = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        logger.error(`Multer error: ${err.code} - ${err.message}`);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        logger.error(`Upload error: ${err.message}`);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
};

router.post("/profile-picture", uploadWithErrorHandling(upload.single("image")), async (req, res) => {
  try {
    if (!req.file) {
      logger.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "trustme/users/profile-pictures",
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );

      stream.end(req.file.buffer);
    });

    logger.info(`Uploaded to Cloudinary: ${result.secure_url}`);

    return res.json({
      url: result.secure_url,
    });
  } catch (err) {
    logger.error(`Cloudinary upload failed: ${err.message}`);
    return res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
});

router.post("/chat-image", uploadWithErrorHandling(upload.single("image")), async (req, res) => {
  try {
    if (!req.file) {
      logger.error("No chat file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "trustme/chat/images", // Different folder for chat images
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });

    logger.info(`Chat image uploaded to Cloudinary: ${result.secure_url}`);

    return res.json({
      url: result.secure_url,
    });
  } catch (err) {
    logger.error(`Chat upload failed: ${err.message}`);
    return res.status(500).json({
      error: "Upload failed",
      details: err.message,
    });
  }
});


export default router;
