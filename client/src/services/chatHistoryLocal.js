const KEY = "tms_chat_history_v1";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeAll(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function dayString(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export function saveChatMessage({ userId, type, message, category = "", timestamp = new Date() }) {
  if (!userId) return;

  const db = readAll();
  if (!db[userId]) db[userId] = {};

  const day = dayString(timestamp);
  if (!db[userId][day]) db[userId][day] = [];

  db[userId][day].push({
    _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId,
    type, // "user" | "assistant"
    message,
    category,
    timestamp: new Date(timestamp).toISOString(),
  });

  writeAll(db);
}

export function getDaysLocal(userId) {
  const db = readAll();
  const daysObj = db[userId] || {};
  return Object.keys(daysObj)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((day) => {
      const arr = daysObj[day] || [];
      return {
        day,
        count: arr.length,
        lastMessageAt: arr[arr.length - 1]?.timestamp || null,
      };
    });
}

export function getMessagesByDayLocal(userId, day) {
  const db = readAll();
  const arr = db[userId]?.[day] || [];
  return arr.slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function deleteDayLocal(userId, day) {
  const db = readAll();
  if (db[userId]) {
    delete db[userId][day];
    writeAll(db);
  }
}

export function seedDemoHistory(userId) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Add a few messages across 3 days
  saveChatMessage({
    userId,
    type: "assistant",
    message: "Demo: Welcome back. This is a seeded history day.",
    category: "general",
    timestamp: twoDaysAgo,
  });
  saveChatMessage({
    userId,
    type: "user",
    message: "Demo: I want to test delete per day.",
    category: "general",
    timestamp: twoDaysAgo,
  });

  saveChatMessage({
    userId,
    type: "user",
    message: "Demo: Yesterday I asked for bullying support.",
    category: "bullying",
    timestamp: yesterday,
  });
  saveChatMessage({
    userId,
    type: "assistant",
    message: "Demo: I’m here to help. Tell me what happened.",
    category: "bullying",
    timestamp: yesterday,
  });

  saveChatMessage({
    userId,
    type: "user",
    message: "Demo: Today message 1",
    category: "focus",
    timestamp: now,
  });
  saveChatMessage({
    userId,
    type: "assistant",
    message: "Demo: Today reply 1",
    category: "focus",
    timestamp: now,
  });
}
