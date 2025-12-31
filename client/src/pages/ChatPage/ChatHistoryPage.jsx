import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatHistoryPage.module.css";

import { useProfilePage } from "../../hooks/useProfile.js";
import { getCategories, getMessagesByCategory, deleteDay, deleteMessage } from "../../services/chatHistoryApi";
import { UserContext } from "../../context/UserContext";
import { FEATURES_BY_CATEGORY, FALLBACK_USER_ID } from "../../constants/chatFeatures";

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const { safeProfile } = useProfilePage();

  const { user } = useContext(UserContext);
  const [effectiveUserId, setEffectiveUserId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [daysList, setDaysList] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  function computeEffectiveUserId() {
    const candidates = [];
    if (safeProfile?.id) candidates.push(safeProfile.id);
    if (user?.id) candidates.push(user.id);
    if (user?._id) candidates.push(user._id);
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) candidates.push(parsed.id);
        if (parsed?._id) candidates.push(parsed._id);
      }
    } catch (e) {}
    if (FALLBACK_USER_ID) candidates.push(FALLBACK_USER_ID);
    return [...new Set(candidates.filter(Boolean))][0] || null;
  }

  async function loadCategories() {
    const candidates = [];
    if (safeProfile?.id) candidates.push(safeProfile.id);
    if (user?.id) candidates.push(user.id);
    if (user?._id) candidates.push(user._id);
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) candidates.push(parsed.id);
        if (parsed?._id) candidates.push(parsed._id);
      }
    } catch (e) {}
    if (FALLBACK_USER_ID) candidates.push(FALLBACK_USER_ID);

    const uniqueCandidates = [...new Set(candidates.filter(Boolean))];
    if (uniqueCandidates.length === 0) {
      setError("User not logged in. Please log in first.");
      setLoadingCats(false);
      return;
    }

    try {
      setLoadingCats(true);
      setError("");
      const uid = uniqueCandidates[0];
      const data = await getCategories(uid);

      const featureKeys = Object.keys(FEATURES_BY_CATEGORY || {});
      const serverMap = (Array.isArray(data) ? data : []).reduce((acc, cur) => {
        acc[cur.category] = cur;
        return acc;
      }, {});

      const merged = featureKeys.map((key) => ({
        category: key,
        count: serverMap[key]?.count || 0,
        lastMessageAt: serverMap[key]?.lastMessageAt || null,
      }));

      setCategories(merged);
      setEffectiveUserId(uid);
    } catch (e) {
      console.error('Failed to load categories', e);
      setError(e?.message || 'Failed to load categories');
    } finally {
      setLoadingCats(false);
    }
  }

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, safeProfile]);

  async function onSelectCategory(cat) {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      setMessages([]);
      setDaysList([]);
      setSelectedDay(null);
      return;
    }

    try {
      setLoadingMessages(true);
      setError("");
      setSelectedCategory(cat);
      const uid = effectiveUserId || computeEffectiveUserId();
      const data = await getMessagesByCategory(uid, cat.category);
      const msgs = data || [];
      setMessages(msgs);
      setDaysList(groupMessagesByDay(msgs));
      setSelectedDay(null);
    } catch (e) {
      console.error('Failed to load messages', e);
      setError(e?.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }

  function groupMessagesByDay(msgs) {
    const groups = {};
    msgs.forEach((m) => {
      const day = new Date(m.timestamp).toISOString().slice(0, 10);
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    });
    return Object.keys(groups)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((day) => ({ day, messages: groups[day] }));
  }

  async function handleDeleteDay(day) {
  const uid = effectiveUserId || computeEffectiveUserId();
  const categoryKey = selectedCategory?.category;

  console.log("🧨 [HistoryPage] DeleteDay clicked", { uid, day, categoryKey });

  if (!uid) {
    setError("User not logged in");
    return;
  }
  if (!categoryKey) {
    setError("No category selected. Delete Day works only inside a category.");
    return;
  }

  if (!confirm(`Delete messages for ${day} in category "${categoryKey}"? This cannot be undone.`)) return;

  try {
    setLoadingMessages(true);

    const resp = await deleteDay(uid, day, categoryKey);
    console.log("✅ deleteDay response", resp);

    const updated = messages.filter((m) => {
      const mDay = new Date(m.timestamp).toISOString().slice(0, 10);
      const sameDay = mDay === day;
      const sameCategory = (m.category || "") === (categoryKey || "");
      return !(sameDay && sameCategory);
    });

    setMessages(updated);
    setDaysList(groupMessagesByDay(updated));
    await loadCategories();
  } catch (err) {
    console.error("deleteDay error", err);
    setError(err?.response?.data?.message || err?.message || "Failed to delete day");
  } finally {
    setLoadingMessages(false);
  }
}

  return (
    <div className={styles.page}>
      {error && (
        <div className={styles.error}>⚠️ {error}</div>
      )}

      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>📚 Chat History</h1>
          <p className={styles.subtitle}>💬 By topic — select a category to view the last 10 days.</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className={styles.refreshBtn} onClick={loadCategories} disabled={loadingCats}>Refresh</button>
        </div>
      </div>

      <div className={styles.content}>
        {loadingCats && <div className={styles.loading}>Loading categories…</div>}
        {!loadingCats && categories.length === 0 && <div className={styles.empty}>No history yet.</div>}

        {!loadingCats && categories.length > 0 && (
          <div className={styles.list}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {categories.map((c) => (
                <button
                  key={c.category}
                  className={styles.categoryBtn}
                  onClick={() => onSelectCategory(c)}
                  style={{ background: selectedCategory === c ? '#FFD1EB' : '#fff', borderColor: selectedCategory === c ? '#FF69B4' : 'rgba(0,0,0,0.08)' }}
                >
                  {c.category === '__uncategorized__' ? '🏷️ Uncategorized' : `📌 ${c.category}`}
                </button>
              ))}
            </div>

            {selectedCategory && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                  {selectedCategory.category === '__uncategorized__' ? '🏷️ Uncategorized' : `📌 ${selectedCategory.category}`}
                </h3>

                {loadingMessages && <div className={styles.loading}>⏳ Loading messages…</div>}

                {!loadingMessages && messages.length === 0 && <div className={styles.empty}>💭 No messages in this category for the last 10 days.</div>}

                {!loadingMessages && messages.length > 0 && (
                  <div className={styles.messagesList}>
                    {daysList.length > 0 && (
                      <div className={styles.daysOverview}>
                        <h4>Days</h4>
                        <div className={styles.daysList}>
                          {daysList.map((d) => (
                            <button key={d.day} className={styles.dayBtn} onClick={() => setSelectedDay(d.day)}>
                              {new Date(d.day).toLocaleDateString()} ({d.messages.length})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDay && (
                      <div className={styles.dayConversation}>
                        <div className={styles.dayHeader}>
                          <strong>{new Date(selectedDay).toLocaleDateString()}</strong>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className={styles.deleteDayBtn} onClick={() => handleDeleteDay(selectedDay)}>Delete Day</button>
                            <button className={styles.backToDaysBtn} onClick={() => setSelectedDay(null)}>Back to days</button>
                          </div>
                        </div>

                        <div className={styles.conversationList}>
                          {messages
                            .filter((m) => new Date(m.timestamp).toISOString().slice(0, 10) === selectedDay)
                            .map((m) => (
                              <div key={m._id} className={`${styles.messageRow} ${styles[m.type]}`}>
                                <div className={styles.msgHeader}>
                                  <span className={styles.msgType}>{m.type === 'user' ? '👤 You' : '🤖 Assistant'}</span>
                                  <span className={styles.msgTime}>{new Date(m.timestamp).toLocaleTimeString()}</span>
                                  <button
                                    className={styles.deleteMsgBtn}
                                    onClick={async () => {
                                      try {
                                        setLoadingMessages(true);
                                        const uid = effectiveUserId || computeEffectiveUserId();
                                        console.log('🧾 [HistoryPage] Deleting message', { id: m._id, uid });
                                        const delResp = await deleteMessage(m._id, uid);
                                        console.log('✅ [HistoryPage] deleteMessage response', delResp);

                                        const updated = messages.filter((x) => x._id !== m._id);
                                        setMessages(updated);
                                        setDaysList(groupMessagesByDay(updated));
                                        await loadCategories();
                                      } catch (err) {
                                        console.error('delete message failed', err);
                                        setError(err?.message || 'Failed to delete message');
                                      } finally {
                                        setLoadingMessages(false);
                                      }
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                                <div className={styles.msgContent}>{m.message}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
