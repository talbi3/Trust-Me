import express from 'express';
import {
    getAllUsers,
    getUserByGoogleId,
    createUser,
    deleteUser,
    updateUser
} from '../controllers/userController.js';

const router = express.Router();

/**
 * Read Only Permission Routes
 */
// GET all users
router.get('/', getAllUsers);

// GET a single user
router.get('/:googleId', getUserByGoogleId);

/**
 * Read and Write Permission Routes
 */
// POST a new user
router.post('/', createUser);

// DELETE a user
router.delete('/:googleId', deleteUser);

// UPDATE a user
router.patch('/:googleId', updateUser);

export default router;