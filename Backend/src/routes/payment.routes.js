import { Router } from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", authenticate, paymentController.createPaymentOrder);
paymentRouter.post("/verify", authenticate, paymentController.verifyPayment);
paymentRouter.post("/webhook", paymentController.razorpayWebhook);
paymentRouter.get("/:id/receipt", authenticate, paymentController.downloadReceipt);

export default paymentRouter;
