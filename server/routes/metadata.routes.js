import express from "express";
import validateRequest from "../middleware/validate-request.middleware.js";
import googleAuth from "../middleware/google-auth.middleware.js";
import { upsertUserMetadataSchema } from "../validations/metadata.validation.js";
import {
  getUserMetadata,
  updateUserMetadata,
} from "../controllers/metadata.controller.js";

const router = express.Router();
router.use(googleAuth);

// Keep the same URL shape under /api/user/metadata (mounted in routes/index.js)
router.get("/", getUserMetadata);
router.put("/", validateRequest(upsertUserMetadataSchema), updateUserMetadata);

export default router;
