import asyncHandler from "../utils/asyncHandler.js";
import { EntityNotFoundError, createValidationError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import UserMetadata from "../models/userMetadata.model.js";
import { generateAIResponse } from "../services/ai.service.js";
import { sendMessageSchema } from "../validations/chat.validation.js";


/**
 * Create a new chat session
 * UPDATED: Accepts 'category' from body to set the conversation topic
 */
const createNewChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Extract category (e.g., "bullying", "sexual_harassment") or default to "general"
  const { category } = req.body; 

  const newChat = await Chat.create({ 
    userId,
    category: category || "general"
  });
  
  logger.info(`New chat created for user ${userId} with category: ${newChat.category}`);
  
  res.status(201).json(newChat);
});


/**
 * Get all chats for the sidebar (without messages)
 * UPDATED: Selects 'category' so the UI can show the correct icon
 */
const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select("title category createdAt"); 

  res.status(200).json(chats);
});


/**
 * Get a specific chat with its history
 * Uses Mongoose Virtuals to populate messages efficiently
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find chat and populate the virtual 'messages' field
  const chat = await Chat.findOne({ _id: id, userId: req.user._id })
    .populate({
      path: "messages",             
      options: { sort: { createdAt: 1 } } 
    });

  if (!chat) {
    throw new EntityNotFoundError("Chat not found");
  }

  // Return the populated messages array (or empty array if none exist)
  res.status(200).json(chat.messages || []);
});


/**
 * Send a message and get AI response
 * UPDATED: Handles 'hasImage' and passes 'chat.category' to AI service
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;
  
  // 1. Validate Body
  const { error, value } = sendMessageSchema.validate(req.body);
  if (error) {
    throw createValidationError(error.details[0].message); 
  }
  
  // Extract content and optional image flag
  const { message: userContent, hasImage } = value;

  // 2. Verify Chat Ownership
  const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
  if (!chat) {
    throw new EntityNotFoundError("Chat not found");
  }

  // 3. Save User Message
  await Message.create({
    chatId,
    role: "user",
    content: userContent,
    hasImage: hasImage || false 
  });

  // 4. Get History for AI Context
  const history = await Message.find({ chatId }).sort({ createdAt: 1 });

  // 4.1 Get (or create) User Metadata to personalize AI responses
  const metaDoc = await UserMetadata.findOneAndUpdate(
    { userId: req.user._id },
    { $setOnInsert: { userId: req.user._id } },
    { new: true, upsert: true }
  ).lean();

  const userMetadata = {
    nickName: metaDoc?.nickName ?? "",
    dateOfBirth: metaDoc?.dateOfBirth ?? "",
    pronouns: metaDoc?.pronouns ?? "",
  };
  
  // 5. Generate AI Response
  // UPDATED: Pass 'chat.category' as the 2nd argument so the AI knows the context
  const aiContent = await generateAIResponse(history, chat.category, userMetadata);

  // 6. Save Assistant Message
  const aiMessage = await Message.create({
    chatId,
    role: "assistant",
    content: aiContent,
  });

  // 7. Update Chat Title (if it's the first message)
  if (history.length <= 2) {
      chat.title = userContent.substring(0, 30) + "..."; 
      await chat.save();
  }

  // 8. Return the new AI message to the UI
  res.status(200).json(aiMessage);
});

export {
  createNewChat,
  getAllChats,
  getChatHistory,
  sendMessage,
};