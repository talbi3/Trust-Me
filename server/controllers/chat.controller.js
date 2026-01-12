import asyncHandler from "../utils/asyncHandler.js";
import { EntityNotFoundError, createValidationError } from "../utils/errors.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import UserMetadata from "../models/userMetadata.model.js";
import { generateAIResponse, generateChatTitle, analyzePictureSafety, analyzeYoutubeVideo } from "../services/ai.service.js";
import { sendMessageSchema } from "../validations/chat.validation.js";
import { getYoutubeMetadata } from "../services/youtube.service.js";
import logger from "../utils/logger.js";
/**
 * Create a new chat session
 */
const createNewChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { category } = req.body;

  const newChat = await Chat.create({
    userId,
    category: category || "general",
  });

  res.status(201).json(newChat);
});

/**
 * Get all chats for the sidebar
 */
const getAllChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select("title category createdAt");

  res.status(200).json(chats);
});

/**
 * Get chat history
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chat = await Chat.findOne({ _id: id, userId: req.user._id }).populate({
    path: "messages",
    options: { sort: { createdAt: 1 } },
  });

  if (!chat) throw new EntityNotFoundError("Chat not found");

  res.status(200).json({
    chatId: chat._id,
    category: chat.category,
    title: chat.title,
    messages: chat.messages || [],
  });
});

/**
 * Send a message and get AI response
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;

  // 1. Validate body
  const { error, value } = sendMessageSchema.validate(req.body);
  if (error) throw createValidationError(error.details[0].message);

  const { message: userContent, hasImage, imageUrl } = value;

  // 2. Verify chat ownership
  const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
  if (!chat) throw new EntityNotFoundError("Chat not found");

  // 3. Handle YouTube feature (ONLY if category === youtube)
  let finalUserContent = userContent;
  let youtubeAnalysis = null;
  let videoMetadata = null;

  const categoryLower = (chat.category || "").toLowerCase();
  if (categoryLower === "youtube" || categoryLower === "youtubeanalysis") {
    videoMetadata = await getYoutubeMetadata(userContent);

    if (videoMetadata) {
      // Get user age for personalized analysis
      const metaDoc = await UserMetadata.findOne({ userId: req.user._id }).lean();
      const userAge = metaDoc?.dateOfBirth 
        ? Math.floor((Date.now() - new Date(metaDoc.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      // Analyze the video with AI
      youtubeAnalysis = await analyzeYoutubeVideo(videoMetadata, userAge);
      
      // Store original URL as the user message
      finalUserContent = userContent;
    } else {
      finalUserContent = userContent;
    }
  }

  // 4. Save user message
  const userMessage = await Message.create({
    chatId,
    role: "user",
    content: finalUserContent,
    imageUrl: imageUrl || null,
    hasImage: hasImage || false,
  });

  // 5. Handle YouTube Analysis Response
  if (youtubeAnalysis) {
    // Build a friendly summary content
    const verdictEmoji = youtubeAnalysis.verdict === 'safe' ? '✅' : 
                         youtubeAnalysis.verdict === 'caution' ? '⚠️' : '🚫';
    const summaryContent = `${verdictEmoji} **Video Analysis Complete**\n\n${youtubeAnalysis.summary}`;

    // Save YouTube analysis as a special message
    const aiMessage = await Message.create({
      chatId,
      role: "assistant",
      content: summaryContent,
      isYoutubeAnalysis: true,
      youtubeAnalysis: youtubeAnalysis,
    });

    // Update chat title if this is the first message
    const history = await Message.find({ chatId }).sort({ createdAt: 1 });
    if (history.length <= 2) {
      const videoTitle = videoMetadata.title.substring(0, 30);
      chat.title = `YouTube: ${videoTitle}...`;
      await chat.save();
    }

    return res.status(200).json({ userMessage, aiMessage });
  }

  // 6. Regular chat flow (non-YouTube or invalid YouTube URL)
  const history = await Message.find({ chatId }).sort({ createdAt: 1 });

  // 7. User metadata for regular chat
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

  // Handle invalid YouTube URL case
  let aiContent;
  if ((categoryLower === "youtube" || categoryLower === "youtubeanalysis") && !videoMetadata) {
    aiContent = "I couldn't find a valid YouTube video from that link. Please paste a YouTube URL like:\n\n• https://www.youtube.com/watch?v=xxxxx\n• https://youtu.be/xxxxx\n\nAnd I'll analyze if it's safe to watch! 🎬";
  } else {
    // 8. Parallel AI tasks
    const tasks = [generateAIResponse(history, chat.category, userMetadata)];

    if (history.length === 1) {
      tasks.push(generateChatTitle(userContent, chat.category));
    }

    const results = await Promise.all(tasks);
    aiContent = results[0];
    const newTitle = results[1];

    // 9. Update title if needed
    if (newTitle) {
      chat.title = newTitle;
      await chat.save();
    } else if (history.length === 1) {
      chat.title = userContent.substring(0, 30) + "...";
      await chat.save();
    }
  }

  // 10. Save assistant message
  const aiMessage = await Message.create({
    chatId,
    role: "assistant",
    content: aiContent,
  });

  res.status(200).json({ userMessage, aiMessage });
});

/**
 * Delete chat
 */
const deleteChat = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const chat = await Chat.findOne({ _id: id, userId: req.user._id });
  if (!chat) throw new EntityNotFoundError("Chat not found");

  await Message.deleteMany({ chatId: id });
  await Chat.deleteOne({ _id: id });

  res.status(200).json({ message: "Chat deleted successfully", chatId: id });
});

/**
 * Edit message & regenerate
 */
const editMessage = asyncHandler(async (req, res) => {
  const { id: chatId, messageId } = req.params;
  const { newContent } = req.body;

  const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
  if (!chat) throw new EntityNotFoundError("Chat not found");

  const originalMsg = await Message.findOne({ _id: messageId, chatId });
  if (!originalMsg) throw new EntityNotFoundError("Message not found");

  originalMsg.content = newContent;
  originalMsg.isEdited = true;
  await originalMsg.save();

  await Message.deleteMany({
    chatId,
    _id: { $gt: originalMsg._id },
  });

  const history = await Message.find({ chatId }).sort({ createdAt: 1 });

  const metaDoc = await UserMetadata.findOne({ userId: req.user._id }).lean();
  const userMetadata = {
    nickName: metaDoc?.nickName ?? "",
    dateOfBirth: metaDoc?.dateOfBirth ?? "",
    pronouns: metaDoc?.pronouns ?? "",
  };

  const aiContent = await generateAIResponse(history, chat.category, userMetadata);

  const aiMessage = await Message.create({
    chatId,
    role: "assistant",
    content: aiContent,
  });

  res.status(200).json({ success: true, aiMessage });
});

/**
 * Delete message & rewind
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const { id: chatId, messageId } = req.params;

  const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
  if (!chat) throw new EntityNotFoundError("Chat not found");

  const msgToDelete = await Message.findOne({ _id: messageId, chatId });
  if (!msgToDelete) throw new EntityNotFoundError("Message not found");

  await Message.deleteMany({
    chatId,
    _id: { $gte: msgToDelete._id },
  });

  res.status(200).json({ success: true, message: "Conversation rewound" });
});


const analyzeImageSafety = asyncHandler(async (req, res) => {
  const { imageUrl, topic } = req.body;

  if (!imageUrl) {
    throw createValidationError("imageUrl is required");
  }

  const analysis = await analyzePictureSafety(imageUrl, topic || "Picture Safety");

  res.status(200).json(analysis);
});


/**
 * Save an analysis result message to the database
 */
const saveAnalysisMessage = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;
  const { content, safetyAnalysis } = req.body;

  // Verify chat ownership
  const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
  if (!chat) {
    throw new EntityNotFoundError("Chat not found");
  }

  // Create the analysis message
  const analysisMessage = await Message.create({
    chatId,
    role: "assistant",
    content: content,
    isAnalysisResult: true,
    safetyAnalysis: safetyAnalysis
  });

  logger.info(`Analysis message saved for chat: ${chatId}`);

  res.status(201).json(analysisMessage);
});


export {
  createNewChat,
  getAllChats,
  getChatHistory,
  sendMessage,
  deleteChat,
  editMessage,
  deleteMessage,
  analyzeImageSafety,
  saveAnalysisMessage
};

