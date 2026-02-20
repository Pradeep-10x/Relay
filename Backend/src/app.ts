import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import workspaceRoutes from "./modules/workspace/workspace.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/workspace", workspaceRoutes);

export default app;
