import express from "express";
import {
  getSettingsByGoogleId,
  updateSettingsByGoogleId,
    getUserFeatureByGoogleId,
} from "../controllers/settingsController.js";

const router = express.Router();

router.get("/:googleId", getSettingsByGoogleId);
router.patch("/:googleId", updateSettingsByGoogleId);
router.get("/:googleId/feature/:featureKey", getUserFeatureByGoogleId);

export default router;
