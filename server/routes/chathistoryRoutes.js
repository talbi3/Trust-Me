import express from "express";
import {
  getDays,
  getMessagesByDay,
  deleteDay,
  saveMessage,
  getCategories,
  getMessagesByCategory,
  deleteMessage,
} from "../controllers/chatHistoryController.js";

const router = express.Router();

// /api/chat-history/days?userId=...
router.get("/days", getDays);

// /api/chat-history/day/2025-12-24?userId=...
router.get("/day/:day", getMessagesByDay);

// ✅ /api/chat-history/day/2025-12-24?userId=...&category=...
router.delete("/day/:day", deleteDay);

// POST /api/chat-history/message
router.post("/message", saveMessage);

// GET /api/chat-history/categories?userId=...
router.get("/categories", getCategories);

// GET /api/chat-history/category/:category?userId=...
router.get("/category/:category", getMessagesByCategory);

// DELETE /api/chat-history/message/:id?userId=...
router.delete("/message/:id", deleteMessage);

export default router;
