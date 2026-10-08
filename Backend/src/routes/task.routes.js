import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const taskRouter = Router();

taskRouter.get("/projects/:id/milestones", authenticate, taskController.getMilestones);
taskRouter.post("/projects/:id/milestones", authenticate, taskController.createMilestone);
taskRouter.get("/projects/:id/tasks", authenticate, taskController.getTasks);
taskRouter.post("/projects/:id/tasks", authenticate, taskController.createTask);
taskRouter.put("/tasks/:taskId", authenticate, taskController.updateTask);

export default taskRouter;
