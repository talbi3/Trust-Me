import { useState, useCallback } from "react"; 
import { 
  createChatSession, 
  sendChatMessage, 
  getChatHistory, 
  deleteChatMessage, 
  editChatMessage,
  uploadChatImage,
  analyzeImageSafety,
  saveAnalysisMessage
} from "../services/chatService"; 
import { CATEGORIES } from "../constants/categories.js";


// Helper function to build a user-friendly analysis message
const buildAnalysisMessage = (analysis) => {
  const { aiGeneratedProbability, confidence, summary, issuesFound } = analysis;
  
  let emoji = "✅";
  let status = "The image appears to be authentic";
  
  if (aiGeneratedProbability > 70) {
    emoji = "⚠️";
    status = "This image may be AI-generated (fake)";
  } else if (aiGeneratedProbability > 40) {
    emoji = "🤔";
    status = "Cannot determine with certainty";
  }
  
  let message = `${emoji} **Image Analysis Results:**\n\n`;
  message += `${status}\n`;
  message += `• AI Probability: ${aiGeneratedProbability}%\n`;
  message += `• Confidence Level: ${confidence}\n\n`;
  
  if (summary) {
    message += `📝 ${summary}\n\n`;
  }
  
  if (issuesFound && issuesFound.length > 0) {
    message += `🔍 Issues Detected:\n`;
    issuesFound.forEach((issue) => {
      message += `• ${issue.description}\n`;
    });
  }
  
  return message;
};

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

  const handleCategorySelect = async (category) => {
  setSelectedCategory(category);
  setIsLoading(true);

  try {
    // ✅ Create chat session immediately with the chosen category
    const newChat = await createChatSession(category?.id || "general");
    const chatId = newChat._id || newChat.id;
    setCurrentChatId(chatId);

    // UI Greeting
    const helloMsg = {
      id: Date.now(),
      role: "assistant",
      type: "assistant",
      content: `Hi there! I see you want to talk about ${category.label}. What's on your mind?`,
      createdAt: new Date(),
      timestamp: new Date(),
    };
    setMessages([helloMsg]);

  } catch (err) {
    console.error("Failed to create chat on category select:", err);
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        type: "assistant",
        content: "I couldn't start a new chat right now. Please try again.",
        isError: true,
        createdAt: new Date(),
        timestamp: new Date(),
      },
    ]);
  } finally {
    setIsLoading(false);
  }
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
        id: msg._id || msg.id || Date.now(),
        imageUrl: msg.imageUrl || null,
        // Preserve analysis result flags for Picture Safety chat
        isAnalysisResult: msg.isAnalysisResult || false,
        safetyAnalysis: msg.safetyAnalysis || null
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

  if ((!textToSend.trim() && !imageFile) || isLoading) return;

  if (!activeUserId) {
      console.error("No active user found! Cannot send message.");
      return;
  }

  const tempId = Date.now(); 

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
  
  const fileToUpload = imageFile; 
  setInputValue("");
  setImagePreview(null); 
  setImageFile(null);

  setIsLoading(true);

  try {
    let chatId = currentChatId;

    if (!chatId) {
      const categoryId = selectedCategory?.id || "general";
      const newChat = await createChatSession(categoryId); 
      chatId = newChat._id || newChat.id; 
      setCurrentChatId(chatId); 
    }

    // Upload Image (if selected)
    let uploadedImageUrl = null;
    let safetyAnalysis = null;
      if (fileToUpload) {
      try {
        uploadedImageUrl = await uploadChatImage(fileToUpload);
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        const errorMsg = uploadError?.response?.data?.error || "Failed to upload image. Please try a different image format (JPG, PNG, WEBP, GIF).";
        const uploadErrorMessage = {
          id: Date.now() + 1,
          role: "assistant",
          type: "assistant",
          content: `❌ **Upload Error:** ${errorMsg}`,
          isError: true,
          createdAt: new Date(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, uploadErrorMessage]);
        setIsLoading(false);
        return;
      }
      // Only run AI detection for "Pictures" category
      if (selectedCategory?.id === "Pictures") {
        safetyAnalysis = await analyzeImageSafety(uploadedImageUrl);
        console.log("Safety Analysis:", safetyAnalysis);
        
        const analysisContent = buildAnalysisMessage(safetyAnalysis);
        
        // Add analysis result as a chat message (optimistic UI)
        const tempAnalysisId = Date.now() + 1;
        const analysisMessage = {
          id: tempAnalysisId,
          role: "assistant",
          type: "assistant",
          isAnalysisResult: true,
          content: analysisContent,
          safetyAnalysis: safetyAnalysis,
          createdAt: new Date(),
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, analysisMessage]);
        
        // Save analysis message to database
        try {
          const savedAnalysis = await saveAnalysisMessage(chatId, analysisContent, safetyAnalysis);
          // Update temp ID with real DB ID
          setMessages((prev) => prev.map((msg) => 
            msg.id === tempAnalysisId 
              ? { ...msg, id: savedAnalysis._id, _id: savedAnalysis._id }
              : msg
          ));
        } catch (err) {
          console.error("Failed to save analysis message:", err);
        }
        
        // If no text was provided, skip the chat message - analysis is enough
        if (!textToSend.trim()) {
          setIsLoading(false);
          return;
        }
      }
    }
    // Send Message to Backend with the Cloudinary URL
    const data = await sendChatMessage(chatId, textToSend, uploadedImageUrl);

    // Update the Temporary ID with Real ID & Real Image URL
    setMessages((prev) => prev.map((msg) => {
      if (msg.id === tempId) {
        return {
           ...msg,
           id: data.userMessage._id,
           _id: data.userMessage._id,
           imageUrl: data.userMessage.imageUrl || uploadedImageUrl || msg.imageUrl // ← עדכון
        };
      }
      return msg;
    }));

    // Add AI Response
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