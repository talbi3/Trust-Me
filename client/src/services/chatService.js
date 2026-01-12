import api from './api'; 

const BASE_URL = '/api/chats';
const UPLOAD_URL = '/api/upload';
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
export const sendChatMessage = async (chatId, content, imageUrl = null) => {
  try {
    const response = await api.post(`${BASE_URL}/${chatId}/message`, {
      message: content,
      imageUrl: imageUrl, // Send the actual URL if exists
      hasImage: !!imageUrl // Keep boolean for backward compatibility if needed
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


/**
 * 5. Delete a Chat Session
 * ADDED: Deletes the chat and its messages via the API
 */
export const deleteChatSession = async (chatId) => {
  try {
    // Uses the HTTP DELETE method on the specific chat ID
    const response = await api.delete(`${BASE_URL}/${chatId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete chat session:", error);
    throw error;
  }
};


/**
 * 6. Edit a Message
 */
export const editChatMessage = async (chatId, messageId, newContent) => {
  try {
    const response = await api.put(`${BASE_URL}/${chatId}/message/${messageId}`, {
      newContent
    });
    return response.data;
  } catch (error) {
    console.error("Failed to edit message:", error);
    throw error;
  }
};

/**
 * 7. Delete a Message
 */
export const deleteChatMessage = async (chatId, messageId) => {
  try {
    const response = await api.delete(`${BASE_URL}/${chatId}/message/${messageId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete message:", error);
    throw error;
  }
};


export const uploadChatImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post(`${UPLOAD_URL}/chat-image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.url; // Returns the secure_url
  } catch (error) {
    console.error("Failed to upload chat image:", error);
    throw error;
  }
};


