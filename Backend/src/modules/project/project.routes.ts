import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createProject, getWorkspaceProjects, deleteProject, addProjectMember } from "./project.controller.js";

const router = Router();

router.post("/:workspaceId/create", authMiddleware, createProject);
router.get("/:workspaceId", authMiddleware, getWorkspaceProjects);
router.delete("/:projectId/delete", authMiddleware, deleteProject);
router.post("/:projectId/add-member", authMiddleware, addProjectMember);

export default router;