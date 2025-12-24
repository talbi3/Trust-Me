import express from "express";
import {
  getDays,
  getMessagesByDay,
  deleteDay,
} from "../controllers/chatHistoryController.js";

const router = express.Router();

// /api/chat-history/days?userId=...
router.get("/days", getDays);

// /api/chat-history/day/2025-12-24?userId=...
router.get("/day/:day", getMessagesByDay);

// /api/chat-history/day/2025-12-24?userId=...
router.delete("/day/:day", deleteDay);

export default router;
