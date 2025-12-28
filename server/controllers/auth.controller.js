import User from '../data/user.schema.js';
import logger from '../utils/logger.js';
import { EntityNotFoundError, CustomError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * GET /api/auth/users
 * ! Should be Admin only
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const authLogger = logger.child({ logMetadata: 'AdminAction' });
    authLogger.info('Fetching all users');

    const users = await User.find().lean();
    
    authLogger.info(`Retrieved ${users.length} users`);
    res.status(200).json({ users });
});


/**
 * POST /api/auth/register
 * Create a new user
 */
const register = asyncHandler(async (req, res) => {
    const { email, name, profilePicture } = req.body; 

    const authLogger = logger.child({ logMetadata: `Register ${email}` });
    authLogger.info('Attempting to register user');

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
        throw new CustomError({ message: "A user with this Email already exists.", statusCode: 409 });
    }

    const newUser = await User.create({
        email,
        name,
        profilePictureUrl: profilePicture || "" 
    });

    authLogger.info(`User created successfully`, { id: newUser._id });
    
    res.status(201).json({ user: newUser });
});


/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new CustomError({ message: "Email is required for login.", statusCode: 400 });
    }

    const authLogger = logger.child({ logMetadata: `Login ${email}` });
    authLogger.info('Login attempt');

    const user = await User.findOne({ email }).lean();

    if (!user) {
        authLogger.warn('User not found during login');
        throw new EntityNotFoundError("User not found. Please register first.");
    }

    authLogger.info('User login successful');
    res.status(200).json({ user });
});


/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
    
    logger.info('Logout request received');

    res.status(200).json({ message: "Logged out successfully" });
});

export {
    getAllUsers,
    register,
    login,
    logout
};