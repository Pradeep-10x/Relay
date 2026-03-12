import { Router } from "express";
import { getUserNotifications, markNotificationAsRead } from "./notification.cotroller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getUserNotifications);
router.patch("/:id/read", authMiddleware, markNotificationAsRead);

export default router;

