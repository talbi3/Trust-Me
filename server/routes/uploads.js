import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /api/uploads/profile-picture
router.post("/profile-picture", upload.single("image"), (req, res) => {
  console.log("req.file =", req.file);  

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
