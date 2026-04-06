import express from "express";
import { logout, refreshAccessToken } from "../controllers/userController.js";
import { exchangeOneTimeCode } from "../controllers/googleAuthController.js";
import { validateOrigin } from "../utils/validateOrigin.js";

const AuthRouter = express.Router();

AuthRouter.post("/logout", validateOrigin, logout);
AuthRouter.post("/refresh", validateOrigin, refreshAccessToken);
AuthRouter.post("/exchange", validateOrigin, exchangeOneTimeCode);

export default AuthRouter;
