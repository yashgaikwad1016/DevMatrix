import { Router } from "express";
import * as referralController from "../controllers/referral.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const referralRouter = Router();

referralRouter.get("/check", referralController.checkReferralCode);
referralRouter.get("/stats", authenticate, referralController.getReferralStats);

export default referralRouter;
