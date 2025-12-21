import express from 'express';

import {
    register,
    getAllUsers,
    login,
    logout
} from '../controllers/authController.js';

const router = express.Router();

/**
 * Read Only Permission Routes
 */

// GET all users
router.get('/', getAllUsers);


/**
 * Read and Write Permission Routes
 */

// POST a new user
router.post('/', register);

router.post('/login', login);

router.post('/logout', logout);


export default router;
