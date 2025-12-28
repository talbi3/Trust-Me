import mongoose from "mongoose";
import ChatLog from "../data/chatLog.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import { createValidationError } from "../utils/errors.js"; 
import { chatHistoryQuerySchema,dayParamSchema } from "../validations/chat.validation.js";


// --- Helper Function ---
function getDayRangeUTC(dayStr) {
  const start = new Date(`${dayStr}T00:00:00.000Z`);
  const end = new Date(`${dayStr}T23:59:59.999Z`);
  return { start, end };
}

// --- Controllers ---

export const getDays = asyncHandler(async (req, res) => {
  // 1. Validation
  const { error, value } = chatHistoryQuerySchema.validate(req.query);
  if (error) {
    throw createValidationError(error.details[0].message);
  }
  
  const { userId } = value;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 2. Aggregation
  const days = await ChatLog.aggregate([
    { $match: { userId: userObjectId } }, 
    {
      $addFields: {
        day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      },
    },
    {
      $group: {
        _id: "$day",
        count: { $sum: 1 },
        lastMessageAt: { $max: "$timestamp" },
      },
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 0,
        day: "$_id",
        count: 1,
        lastMessageAt: 1,
      },
    },
  ]);

  logger.info(`Retrieved chat days for user ${userId}. Count: ${days.length}`);
  res.json(days);
});


export const getMessagesByDay = asyncHandler(async (req, res) => {
  // 1. Validation (Query + Params)
  const queryValidation = chatHistoryQuerySchema.validate(req.query);
  const paramsValidation = dayParamSchema.validate(req.params);

  if (queryValidation.error) throw createValidationError(queryValidation.error.details[0].message);
  if (paramsValidation.error) throw createValidationError(paramsValidation.error.details[0].message);

  const { userId } = queryValidation.value;
  const { day } = paramsValidation.value;

  // 2. Logic
  const { start, end } = getDayRangeUTC(day);

  const messages = await ChatLog.find({
    userId: userId, // Mongoose converts string -> ObjectId automatically in .find()
    timestamp: { $gte: start, $lte: end },
  })
    .sort({ timestamp: 1 })
    .populate('userId', 'name profilePictureUrl') 
    .lean(); 

  logger.info(`Retrieved ${messages.length} messages for user ${userId} on ${day}`);
  res.json(messages);
});


export const deleteDay = asyncHandler(async (req, res) => {
  // 1. Validation
  const queryValidation = chatHistoryQuerySchema.validate(req.query);
  const paramsValidation = dayParamSchema.validate(req.params);

  if (queryValidation.error) throw createValidationError(queryValidation.error.details[0].message);
  if (paramsValidation.error) throw createValidationError(paramsValidation.error.details[0].message);

  const { userId } = queryValidation.value;
  const { day } = paramsValidation.value;

  // 2. Logic
  const { start, end } = getDayRangeUTC(day);

  const result = await ChatLog.deleteMany({
    userId: userId,
    timestamp: { $gte: start, $lte: end },
  });

  if (result.deletedCount === 0) {
    logger.info(`No messages found to delete for user ${userId} on ${day}`);
  } else {
    logger.info(`Deleted ${result.deletedCount} messages for user ${userId} on ${day}`);
  }

  res.json({ 
    success: true,
    deletedCount: result.deletedCount, 
    day 
  });
});