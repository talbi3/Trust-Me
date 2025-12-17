// server/routes/user.js

import express from 'express';
import {
  getUserProfile,
  getUserSettings,
  updateUserProfile,
  updateUserSettings,
} from '../controllers/userController.js';

const router = express.Router();

// GET user profile
router.get('/profile', getUserProfile);

// UPDATE user profile
router.put('/profile', updateUserProfile);

// GET user settings
router.get('/settings', getUserSettings);

// UPDATE user settings
router.put('/settings', updateUserSettings);

export default router;
