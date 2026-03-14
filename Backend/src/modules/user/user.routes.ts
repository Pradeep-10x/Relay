import { Router } from "express";
import {
  generateAvatarUploadUrl,
  updateurl,
  getCurrentUserProfile,
  changePassword,
  updateProfile
} from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/avatar/upload-url", authMiddleware, generateAvatarUploadUrl);
router.patch("/avatar", authMiddleware, updateurl);

router.get("/me", authMiddleware, getCurrentUserProfile);

router.post("/change-password", authMiddleware, changePassword);

router.post("/edit-profile", authMiddleware, updateProfile);

export default router;