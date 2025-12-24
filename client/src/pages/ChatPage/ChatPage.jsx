import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, History as HistoryIcon, Sparkles } from "lucide-react";
import styles from "../ChatPage/ChatPage.module.css";

// Constants
import { FEATURES_BY_CATEGORY, FALLBACK_USER_ID } from "../../constants/chatFeatures";

// Components
import CategorySelector from "../../components/chat/CategorySelector/CategorySelector.jsx";
import MessageList from "../../components/chat/MessageList/MessageList.jsx";
import ChatInput from "../../components/chat/ChatInput/ChatInput.jsx";
import FeaturePanel from "../../components/chat/FeaturePanel/FeaturePanel.jsx"; // Ensure this is imported!
import Button from "../../components/common/Button/Button";

// Hooks & Services
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import { sendMessageToMars } from "../../services/chatService";
import { useProfilePage } from "../../hooks/useProfile.js";
import { saveChatMessage, seedDemoHistory } from "../../services/chatHistoryLocal";

export default function ChatPage() {
  const navigate = useNavigate();
  const { safeProfile } = useProfilePage();

  // 1. Identify User
  const activeUserId = safeProfile?.id || FALLBACK_USER_ID;

  // 2. State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Feature Panel State
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef(null);

  // 3. Dropdown Click Outside Logic
  useEffect(() => {
    function onDocMouseDown(e) {
      if (!featuresRef.current) return;
      if (!featuresRef.current.contains(e.target)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  /* =========================================================================
     4. CORE FUNCTION: Handle Send Message
     (Moved UP here so other functions can see it)
     ========================================================================= */
  const handleSendMessage = async (overrideText = null) => {
    const textToSend = overrideText || inputValue;
    
    // Validation
    if ((!textToSend.trim() && !imagePreview) || isLoading) return;

    // 1. Create User Message Object
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: textToSend,
      image: imagePreview,
      timestamp: new Date(),
    };

    // 2. Update UI & Local History
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setImagePreview(null);
    setIsLoading(true);
    setFeaturesOpen(false); // Close menu if open

    saveChatMessage({
      userId: activeUserId,
      type: "user",
      message: userMessage.content,
      category: selectedCategory?.label || "",
      timestamp: userMessage.timestamp,
    });

    try {
      // 3. Prepare History for API
      const historyToSend = [...messages, userMessage];

      // 4. API Call
      const data = await sendMessageToMars({
        message: textToSend,
        helpOption: selectedCategory?.id,
        userId: activeUserId,
        conversationHistory: historyToSend,
        hasImage: !!imagePreview,
        isVoiceMessage: !!overrideText,
      });

      // 5. Create Assistant Response
      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: data.response || "I heard you, but I'm having trouble thinking of a response right now.",
        actions: data.actions || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      saveChatMessage({
        userId: activeUserId,
        type: "assistant",
        message: assistantMessage.content,
        category: selectedCategory?.label || "",
        timestamp: assistantMessage.timestamp,
      });

    } catch (error) {
      console.error("Chat Error:", error);
      const fallback = {
        id: Date.now() + 1,
        type: "assistant",
        content: "My connection is a little weak right now. Can you try saying that again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================================
     5. DEPENDENT HANDLERS (These call handleSendMessage)
     ========================================================================= */
  
  // Voice Handler
  const handleVoiceResult = (transcript) => {
    if (transcript) handleSendMessage(transcript);
  };

  const { isListening, toggleListening } = useSpeechRecognition(handleVoiceResult);

  // Category Selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFeaturesOpen(false);

    const helloMsg = {
      id: Date.now(),
      type: "assistant",
      content: `Hi there! I see you want to talk about **${category.label}**. I'm here to listen and help you stay safe. What's on your mind?`,
      timestamp: new Date(),
    };

    setMessages([helloMsg]);

    saveChatMessage({
      userId: activeUserId,
      type: "assistant",
      message: helloMsg.content,
      category: category?.label || "",
      timestamp: helloMsg.timestamp,
    });
  };

  // Reset/Clear Chat
  const handleReset = () => {
    setSelectedCategory(null);
    setMessages([]);
    setInputValue("");
    setImagePreview(null);
    setFeaturesOpen(false);
  };

  /* =========================================================================
     6. RENDER
     ========================================================================= */

  // VIEW: No Category Selected
  if (!selectedCategory) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>New Chat</h1>
              <p className={styles.subtitle}>Select a topic to start</p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                seedDemoHistory(activeUserId);
                navigate("/history");
              }}
              style={{ fontSize: "0.85rem", padding: "6px 12px" }}
            >
              <HistoryIcon size={14} style={{ marginRight: 6 }} />
              Load Demo & History
            </Button>
          </div>

          <div className={styles.card} style={{ minHeight: "60vh", padding: 20 }}>
            <CategorySelector onSelectCategory={handleCategorySelect} userId={activeUserId} />
          </div>
        </div>
      </div>
    );
  }

  // VIEW: Active Chat
  const activeFeatures = FEATURES_BY_CATEGORY[selectedCategory.id] || [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Truse Me Chat</h1>
            <p className={styles.subtitle}>
              Talking about: <strong>{selectedCategory.label}</strong>
            </p>
          </div>
        </div>

        <div className={styles.card}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>{selectedCategory.icon}</span>
              <span style={{ fontWeight: "bold" }}>Safety Assistant</span>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Button variant="outline" onClick={() => navigate("/history")}>
                <HistoryIcon size={14} /> History
              </Button>

              {/* Features Toggle Wrapper */}
              <div className={styles.featuresWrap} ref={featuresRef}>
                <Button
                  variant="outline"
                  onClick={() => setFeaturesOpen((v) => !v)}
                  disabled={!activeFeatures.length}
                >
                  <Sparkles size={14} /> Ideas
                </Button>

                {/* Dropdown with New FeaturePanel Component */}
                {featuresOpen && (
                  <div className={styles.featuresMenuContainer}>
                     <FeaturePanel 
                        categoryId={selectedCategory.id} 
                        onApplyFeature={handleSendMessage} 
                        disabled={isLoading}
                     />
                  </div>
                )}
              </div>

              <Button variant="outline" onClick={handleReset}>
                <RotateCcw size={14} /> Change Topic
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.chatContent}>
            <MessageList messages={messages} isLoading={isLoading} />
          </div>

          {/* Input */}
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