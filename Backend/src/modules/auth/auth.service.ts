import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { addDays } from "date-fns";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

export const registerUser= async(data: {
  email: string;
  password: string;
  name?: string;
}) =>{
   
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ApiError(400, "Email already in use");
    }

    const passwordHash = await hashPassword(data.password);
     
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name as string,
      },
    });


     

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };

  }

export const loginUser = async(data: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const valid = await comparePassword(
    data.password,
    user.passwordHash
  );

  if (!valid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: addDays(new Date(), 7),
    },
  });

  return { accessToken, refreshToken };
}

export const refreshTokens = async(oldToken: string) => {
  const payload = verifyRefreshToken(oldToken) as { sub: string };

  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });

  if (!stored || stored.revoked) {
    throw new Error("Invalid refresh token");
  }

  // revoking old token
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const newAccessToken = generateAccessToken(payload.sub);
  const newRefreshToken = generateRefreshToken(payload.sub);

  //storing new token
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.sub,
      expiresAt: addDays(new Date(), 7),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
