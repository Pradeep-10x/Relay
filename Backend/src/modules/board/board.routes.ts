import { Router } from "express";
import { getBoard } from "./board.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/projects/:projectId/board", authMiddleware, getBoard);

export default router;