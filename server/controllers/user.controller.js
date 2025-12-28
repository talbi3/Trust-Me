import User from '../data/user.schema.js';
import UserMetadata from '../data/userMetadata.schema.js';
import logger from '../utils/logger.js';
import { EntityNotFoundError, CustomError } from '../utils/errors.js';
import asyncHandler from '../utils/asyncHandler.js'; 

/**
 * GET /api/user/profile
 */
const getUserProfile = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
      throw new CustomError({ message: "Email query param is required.", statusCode: 400 });
    }

    const profileLogger = logger.child({ logMetadata: `User ${email}` });
    profileLogger.debug("Requesting user profile");

    const user = await User.findOne({ email }).lean();

    if (!user) {
      throw new EntityNotFoundError(`User with email ${email} not found`);
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
      dateOfBirth: user.dateOfBirth,
    });
});

/**
 * PUT /api/user/profile
 */
const updateUserProfile = asyncHandler(async (req, res) => {
    const { email, name, dateOfBirth, profilePictureUrl  } = req.body;

    if (!email) {
       throw new CustomError({ message: "Email is required to identify user", statusCode: 400 });
    }

    const profileLogger = logger.child({ logMetadata: `User ${email}` });
    profileLogger.debug("Updating user profile");

    let updateData = { name, dateOfBirth };

    if (profilePictureUrl) { updateData.profilePictureUrl = profilePictureUrl; }

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new EntityNotFoundError(`User with email ${email} not found`);
    }

    res.status(200).json({ user: updatedUser });
});

/**
 * GET /api/user/settings
 */
const getUserSettings = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
      throw new CustomError({ message: "Email query param is required.", statusCode: 400 });
    }

    const settingsLogger = logger.child({ logMetadata: `User ${email}` });
    settingsLogger.debug("Requesting user settings");

    const user = await User.findOne({ email }).select('settings').lean();

    if (!user) {
      throw new EntityNotFoundError(`User with email ${email} not found`);
    }

    res.status(200).json(user.settings);
});

/**
 * PUT /api/user/settings
 */
const updateUserSettings = asyncHandler(async (req, res) => {
    const { email, ...settingsData } = req.body;

    if (!email) {
       throw new CustomError({ message: "Email is required to identify user", statusCode: 400 });
    }

    const settingsLogger = logger.child({ logMetadata: `User ${email}` });
    settingsLogger.debug("Updating user settings");

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { settings: settingsData } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      throw new EntityNotFoundError(`User with email ${email} not found`);
    }

    res.status(200).json({ success: true, settings: updatedUser.settings });
});

/**
 * DELETE /api/user
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new CustomError({ message: "Email is required to identify user", statusCode: 400 });
    }

    const userLogger = logger.child({ logMetadata: `User ${email}` });
    userLogger.warn("Deleting user account");

    const user = await User.findOneAndDelete({ email });

    if (!user) {
      throw new EntityNotFoundError(`User with email ${email} not found`);
    }

    res.status(200).json({
      message: "User deleted successfully",
      deletedUserEmail: user.email
    });
});

/**
 * GET /api/user/metadata?email=...
 * Returns minimal metadata object for context usage
 */
const getUserMetadata = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      throw new CustomError({ message: "Email is required to identify user", statusCode: 400 });
    }

    const user = await User.findOne({ email }).lean();

    // Handle new/unknown user: return sparse metadata
    if (!user) {
      return res.status(200).json({
        userId: null,
        pronouns: "",
        previousIncidents: [],
        preferences: {},
        conversation: { lastConversationAt: null, conversationCount: 0 }
      });
    }

    // Upsert metadata doc (create default if missing)
    const metaDoc = await UserMetadata.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id } },
      { new: true, upsert: true }
    ).lean();

    // Build preferences for context (use your existing user.settings)
    const preferences = {
      ...(user.settings ?? {}),
      ...(metaDoc.preferences ?? {}),
    };

    return res.status(200).json({
      userId: String(user._id),
      pronouns: metaDoc.pronouns ?? "",
      previousIncidents: metaDoc.previousIncidents ?? [],
      preferences,
      conversation: metaDoc.conversation ?? { lastConversationAt: null, conversationCount: 0 }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



export {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  deleteUser,
  getUserMetadata
};