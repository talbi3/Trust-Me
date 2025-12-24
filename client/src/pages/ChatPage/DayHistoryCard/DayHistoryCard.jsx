import PropTypes from "prop-types";
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
  day,
  count,
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
            <span className={styles.chev}>{isOpen ? "▾" : "▸"}</span>
            <span className={styles.day}>{day}</span>
          </div>
          <span className={styles.count}>{count} msgs</span>
        </button>

        <button className={styles.deleteBtn} onClick={onDelete} type="button">
          Delete day
        </button>
      </div>

      {isOpen ? (
        <div className={styles.body}>
          {loadingMessages ? (
            <div className={styles.loading}>Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className={styles.empty}>No messages for this day.</div>
          ) : (
            <div className={styles.messages}>
              {messages.map((m) => (
                <div
                  key={m._id || m.id}
                  className={`${styles.msg} ${
                    m.type === "user" ? styles.user : styles.assistant
                  }`}
                >
                  <div className={styles.meta}>
                    <span className={styles.role}>{m.type}</span>
                    <span className={styles.time}>{formatTime(m.timestamp)}</span>
                    {m.category ? <span className={styles.category}>{m.category}</span> : null}
                  </div>
                  <div className={styles.text}>{m.message || m.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

DayHistoryCard.propTypes = {
  day: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  isOpen: PropTypes.bool.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      type: PropTypes.string,
      message: PropTypes.string,
      content: PropTypes.string,
      category: PropTypes.string,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    })
  ).isRequired,
  loadingMessages: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
