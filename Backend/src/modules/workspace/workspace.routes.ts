import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createWorkspace , getWorkspaces , addMemberToWorkspace ,getWorkspaceMembers ,deleteWorkspace , removeMemberFromWorkspace} from "./workspace.controller.js";

const router = Router();    

/**
 * @swagger
 * /workspace/create:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 */
router.post("/create", authMiddleware, createWorkspace);

/**
 * @swagger
 * /workspace/:
 *   get:
 *     summary: Get all workspaces for the current user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 */
router.get("/", authMiddleware, getWorkspaces);

/**
 * @swagger
 * /workspace/{workspaceId}/add:
 *   post:
 *     summary: Add member to workspace
 *     tags: [Workspaces]
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
router.post("/:workspaceId/add", authMiddleware, addMemberToWorkspace);

/**
 * @swagger
 * /workspace/{workspaceId}/members:
 *   get:
 *     summary: Get workspace members
 *     tags: [Workspaces]
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
 *         description: List of workspace members
 */
router.get("/:workspaceId/members", authMiddleware, getWorkspaceMembers);

/**
 * @swagger
 * /workspace/{workspaceId}/delete:
 *   delete:
 *     summary: Delete workspace
 *     tags: [Workspaces]
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
 *         description: Workspace deleted successfully
 */
router.delete("/:workspaceId/delete", authMiddleware, deleteWorkspace);

/**
 * @swagger
 * /workspace/{workspaceId}/remove-member:
 *   delete:
 *     summary: Remove member from workspace
 *     tags: [Workspaces]
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
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
router.delete("/:workspaceId/remove-member", authMiddleware, removeMemberFromWorkspace);
export default router;
