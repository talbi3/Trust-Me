import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, History as HistoryIcon, Sparkles } from "lucide-react";
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

/**
 * Features per topic (categoryId).
 * IMPORTANT: categoryId must match CategorySelector ids.
 * If your ids are "picture"/"bullying"/"focus" - change the keys accordingly.
 */
function getFeaturesForCategory(categoryId) {
  const FEATURES_BY_CATEGORY = {
    Pictures: [
      { key: "A", label: "FEATURE A", message: "APPLY FEATURE A" },
      { key: "B", label: "FEATURE B", message: "APPLY FEATURE B" },
    ],
    Bullying: [
      { key: "C", label: "FEATURE C", message: "APPLY FEATURE C" },
      { key: "B", label: "FEATURE B", message: "APPLY FEATURE B" },
    ],
    Focus: [
      { key: "D", label: "FEATURE D", message: "APPLY FEATURE D" },
      { key: "C", label: "FEATURE C", message: "APPLY FEATURE C" },
    ],
  };

  return FEATURES_BY_CATEGORY[categoryId] || [];
}

export default function ChatPage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Features dropdown state
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef(null);

  const features = getFeaturesForCategory(selectedCategory?.id);

  // Close dropdown when clicking outside
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

  /* ---------------- Voice ---------------- */
  const handleVoiceResult = (transcript) => {
    if (transcript) handleSendMessage(transcript);
  };

  const { isListening, toggleListening } = useSpeechRecognition(handleVoiceResult);

  /* ---------------- Category ---------------- */
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFeaturesOpen(false);

    const helloMsg = {
      id: Date.now(),
      type: "assistant",
      content: `Hello! I'm here to help you with ${category.label.toLowerCase()}. How can I assist you today?`,
      timestamp: new Date(),
    };

    setMessages([helloMsg]);

    saveChatMessage({
      userId: USER_ID,
      type: "assistant",
      message: helloMsg.content,
      category: category?.label || "",
      timestamp: helloMsg.timestamp,
    });
  };

  /* ---------------- Send Message ---------------- */
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

    saveChatMessage({
      userId: USER_ID,
      type: "user",
      message: userMessage.content,
      category: selectedCategory?.label || "",
      timestamp: userMessage.timestamp,
    });

    try {
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

  /* ---------------- Feature Apply ---------------- */
  const handleApplyFeature = (featureText) => {
    setFeaturesOpen(false);
    handleSendMessage(featureText);
  };

  /* ---------------- Reset ---------------- */
  const handleReset = () => {
    setSelectedCategory(null);
    setMessages([]);
    setInputValue("");
    setImagePreview(null);
    setFeaturesOpen(false);
  };

  /* ---------------- No Category Selected ---------------- */
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
                seedDemoHistory(USER_ID);
                navigate("/history");
              }}
              style={{ fontSize: "0.85rem", padding: "6px 12px" }}
            >
              <HistoryIcon size={14} style={{ marginRight: 6 }} />
              Load Demo &amp; History
            </Button>
          </div>

          <div className={styles.card} style={{ minHeight: "60vh", padding: 20 }}>
            <CategorySelector onSelectCategory={handleCategorySelect} userId={USER_ID} />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Chat UI ---------------- */
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Mars Chat</h1>
            <p className={styles.subtitle}>
              Talking about: <strong>{selectedCategory.label}</strong>
            </p>
          </div>
        </div>

        <div className={styles.card}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: "1.5rem" }}>{selectedCategory.icon}</span>
              <span>Assistant</span>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Button variant="outline" onClick={() => navigate("/history")}>
                <HistoryIcon size={14} /> History
              </Button>

              {/* Features dropdown */}
              <div className={styles.featuresWrap} ref={featuresRef}>
                <Button
                  variant="outline"
                  onClick={() => setFeaturesOpen((v) => !v)}
                  disabled={!features?.length}
                >
                  <Sparkles size={14} /> Features
                </Button>

                {featuresOpen && (
                  <div className={styles.featuresMenu} role="menu" aria-label="Features menu">
                    <div className={styles.featuresMenuTitle}>
                      Topic: {selectedCategory?.label}
                    </div>

                    {features.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        className={styles.featuresItem}
                        onClick={() => handleApplyFeature(f.message)}
                        disabled={isLoading}
                        role="menuitem"
                      >
                        {f.label}
                      </button>
                    ))}
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
