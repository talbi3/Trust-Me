import express from "express";
import multer from "multer";
import logger from "../utils/logger.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// multer in-memory (no local uploads folder)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG/PNG/WEBP images are allowed"));
    }
    cb(null, true);
  },
});

router.post("/profile-picture", upload.single("image"), async (req, res) => {
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

export default router;
