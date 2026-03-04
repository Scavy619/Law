import express from "express";
import authUser from "../middleware/authUser.js";
import {
  createChat,
  getChat,
  deleteChat,
  getUserChats,
  updateChatTitle,
} from "../controllers/chatController.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const chatRouter = express.Router();

// 10 new sessions per user per hour
chatRouter.post(
  "/create",
  authUser,
  rateLimiter(10, 60 * 60, (req) => req.user.id),
  createChat,
);
chatRouter.get("/get/:sessionId", authUser, getChat);
chatRouter.get("/sessions", authUser, getUserChats);
// 30 title updates per user per minute
chatRouter.put(
  "/update-title",
  authUser,
  rateLimiter(30, 60, (req) => req.user.id),
  updateChatTitle,
);
// 20 deletes per user per hour
chatRouter.delete(
  "/delete",
  authUser,
  rateLimiter(20, 60 * 60, (req) => req.user.id),
  deleteChat,
);

export default chatRouter;
