import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createWorkspace } from "./workspace.controller.js";

const router = Router();    

router.post("/create", authMiddleware, createWorkspace);

export default router;