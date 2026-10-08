import { Router } from "express";
import * as ghController from "../controllers/github.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const githubRouter = Router();

githubRouter.post("/projects/:id/github/connect", authenticate, ghController.connectGitHubRepo);
githubRouter.get("/projects/:id/github", authenticate, ghController.getGitHubRepo);
githubRouter.post("/projects/:id/github/sync", authenticate, ghController.syncGitHubRepo);

export default githubRouter;
