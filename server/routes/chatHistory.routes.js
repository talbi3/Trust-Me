import express from "express";
import {
  getDays,
  getMessagesByDay,
  deleteDay,
} from "../controllers/chatHistory.controller.js";
import validateRequest from '../middleware/validate-request.middleware.js';
import { chatHistoryQuerySchema, dayParamSchema } from "../validations/chat.validation.js";

const router = express.Router();

// /api/chat-history/days?userId=...
router.get("/days", validateRequest(chatHistoryQuerySchema), getDays);

// /api/chat-history/day/2025-12-24?userId=...
router.get("/day/:day", validateRequest(chatHistoryQuerySchema, dayParamSchema), getMessagesByDay);

// /api/chat-history/day/2025-12-24?userId=...
router.delete("/day/:day", validateRequest(chatHistoryQuerySchema, dayParamSchema), deleteDay);

export default router;
