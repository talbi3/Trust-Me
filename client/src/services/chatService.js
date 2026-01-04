import api from './api'; 

const BASE_URL = '/api/chats';

/**
 * 1. Create a new Chat Session
 * UPDATED: Now accepts 'category' to set the context (e.g., 'bullying')
 */
export const createChatSession = async (category) => {
  try {
    // We send the category in the body so the backend saves it in the Chat model
    const response = await api.post(`${BASE_URL}/new`, { 
      category: category || "general" 
    });
    return response.data; 
  } catch (error) {
    console.error("Failed to create chat session:", error);
    throw error;
  }
};

/**
 * 2. Send Message to AI
 * UPDATED: Added optional 'hasImage' parameter
 */
export const sendChatMessage = async (chatId, content, hasImage = false) => {
  try {
    const response = await api.post(`${BASE_URL}/${chatId}/message`, {
      message: content,
      hasImage: hasImage
    });
    return response.data; 
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};

/**
 * 3. Get All Chats (Sidebar)
 */
export const getUserChats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chats:", error);
    throw error;
  }
};

/**
 * 4. Get Specific Chat History
 */
export const getChatHistory = async (chatId) => {
  try {
    const response = await api.get(`${BASE_URL}/${chatId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    throw error;
  }
};