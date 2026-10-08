import { Router } from "express";
import * as reqController from "../controllers/requirement.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const requirementRouter = Router();

// Allow authenticated access
requirementRouter.get("/projects/:id/requirements", authenticate, reqController.getRequirements);
requirementRouter.post("/projects/:id/requirements", authenticate, reqController.saveRequirements);
requirementRouter.put("/projects/:id/requirements/:requirementId", authenticate, reqController.saveRequirements);
requirementRouter.post("/projects/:id/requirements/:requirementId/submit", authenticate, reqController.submitRequirement);
requirementRouter.post(
  "/projects/:id/requirements/:requirementId/approve",
  authenticate,
  requireRole("admin"),
  reqController.approveRequirement
);
requirementRouter.get("/projects/:id/requirements/:requirementId/pdf", authenticate, reqController.exportRequirementPDF);

export default requirementRouter;
