import { Router } from "express";
import * as deployController from "../controllers/deployment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const deploymentRouter = Router();

deploymentRouter.post("/projects/:id/deployments", authenticate, deployController.createDeployment);
deploymentRouter.get("/projects/:id/deployments", authenticate, deployController.getDeployments);

export default deploymentRouter;
