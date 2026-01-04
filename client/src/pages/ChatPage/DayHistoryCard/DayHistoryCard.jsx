import PropTypes from "prop-types";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react"; // Assuming you have lucide-react, or use text
import styles from "./DayHistoryCard.module.css";

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function DayHistoryCard({
  title, // Changed 'day' to 'title' to be more flexible (Date + Time)
  count, // Optional now
  isOpen,
  messages,
  loadingMessages,
  onToggle,
  onDelete,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <button className={styles.dayBtn} onClick={onToggle} type="button">
          <div className={styles.dayTitle}>
            <span className={styles.chev}>
                {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
            </span>
            {/* Displaying the Date/Title of the chat */}
            <span className={styles.day}>{title}</span>
          </div>
          {/* Only show count if we have it, otherwise hide */}
          {count !== undefined && <span className={styles.count}>{count} msgs</span>}
        </button>

        <button 
            className={styles.deleteBtn} 
            onClick={(e) => {
                e.stopPropagation(); // Prevent toggling when clicking delete
                onDelete();
            }} 
            type="button"
            title="Delete Chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {isOpen && (
        <div className={styles.body}>
          {loadingMessages ? (
            <div className={styles.loading}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className={styles.empty}>No messages in this conversation.</div>
          ) : (
            <div className={styles.messages}>
              {messages.map((m) => (
                <div
                  key={m._id || m.id}
                  className={`${styles.msg} ${
                    (m.role === "user" || m.type === "user") ? styles.user : styles.assistant
                  }`}
                >
                  <div className={styles.meta}>
                    <span className={styles.role}>
                        {(m.role === "user" || m.type === "user") ? "You" : "Assistant"}
                    </span>
                    <span className={styles.time}>{formatTime(m.createdAt || m.timestamp)}</span>
                  </div>
                  {/* Support both new API (content) and old API (message) */}
                  <div className={styles.text}>{m.content || m.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DayHistoryCard.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  messages: PropTypes.array,
  loadingMessages: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};