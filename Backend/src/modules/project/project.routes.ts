import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createProject, getWorkspaceProjects, deleteProject, addProjectMember } from "./project.controller.js";

const router = Router();

/**
 * @swagger
 * /project/{workspaceId}/create:
 *   post:
 *     summary: Create a new project in a workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, key]
 *             properties:
 *               name:
 *                 type: string
 *               key:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.post("/:workspaceId/create", authMiddleware, createProject);

/**
 * @swagger
 * /project/{workspaceId}:
 *   get:
 *     summary: Get projects by workspace ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get("/:workspaceId", authMiddleware, getWorkspaceProjects);

/**
 * @swagger
 * /project/{projectId}/delete:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
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
 *         description: Project deleted
 */
router.delete("/:projectId/delete", authMiddleware, deleteProject);

/**
 * @swagger
 * /project/{projectId}/add-member:
 *   post:
 *     summary: Add member to project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role]
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER]
 *     responses:
 *       200:
 *         description: Member added successfully
 */
router.post("/:projectId/add-member", authMiddleware, addProjectMember);

export default router;