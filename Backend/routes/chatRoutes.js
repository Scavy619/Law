import express from "express";
import authUser from "../middleware/authUser.js";
import {
  createChat,
  getChat,
  deleteChat,
  getUserChats,
  updateChatTitle,
  exportAllChats,
} from "../controllers/chatController.js";
import { routeLimiter } from "../middleware/rateLimiter.js";

const chatRouter = express.Router();

// 10 new sessions per user per hour
chatRouter.post(
  "/create",
  authUser,
  routeLimiter(10, 60 * 60, (req) => req.user.id),
  createChat,
);
chatRouter.get("/get/:sessionId", authUser, getChat);
chatRouter.get("/sessions", authUser, getUserChats);
// 30 title updates per user per minute
chatRouter.put(
  "/update-title",
  authUser,
  routeLimiter(30, 60, (req) => req.user.id),
  updateChatTitle,
);
// 20 deletes per user per hour
chatRouter.delete(
  "/delete",
  authUser,
  routeLimiter(20, 60 * 60, (req) => req.user.id),
  deleteChat,
);
chatRouter.get(
  "/export",
  authUser,
  routeLimiter(5, 60 * 60, (req) => req.user.id),
  exportAllChats,
);

export default chatRouter;
