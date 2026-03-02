import express from "express";
import authUser from "../middleware/authUser.js";
import { getMessage } from "../controllers/messageContoller.js";
import { checkCredit } from "../middleware/creditManager.js";
import { rateLimiter } from "../middleware/rateLimiter.js";


const messageRouter = express.Router();

messageRouter.post("/get-message", authUser, rateLimiter(30, 60, (req) => req.user.id), // per user limit
  checkCredit, getMessage);

export default messageRouter;

