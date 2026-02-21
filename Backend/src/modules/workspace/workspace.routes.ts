import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createWorkspace , getWorkspaces , addMemberToWorkspace ,getWorkspaceMembers ,deleteWorkspace , removeMemberFromWorkspace} from "./workspace.controller.js";

const router = Router();    

router.post("/create", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.post("/:workspaceId/add", authMiddleware, addMemberToWorkspace);
router.get("/:workspaceId/members", authMiddleware, getWorkspaceMembers);
router.delete("/:workspaceId/delete", authMiddleware, deleteWorkspace);
router.delete("/:workspaceId/remove-member", authMiddleware, removeMemberFromWorkspace);
export default router;