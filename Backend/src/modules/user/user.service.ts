import { r2 } from "../../lib/r2.js";
import { prisma } from "../../lib/prisma.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

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
