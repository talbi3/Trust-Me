import User from "../models/user.model.js";
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
  });
});

/**
 * PUT /api/user/profile
 * Auth: googleAuth middleware sets req.user
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, profilePictureUrl } = req.body;

  const profileLogger = logger.child({ logMetadata: `User ${userId}` });
  profileLogger.debug("Updating user profile");

  const updateData = {};
  if (name !== undefined) updateData.name = name;
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
export {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
};

