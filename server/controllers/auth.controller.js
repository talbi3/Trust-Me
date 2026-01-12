import User from '../models/user.model.js';
import UserMetadata from '../models/userMetadata.model.js'; 
import logger from '../utils/logger.js';
import { CustomError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js';
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /api/auth/google
 * Google Login or Register
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

  const name = payload?.name || "";
  const profilePictureUrl = payload?.picture || "";

  const authLogger = logger.child({ logMetadata: `GoogleLogin ${email}` });
  authLogger.info('Google login attempt');

  // 1) Find existing user
  let user = await User.findOne({ email });

  // 2) If not exists -> create user (registration)
  let isNewUser = false;
  if (!user) {
    authLogger.info('User not found - creating new user from Google profile');

    user = await User.create({
      name,
      email,
      profilePictureUrl,
    });

    isNewUser = true;
  }

  // 3) Ensure metadata doc exists (so we can later save pronouns safely)
  const metaDoc = await UserMetadata.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id } },
    { new: true, upsert: true }
  ).lean();

  // 4) Compute needsOnboarding based on UserMetadata
  const needsOnboarding =
    !metaDoc?.dateOfBirth ||
    !metaDoc?.pronouns ||
    !metaDoc?.nickName;

  authLogger.info('Google login successful');
  res.status(200).json({
    user: user.toObject ? user.toObject() : user, 
    needsOnboarding,
    isNewUser,
  });
});

const logout = asyncHandler(async (req, res) => {
  logger.info('Logout request received');
  res.status(200).json({ message: "Logged out successfully" });
});


export {
  googleLogin,
  logout,
};

