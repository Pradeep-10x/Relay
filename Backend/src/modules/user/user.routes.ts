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

/**
 * @swagger
 * /user/avatar/upload-url:
 *   post:
 *     summary: Get presigned URL for avatar upload
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Presigned URL generated
 */
router.post("/avatar/upload-url", authMiddleware, generateAvatarUploadUrl);

/**
 * @swagger
 * /user/avatar:
 *   patch:
 *     summary: Update user avatar URL
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Avatar updated
 */
router.patch("/avatar", authMiddleware, updateurl);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current logged in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get("/me", authMiddleware, getCurrentUserProfile);

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post("/change-password", authMiddleware, changePassword);

/**
 * @swagger
 * /user/edit-profile:
 *   post:
 *     summary: Edit user profile details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.post("/edit-profile", authMiddleware, updateProfile);

export default router;