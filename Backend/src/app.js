import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import config from "./config/env.js";

// Routes
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import requirementRouter from "./routes/requirement.routes.js";
import quotationRouter from "./routes/quotation.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import taskRouter from "./routes/task.routes.js";
import changeRequestRouter from "./routes/changeRequest.routes.js";
import githubRouter from "./routes/github.routes.js";
import deploymentRouter from "./routes/deployment.routes.js";
import deliverableRouter from "./routes/deliverable.routes.js";
import referralRouter from "./routes/referral.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [config.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

if (config.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "DevMatrix API",
    time: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api", requirementRouter);
app.use("/api", quotationRouter);
app.use("/api/payments", paymentRouter);
app.use("/api", taskRouter);
app.use("/api", changeRequestRouter);
app.use("/api", githubRouter);
app.use("/api", deploymentRouter);
app.use("/api", deliverableRouter);
app.use("/api/referrals", referralRouter);
app.use("/api/admin", adminRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(config.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

export default app;
