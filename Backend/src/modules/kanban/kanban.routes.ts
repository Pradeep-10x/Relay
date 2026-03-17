import { Router } from "express";
import { getKanbanBoard } from "./kanban.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /projects/{projectId}/kanban:
 *   get:
 *     summary: Get kanban board for a project
 *     tags: [Kanban]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Kanban board retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */
router.get("/projects/:projectId/kanban", authMiddleware, getKanbanBoard);

export default router;