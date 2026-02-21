import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createWorkspace , getWorkspaces , addMemberToWorkspace ,getWorkspaceMembers ,deleteWorkspace } from "./workspace.controller.js";

const router = Router();    

router.post("/create", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.post("/:workspaceId/add", authMiddleware, addMemberToWorkspace);
router.get("/:workspaceId/members", authMiddleware, getWorkspaceMembers);
router.delete("/:workspaceId/delete", authMiddleware, deleteWorkspace);
export default router;