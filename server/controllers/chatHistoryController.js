import ChatLog from "../data/ChatLog.js";

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
    const { userId } = req.query;
    const { day } = req.params;

    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!day) return res.status(400).json({ message: "day is required" });

    const { start, end } = getDayRangeUTC(day);

    const result = await ChatLog.deleteMany({
      userId,
      timestamp: { $gte: start, $lte: end },
    });

    return res.json({ deletedCount: result.deletedCount, day });
  } catch (err) {
    console.error("deleteDay error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}