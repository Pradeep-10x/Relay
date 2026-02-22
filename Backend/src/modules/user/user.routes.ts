import { Router } from "express";
import {
  generateAvatarUploadUrl,
  updateurl,
  getCurrentUserProfile,
} from "./user.avatar.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/avatar/upload-url", authMiddleware, generateAvatarUploadUrl);
router.patch("/avatar", authMiddleware, updateurl);

router.get("/me", authMiddleware, getCurrentUserProfile);

export default router;