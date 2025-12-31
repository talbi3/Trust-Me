const API_BASE =
  import.meta.env.VITE_SERVER_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

/**
 * handle(res)
 * - Converts non-2xx responses into thrown Errors (so your UI can catch them).
 * - Tries to read JSON if possible, otherwise falls back to text.
 */
async function handle(res) {
  if (!res.ok) {
    // Try to parse JSON error first (common in Express)
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      const msg = data?.message || JSON.stringify(data) || `Request failed: ${res.status}`;
      throw new Error(msg);
    }

    // Fallback: text
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // Success
  // Some endpoints might return empty response; guard that:
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

export async function getDays(userId) {
  const res = await fetch(
    `${API_BASE}/api/chat-history/days?userId=${encodeURIComponent(userId)}`
  );
  return handle(res);
}

export async function getMessagesByDay(userId, day) {
  const res = await fetch(
    `${API_BASE}/api/chat-history/day/${encodeURIComponent(day)}?userId=${encodeURIComponent(userId)}`
  );
  return handle(res);
}

/**
 * ✅ IMPORTANT FIX:
 * deleteDay now REQUIRES category.
 * This prevents accidental "delete whole day" when category is missing.
 *
 * Server endpoint expects:
 * DELETE /api/chat-history/day/:day?userId=...&category=...
 */
export async function deleteDay(userId, day, category) {
  // ✅ Make it impossible to send a "delete day" request without category
  if (!category) {
    throw new Error("deleteDay blocked: category is required");
  }

  const url =
    `${API_BASE}/api/chat-history/day/${encodeURIComponent(day)}` +
    `?userId=${encodeURIComponent(userId)}` +
    `&category=${encodeURIComponent(category)}`;

  console.log("📡 [chatHistoryApi] DELETE DAY (SAFE) url =", url);

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
  const url =
    `${API_BASE}/api/chat-history/message/${encodeURIComponent(id)}` +
    `?userId=${encodeURIComponent(userId)}`;

  console.log(`📡 [chatHistoryApi] DELETE message url=${url}`);

  const res = await fetch(url, { method: "DELETE" });
  return handle(res);
}

export async function getCategories(userId) {
  console.log(`📡 [chatHistoryApi] GET categories for userId=${userId}`);

  const res = await fetch(
    `${API_BASE}/api/chat-history/categories?userId=${encodeURIComponent(userId)}`
  );

  return handle(res);
}

export async function getMessagesByCategory(userId, category) {
  console.log(`📡 [chatHistoryApi] GET messages for category=${category} userId=${userId}`);

  const res = await fetch(
    `${API_BASE}/api/chat-history/category/${encodeURIComponent(category)}?userId=${encodeURIComponent(userId)}`
  );

  return handle(res);
}
