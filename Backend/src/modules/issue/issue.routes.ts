import { Router } from "express";
import {
  createIssue,
  updateIssueState,
  updateIssue,

  addDependency,
  removeDependency,
  getIssueActivity,
  getProjectBoard,
  getProjectAnalytics,
  getIssueById
} from "./issue.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /projects/{projectId}/issues:
 *   post:
 *     summary: Create an issue
 *     tags: [Issues]
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
 *             required: [title, priority]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [LOW, NORMAL, HIGH]
 *               assigneeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Issue created successfully
 */
router.post(
  "/projects/:projectId/issues",
  authMiddleware,
  createIssue
);

/**
 * @swagger
 * /issues/{issueId}/state:
 *   patch:
 *     summary: Update issue state
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stateId]
 *             properties:
 *               stateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue state updated
 */
router.patch(
  "/issues/:issueId/state",
  authMiddleware,
  updateIssueState
);

/**
 * @swagger
 * /issues/{issueId}:
 *   patch:
 *     summary: Update issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Issue updated
 */
router.patch("/issues/:issueId", authMiddleware, updateIssue);



/**
 * @swagger
 * /issues/{issueId}/dependencies:
 *   post:
 *     summary: Add an issue dependency
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blockerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dependency added
 */
router.post(
  "/issues/:issueId/dependencies",
  authMiddleware,
  addDependency
);

/**
 * @swagger
 * /issues/{issueId}/dependencies/{blockerId}:
 *   delete:
 *     summary: Remove an issue dependency
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: blockerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dependency removed
 */
router.delete(
  "/issues/:issueId/dependencies/:blockerId",
  authMiddleware,
  removeDependency
);

/**
 * @swagger
 * /issues/{issueId}/activity:
 *   get:
 *     summary: Get issue activity
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of issue activities
 */
router.get(
  "/issues/:issueId/activity",
  authMiddleware,
  getIssueActivity
);

/**
 * @swagger
 * /projects/{projectId}/board:
 *   get:
 *     summary: Get project board
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
 *         description: Found Project board entries
 */
router.get(
  "/projects/:projectId/board",
  authMiddleware,
  getProjectBoard
);

/**
 * @swagger
 * /projects/{projectId}/analytics:
 *   get:
 *     summary: Get project issue analytics
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
 *         description: Analytics report
 */
router.get(
  "/projects/:projectId/analytics",
  authMiddleware,
  getProjectAnalytics
);

/**
 * @swagger
 * /issues/{issueId}:
 *   get:
 *     summary: Get issue details
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: issueId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Issue details fetched
 */
router.get("/issues/:issueId", authMiddleware, getIssueById);

export default router;