import { Router } from "express";
import { getIssueActivity } from "./activity.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/issues/:issueId/activity", authMiddleware, getIssueActivity);

export default router;


