import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createWorkspace , getWorkspaces , addMemberToWorkspace ,getWorkspaceMembers } from "./workspace.controller.js";

const router = Router();    

router.post("/create", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.post("/:workspaceId/add", authMiddleware, addMemberToWorkspace);
router.get("/:workspaceId/members", authMiddleware, getWorkspaceMembers);
export default router;