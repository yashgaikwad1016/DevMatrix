import { Router } from "express";
import * as crController from "../controllers/changeRequest.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const changeRequestRouter = Router();

changeRequestRouter.get("/projects/:id/change-requests", authenticate, crController.getChangeRequests);
changeRequestRouter.post("/projects/:id/change-requests", authenticate, crController.createChangeRequest);
changeRequestRouter.post("/change-requests/:id/approve", authenticate, requireRole("admin"), crController.approveChangeRequest);

export default changeRequestRouter;
