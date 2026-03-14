import { r2 } from "../../lib/r2.js";
import { prisma } from "../../lib/prisma.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { ApiError } from "../../utils/ApiError.js";
import {hashPassword , comparePassword} from "../../utils/hash.js";
dotenv.config();

// Generating Avatar URl Upload Service for frontend to upload
export const generateAvatarUploadUrlService = async (userId: string) => {
    const key = `avatars/${userId}/${Date.now()}.png`;

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: "image/png", 
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 120, signingRegion: "auto" });

    return { uploadUrl, key };
}

// Saving avatar key in Db service here
export const saveAvatarKeyService = async (userId: string, key: string) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { avatar: key },
    });
}

// Getting Signed Avatar URL Service for frontend to display avatar
export const getAvatarUrlService = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
    });

    return await getSignedUrl(r2, command, { expiresIn: 300, signingRegion: "auto" });
}


//profile update services

export const updateProfileService = async (userId: string, name?: string, username?: string, avatar?: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if(!user) {
        throw new Error("User not found");
    }
    if(username) {
        const taken = await prisma.user.findUnique({
            where: { username },
        });
        if(taken) {
            throw new Error("Username already taken");
        }
    }
    const data: any = {};

if (name !== undefined) data.name = name;
if (username !== undefined) data.username = username;
if (avatar !== undefined) data.avatar = avatar;

    const updated = await prisma.user.update({
        where: { id: userId },
        data
    });

    const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, email: true, name: true, avatar: true },
    });
    return updatedUser;
}

export const changePasswordService = async (userId: string, oldPassword: string, newPassword: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if(!user) {
        throw new ApiError(404, "User not found");
    }
    const valid = await comparePassword(oldPassword, user.passwordHash);
    if(!valid) {
        throw new ApiError(401, "Incorrect old password");
    }
    const hash = await hashPassword(newPassword);
    const updated = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hash },
    });
}
    