import asyncHandler from "../utils/asyncHandler.js";
import User from "../data/user.schema.js";
import { postChatSchema } from "../validations/chat.validation.js";
import ChatLog from '../data/chatLog.schema.js'; 
import { createValidationError } from "../utils/errors.js";
import { generateMockResponse } from "../services/mockAgent.service.js";



/**
 * POST /api/chat
 * Body: { message: string, helpOption: string, userId: string }
 */
const postChatMessage = asyncHandler(async (req, res) => {
  // 1. Validation
  const { error, value } = postChatSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    throw createValidationError("Validation failed", error.details);
  }

  const { message, helpOption, userId, hasImage, isVoiceMessage } = value;

  // 2. Authorization: Verify User
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    res.status(401);
    throw new Error("Unauthorized: user not found");
  }

  // 3. Save USER Message to DB
  await ChatLog.create({
    userId,
    message: message || (hasImage ? "Sent an image" : "Voice message"),
    type: 'user',
    category: helpOption,
    hasImage: !!hasImage
  });

  // 4. Generate AI Response (Using the external Service)
  const { response, actions } = await generateMockResponse(helpOption, hasImage, isVoiceMessage);

  // 5. Save ASSISTANT Response to DB
  await ChatLog.create({
    userId,
    message: response,
    type: 'assistant',
    category: helpOption
  });

  // 6. Send Response to Client
  res.status(200).json({
    success: true,
    response,
    actions
  });
});



export default postChatMessage;
 