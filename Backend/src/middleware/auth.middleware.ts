import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { getCache, setCache, deleteCache } from "../utils/cache.js";

const authCacheKey = (userId: string) => `auth:user:${userId}`;

// Short TTL so a deactivation/profile change is reflected quickly while still
// removing a DB round-trip from the hot path on every authenticated request.
const AUTH_CACHE_TTL = 30;

// Called by user mutations (profile update, password change, deactivation) to
// invalidate the cached identity immediately.
export const invalidateUserAuthCache = (userId: string) =>
  deleteCache(authCacheKey(userId));

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authorization header or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyAccessToken(token) as { sub: string };

    if (!payload?.sub) {
      return res.status(401).json({ message: "Unauthorized payload" });
    }

    const cacheKey = authCacheKey(payload.sub);
    let user = await getCache(cacheKey);

    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          name: true,
          id: true,
          email: true,
          deletedAt: true,
        },
      });

      if (user) {
        await setCache(cacheKey, user, AUTH_CACHE_TTL);
      }
    }

    if (!user || user.deletedAt) {
      return res.status(401).json({ message: "User not found or deactivated" });
    }

    req.user! = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
