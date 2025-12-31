import ChatLog from "../data/ChatLog.js";
import mongoose from "mongoose";

function getDayRangeUTC(dayStr) {
  const start = new Date(`${dayStr}T00:00:00.000Z`);
  const end = new Date(`${dayStr}T23:59:59.999Z`);
  return { start, end };
}

function normalizeCategoryFilter(category) {
  if (category === "__uncategorized__") {
    return { $or: [{ category: null }, { category: "" }] };
  }
  return { category };
}

function normalizeUserId(userId) {
  // If your schema uses ObjectId for userId, convert it.
  // If your schema uses String, this still works because we'll fall back to string.
  if (!userId) return null;

  if (mongoose.Types.ObjectId.isValid(userId)) {
    // If in DB it's ObjectId, matching works.
    // If in DB it's string, it won't match — in that case change schema or store string.
    return new mongoose.Types.ObjectId(userId);
  }
  return userId;
}

export async function getDays(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const uid = normalizeUserId(userId);

    const days = await ChatLog.aggregate([
      { $match: { userId: uid } },
      {
        $addFields: {
          day: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
        },
      },
      {
        $group: {
          _id: "$day",
          count: { $sum: 1 },
          lastMessageAt: { $max: "$timestamp" },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _id: 0,
          day: "$_id",
          count: 1,
          lastMessageAt: 1,
        },
      },
    ]);

    return res.json(days);
  } catch (err) {
    console.error("getDays error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMessagesByDay(req, res) {
  try {
    const { userId } = req.query;
    const { day } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!day) return res.status(400).json({ message: "day is required" });

    const uid = normalizeUserId(userId);
    const { start, end } = getDayRangeUTC(day);

    const messages = await ChatLog.find({
      userId: uid,
      timestamp: { $gte: start, $lte: end },
    }).sort({ timestamp: 1 });

    return res.json(messages);
  } catch (err) {
    console.error("getMessagesByDay error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * ✅ DELETE /api/chat-history/day/:day?userId=...&category=...
 * Deletes ONLY messages for that day AND category (topic).
 */
export async function deleteDay(req, res) {
  try {
    const { userId, category } = req.query;
    const { day } = req.params;

    console.log("🧨 [Server] deleteDay called", { userId, category, day });

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!day) return res.status(400).json({ message: "day is required" });

    // ✅ IMPORTANT: category is required so we never delete the whole day
    if (!category) {
      return res.status(400).json({
        message: "category is required (this endpoint deletes only by day+category)",
      });
    }

    const uid = normalizeUserId(userId);
    const { start, end } = getDayRangeUTC(day);

    const catFilter = normalizeCategoryFilter(category);

    const result = await ChatLog.deleteMany({
      userId: uid,
      ...catFilter,
      timestamp: { $gte: start, $lte: end },
    });

    console.log(
      `🗑️ [Server] deleteDay userId="${userId}" day="${day}" category="${category}" deleted=${result.deletedCount}`
    );

    return res.json({ deletedCount: result.deletedCount, day, category });
  } catch (err) {
    console.error("deleteDay error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function saveMessage(req, res) {
  try {
    const { userId, type, message, category, timestamp, hasImage } = req.body;

    console.log(
      `💬 [Server] saveMessage called: userId="${userId}", type="${type}", category="${category}"`
    );
    console.log(`🔍 [Server] mongoose.readyState=${mongoose.connection.readyState}`);

    if (!userId || !type)
      return res.status(400).json({ message: "userId and type are required" });

    const uid = normalizeUserId(userId);
    const ts = timestamp ? new Date(timestamp) : new Date();

    const saved = await ChatLog.create({
      userId: uid,
      type,
      message,
      category,
      hasImage: !!hasImage,
      timestamp: ts,
    });

    console.log(`✅ [Server] Message saved to DB:`, saved._id);

    // retention: remove messages older than 10 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 10);

    const deleted = await ChatLog.deleteMany({
      userId: uid,
      timestamp: { $lt: cutoff },
    });

    console.log(`🗑️ [Server] Deleted ${deleted.deletedCount} old messages for user ${userId}`);

    return res.json({ ok: true });
  } catch (err) {
    console.error("❌ [Server] saveMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getCategories(req, res) {
  try {
    const { userId } = req.query;
    console.log(`📂 [Server] getCategories called with userId: "${userId}"`);

    if (!userId) return res.status(400).json({ message: "userId is required" });

    const uid = normalizeUserId(userId);

    const categories = await ChatLog.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id: { $ifNull: ["$category", "__uncategorized__"] },
          count: { $sum: 1 },
          lastMessageAt: { $max: "$timestamp" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          lastMessageAt: 1,
        },
      },
    ]);

    return res.json(categories);
  } catch (err) {
    console.error("getCategories error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMessagesByCategory(req, res) {
  try {
    const { userId } = req.query;
    const { category } = req.params;

    console.log(
      `📂 [Server] getMessagesByCategory called userId="${userId}" category="${category}"`
    );

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!category) return res.status(400).json({ message: "category is required" });

    const uid = normalizeUserId(userId);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 10);

    const catFilter = normalizeCategoryFilter(category);

    const messages = await ChatLog.find({
      userId: uid,
      ...catFilter,
      timestamp: { $gte: cutoff },
    }).sort({ timestamp: 1 });

    return res.json(messages);
  } catch (err) {
    console.error("getMessagesByCategory error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteMessage(req, res) {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!id) return res.status(400).json({ message: "message id is required" });

    const uid = normalizeUserId(userId);

    console.log(`🗑️ [Server] deleteMessage called userId="${userId}" id="${id}"`);

    const result = await ChatLog.deleteOne({ _id: id, userId: uid });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Message not found" });

    return res.json({ deletedId: id });
  } catch (err) {
    console.error("deleteMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
