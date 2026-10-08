import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const adminRouter = Router();

// Endpoint to seed initial admin (safe: won't duplicate)
adminRouter.post("/seed", adminController.seedInitialAdmin);

// Admin-protected routes
adminRouter.use(authenticate, requireRole("admin"));

adminRouter.get("/stats", adminController.getDashboardStats);
adminRouter.get("/clients", adminController.getClients);
adminRouter.get("/developers", adminController.getDevelopers);
adminRouter.get("/audit-logs", adminController.getAuditLogs);

export default adminRouter;
