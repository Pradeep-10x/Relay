import { Router } from "express";
import {
  createIssue,
  updateIssueState,
  selfAssignIssue
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

router.patch(
  "/:issueId/assign",
  authMiddleware,
  selfAssignIssue
);

export default router;