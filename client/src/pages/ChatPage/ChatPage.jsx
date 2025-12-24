import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, History as HistoryIcon } from "lucide-react";
import styles from "../ChatPage/ChatPage.module.css";

// Components
import CategorySelector from "../../components/chat/CategorySelector/CategorySelector.jsx";
import MessageList from "../../components/chat/MessageList/MessageList.jsx";
import ChatInput from "../../components/chat/ChatInput/ChatInput.jsx";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import { sendMessageToMars } from "../../services/chatService";
import Button from "../../components/common/Button/Button";

// Local demo history (front-only)
import { saveChatMessage, seedDemoHistory } from "../../services/chatHistoryLocal";

const USER_ID = "Perseverance-34";

export default function ChatPage() {
  const navigate = useNavigate();

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

    const helloMsg = {
      id: Date.now(),
      type: "assistant",
      content: `Hello! I'm here to help you with ${category.label.toLowerCase()}. How can I assist you today?`,
      timestamp: new Date(),
    };

    setMessages([helloMsg]);

    // Save to demo history
    saveChatMessage({
      userId: USER_ID,
      type: "assistant",
      message: helloMsg.content,
      category: category?.label || "",
      timestamp: helloMsg.timestamp,
    });
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

    // UI update
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setImagePreview(null);
    setIsLoading(true);

    // Save to demo history (user message)
    saveChatMessage({
      userId: USER_ID,
      type: "user",
      message: userMessage.content,
      category: selectedCategory?.label || "",
      timestamp: userMessage.timestamp,
    });

    try {
      // include the new message in conversationHistory sent to server
      const historyToSend = [...messages, userMessage];

      const data = await sendMessageToMars({
        message: textToSend,
        helpOption: selectedCategory?.id,
        userId: USER_ID,
        conversationHistory: historyToSend,
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

      // Save to demo history (assistant message)
      saveChatMessage({
        userId: USER_ID,
        type: "assistant",
        message: assistantMessage.content,
        category: selectedCategory?.label || "",
        timestamp: assistantMessage.timestamp,
      });
    } catch (error) {
      console.error(error);

      const fallback = {
        id: Date.now() + 1,
        type: "assistant",
        content: "I'm having trouble connecting to the network. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallback]);

      // Save error message to demo history so you can see it in History
      saveChatMessage({
        userId: USER_ID,
        type: "assistant",
        message: fallback.content,
        category: selectedCategory?.label || "",
        timestamp: fallback.timestamp,
      });
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

  // If no category selected
  if (!selectedCategory) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>New Chat</h1>
              <p className={styles.subtitle}>Select a topic to start</p>
            </div>

            {/* Optional: quick demo seed button for testing */}
            <div style={{ display: "flex", gap: 10 }}>
              <Button
                variant="outline"
                onClick={() => {
                  seedDemoHistory(USER_ID);
                  navigate("/history");
                }}
                style={{ fontSize: "0.85rem", padding: "6px 12px" }}
              >
                <HistoryIcon size={14} style={{ marginRight: 6 }} /> Load Demo &amp; Open History
              </Button>
            </div>
          </div>

          <div className={styles.card} style={{ height: "auto", minHeight: "60vh", padding: "20px" }}>
            <CategorySelector onSelectCategory={handleCategorySelect} userId={USER_ID} />
          </div>
        </div>
      </div>
    );
  }

  // Chat UI
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

        <div className={styles.card}>
          {/* Card Internal Header */}
          <div className={styles.chatHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>{selectedCategory.icon}</span>
              <span style={{ fontWeight: 500, color: "#333" }}>Assistant</span>
            </div>

            {/* Actions: History + Change Topic */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Button
                variant="outline"
                onClick={() => navigate("/history")}
                style={{ fontSize: "0.85rem", padding: "6px 12px" }}
              >
                <HistoryIcon size={14} style={{ marginRight: 6 }} /> History
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                style={{ fontSize: "0.85rem", padding: "6px 12px" }}
              >
                <RotateCcw size={14} style={{ marginRight: 6 }} /> Change Topic
              </Button>
            </div>
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
