import { useState } from "react";
import { createChatSession, sendChatMessage } from "../services/chatService"; 

export const useChat = (activeUserId) => {
  // --- State ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);

  // --- Handlers ---

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    // UI Greeting
    const helloMsg = {
      id: Date.now(),
      role: "assistant", 
      type: "assistant", 
      content: `Hi there! I see you want to talk about ${category.label}. I'm here to listen. What's on your mind?`,
      createdAt: new Date(),
      timestamp: new Date(), // FIX: Added for UI compatibility (MessageList)
    };
    setMessages([helloMsg]);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setMessages([]);
    setInputValue("");
    setImagePreview(null);
    setCurrentChatId(null); 
  };

  const handleSendMessage = async (overrideText = null) => {
    const textToSend = overrideText || inputValue;

    // Validation
    if ((!textToSend.trim() && !imagePreview) || isLoading) return;

    if (!activeUserId) {
        console.error("No active user found! Cannot send message.");
        return;
    }

    // 1. Optimistic UI Update
    const userMessage = {
      id: Date.now(),
      role: "user",
      type: "user", 
      content: textToSend, 
      hasImage: !!imagePreview, 
      createdAt: new Date(),
      timestamp: new Date(), // FIX: Added for UI compatibility
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setImagePreview(null); 
    setIsLoading(true);

    try {
      // 2. Chat Session Management
      let chatId = currentChatId;

      if (!chatId) {
        console.log("Creating new chat session...");
        
        const categoryId = selectedCategory?.id || "general";
        
        const newChat = await createChatSession(categoryId); 
        chatId = newChat._id || newChat.id; 
        
        setCurrentChatId(chatId); 
      }

      // 3. Send Message to Backend
      console.log(`Sending message to chat: ${chatId}`);
      
      const data = await sendChatMessage(chatId, textToSend, !!imagePreview); 

      // 4. Handle Response from AI
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        type: "assistant", 
        content: data.content || data.response || "Received empty response",
        createdAt: new Date(),
        timestamp: new Date(), // FIX: Added for UI compatibility
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
        timestamp: new Date(), // FIX: Added for UI compatibility
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    setImagePreview,
    handleCategorySelect,
    handleReset,
    handleSendMessage
  };
};