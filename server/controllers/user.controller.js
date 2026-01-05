import User from "../models/user.model.js";
import UserMetadata from "../models/userMetadata.model.js";
import logger from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/user/profile
 * Auth: googleAuth middleware sets req.user
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    name: user.name,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl,
    dateOfBirth: user.dateOfBirth,
  });
});

/**
 * PUT /api/user/profile
 * Auth: googleAuth middleware sets req.user
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, dateOfBirth, profilePictureUrl } = req.body;

  const profileLogger = logger.child({ logMetadata: `User ${userId}` });
  profileLogger.debug("Updating user profile");

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
  if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  res.status(200).json({ user: updatedUser });
});

/**
 * GET /api/user/settings
 * Auth: googleAuth middleware sets req.user
 */
const getUserSettings = asyncHandler(async (req, res) => {
  const user = req.user;
  res.status(200).json(user.settings || {});
});

/**
 * PUT /api/user/settings
 * Auth: googleAuth middleware sets req.user
 */
const updateUserSettings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const settingsData = req.body;

  const settingsLogger = logger.child({ logMetadata: `User ${userId}` });
  settingsLogger.debug("Updating user settings");

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { settings: settingsData } },
    { new: true, runValidators: true }
  ).lean();

  res.status(200).json({ success: true, settings: updatedUser.settings });
});



/**
 * GET /api/user/metadata
 * Auth: googleAuth middleware sets req.user
 */
const getUserMetadata = asyncHandler(async (req, res) => {
  const user = req.user;

  const metaDoc = await UserMetadata.findOneAndUpdate(
    { userId: user._id },
    { $setOnInsert: { userId: user._id } },
    { new: true, upsert: true }
  ).lean();

  const preferences = {
    ...(user.settings ?? {}),
    ...(metaDoc.preferences ?? {}),
  };

  res.status(200).json({
    userId: String(user._id),
    pronouns: metaDoc.pronouns ?? "",
    previousIncidents: metaDoc.previousIncidents ?? [],
    preferences,
    conversation: metaDoc.conversation ?? { lastConversationAt: null, conversationCount: 0 },
  });
});

/**
 * PUT /api/user/metadata
 * Auth: googleAuth middleware sets req.user
 */
const updateUserMetadata = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { pronouns } = req.body;

  const metaLogger = logger.child({ logMetadata: `UserMetadata ${userId}` });
  metaLogger.debug("Updating user metadata");

  const updateData = {};
  if (pronouns !== undefined) updateData.pronouns = pronouns;

  const updatedMeta = await UserMetadata.findOneAndUpdate(
    { userId },
    { $set: updateData, $setOnInsert: { userId } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  res.status(200).json({ success: true, metadata: updatedMeta });
});


export {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getUserMetadata,
  updateUserMetadata,
};

