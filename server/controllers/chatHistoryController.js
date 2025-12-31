import ChatLog from "../data/ChatLog.js";
import mongoose from 'mongoose';

function getDayRangeUTC(dayStr) {
  // dayStr expected: YYYY-MM-DD
  const start = new Date(`${dayStr}T00:00:00.000Z`);
  const end = new Date(`${dayStr}T23:59:59.999Z`);
  return { start, end };
}

export async function getDays(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const days = await ChatLog.aggregate([
      { $match: { userId } },
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

    const { start, end } = getDayRangeUTC(day);

    const messages = await ChatLog.find({
      userId,
      timestamp: { $gte: start, $lte: end },
    }).sort({ timestamp: 1 });

    return res.json(messages);
  } catch (err) {
    console.error("getMessagesByDay error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteDay(req, res) {
  try {
    const { userId, category } = req.query;
    const { day } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!day) return res.status(400).json({ message: "day is required" });

    const { start, end } = getDayRangeUTC(day);

    // If category is provided, only delete messages in that category for the day
    const catFilter = category
      ? (category === '__uncategorized__' ? { $or: [{ category: null }, { category: '' }] } : { category })
      : {};

    const result = await ChatLog.deleteMany({
      userId,
      ...catFilter,
      timestamp: { $gte: start, $lte: end },
    });

    console.log(`🗑️ [Server] deleteDay userId="${userId}" day="${day}" category="${category || ''}" deleted=${result.deletedCount}`);
    return res.json({ deletedCount: result.deletedCount, day, category: category || null });
  } catch (err) {
    console.error("deleteDay error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function saveMessage(req, res) {
  try {
    const { userId, type, message, category, timestamp, hasImage } = req.body;
    console.log(`💬 [Server] saveMessage called: userId="${userId}", type="${type}", category="${category}"`);
    console.log(`🔍 [Server] mongoose.readyState=${mongoose.connection.readyState}`);
    if (!userId || !type) return res.status(400).json({ message: 'userId and type are required' });

    const ts = timestamp ? new Date(timestamp) : new Date();

    const saved = await ChatLog.create({ userId, type, message, category, hasImage: !!hasImage, timestamp: ts });
    console.log(`✅ [Server] Message saved to DB:`, saved._id);

    // Enforce retention: remove messages older than 10 days for this user
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 10);
    const deleted = await ChatLog.deleteMany({ userId, timestamp: { $lt: cutoff } });
    console.log(`🗑️ [Server] Deleted ${deleted.deletedCount} old messages for user ${userId}`);

    return res.json({ ok: true });
  } catch (err) {
    console.error('❌ [Server] saveMessage error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getCategories(req, res) {
  try {
    const { userId } = req.query;
    console.log(`📂 [Server] getCategories called with userId: "${userId}"`);
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const categories = await ChatLog.aggregate([
      { $match: { userId } },
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
    console.error('getCategories error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getMessagesByCategory(req, res) {
  try {
    const { userId } = req.query;
    const { category } = req.params;

    console.log(`📂 [Server] getMessagesByCategory called userId="${userId}" category="${category}"`);

    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!category) return res.status(400).json({ message: 'category is required' });

    // Only return last 10 days of messages
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 10);

    const catFilter = category === '__uncategorized__' ? { $or: [{ category: null }, { category: '' }] } : { category };

    const messages = await ChatLog.find({
      userId,
      ...catFilter,
      timestamp: { $gte: cutoff },
    }).sort({ timestamp: 1 });

    return res.json(messages);
  } catch (err) {
    console.error('getMessagesByCategory error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function deleteMessage(req, res) {
  try {
    const { userId } = req.query;
    const { id } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!id) return res.status(400).json({ message: "message id is required" });

    console.log(`🗑️ [Server] deleteMessage called userId="${userId}" id="${id}"`);

    const result = await ChatLog.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ message: 'Message not found' });

    return res.json({ deletedId: id });
  } catch (err) {
    console.error('deleteMessage error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}