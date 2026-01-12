import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import styles from "./ChatHistoryPage.module.css";
import DayHistoryCard from "./DayHistoryCard/DayHistoryCard";

// Services
import { getUserChats, deleteChatSession } from "../../services/chatService";

export default function ChatHistoryPage() {
  const navigate = useNavigate();

  // --- State ---
  const [chats, setChats] = useState([]); 
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState("");

  // --- 1. Load Chats on Mount ---
  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setLoadingChats(true);
      setError("");
      // Fetch list of chats from backend
      const data = await getUserChats();
      // Sort by newest first
      const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setChats(sorted);
    } catch (e) {
      console.error("Failed to load history", e);
      setError("Failed to load chat history.");
    } finally {
      setLoadingChats(false);
    }
  }

  // --- 2. Handle Navigation (Clicking a chat) ---
  const handleChatClick = (chatId) => {
    // Navigate to the main chat page with the specific ID to resume conversation
    navigate(`/chat/${chatId}`);
  };

  // --- 3. Handle Delete ---
  async function handleDeleteChat(chatId) {
    if (!window.confirm("Delete this conversation?")) return;
    
    try {
      await deleteChatSession(chatId);
      // Re-fetch the fresh list from the server to update UI
      await loadChats();
    } catch (e) {
      console.error("Failed to delete chat", e);
      alert("Could not delete chat");
    }
  }

  // Helper to format the Chat Title (Date + Time or Custom Title)
  const getChatTitle = (chat) => {
    const dateObj = new Date(chat.createdAt);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
    
    return chat.title && chat.title !== "New Conversation" 
      ? `${dateStr} - ${chat.title}` 
      : `${dateStr} - ${timeStr}`;
  };

  return (
    <div className={styles.page}>
      {error && <div className={styles.error}><AlertTriangle size={16} /> {error}</div>}

      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Chat History</h1>
          <p className={styles.subtitle}>
             Your past conversations sorted by date.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {loadingChats && <div className={styles.loading}>Loading history...</div>}
        
        {!loadingChats && chats.length === 0 && (
          <div className={styles.empty}>No history yet.</div>
        )}

        {!loadingChats && chats.length > 0 && (
          <div className={styles.list}>
            {chats.map((chat) => (
              <DayHistoryCard
                key={chat._id}
                title={getChatTitle(chat)}
                // Pass the navigation handler
                onClick={() => handleChatClick(chat._id)}
                // Pass the delete handler
                onDelete={() => handleDeleteChat(chat._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}