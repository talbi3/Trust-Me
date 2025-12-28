const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
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

export async function deleteDay(userId, day) {
  const res = await fetch(
    `${API_BASE}/api/chat-history/day/${encodeURIComponent(day)}?userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
  return handle(res);
}
