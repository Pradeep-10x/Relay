import { r2 } from "../../lib/r2.js";
import { prisma } from "../../lib/prisma.js";
import { Request, Response } from "express";
import {getSignedUrl,} from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand , GetObjectCommand } from "@aws-sdk/client-s3";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";

// Generating Avatar URl Upload Service for frontend to upload

const generateAvatarUploadUrlService = async (userId: string) => {

const key = `avatars/${userId}/${Date.now()}.png`;

const command = new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME!,
  Key: key,
  ContentType: "image/png", 
});

const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 120 });

return { uploadUrl, key };
}

//Saving avatar key in Db service here
const saveAvatarKeyService = async (userId: string, key: string) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { avatar: key },
    });
}

//Getting Signed Avatar URL Service for frontend to display avatar
const getAvatarUrlService = async (key: string) => {
    const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
    });

    return await getSignedUrl(r2, command, { expiresIn: 300 });
}

//CONTROLLERS //
  //Requesting upload URL for avatar from frontend
export const generateAvatarUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    const data = await generateAvatarUploadUrlService(userId);
    res.json(data);
}
);


  //to update key to db after successful upload
export const updateurl = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
const {key} = req.body;

if(!key){
    throw new ApiError(400, "Avatar Key is required");
}

    const user = await saveAvatarKeyService(userId, key);
    res.json({ message: "Avatar updated successfully", avatarKey: user.avatar });
}
);
 // to fetch current user profile with avatar URL
export const getCurrentUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, avatar: true },
    });
     if (!user) {
        throw new ApiError(404, "User not found");
    }

    let avatarUrl = null;
    if (user.avatar) {
        avatarUrl = await getAvatarUrlService(user.avatar);
    }
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatarUrl } }); 
}    );