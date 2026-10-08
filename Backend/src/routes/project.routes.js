import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const projectRouter = Router();

projectRouter.use(authenticate);

projectRouter.get("/", projectController.getProjects);
projectRouter.post("/", projectController.createProject);
projectRouter.get("/:id", projectController.getProjectById);
projectRouter.put("/:id", projectController.updateProject);

export default projectRouter;
