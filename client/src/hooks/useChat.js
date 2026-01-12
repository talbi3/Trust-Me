import { useState, useCallback } from "react"; 
import { 
  createChatSession, 
  sendChatMessage, 
  getChatHistory, 
  deleteChatMessage, 
  editChatMessage,
  uploadChatImage // Make sure to export this from chatService.js
} from "../services/chatService"; 
import { CATEGORIES } from "../constants/categories.js";

export const useChat = (activeUserId) => {
  // --- State ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Image State
  const [imagePreview, setImagePreview] = useState(null); // Local URL for UI display
  const [imageFile, setImageFile] = useState(null);       // Actual File object for upload
  
  const [currentChatId, setCurrentChatId] = useState(null);

  // --- Handlers ---

  // NEW: specific handler for selecting images from the input
  const handleImageSelect = (file) => {
    if (!file) {
      setImagePreview(null);
      setImageFile(null);
      return;
    }
    // Create a local URL for immediate preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    // UI Greeting
    const helloMsg = {
      id: Date.now(),
      role: "assistant", 
      type: "assistant", 
      content: `Hi there! I see you want to talk about ${category.label}. I'm here to listen. What's on your mind?`,
      createdAt: new Date(),
      timestamp: new Date(),
    };
    setMessages([helloMsg]);
  };

  /**
   * Load an existing chat session from DB
   */
  const loadExistingChat = useCallback(async (chatId) => {
    try {
      setIsLoading(true);
      
      // 1. Fetch data from backend
      const data = await getChatHistory(chatId);
      
      // 2. Find the category object to restore UI (Label/Icon)
      const foundCategory = CATEGORIES.find(c => c.id === data.category) || CATEGORIES[0];

      // 3. Map DB messages to UI messages
      const formattedMessages = (data.messages || []).map((msg) => ({
        ...msg,
        // If DB has 'role', use it to set 'type', otherwise default to msg.type
        type: msg.role === 'user' ? 'user' : 'assistant',
        // Ensure we have a valid ID for React keys
        id: msg._id || msg.id || Date.now()
      }));

      // 4. Update State
      setCurrentChatId(chatId);
      setSelectedCategory(foundCategory);
      setMessages(formattedMessages); 

    } catch (error) {
      console.error("Failed to load chat:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setSelectedCategory(null);
    setMessages([]);
    setInputValue("");
    setImagePreview(null);
    setImageFile(null); // Clear the file object as well
    setCurrentChatId(null); 
  };

  /**
   * Send Message
   * Logic: 
   * 1. Optimistic UI update (shows text + local image immediately)
   * 2. Upload image to Cloudinary (if exists)
   * 3. Send text + image URL to backend
   */
  const handleSendMessage = async (overrideText = null) => {
    const textToSend = overrideText || inputValue;

    // Validation: Don't send if empty AND no image, or if currently loading
    if ((!textToSend.trim() && !imageFile) || isLoading) return;

    if (!activeUserId) {
        console.error("No active user found! Cannot send message.");
        return;
    }

    // 1. Generate Temporary ID
    const tempId = Date.now(); 

    // Optimistic UI Update
    // We use 'imagePreview' (Blob URL) here so the user sees the image instantly
    const optimisticUserMessage = {
      id: tempId, 
      role: "user",
      type: "user", 
      content: textToSend, 
      imageUrl: imagePreview, 
      createdAt: new Date(),
      timestamp: new Date(), 
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    
    // Store file reference locally for upload, then clear inputs
    const fileToUpload = imageFile; 
    setInputValue("");
    setImagePreview(null); 
    setImageFile(null);

    setIsLoading(true);

    try {
      // 2. Chat Session Management
      let chatId = currentChatId;

      if (!chatId) {
        const categoryId = selectedCategory?.id || "general";
        const newChat = await createChatSession(categoryId); 
        chatId = newChat._id || newChat.id; 
        setCurrentChatId(chatId); 
      }

      // 3. Upload Image (if selected)
      let uploadedImageUrl = null;
      if (fileToUpload) {
        // Upload to Cloudinary and get the secure URL
        uploadedImageUrl = await uploadChatImage(fileToUpload);
      }

      // 4. Send Message to Backend
      // Pass the text and the real Cloudinary URL
      const data = await sendChatMessage(chatId, textToSend, uploadedImageUrl); 

      // 5. Update the Temporary ID with the Real ID from Server
      // Also update the image URL to the remote one (optional, but good for consistency)
      setMessages((prev) => prev.map((msg) => {
        if (msg.id === tempId) {
          return {
             ...msg,
             id: data.userMessage._id, // Real MongoDB ID
             _id: data.userMessage._id,
             imageUrl: data.userMessage.imageUrl || msg.imageUrl
          };
        }
        return msg;
      }));

      // 6. Add AI Response
      const assistantMessage = {
        ...data.aiMessage,
        type: "assistant", 
        id: data.aiMessage._id || Date.now()
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Backend Error:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        type: "assistant", 
        content: "Sorry, I'm having trouble connecting to the server right now. Please try again.",
        isError: true,
        createdAt: new Date(),
        timestamp: new Date(), 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * SMOOTH DELETE:
   * Slices the array locally to avoid page reload flickering.
   */
  const handleMessageDelete = async (messageId) => {
    if (!currentChatId) return;
    if (!window.confirm("Delete this message? All following messages will also be removed.")) return;

    // 1. Find index of message
    const msgIndex = messages.findIndex((m) => (m.id === messageId || m._id === messageId));
    if (msgIndex === -1) return;

    // 2. Immediate UI Update: Keep only messages BEFORE the deleted one
    const newHistory = messages.slice(0, msgIndex);
    setMessages(newHistory);

    try {
      // 3. Call API (Server handles the "rewind" logic in DB)
      await deleteChatMessage(currentChatId, messageId);
    } catch (error) {
      console.error("Delete failed", error);
      // Fallback: Reload chat if API fails to sync state
      loadExistingChat(currentChatId);
    }
  };

  /**
   * SMOOTH EDIT:
   * Updates text locally, removes future messages, shows typing indicator,
   * and appends the new AI response seamlessly.
   */
  const handleMessageEdit = async (messageId, newContent) => {
    if (!currentChatId) return;

    // 1. Find index
    const msgIndex = messages.findIndex((m) => (m.id === messageId || m._id === messageId));
    if (msgIndex === -1) return;

    // 2. Immediate UI Update:
    //    a. Slice history up to this message (inclusive)
    //    b. Update content of this message
    //    c. Remove everything after it (future is now invalid)
    const updatedMessages = messages.slice(0, msgIndex + 1).map((msg, index) => {
        if (index === msgIndex) {
            return { ...msg, content: newContent, isEdited: true };
        }
        return msg;
    });

    setMessages(updatedMessages);
    setIsLoading(true); // Shows typing indicator at the bottom

    try {
      // 3. Call API
      const response = await editChatMessage(currentChatId, messageId, newContent);
      
      // 4. Append new AI response smoothly
      if (response.aiMessage) {
          const aiMsg = {
              ...response.aiMessage,
              type: "assistant", 
              id: response.aiMessage._id 
          };
          setMessages((prev) => [...prev, aiMsg]);
      }

    } catch (error) {
      console.error("Edit failed", error);
      setIsLoading(false);
      // Fallback: Reload chat if API fails
      loadExistingChat(currentChatId); 
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    selectedCategory,
    isLoading,
    imagePreview,
    setImagePreview: handleImageSelect, // Expose the specific handler for UI components
    handleCategorySelect,
    handleReset,
    handleSendMessage,
    loadExistingChat,
    currentChatId,
    handleMessageDelete,
    handleMessageEdit,
  };
};