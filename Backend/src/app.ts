import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import workspaceRoutes from "./modules/workspace/workspace.routes.js";
import userRouter from "./modules/user/user.routes.js";
import projectRoutes from "./modules/project/project.routes.js";
import issueRoutes from "./modules/issue/issue.routes.js";
import commentRoutes from "./modules/comment/comment.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import activityRoutes from "./modules/activity/activity.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", true); 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1", issueRoutes);
app.use("/api/v1", commentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1", activityRoutes);

export default app;
