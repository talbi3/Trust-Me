import { useState } from "react";
import { RotateCcw } from "lucide-react";
import styles from "../ChatPage/ChatPage.module.css";

// Reuse the components we built previously
import CategorySelector from "../../components/chat/CategorySelector/CategorySelector.jsx";
import MessageList from "../../components/chat/MessageList/MessageList.jsx";
import ChatInput from "../../components/chat/ChatInput/ChatInput.jsx";
import useSpeechRecognition from "../../hooks/useSpeechRecognition"; // Adjust path if needed
import { sendMessageToMars } from "../../services/chatService"; // Adjust path if needed
import Button from "../../components/common/Button/Button"; // Reusing your Button component

const USER_ID = "Perseverance-34";

export default function ChatPage() {
  // --- Logic State (Same as before) ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleVoiceResult = (transcript) => {
    if (transcript) handleSendMessage(transcript);
  };

  const { isListening, toggleListening } = useSpeechRecognition(handleVoiceResult);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setMessages([
      {
        id: Date.now(),
        type: "assistant",
        content: `Hello! I'm here to help you with ${category.label.toLowerCase()}. How can I assist you today?`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async (overrideText = null) => {
    const textToSend = overrideText || inputValue;
    if ((!textToSend.trim() && !imagePreview) || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: textToSend,
      image: imagePreview,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setImagePreview(null);
    setIsLoading(true);

    try {
      const data = await sendMessageToMars({
        message: textToSend,
        helpOption: selectedCategory?.id,
        userId: USER_ID,
        conversationHistory: messages,
        hasImage: !!imagePreview,
        isVoiceMessage: !!overrideText,
      });

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: data.response || "Message received!",
        actions: data.actions || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "assistant",
          content: "I'm having trouble connecting to the network. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setMessages([]);
    setInputValue("");
    setImagePreview(null);
  };

  // --- Render ---

  // 1. If no category selected, show the full-page selector (or wrapped in card if preferred)
  if (!selectedCategory) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>New Chat</h1>
              <p className={styles.subtitle}>Select a topic to start</p>
            </div>
          </div>
          <div className={styles.card} style={{ height: "auto", minHeight: "60vh", padding: "20px" }}>
            <CategorySelector onSelectCategory={handleCategorySelect} userId={USER_ID} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Chat Interface wrapped in the Profile-style Card
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Mars Chat</h1>
            <p className={styles.subtitle}>
              Talking about: <strong>{selectedCategory.label}</strong>
            </p>
          </div>
        </div>

        {/* The "Card" container */}
        <div className={styles.card}>
          
          {/* Card Internal Header (Optional actions) */}
          <div className={styles.chatHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>{selectedCategory.icon}</span>
              <span style={{ fontWeight: 500, color: "#333" }}>Assistant</span>
            </div>
            
            <Button variant="outline" onClick={handleReset} style={{ fontSize: "0.85rem", padding: "6px 12px" }}>
              <RotateCcw size={14} style={{ marginRight: 6 }} /> Change Topic
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className={styles.chatContent}>
            <MessageList messages={messages} isLoading={isLoading} />
          </div>

          {/* Input Area */}
          <div className={styles.inputSection}>
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={() => handleSendMessage()}
              isLoading={isLoading}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              isListening={isListening}
              onToggleListening={toggleListening}
            />
          </div>
        </div>

      </div>
    </div>
  );
}