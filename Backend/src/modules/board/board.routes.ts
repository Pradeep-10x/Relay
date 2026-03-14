import { Router } from "express";
import { getBoard } from "./board.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /projects/{projectId}/board:
 *   get:
 *     summary: Get project whiteboard
 *     tags: [Whiteboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Whiteboard strokes retrieved
 */
router.get("/projects/:projectId/board", authMiddleware, getBoard);

export default router;