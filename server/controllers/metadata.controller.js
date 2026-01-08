import UserMetadata from "../models/userMetadata.model.js";
import logger from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/user/metadata
 * Auth: googleAuth middleware sets req.user
 */
const getUserMetadata = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const metaDoc = await UserMetadata.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  ).lean();

  res.status(200).json({
    userId: String(userId),
    nickName: metaDoc.nickName ?? "",
    dateOfBirth: metaDoc.dateOfBirth ?? "",
    pronouns: metaDoc.pronouns ?? "",
  });
});

/**
 * PUT /api/user/metadata
 * Auth: googleAuth middleware sets req.user
 */
const updateUserMetadata = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { pronouns, dateOfBirth, nickName } = req.body;

  const metaLogger = logger.child({ logMetadata: `UserMetadata ${userId}` });
  metaLogger.debug("Updating user metadata");

  const updateData = {};
  if (pronouns !== undefined) updateData.pronouns = pronouns;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
  if (nickName !== undefined) updateData.nickName = nickName;

  const updatedMeta = await UserMetadata.findOneAndUpdate(
    { userId },
    { $set: updateData, $setOnInsert: { userId } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  res.status(200).json({ success: true, metadata: updatedMeta });
});

export { getUserMetadata, updateUserMetadata };
