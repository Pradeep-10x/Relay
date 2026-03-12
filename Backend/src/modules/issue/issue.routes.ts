import { Router } from "express";
import {
  createIssue,
  updateIssueState,
  updateIssue,

  addDependency,
  removeDependency,
  getIssueActivity,
  getProjectBoard,
  getProjectAnalytics
} from "./issue.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/projects/:projectId/issues",
  authMiddleware,
  createIssue
);

router.patch(
  "/issues/:issueId/state",
  authMiddleware,
  updateIssueState
);

router.patch("/issues/:issueId", authMiddleware, updateIssue);



router.post(
  "/issues/:issueId/dependencies",
  authMiddleware,
  addDependency
);

router.delete(
  "/issues/:issueId/dependencies/:blockerId",
  authMiddleware,
  removeDependency
);

router.get(
  "/issues/:issueId/activity",
  authMiddleware,
  getIssueActivity
);

router.get(
  "/projects/:projectId/board",
  authMiddleware,
  getProjectBoard
);

router.get(
  "/projects/:projectId/analytics",
  authMiddleware,
  getProjectAnalytics
);

export default router;