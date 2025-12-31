const API_BASE = import.meta.env.VITE_SERVER_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(text || "{}");
      throw new Error(parsed.message || text || `Request failed: ${res.status}`);
    } catch (e) {
      throw new Error(text || `Request failed: ${res.status}`);
    }
  }
  return res.json();
}

export async function getDays(userId) {
  const res = await fetch(`${API_BASE}/api/chat-history/days?userId=${encodeURIComponent(userId)}`);
  return handle(res);
}

export async function getMessagesByDay(userId, day) {
  const res = await fetch(
    `${API_BASE}/api/chat-history/day/${encodeURIComponent(day)}?userId=${encodeURIComponent(userId)}`
  );
  return handle(res);
}

export async function deleteDay(userId, day, category) {
  let url = `${API_BASE}/api/chat-history/day/${encodeURIComponent(day)}?userId=${encodeURIComponent(userId)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  console.log(`📡 [chatHistoryApi] DELETE day=${day} userId=${userId} category=${category || ''}`);
  const res = await fetch(url, { method: "DELETE" });
  return handle(res);
}

export async function saveMessage(userId, payload) {
  const body = { userId, ...payload };
  console.log(`📡 [chatHistoryApi] POST ${API_BASE}/api/chat-history/message`, body);
  const res = await fetch(`${API_BASE}/api/chat-history/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}

export async function deleteMessage(id, userId) {
  console.log(`📡 [chatHistoryApi] DELETE message ${id} for userId=${userId}`);
  const res = await fetch(`${API_BASE}/api/chat-history/message/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  return handle(res);
}

export async function getCategories(userId) {
  console.log(`📡 [chatHistoryApi] GET categories for userId=${userId}`);
  const res = await fetch(`${API_BASE}/api/chat-history/categories?userId=${encodeURIComponent(userId)}`);
  return handle(res);
}

export async function getMessagesByCategory(userId, category) {
  console.log(`📡 [chatHistoryApi] GET messages for category=${category} userId=${userId}`);
  const res = await fetch(
    `${API_BASE}/api/chat-history/category/${encodeURIComponent(category)}?userId=${encodeURIComponent(userId)}`
  );
  return handle(res);
}
