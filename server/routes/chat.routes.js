import express from 'express';
import googleAuth from "../middleware/google-auth.middleware.js";
import { 
  createNewChat, 
  getAllChats, 
  getChatHistory, 
  sendMessage 
} from '../controllers/chat.controller.js';

const router = express.Router();

router.use(googleAuth);  

/**
 * Read Only Permission Routes
 */

// Loading all past chats for a user to sidebar
router.get('/', getAllChats);

// Loading a chat history in a specific chat conversation
router.get('/:id', getChatHistory);


/**
 * Read and Write Permission Routes
 */

// Server starting a new chat session in DB and returning chat ID
router.post('/new', createNewChat);

// Sending a message to an existing chat and receiving a response from openAI
router.post('/:id/message', sendMessage);


export default router;