import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { prisma } from "../../lib/prisma.js";
import {
    generateAvatarUploadUrlService,
    saveAvatarKeyService,
    getAvatarUrlService,
    updateProfileService,
    changePasswordService
} from "./user.service.js";

// Requesting upload URL for avatar from frontend
export const generateAvatarUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const data = await generateAvatarUploadUrlService(userId);
    res.json(data);
});

// to update key to db after successful upload
export const updateurl = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const { key } = req.body;

    if (!key) {
        throw new ApiError(400, "Avatar Key is required");
    }

    const user = await saveAvatarKeyService(userId, key);
    res.json({ message: "Avatar updated successfully", avatarKey: user.avatar });
});

// to fetch current user profile with avatar URL
export const getCurrentUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true, name: true, avatar: true },
    });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let avatarUrl = null;
    if (user.avatar) {
        avatarUrl = await getAvatarUrlService(user.avatar);
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: avatarUrl } }); 
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const { name, username, avatar } = req.body;
    const user = await updateProfileService(userId, name, username, avatar);
    res.json({ message: "Profile updated successfully", user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const { oldPassword, newPassword } = req.body;
    const user = await changePasswordService(userId, oldPassword, newPassword);
    res.json({ message: "Password changed successfully" });
});