import { Router } from "express";
import { createComment, deleteComment, editComment, getIssueComments } from "./comment.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/issues/:issueId/comment", authMiddleware, createComment);
router.get("/issues/:issueId/comments", getIssueComments);
router.patch("/comments/:commentId", authMiddleware, editComment);
router.delete("/comments/:commentId", authMiddleware, deleteComment);

export default router;