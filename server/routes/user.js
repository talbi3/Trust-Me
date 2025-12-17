// server/routes/user.js

import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
} from '../controllers/userController.js';

const router = express.Router();

// GET user profile
router.get('/profile', getUserProfile);

// UPDATE user profile
router.put('/profile', updateUserProfile);

export default router;
