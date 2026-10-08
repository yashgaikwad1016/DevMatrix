import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

// Registration & Login
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);

// Email Verification & OTP
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-otp", authController.resendOTP);

// Token & Session Management
authRouter.get("/get-me", authController.getMe);
authRouter.get("/me", authenticate, authController.getMe);
authRouter.get("/refresh-token", authController.refreshToken);
authRouter.post("/refresh", authController.refreshToken);
authRouter.get("/logout", authController.logout);
authRouter.post("/logout", authController.logout);
authRouter.get("/logout-all", authenticate, authController.logoutAll);

// Social OAuth
authRouter.get("/oauth-config", authController.getOAuthConfig);
authRouter.post("/google", authController.googleLogin);
authRouter.post("/github", authController.githubLogin);

export default authRouter;
