import express from 'express';
// Note: We must include the .js extension when using 'import'
import * as userController from '../controllers/userController.js'; 

const router = express.Router();

// Route to create a new user
router.post('/', userController.createUser);

// Route to get all users
router.get('/', userController.getAllUsers);

// Route to get specific user by Google ID
router.get('/:googleId', userController.getUserByGoogleId);

export default router; // This fixes the "default export" error