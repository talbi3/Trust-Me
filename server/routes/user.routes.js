import express from 'express';
import validateRequest from '../middleware/validate-request.middleware.js';
import googleAuth from '../middleware/google-auth.middleware.js';
import { 
    updateUserProfileSchema, 
    updateUserSettingsSchema 
} from '../validations/user.validation.js';

import {
    getUserProfile,
    updateUserProfile,
    getUserSettings,
    updateUserSettings,
} from '../controllers/user.controller.js';

const router = express.Router();
router.use(googleAuth);

/**
 * Read Only Permission Routes
 */

router.get('/profile', getUserProfile);
router.get('/settings', getUserSettings);


/**
 * Read and Write Permission Routes
 */

router.put('/profile', validateRequest(updateUserProfileSchema), updateUserProfile);
router.put('/settings', validateRequest(updateUserSettingsSchema), updateUserSettings);


export default router;
