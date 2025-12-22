import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUserSettings,
    updateUserSettings,
    deleteUser,
} from '../controllers/userController.js';


const router = express.Router();

/**
 * Read Only Permission Routes
 */

// GET user profile
router.get('/profile', getUserProfile);

// GET user settings
router.get('/settings', getUserSettings);


/**
 * Read and Write Permission Routes
 */

// DELETE a user
router.delete('/', deleteUser);

// UPDATE user profile
router.put('/profile', updateUserProfile);

// UPDATE user settings
router.put('/settings', updateUserSettings);

export default router;
