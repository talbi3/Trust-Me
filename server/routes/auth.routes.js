import express from 'express';
import validateRequest from '../middleware/validate-request.middleware.js';
import { createUserSchema, loginSchema } from '../validations/user.validation.js';
import {
    register,
    getAllUsers,
    login,
    logout
} from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Read Only Permission Routes
 */

router.get('/', getAllUsers);


/**
 * Read and Write Permission Routes
 */

router.post('/', validateRequest(createUserSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);


export default router;
