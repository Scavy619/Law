import express from "express";
import { logout, refreshAccessToken } from "../controllers/userController.js";

const AuthRouter = express.Router();


AuthRouter.post("/logout", logout);
AuthRouter.post("/refresh", refreshAccessToken);

export default AuthRouter;
