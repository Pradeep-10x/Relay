import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt.js";

export const registerUser= async(data: {
  email: string;
  password: string;
  name?: string;
}) =>{
  return prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ApiError("Email already registered", 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await tx.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name as string,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  });
}


