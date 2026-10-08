import { Router } from "express";
import * as deliverableController from "../controllers/deliverable.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const deliverableRouter = Router();

deliverableRouter.get("/projects/:id/deliverables", authenticate, deliverableController.getDeliverables);
deliverableRouter.post("/projects/:id/deliverables", authenticate, deliverableController.createDeliverable);
deliverableRouter.get("/deliverables/:deliverableId/download", authenticate, deliverableController.downloadDeliverable);

export default deliverableRouter;
