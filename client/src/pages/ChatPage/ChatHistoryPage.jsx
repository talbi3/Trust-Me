import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import styles from "./ChatHistoryPage.module.css";
import DayHistoryCard from "./DayHistoryCard/DayHistoryCard";

// Services (New Backend API)
import { getUserChats, getChatHistory } from "../../services/chatService";

export default function ChatHistoryPage() {
  const navigate = useNavigate();

  // --- State ---
  const [chats, setChats] = useState([]); // List of chat sessions
  const [loadingChats, setLoadingChats] = useState(true);
  const [error, setError] = useState("");

  // Manages which card is currently open (Accordion style)
  const [openChatId, setOpenChatId] = useState(null);
  
  // Stores messages for the open chat: { [chatId]: [messages...] }
  const [messagesCache, setMessagesCache] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  // --- 1. Load Chats on Mount ---
  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setLoadingChats(true);
      setError("");
      // Fetch list of chats from backend (GET /api/chats)
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

  // --- 2. Handle Card Toggle (Expand/Collapse) ---
  async function handleToggle(chatId) {
    // If clicking the already open chat, close it
    if (openChatId === chatId) {
      setOpenChatId(null);
      return;
    }

    // Open new chat
    setOpenChatId(chatId);

    // If we already have messages in cache, don't fetch again
    if (messagesCache[chatId]) {
      return;
    }

    // Fetch messages for this chat
    try {
      setLoadingMessages(true);
      const msgs = await getChatHistory(chatId); // GET /api/chats/:id
      setMessagesCache((prev) => ({ ...prev, [chatId]: msgs }));
    } catch (e) {
      console.error("Failed to load messages", e);
      // Optional: Show specific error on the card
    } finally {
      setLoadingMessages(false);
    }
  }

  // --- 3. Handle Delete (Stub for now) ---
  async function handleDeleteChat(chatId) {
    if (!window.confirm("Delete this conversation?")) return;
    
    try {
      // TODO: Add deleteChat to chatService.js if backend supports it
      // await deleteChat(chatId); 
      
      // For now, just remove from UI to simulate
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (openChatId === chatId) setOpenChatId(null);
      
    } catch (e) {
      console.error("Failed to delete chat", e);
      alert("Could not delete chat");
    }
  }

  // Helper to format the Chat Title (Date + Time)
  const getChatTitle = (chat) => {
    // If the chat has a specific title, use it, otherwise use Date
    const dateObj = new Date(chat.createdAt);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Example: "Jan 3, 2026 - 10:30 AM" or custom title if exists
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
          <h1 className={styles.title}> Chat History</h1>
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

        {/* Render List of DayHistoryCards */}
        {!loadingChats && chats.length > 0 && (
          <div className={styles.list}>
            {chats.map((chat) => (
              <DayHistoryCard
                key={chat._id}
                title={getChatTitle(chat)} // Display Date + Time
                // Note: 'count' might not be available in list API, can omit or show if backend sends it
                isOpen={openChatId === chat._id}
                loadingMessages={loadingMessages}
                messages={messagesCache[chat._id] || []}
                onToggle={() => handleToggle(chat._id)}
                onDelete={() => handleDeleteChat(chat._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}