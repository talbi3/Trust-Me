import { useEffect, useRef, useState, useCallback, isValidElement, useContext } from "react"; // Added isValidElement
import { useNavigate } from "react-router-dom";
import { RotateCcw, History as HistoryIcon, Sparkles } from "lucide-react";
import styles from "./ChatPage.module.css";

// Constants
import { FEATURES_BY_CATEGORY } from "../../constants/chatFeatures";

// Components
import CategorySelector from "../../components/chat/CategorySelector/CategorySelector.jsx";
import MessageList from "../../components/chat/MessageList/MessageList.jsx";
import ChatInput from "../../components/chat/ChatInput/ChatInput.jsx";
import FeaturePanel from "../../components/chat/FeaturePanel/FeaturePanel.jsx";
import Button from "../../components/common/Button/Button";

// Hooks
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import { useChatUser } from "../../hooks/useChatUser";  
import { useChat } from "../../hooks/useChat";          
import { MetadataContext } from "../../context/MetadataContext.jsx";
import { UserContext } from "../../context/UserContext.jsx";

export default function ChatPage() {
  const navigate = useNavigate();
  
  // 1. Get User
  const activeUserId = useChatUser();
  const { user } = useContext(UserContext);
  const { metadata, getMetadata } = useContext(MetadataContext);

  // 2. Get Chat Logic & State
  const {
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
  } = useChat(activeUserId);

  // 3. UI Local State (Features Panel)
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef(null);

  // Click Outside Logic
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

  // Voice Handler
  const handleVoiceResult = useCallback((transcript) => {
    if (transcript) handleSendMessage(transcript);
  }, [handleSendMessage]);

  const { isListening, toggleListening } = useSpeechRecognition(handleVoiceResult);

  // Wrapper to close panel
  const onFeatureApply = (text) => {
      setFeaturesOpen(false);
      handleSendMessage(text);
  };

  // Load metadata to greet with nickname
  useEffect(() => {
    if (user && !metadata) {
      getMetadata();
    }
  }, [user, metadata, getMetadata]);

  const displayName = metadata?.nickName || user?.name || null;


  const renderIcon = (icon) => {
    if (!icon) return null;
    
    // Case A: It's an Emoji string or already a <Component />
    if (typeof icon === 'string' || isValidElement(icon)) {
        return <span style={{ fontSize: "1.5rem" }}>{icon}</span>;
    }
    
    // Case B: It's a Lucide Component (function/object) passed as reference
    // We must render it as a Tag <IconComponent />
    const IconComponent = icon;
    return <IconComponent size={28} />;
  };

  /* =========================================================================
     RENDER
     ========================================================================= */

  // VIEW: No Category Selected
  if (!selectedCategory) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>New Chat</h1>
              {displayName ? (
                <p className={styles.subtitle} style={{ fontSize: "0.95rem" }}>
                  HEY {displayName}! Nice to have you back.
                </p>
              ) : (
                <p className={styles.subtitle}>Select a topic to start</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/history")}
              style={{ fontSize: "0.85rem", padding: "6px 12px" }}
            >
              <HistoryIcon size={14} style={{ marginRight: 6 }} />
              Open History
            </Button>
          </div>

          <div className={styles.card} style={{ minHeight: "60vh", padding: 20 }}>
            <CategorySelector
              key={activeUserId || "guest"} 
              onSelectCategory={handleCategorySelect}
              userId={activeUserId}
            />
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
            <h1 className={styles.title}>Trust Me Chat</h1>
            <p className={styles.subtitle}>
              Talking about: <strong>{selectedCategory.label}</strong>
            </p>
          </div>
        </div>

        <div className={styles.card}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* FIX: Use the helper function here instead of direct render */}
              {renderIcon(selectedCategory.icon)}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "bold" }}>Safety Assistant</span>
                <span className={styles.privacyNote} style={{ marginTop: 2 }}>
                  Your conversation is private — no sharing, no judgment.
                </span>
              </div>
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

                {featuresOpen && (
                  <div className={styles.featuresMenuContainer}>
                    <FeaturePanel
                      categoryId={selectedCategory.id}
                      onApplyFeature={onFeatureApply}
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