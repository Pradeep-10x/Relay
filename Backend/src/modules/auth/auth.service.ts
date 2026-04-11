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
  username: string;
}) =>{
   
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });

    if (existing) {
      throw new ApiError(400, "Email or username already in use");
    }

    const passwordHash = await hashPassword(data.password);
     
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        username:data.username,
        name: data.name as string,
      },
        select: {
    id: true,
    email: true,
    username: true,
    name: true,
    createdAt: true
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

    return { user, accessToken, refreshToken };

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
    throw new ApiError(401, "Invalid refresh token");
  }

  if (stored.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token expired");
  }

  // revoking old token
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const newAccessToken = generateAccessToken(user.id);
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
export const googleCallbackService = async (code: string, state?: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApiError(500, "Google OAuth environment variables are not configured");
  }

  // 1. Exchange code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const errData = await tokenResponse.text();
    console.error("Google Token Error:", errData);
    throw new ApiError(400, "Failed to exchange Google OAuth code");
  }

  const tokenData = await tokenResponse.json();

  // 2. Decode ID token (no extra HTTP call needed)
  const { default: jwt } = await import("jsonwebtoken");
  const userData = jwt.decode(tokenData.id_token) as {
    sub: string;
    email: string;
    name: string;
    picture: string;
    email_verified: boolean;
  };

  if (!userData?.email) throw new ApiError(400, "Could not extract email from Google token");
  if (!userData.email_verified) throw new ApiError(400, "Google email is not verified");

  // 3. Find or create user (by googleId first, then email)
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: userData.sub }, { email: userData.email }] },
  });

  if (!user) {
    const crypto = await import("crypto");
    const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));

    let baseUsername = (userData.email.split("@")[0] ?? "user").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user";
    let username = baseUsername;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter++}`;
    }

    user = await prisma.user.create({
      data: {
        googleId: userData.sub,
        email: userData.email,
        name: userData.name || baseUsername,
        username,
        passwordHash,
        avatar: userData.picture || null,
      },
    });
  } else {
    // Patch missing fields on existing user
    const updates: any = {};
    if (!user.googleId) updates.googleId = userData.sub;
    if (!user.avatar && userData.picture) updates.avatar = userData.picture;

    if (Object.keys(updates).length) {
      user = await prisma.user.update({ where: { id: user.id }, data: updates });
    }
  }

  // 4. Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // 5. Store hashed refresh token
  const crypto = await import("crypto");
  const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: addDays(new Date(), 7),
    },
  });

  return { accessToken, refreshToken, user };
};