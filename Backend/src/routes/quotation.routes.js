import { Router } from "express";
import * as quotationController from "../controllers/quotation.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const quotationRouter = Router();

quotationRouter.post("/projects/:id/quotations", authenticate, requireRole("admin"), quotationController.createQuotation);
quotationRouter.get("/projects/:id/quotations", authenticate, quotationController.getQuotations);
quotationRouter.post("/quotations/:quotationId/accept", authenticate, quotationController.acceptQuotation);
quotationRouter.get("/quotations/:quotationId/pdf", authenticate, quotationController.downloadQuotationPDF);

export default quotationRouter;
