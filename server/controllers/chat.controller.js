import asyncHandler from "../utils/asyncHandler.js";
import { EntityNotFoundError, createValidationError } from "../utils/errors.js";
import logger from "../utils/logger.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import UserMetadata from "../models/userMetadata.model.js";
import { generateAIResponse, generateChatTitle } from "../services/ai.service.js";
import { sendMessageSchema } from "../validations/chat.validation.js";


/**
 * Create a new chat session
 */
const createNewChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
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
 */
const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select("title category createdAt"); 

  res.status(200).json(chats);
});


/**
 * Get a specific chat with its history
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chat = await Chat.findOne({ _id: id, userId: req.user._id })
    .populate({
      path: "messages",             
      options: { sort: { createdAt: 1 } } 
    });

  if (!chat) {
    throw new EntityNotFoundError("Chat not found");
  }

  res.status(200).json({
    chatId: chat._id,
    category: chat.category || "general",
    title: chat.title,
    messages: chat.messages || []
  });
});


/**
 * Send a message and get AI response
 * UPDATED: 
 * 1. Generates AI Title on first message
 * 2. Returns { userMessage, aiMessage } to sync IDs with frontend
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;
  
  // 1. Validate Body
  const { error, value } = sendMessageSchema.validate(req.body);
  if (error) {
    throw createValidationError(error.details[0].message); 
  }
  
  const { message: userContent, hasImage } = value;

  // 2. Verify Chat Ownership
  const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
  if (!chat) {
    throw new EntityNotFoundError("Chat not found");
  }

  // 3. Save User Message
  const userMessage = await Message.create({
    chatId,
    role: "user",
    content: userContent,
    hasImage: hasImage || false 
  });

  // 4. Get History for AI Context
  const history = await Message.find({ chatId }).sort({ createdAt: 1 });

  // 4.1 Get User Metadata
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
  
  // --- PARALLEL EXECUTION START ---
  // We run AI Response generation AND Title generation (if needed) at the same time
  
  const tasks = [
    // Task A: Generate the Main AI Response
    generateAIResponse(history, chat.category, userMetadata)
  ];

  // Task B: Generate Title (Only if it's the very first user message)
  if (history.length === 1) {
    tasks.push(generateChatTitle(userContent, chat.category));
  }

  // Wait for all tasks to finish
  const results = await Promise.all(tasks);
  const aiContent = results[0]; // Result of Task A
  const newTitle = results[1];  // Result of Task B (undefined if not run)

  // --- PARALLEL EXECUTION END ---

  // 5. Update Chat Title if a new one was generated
  if (newTitle) {
      chat.title = newTitle;
      await chat.save();
  } else if (history.length === 1) {
      // Fallback if AI title generation failed
      chat.title = userContent.substring(0, 30) + "...";
      await chat.save();
  }

  // 6. Save Assistant Message
  const aiMessage = await Message.create({
    chatId,
    role: "assistant",
    content: aiContent,
  });

  // 7. Return BOTH messages
  res.status(200).json({ 
    userMessage, 
    aiMessage 
  });
});


/**
 * Delete a chat session and all its associated messages
 */
const deleteChat = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chat = await Chat.findOne({ _id: id, userId: req.user._id });

  if (!chat) {
    throw new EntityNotFoundError("Chat not found");
  }

  await Message.deleteMany({ chatId: id });
  await Chat.deleteOne({ _id: id });

  logger.info(`Chat deleted: ${id} by user: ${req.user._id}`);

  res.status(200).json({ message: "Chat deleted successfully", chatId: id });
});


/**
 * Edit a specific message & Regenerate AI Response
 * Logic: Updates content -> Deletes future messages -> Generates new AI response
 */
const editMessage = asyncHandler(async (req, res) => {
  // FIX: Map 'id' from route to 'chatId'
  const { id: chatId, messageId } = req.params; 
  const { newContent } = req.body;
  const userId = req.user._id;

  // 1. Verify user owns this chat
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) throw new EntityNotFoundError("Chat not found");

  // 2. Find the original message
  const originalMsg = await Message.findOne({ _id: messageId, chatId });
  if (!originalMsg) throw new EntityNotFoundError("Message not found");

  // 3. Update the message content
  originalMsg.content = newContent;
  originalMsg.isEdited = true;
  await originalMsg.save();

  // 4. Ripple Effect: Delete all messages created AFTER this message
  await Message.deleteMany({ 
    chatId, 
    _id: { $gt: originalMsg._id } 
  });

  // 5. Generate NEW AI Response
  const history = await Message.find({ chatId }).sort({ createdAt: 1 });

  const metaDoc = await UserMetadata.findOne({ userId }).lean();
  const userMetadata = {
    nickName: metaDoc?.nickName ?? "",
    dateOfBirth: metaDoc?.dateOfBirth ?? "",
    pronouns: metaDoc?.pronouns ?? "",
  };

  const aiContent = await generateAIResponse(history, chat.category, userMetadata);

  // 6. Save the new Assistant Message
  const aiMessage = await Message.create({
    chatId,
    role: "assistant",
    content: aiContent,
  });

  logger.info(`Message edited & conversation regenerated. Chat: ${chatId}`);

  // Return the new AI message so the frontend knows what happened
  res.status(200).json({ success: true, aiMessage });
});


/**
 * Delete a specific message & Rewind History
 * Logic: Deletes the message AND all subsequent messages.
 */
const deleteMessage = asyncHandler(async (req, res) => {
  // FIX: Map 'id' from route to 'chatId'
  const { id: chatId, messageId } = req.params;
  const userId = req.user._id;

  // 1. Verify chat ownership
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) throw new EntityNotFoundError("Chat not found");

  // 2. Find the message to delete
  const msgToDelete = await Message.findOne({ _id: messageId, chatId });
  if (!msgToDelete) throw new EntityNotFoundError("Message not found");

  // 3. Delete this message AND all future messages ($gte = Greater Than or Equal)
  await Message.deleteMany({ 
    chatId, 
    _id: { $gte: msgToDelete._id } 
  });

  logger.info(`Conversation rewound at message ${messageId}. Chat: ${chatId}`);

  res.status(200).json({ success: true, message: "Conversation rewound" });
});


export {
  createNewChat,
  getAllChats,
  getChatHistory,
  sendMessage,
  deleteChat,
  editMessage,
  deleteMessage
};