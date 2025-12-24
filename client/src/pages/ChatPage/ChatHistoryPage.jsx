import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatHistoryPage.module.css";

import DayHistoryCard from "./DayHistoryCard/DayHistoryCard";

// Local demo history (front-only)
import {
  getDaysLocal,
  getMessagesByDayLocal,
  deleteDayLocal,
  seedDemoHistory,
} from "../../services/chatHistoryLocal";

export default function ChatHistoryPage() {
  const navigate = useNavigate();

  // Keep consistent with ChatPage USER_ID
  const userId = useMemo(() => "Perseverance-34", []);

  const [days, setDays] = useState([]);
  const [openDay, setOpenDay] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  async function loadDays() {
    try {
      setLoadingDays(true);
      setError("");

      // Local (sync) but we keep the async shape to match previous code
      const data = getDaysLocal(userId);
      setDays(data);
    } catch (e) {
      setError(e.message || "Failed to load days");
    } finally {
      setLoadingDays(false);
    }
  }

  useEffect(() => {
    loadDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onToggleDay(day) {
    if (openDay === day) {
      setOpenDay(null);
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");
      setOpenDay(day);

      const data = getMessagesByDayLocal(userId, day);
      setMessages(data);
    } catch (e) {
      setError(e.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function onDeleteDay(day) {
    const ok = window.confirm(`Delete all messages from ${day}?`);
    if (!ok) return;

    try {
      setError("");
      deleteDayLocal(userId, day);

      if (openDay === day) {
        setOpenDay(null);
        setMessages([]);
      }

      await loadDays();
    } catch (e) {
      setError(e.message || "Failed to delete day");
    }
  }

  function onLoadDemo() {
    seedDemoHistory(userId);
    loadDays();
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Chat History</h1>
          <p className={styles.subtitle}>By day, with delete per day.</p>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className={styles.refreshBtn} onClick={onLoadDemo} disabled={loadingDays}>
            Load Demo
          </button>

          <button className={styles.refreshBtn} onClick={loadDays} disabled={loadingDays}>
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.content}>
        {loadingDays ? (
          <div className={styles.loading}>Loading days…</div>
        ) : days.length === 0 ? (
          <div className={styles.empty}>
            No history yet.
            <div style={{ marginTop: 10 }}>
              <button className={styles.refreshBtn} onClick={onLoadDemo}>
                Load Demo History
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {days.map((d) => (
              <DayHistoryCard
                key={d.day}
                day={d.day}
                count={d.count}
                isOpen={openDay === d.day}
                messages={openDay === d.day ? messages : []}
                loadingMessages={openDay === d.day ? loadingMessages : false}
                onToggle={() => onToggleDay(d.day)}
                onDelete={() => onDeleteDay(d.day)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
