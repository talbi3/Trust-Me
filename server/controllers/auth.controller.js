import User from '../models/user.model.js';
import logger from '../utils/logger.js';
import { CustomError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';
import { OAuth2Client } from "google-auth-library";

/**
 * Google OAuth client
 */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


/**
 * POST /api/auth/google
 * Google Login (seeded users only)
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new CustomError({ message: "idToken is required for google login.", statusCode: 400 });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = payload?.email;

  if (!email) {
    throw new CustomError({ message: "Google token missing email.", statusCode: 400 });
  }

  const authLogger = logger.child({ logMetadata: `GoogleLogin ${email}` });
  authLogger.info('Google login attempt');

  const user = await User.findOne({ email }).lean();

  if (!user) {
    authLogger.warn('User not found for google login (not seeded)');
    throw new CustomError({ message: "User not found. Please ask admin to add you.", statusCode: 401 });
  }

  authLogger.info('Google login successful');
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
  googleLogin,
  logout
};