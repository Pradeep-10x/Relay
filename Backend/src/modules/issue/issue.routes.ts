import { Router } from "express";
import {
  createIssue,
  updateIssueState,


  addDependency,
  removeDependency,
  getIssueActivity,
} from "./issue.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/projects/:projectId/issues",
  authMiddleware,
  createIssue
);

router.patch(
  "/:issueId/state",
  authMiddleware,
  updateIssueState
);




router.post(
  "/:issueId/dependencies",
  authMiddleware,
  addDependency
);

router.delete(
  "/:issueId/dependencies/:blockerId",
  authMiddleware,
  removeDependency
);

router.get(
  "/:issueId/activity",
  authMiddleware,
  getIssueActivity
);

export default router;