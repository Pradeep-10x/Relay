import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import workspaceRoutes from "./modules/workspace/workspace.routes.js";
import userRouter from "./modules/user/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", true); 
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/user", userRouter);

export default app;
