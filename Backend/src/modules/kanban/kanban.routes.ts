import { Router } from "express";
import { getKanbanBoard } from "./kanban.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/projects/:projectId/kanban", authMiddleware, getKanbanBoard);

export default router;