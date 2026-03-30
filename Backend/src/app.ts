import express from "express";
import helmet from "helmet";
import cors from "cors";
import { prisma, dbReady } from "./lib/prisma.js";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import workspaceRoutes from "./modules/workspace/workspace.routes.js";
import userRouter from "./modules/user/user.routes.js";
import projectRoutes from "./modules/project/project.routes.js";
import issueRoutes from "./modules/issue/issue.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import boardRoutes from "./modules/board/board.routes.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import kanbanRoutes from "./modules/kanban/kanban.routes.js";
import { httpLogger } from "./middleware/logger.middleware.js";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { logger } from "./config/logger.js";
import { redis } from "./lib/redis.js";
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", true); 
app.use(rateLimiter);
app.use(httpLogger);

//health check 
app.get('/health', async (req, res) => {
//   try {
//      await prisma.$queryRaw`SELECT 1`;
//     res.json({ ok: true, db: true, timestamp: new Date().toISOString() });
//   }
//   catch (error) {
   console.log('Health check failed');
    res.status(503).json({ ok: false, db: false });
  }

);

app.get("/ready", (req, res) => {
  const redisStatus = redis.status;

  if (!dbReady) {
    return res.status(503).json({
      status: "not-ready",
      database: "disconnected"
    });
  }

  if (redisStatus !== "ready") {
    return res.status(503).json({
      status: "not-ready",
      redis: redisStatus
    });
  }

  res.json({
    status: "ready",
    database: "connected",
    redis: redisStatus
  });
});

//Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1", issueRoutes);
app.use("/api/v1", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1", boardRoutes);
app.use("/api/v1", kanbanRoutes);

export default app;
