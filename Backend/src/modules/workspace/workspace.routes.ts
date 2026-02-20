import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createWorkspace , getWorkspaces } from "./workspace.controller.js";

const router = Router();    

router.post("/create", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);

export default router;